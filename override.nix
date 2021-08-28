# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# SPDX-License-Identifier: AGPL-3.0-or-later
{pkgs ? import <nixpkgs> {
    inherit system;
}, system ? builtins.currentSystem}:

let
  nodePackages = import ./default.nix {
    inherit pkgs system;
    nodejs = pkgs.nodejs-16_x;
  };
in
nodePackages // {
    shell = nodePackages.shell.override {
        nativeBuildInputs = [ pkgs.nodePackages.node-pre-gyp ];

        preRebuild = ''
            patchShebangs node_modules/@mapbox/node-pre-gyp/bin/node-pre-gyp
            patchShebangs node_modules/.bin/node-pre-gyp
            cat node_modules/esbuild/install.js
            cp node_modules/esbuild-linux-64/bin/esbuild node_modules/esbuild/bin/esbuild
            substituteInPlace node_modules/esbuild/package.json --replace 'node install.js' ""
            #substituteInPlace node_modules/esbuild/package.json --replace 'node install.js' "ESBUILD_BINARY_PATH=node_modules/esbuild-linux-64/bin/esbuild node install.js"
            substituteInPlace package.json --replace 'husky install' ""
        '';
    };
}

# node2nix --development -l

# nix repl
# flake = builtins.getFlake (toString /home/moritz/Documents/projektwahl-sveltekit)
# flake.packages.x86_64-linux.container