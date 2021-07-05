# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# SPDX-License-Identifier: AGPL-3.0-or-later
{
  description = "projektwahl-sveltekit's development flake";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs";
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
            ];

            shellHook = ''
              docker-compose up -d
            '';
          };

          packages = {
            container = 
let
  nodeDependencies = (pkgs.callPackage ./override.nix {}).shell.nodeDependencies;
in
pkgs.stdenv.mkDerivation {
  name = "projektwahl-sveltekit";
  src = ./.;
  buildInputs = [pkgs.nodejs];
  buildPhase = ''
    ln -s ${nodeDependencies}/lib/node_modules ./node_modules
    ls -la ${nodeDependencies}/bin/
    export PATH="${nodeDependencies}/bin:$PATH"

    # Build the distribution bundle in "dist"
    npm run build
    cp -r build $out/
  '';
};
          };
        }
      );
}
