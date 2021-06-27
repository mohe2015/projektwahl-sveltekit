<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script context="module" lang="ts">
	import { buildLoad } from '$lib/entites';
	import type { BaseQueryType } from '$lib/entites';
	import type { Load } from '@sveltejs/kit';

	export const load: Load = buildLoad('projects.json', {
		pagination_limit: '10',
		'sorting[]': ['id:down-up', 'title:down-up']
	});
</script>

<script lang="ts">
	import DeleteButton from '$lib/entity-list/DeleteButton.svelte';
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
	import type { EntityResponseBody } from '$lib/entites';

	let list: EntityList;
	export let theResponse: EntityResponseBody;
	export let fullInvalidationUrl: string;
	export let initialQuery: BaseQueryType;
</script>

<main class="container">
	<EntityList
		bind:this={list}
		response={theResponse}
		{fullInvalidationUrl}
		{initialQuery}
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
		<tbody slot="response" let:response>
			{#each response.entities as entity (entity.id)}
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
		</tbody>
	</EntityList>
</main>
