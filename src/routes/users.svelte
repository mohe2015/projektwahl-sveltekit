<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts" context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, context }) {
		console.log("load")
        const url = `/users.json`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: {
					users: await res.json()
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>
<script lang="ts">
    export let users;
</script>
<svelte:head>
	<title>Nutzer</title>
</svelte:head>

<h1 class="text-center">Nutzer</h1>

{#each users as { name, type}}

{name}
{type}

{/each}
