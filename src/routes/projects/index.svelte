<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import DeleteButton from '$lib/entity-list/DeleteButton.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/entity-list/EntityList.svelte';
	import { Readable, Writable, writable } from 'svelte/store';
import type { EntityResponseBody, Existing, RawProjectType, Result } from '$lib/types';
import type { BaseQuery } from '$lib/list-entities';
import NumberFiltering from '$lib/entity-list/NumberFiltering.svelte';
import TextFiltering from '$lib/entity-list/TextFiltering.svelte';

	let list: EntityList<Existing<RawProjectType>>;
	let response: Readable<Result<EntityResponseBody<Existing<RawProjectType>>>>;
	let query: Writable<BaseQuery<Existing<RawProjectType>>> = writable({
		paginationLimit: 10,
		sorting: ['id:down-up', 'title:down-up'],
		paginationDirection: null,
		paginationCursor: null,
		filters: {}
	});
</script>

<main class="container">
	<EntityList
		bind:this={list}
		bind:response
		url={'projects.json'}
		{query}
		title="Projekte"
		createUrl="/projects/create"
	>
		<thead slot="filter" let:headerClick let:currentSortValue>
			<tr>
				<Sorting name="id" title="#" {headerClick} {currentSortValue} {query} />
				<Sorting name="title" title="Titel" {headerClick} {currentSortValue} {query} />
				<th>Aktionen</th>
			</tr>
			<tr class="align-middle">
				<NumberFiltering name="id" {query} />
				<TextFiltering name="title" {query} />
				<th scope="col" />
			</tr>
		</thead>
		<tbody slot="response">
			{#if $response?.failure}
				<tr>
					<td colspan="3">
						<div class="alert alert-danger w-100" role="alert">
							Fehler {$response.failure}
						</div>
					</td>
				</tr>
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
								refreshList={async () => list.refresh()}
							/>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</EntityList>
</main>
