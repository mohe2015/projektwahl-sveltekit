<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit/types/page';

	export const load: Load = async function ({ page, fetch, session, context }) {
		let url = '/user/me.json';
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: await res.json()
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	import type { UserType } from '$lib/types';

	export let user: UserType;
</script>

<svelte:head>
	<title>Willkommen</title>
</svelte:head>

<h1 class="text-center">Willkommen</h1>

{#if user}
	Hallo {user.name}!
{:else}
	Noch nicht angemeldet.
{/if}
