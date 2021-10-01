<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseQueryType } from '$lib/entites';

	import type { Writable } from 'svelte/store';

	export let filters: Writable<any>;
	export let name: string;
	export let type: 'text' | 'number' = 'text';
</script>

<!-- because of a limitation of svelte (binding with dynamic type not possible) we need to duplicate the code here -->
{#if type === 'text'}
	<th scope="col">
		<input
			bind:value={$filters[name]}
			type="text"
			class="form-control"
			id="projects-filter-{name}"
		/>
	</th>
{:else if type === 'number'}
	<th scope="col">
		<input
			bind:value={$filters[name]}
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
