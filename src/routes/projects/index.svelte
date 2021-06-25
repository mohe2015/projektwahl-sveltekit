<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import DeleteButton from '$lib/entity-list/DeleteButton.svelte';
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
	import CustomLayout from '/src/routes/_customLayout.svelte';

	let list: EntityList;
</script>

<CustomLayout>
	<EntityList
		bind:this={list}
		initialQuery={{
			pagination_limit: '10',
			'sorting[]': ['id:down-up', 'title:down-up']
		}}
		title="Projekte"
		url="projects.json"
		createUrl="/projects/create"
	>
		<thead slot="filter" let:headerClick let:currentSortValue let:query>
			<tr>
				<Sorting name="id" title="#" {headerClick} {currentSortValue} {query} />
				<Sorting name="title" title="Titel" {headerClick} {currentSortValue} {query} />
			</tr>
			<tr class="align-middle">
				<Filtering name="id" type="number" {query} />
				<Filtering name="title" type="text" {query} />
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
							refreshList={list.refresh}
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</EntityList>
</CustomLayout>
