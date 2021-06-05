<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
	import ListFiltering from '$lib/entity-list/ListFiltering.svelte';
	/*
	type UsersQueryParameters = {
		'filter_types[]': string[];
		pagination_limit: string;
		'sorting[]': string[];
		filter_id?: string;
		filter_name?: string;
	};
*/
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
			<th>Aktionen</th>
		</tr>
		<tr class="align-middle">
			<Filtering name="id" type="number" {query} />
			<Filtering name="name" type="text" {query} />
			<ListFiltering name="types[]" options={['admin', 'helper', 'voter']} {query} />
			<th scope="col" />
		</tr>
	</thead>
	<tbody slot="response" let:response>
		{#each response.entities as entity (entity.id)}
			<tr>
				<th scope="row">{entity.id}</th>
				<td>{entity.name}</td>
				<td>{entity.type}</td>
				<td>
					<!--
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-eye"></i>
				   </button>
				   -->
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-pen" />
					</button>
					<!--
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-key"></i>
				   	</button>
					-->
					<!--
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-person-check"></i>
				   	</button>
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-person-x"></i>
				   	</button>
					-->
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-box-arrow-in-right" />
					</button>
					<!--
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-trash"></i>
				   	</button>
					-->
				</td>
			</tr>
		{/each}
	</tbody>
</EntityList>
