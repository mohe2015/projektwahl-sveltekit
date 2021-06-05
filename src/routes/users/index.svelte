<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';

	type UsersQueryParameters = {
		'filter_types[]': string[];
		pagination_limit: string;
		'sorting[]': string[];
		filter_id?: string;
		filter_name?: string;
	};
</script>

<EntityList
	initialQuery={{
		'filter_types[]': ['admin', 'helper', 'voter'],
		pagination_limit: '10',
		'sorting[]': ['id:down-up', 'name:down-up', 'type:down-up']
	}}
	title="Nutzer"
	url="users.json"
	createUrl="/users/create"
>
	<thead slot="filter" let:headerClick let:currentSortValue let:query>
		<tr>
			<Sorting name="id" title="#" {headerClick} {currentSortValue} {query} />
			<Sorting name="name" title="Name" {headerClick} {currentSortValue} {query} />
			<Sorting name="type" title="Typ" {headerClick} {currentSortValue} {query} />
		</tr>
		<tr class="align-middle">
			<Filtering name="id" type="number" {query} />
			<Filtering name="name" type="text" {query} />
			<Filtering name="types[]" type="text" {query} />
			<!-- TODO FIXME -->
		</tr>
	</thead>
	<tbody slot="response" let:response>
		{#each response.entities as entity (entity.id)}
			<tr>
				<th scope="row">{entity.id}</th>
				<td>{entity.name}</td>
				<td>{entity.type}</td>
			</tr>
		{/each}
	</tbody>
</EntityList>

<!--
<th scope="col">
	<select
		bind:value={$query['filter_types[]']}
		class="form-select form-select-sm"
		multiple
		size="3"
		aria-label="Filter by type"
	>
		<option value="admin">admin</option>
		<option value="helper">helper</option>
		<option value="voter">voter</option>
	</select>
</th>
-->
<style>
	.table-cell-hover:hover {
		--bs-table-accent-bg: var(--bs-table-hover-bg);
		color: var(--bs-table-hover-color);
	}
</style>
