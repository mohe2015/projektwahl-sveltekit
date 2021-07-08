# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# SPDX-License-Identifier: AGPL-3.0-or-later
{
  description = "projektwahl-sveltekit's development flake";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let pkgs = nixpkgs.legacyPackages.${system}; in
        {
          devShell = pkgs.mkShell {
            nativeBuildInputs = [
              pkgs.nodejs-16_x
              pkgs.postgresql_13
              pkgs.docker-compose
              pkgs.reuse
              pkgs.nixpkgs-fmt
              pkgs.nodePackages.npm-check-updates
              pkgs.cbc
              pkgs.glpk
              pkgs.nodePackages.node2nix
            ];

            shellHook = ''
              docker-compose up -d
            '';
          };

          packages = rec {
            # use a second minimal nodejs without npm, gyp, docs, manpages etc?
            # nix path-info -rsSh .#nodejs
            # 246.8M
            # nix why-depends .#nodejs /nix/store/6cfajs6lsy9b4wxp3jvyyl1g5x2pjmpr-python3-3.8.9
            nodejs = (pkgs.nodejs-16_x.override {
              openssl = pkgs.openssl.overrideAttrs (old: {
                postInstall = ''
                  ${old.postInstall}
                  ls -R $bin
                  rm $bin/bin/c_rehash
                '';
              });
            }).overrideAttrs (old: {
              postInstall = ''
                ${old.postInstall}
                rm $out/lib/node_modules/npm/node_modules/node-gyp/gyp/*.py
                rm $out/lib/node_modules/npm/node_modules/node-gyp/*.py
                rm $out/lib/node_modules/npm/node_modules/node-gyp/gyp/tools/*.py
                rm -R $out/lib/node_modules/npm/node_modules/node-gyp/gyp/pylib/
              '';
            });
            nodejs-slim = pkgs.nodejs-16_x.override {
              enableNpm = false;
              openssl = pkgs.openssl.overrideAttrs (old: {
                postInstall = ''
                  ${old.postInstall}
                  ls -R $bin
                  rm $bin/bin/c_rehash
                '';
              });
            };
            package =
              let
                nodeDependencies = (pkgs.callPackage ./override.nix { }).shell.nodeDependencies;
              in
              pkgs.stdenv.mkDerivation {
                name = "projektwahl-sveltekit";
                src = pkgs.lib.sourceByRegex ./. [ "src.*" "package.json" "svelte.config.js" "tsconfig.json" ]; # TODO FIXME this causes all the rebuilds
                buildInputs = [ nodejs ];
                buildPhase = ''
                  ln -s ${nodeDependencies}/lib/node_modules ./node_modules
                  ls -la ./node_modules/
                  export PATH="${nodeDependencies}/bin:$PATH"

                  # Build the distribution bundle in "dist"
                  npm run build
                '';
                installPhase = ''
                  mkdir $out
                  cp -r node_modules $out/node_modules # we definitely need to remove development dependencies
                  cp package.json $out/package.json
                  cp -r build $out/build
                  sed -e '\#^//#d' build/index.js > $out/build/index.js
                '';
              };
            packageSlim = pkgs.replaceDependency {
              drv = package;
              oldDependency = nodejs;
              newDependency = nodejs-slim;
            };
            container =
              # 244M
              # ls -Llh result
              # du -sh result/
              # nix path-info -rsSh .#package
              # the following command is epic
              # nix why-depends .#package  /nix/store/gmsv7hm0wd5siyhi4nsbn1aqpbcbi0cl-perl-5.32.1
              # docker load --input result
              # docker images
              # docker run -it projektwahl-sveltekit
              # nodejs is probably 71MB but we also need lots of system libs
              # https://github.com/NixOS/nixpkgs/blob/master/pkgs/build-support/replace-dependency.nix
              pkgs.dockerTools.buildLayeredImage {
                name = "projektwahl-sveltekit";
                tag = "latest";

                contents = [ nodejs package ];

                config = {
                  # https://engineeringblog.yelp.com/2016/01/dumb-init-an-init-for-docker.html#process-behavior-inside-docker-containers
                  Cmd = [ "${pkgs.dumb-init}/bin/dumb-init" "${nodejs}/bin/node" "${package}/build/index.js" ]; # "${pkgs.coreutils}/bin/ls"
                  WorkingDir = package;
                };
              };
          };
        }
      );
}
