<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { EntityResponseBody, FetchResponse } from '$lib/entites';

	import DeleteButton from '$lib/entity-list/DeleteButton.svelte';
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
	import { Readable, writable } from 'svelte/store';

	let list: EntityList;
	let response: Readable<FetchResponse<EntityResponseBody>>;
</script>

<main class="container">
	<EntityList
		bind:this={list}
		bind:response
		url={'projects.json'}
		query={writable({
			paginationLimit: 10,
			sorting: ['id:down-up', 'title:down-up'],
			paginationDirection: null,
			paginationCursor: null,
			filters: {}
		})}
		title="Projekte"
		createUrl="/projects/create"
	>
		<thead slot="filter" let:headerClick let:currentSortValue let:query>
			<tr>
				<Sorting name="id" title="#" {headerClick} {currentSortValue} {query} />
				<Sorting name="title" title="Titel" {headerClick} {currentSortValue} {query} />
				<th>Aktionen</th>
			</tr>
			<tr class="align-middle">
				<Filtering name="id" type="number" {query} />
				<Filtering name="title" type="text" {query} />
				<th scope="col" />
			</tr>
		</thead>
		<tbody slot="response">
			{#if $response?.error}
				<div class="alert alert-danger" role="alert">
					Fehler {$response.error}
				</div>
			{:else}
				{#each $response?.success?.entities ?? [] as entity (entity.id)}
					<tr>
						<th scope="row">{entity.id}</th>
						<td>{entity.title}</td>
						<td>
							<a class="btn btn-secondary" href="/projects/edit/{entity.id}" role="button">
								<i class="bi bi-pen" />
							</a>
							<DeleteButton
								entityId={entity.id}
								entityName={entity.title}
								path="projects"
								refreshList={() => list.refresh()}
							/>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</EntityList>
</main>
