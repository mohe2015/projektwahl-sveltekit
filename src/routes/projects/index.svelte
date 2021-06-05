<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
</script>

<EntityList
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
			</tr>
		{/each}
	</tbody>
</EntityList>
