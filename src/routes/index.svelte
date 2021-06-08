<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit/types/page';

	export const load: Load = async function ({ page, fetch, session, context }) {
		const res = await fetch('/welcome.json');

		if (res.ok) {
			return {
				props: await res.json()
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load /welcome.json`)
		};
	};
</script>

<script lang="ts">
	export let text: string;
</script>

<svelte:head>
	<title>Willkommen</title>
</svelte:head>

<h1 class="text-center">Willkommen</h1>

{text}
