// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import preprocess from 'svelte-preprocess';
import node from '@sveltejs/adapter-node';

// https://github.com/sveltejs/integrations#bundler-plugins

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	compilerOptions: {},
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: node(),
		prerender: {
			enabled: false
		}, // build makes database requests otherwise
		vite: {
			optimizeDeps: {
				exclude: ['fs/promises']
			},
			build: {
				rollupOptions: {
					external: ['fs/promises']
				}
			},
			ssr: {
				external: ['fs/promises']
			},
		}
	}
};

export default config;
