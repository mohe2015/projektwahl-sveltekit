<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	const sleep = (milliseconds: number) => {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	};

	export const load: Load = async () => {
		//await sleep(1000);

		return {
			status: 200
		};
	};
</script>

<script lang="ts">
	import { session } from '$app/stores';
</script>

<svelte:head>
	<title>Willkommen</title>
</svelte:head>

<main class="container">
	<h1 class="text-center">Willkommen</h1>

	{#if $session.user !== null}
		Hallo {$session.user.name}!
	{:else}
		Noch nicht angemeldet.
	{/if}
</main>
