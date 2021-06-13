<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
	import Ranking from './_Ranking.svelte';
	import CustomLayout from '/src/routes/_customLayout.svelte';
</script>

<CustomLayout>
	<EntityList
		initialQuery={{
			pagination_limit: '50',
			'sorting[]': ['rank:up', 'id:down-up', 'title:down-up']
		}}
		title="Wahl"
		url="election.json"
		createUrl="/404"
	>
		<thead slot="filter" let:headerClick let:currentSortValue let:query>
			<tr>
				<Sorting name="id" title="#" {headerClick} {currentSortValue} {query} />
				<Sorting name="title" title="Titel" {headerClick} {currentSortValue} {query} />
				<Sorting name="rank" title="Rang" {headerClick} {currentSortValue} {query} />
			</tr>
			<tr class="align-middle">
				<Filtering name="id" type="number" {query} />
				<Filtering name="title" type="text" {query} />
				<Filtering name="rank" type="number" {query} />
			</tr>
		</thead>
		<tbody slot="response" let:response>
			{#each response.entities as entity (entity.id)}
				<tr>
					<th scope="row">{entity.id}</th>
					<td>{entity.title}</td>
					<td>
						<Ranking {entity} />
					</td>
				</tr>
			{/each}
		</tbody>
	</EntityList>

	<!-- https://github.com/sveltejs/kit/issues/627 -->
	<footer slot="footer" style="position: sticky; bottom: 0; z-index: 1020;">
		<div class="alert alert-success mb-0 border-0 rounded-0" role="alert">
			A simple success alert—check it out!
		</div>
	</footer>
</CustomLayout>
