<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts" context="module">
	import type { Result } from '$lib/result';

	export const load: Load = async ({ page, fetch }) => {
		const url = `/projects/data/${page.params.id}.json`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: (await res.json()) as Result<Existing<RawProjectType>, { [key: string]: string }>
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	import type { Existing, RawProjectType } from '$lib/types';

	import type { Load } from '@sveltejs/kit';
	import Form from '../_form.svelte';

	export let entity: RawProjectType;
</script>

<svelte:head>
	<title>Projekt ändern</title>
</svelte:head>

<main class="container">
	<Form {entity} />
</main>
