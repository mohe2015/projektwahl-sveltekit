{pkgs ? import <nixpkgs> {
    inherit system;
}, system ? builtins.currentSystem}:

let
  nodePackages = import ./default.nix {
    inherit pkgs system;
  };
in
nodePackages // {
    package = nodePackages.package.override {
        nativeBuildInputs = [ pkgs.nodePackages.node-pre-gyp ];

        preRebuild = ''
            find | grep "node-pre-gyp$"
            patchShebangs node_modules/@mapbox/node-pre-gyp/bin/node-pre-gyp
            patchShebangs node_modules/.bin/node-pre-gyp

            ls -la node_modules/argon2/package.json
            cat node_modules/argon2/package.json

            ls ${pkgs.nodePackages.node-pre-gyp}/bin/node-pre-gyp
        '';
    };
}

# nix repl
# flake = builtins.getFlake (toString /home/moritz/Documents/projektwahl-sveltekit)
# flake.packages.x86_64-linux.container