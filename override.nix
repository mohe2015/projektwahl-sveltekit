{pkgs ? import <nixpkgs> {
    inherit system;
}, system ? builtins.currentSystem}:

let
  nodePackages = import ./default.nix {
    inherit pkgs system;
  };
in
nodePackages // {
    sources."argon2-0.28.2" = nodePackages.sources."argon2-0.28.2".override {
        
    };
}

# nix repl
# flake = builtins.getFlake (toString /home/moritz/Documents/projektwahl-sveltekit)
# flake.packages.x86_64-linux.container