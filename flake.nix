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
            # nix path-info -rsSh nixpkgs#nodejs-16_x
            # 246.8M
            # nix why-depends nixpkgs#nodejs-16_x /nix/store/qlr1ffwc6z9inhzn3qk58k627ps7k7pv-perl-5.32.1
            nodejs = (pkgs.nodejs-16_x.override {
              openssl = pkgs.openssl.overrideAttrs (old: {
                postInstall = ''
                  ${old.postInstall}
                  rm $out/bin/c_rehash
                '';
              });
            }).overrideAttrs (old: {
              postInstall = ''
                ${old.postInstall}
                echo MY CUSTOM POST INSTALL PHASE
                rm $out/lib/node_modules/npm/node_modules/node-gyp/gyp/gyp_main.py
              ''; 
            });
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
                /*
                  projektwahl-sveltekit.tar.gz> Creating layer 1 from paths: ['/nix/store/jlz466np275y4myx4vbmab3w7mq6ph8w-libunistring-0.9.10']
                  projektwahl-sveltekit.tar.gz> Creating layer 2 from paths: ['/nix/store/skzi7q7ip4my4z7vcyvqfli85gnmialv-libidn2-2.3.1']
                  projektwahl-sveltekit.tar.gz> Creating layer 3 from paths: ['/nix/store/adxc893j47gxx3xjw403zdf0liiddvw2-glibc-2.32-48']
                  projektwahl-sveltekit.tar.gz> Creating layer 4 from paths: ['/nix/store/ahkq1lrxwky15ibkh8nvn7zdkhdxs7rz-attr-2.4.48']
                  projektwahl-sveltekit.tar.gz> Creating layer 5 from paths: ['/nix/store/26a78ync552m8j4sbjavhvkmnqir8c9y-bash-4.4-p23']
                  projektwahl-sveltekit.tar.gz> Creating layer 6 from paths: ['/nix/store/hykrzkafy5cvazar4hgi7505ila1yl5x-acl-2.3.1']
                  projektwahl-sveltekit.tar.gz> Creating layer 7 from paths: ['/nix/store/d9mfvhvksvsx0ar8pmxwhgwd9my045rp-gcc-10.3.0-lib']
                  projektwahl-sveltekit.tar.gz> Creating layer 8 from paths: ['/nix/store/0b0mijbd7mp8gcglmkkdr2775ki38x9v-zlib-1.2.11']
                  projektwahl-sveltekit.tar.gz> Creating layer 9 from paths: ['/nix/store/hsi52np49n9g2fdg86mmw6vz6y2y7vg0-openssl-1.1.1k']
                  projektwahl-sveltekit.tar.gz> Creating layer 10 from paths: ['/nix/store/203srbndvymk3pngvndmfcmprzk14333-coreutils-8.32']
                  projektwahl-sveltekit.tar.gz> Creating layer 11 from paths: ['/nix/store/sfnp4faf4m8d8p04jvmabcn7j5bacqqg-ncurses-6.2']
                  projektwahl-sveltekit.tar.gz> Creating layer 12 from paths: ['/nix/store/jf2jynm6qd4kfayavsqbqz7gg9s772lb-icu4c-69.1']
                  projektwahl-sveltekit.tar.gz> Creating layer 13 from paths: ['/nix/store/qlr1ffwc6z9inhzn3qk58k627ps7k7pv-perl-5.32.1']
                  projektwahl-sveltekit.tar.gz> Creating layer 14 from paths: ['/nix/store/alm923rykl5ccjqj0qn77nh48al4jvm0-bzip2-1.0.6.0.2']
                  projektwahl-sveltekit.tar.gz> Creating layer 15 from paths: ['/nix/store/5pxlh9lc8nm68kh5d5l8g0alrhf73rgc-expat-2.4.1']
                  projektwahl-sveltekit.tar.gz> Creating layer 16 from paths: ['/nix/store/sb3x5bzqmvmhysngkr1r11h2xx7gapcp-gdbm-1.19']
                  projektwahl-sveltekit.tar.gz> Creating layer 17 from paths: ['/nix/store/qv3b7pswf4j9c03dchr96p4r27700ph5-libffi-3.3']
                  projektwahl-sveltekit.tar.gz> Creating layer 18 from paths: ['/nix/store/6kgfmzx90c1a6afqnbkz6qprkzss476k-mime-types-9']
                  projektwahl-sveltekit.tar.gz> Creating layer 19 from paths: ['/nix/store/m2hq4avk256sl01wbygg83ils7hywah4-openssl-1.1.1k-bin']
                  projektwahl-sveltekit.tar.gz> Creating layer 20 from paths: ['/nix/store/8kqw9p956gzm4r2mza7nv89hbavsa0vf-readline-6.3p08']
                  projektwahl-sveltekit.tar.gz> Creating layer 21 from paths: ['/nix/store/zr8dj1sm6jhr3qil6nskp2qnmk0xf08g-sqlite-3.35.5']
                  projektwahl-sveltekit.tar.gz> Creating layer 22 from paths: ['/nix/store/ajm0wiln2qfh5r6js25zm7450fjf0nlw-xz-5.2.5']
                  projektwahl-sveltekit.tar.gz> Creating layer 23 from paths: ['/nix/store/c6w8la0pzhf77c50gqd5038d907z492y-icu4c-69.1-dev']
                  projektwahl-sveltekit.tar.gz> Creating layer 24 from paths: ['/nix/store/67b8037c3b7z3d95q5f0968l65zd6kv8-libuv-1.41.0']
                  projektwahl-sveltekit.tar.gz> Creating layer 25 from paths: ['/nix/store/ijxk75nda5zv64ydlhzyl6pspg5z950i-openssl-1.1.1k-dev']
                  projektwahl-sveltekit.tar.gz> Creating layer 26 from paths: ['/nix/store/2nhfiak8a30vw67mxksc2kdb69np2jcw-python3-3.8.9']
                  projektwahl-sveltekit.tar.gz> Creating layer 27 from paths: ['/nix/store/0zqag7wf4rd3ivw9x39isfldi7phgg2b-zlib-1.2.11-dev']
                  projektwahl-sveltekit.tar.gz> Creating layer 28 from paths: ['/nix/store/qkfijlx6zq91h6ywddhd1v272ygp2x61-nodejs-16.4.1']
                  projektwahl-sveltekit.tar.gz> Creating layer 29 from paths: ['/nix/store/z57kx5xkjigwbgdk8dg85yd58izf0dgr-glibc-2.32-48-bin']
                  projektwahl-sveltekit.tar.gz> Creating layer 30 from paths: ['/nix/store/5bhqi6n098slcbfwbbdp5jvzar1p6xbp-linux-headers-5.12']
                  projektwahl-sveltekit.tar.gz> Creating layer 31 from paths: ['/nix/store/pv82p70b06wcm0qf1rarhh5lccdhckv0-glibc-2.32-48-dev']
                  projektwahl-sveltekit.tar.gz> Creating layer 32 from paths: ['/nix/store/bqgh2vm981wscyqhvv0fyzdih52hwc7n-gcc-10.3.0']
                  projektwahl-sveltekit.tar.gz> Creating layer 33 from paths: ['/nix/store/ic5a27lx611n9d8qd9dfsinf198a3gn9-node-sources']
                  projektwahl-sveltekit.tar.gz> Creating layer 34 from paths: ['/nix/store/mfshcz4sqjwyx0cz68dbs3z4cb1lq1kb-node-dependencies-projektwahl-sveltekit-0.0.1']
                  projektwahl-sveltekit.tar.gz> Creating layer 35 from paths: ['/nix/store/h4c2d5b7jv1fmz64qnkc6w10pdxwkghx-projektwahl-sveltekit']
                */
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
