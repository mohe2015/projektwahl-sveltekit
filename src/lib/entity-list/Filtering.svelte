<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseQuery } from '$lib/list-entities';

	import type { Writable } from 'svelte/store';

	type E = $$Generic;

	export let query: Writable<BaseQuery<E>>;
	export let name: keyof E;
	export let type: 'text' | 'number' | 'boolean' = 'text';
</script>

<!-- because of a limitation of svelte (binding with dynamic type not possible) we need to duplicate the code here -->
{#if type === 'text'}
	<th scope="col">
		<input
			bind:value={$query.filters[name]}
			type="text"
			class="form-control"
			id="projects-filter-{name}"
		/>
	</th>
{:else if type === 'number'}
	<th scope="col">
		<input
			bind:value={$query.filters[name]}
			type="number"
			class="form-control"
			id="projects-filter-{name}"
		/>
	</th>
{:else if type === 'boolean'}
	<th scope="col">
		<input
			bind:checked={$query.filters[name]}
			type="checkbox"
			class="form-check-input"
			id="projects-filter-{name}"
		/>
	</th>
{:else}
	<div class="alert alert-danger" role="alert">
		Interner Fehler: Unbekannter Eingabe-Typ: {type}
	</div>
{/if}
