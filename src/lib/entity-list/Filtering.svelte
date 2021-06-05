<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseQueryType } from '$lib/EntityList.svelte';
	import type { Writable } from 'svelte/store';

	export let query: Writable<BaseQueryType>;
	export let name: string;
	export let type: 'text' | 'number' = 'text';
</script>

{#if type === 'text'}
	<th scope="col">
		<input
			bind:value={$query[`filter_${name}`]}
			type="text"
			class="form-control"
			id="projects-filter-{name}"
		/>
	</th>
{:else if type === 'number'}
	<th scope="col">
		<input
			bind:value={$query[`filter_${name}`]}
			type="number"
			class="form-control"
			id="projects-filter-{name}"
		/>
	</th>
{:else}
	<div class="alert alert-danger" role="alert">
		Interner Fehler: Unbekannter Eingabe-Typ: {type}
	</div>
{/if}
