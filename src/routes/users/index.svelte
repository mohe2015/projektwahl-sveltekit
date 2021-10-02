<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Filtering from '../../lib/entity-list/Filtering.svelte';
	import Sorting from '../../lib/entity-list/Sorting.svelte';
	import EntityList from '../../lib/EntityList.svelte';
	import ListFiltering from '../../lib/entity-list/ListFiltering.svelte';
	import DeleteButton from '$lib/entity-list/DeleteButton.svelte';
	import { writable } from 'svelte/store';

	let list: EntityList;
	export let fullInvalidationUrl: string;
</script>

<main class="container">
	<EntityList
		bind:this={list}
		{fullInvalidationUrl}
		url="users.json"
		query={writable({
			filters: {
				types: ['admin', 'helper', 'voter']
			},
			paginationLimit: 10,
			sorting: ['id:down-up', 'name:down-up', 'type:down-up'],
			paginationCursor: null,
			paginationDirection: null
		})}
		title="Nutzer"
		createUrl="/users/create"
	>
		<a slot="buttons" class="btn btn-primary" href="/users/import" role="button"
			>Nutzer importieren</a
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
				<ListFiltering name="types" options={['admin', 'helper', 'voter']} {query} />
				<th scope="col" />
			</tr>
		</thead>
		<tbody slot="response" let:response>
			{#await response}
				Wird geladen...
			{:then response}
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
							<a class="btn btn-secondary" href="/users/edit/{entity.id}" role="button">
								<i class="bi bi-pen" />
							</a>
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

							<DeleteButton
								entityId={entity.id}
								entityName={entity.name}
								path="users"
								refreshList={() => list.refresh()}
							/>
						</td>
					</tr>
				{/each}
			{/await}
		</tbody>
	</EntityList>
</main>
