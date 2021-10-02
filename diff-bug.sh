# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

cd build-broken
npx prettier --write .
cd ..

cd build
npx prettier --write .
cd ..

diff --color -r build build-broken/

diff --color build/assets/_app/chunks/_form-a0aad7bd.js build-broken/assets/_app/chunks/_form-a7a54ad5.js

diff --color build/assets/_app/pages/projects/create.svelte-d2c2315b.js build-broken/assets/_app/pages/projects/create.svelte-88cb6249.js

diff --color build/assets/_app/pages/projects/edit/[id].svelte-41922f98.js build-broken/assets/_app/pages/projects/edit/[id].svelte-20c7f27b.js

diff --color build/assets/_app/start-bbd1829a.js build-broken/assets/_app/start-de6229eb.js

