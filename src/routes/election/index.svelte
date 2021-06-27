<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
	import Ranking from './_Ranking.svelte';

	import { flip } from 'svelte/animate';
	import { scale } from 'svelte/transition';

	// https://javascript.plainenglish.io/advanced-svelte-transition-features-ca285b653437

	let list: EntityList;
</script>

<main class="container">
	<EntityList
		bind:this={list}
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
				<tr animate:flip={{ duration: 500 }} transition:scale={{ duration: 500 }}>
					<th scope="row">{entity.id}</th>
					<td>{entity.title}</td>
					<td>
						<Ranking {list} {entity} />
					</td>
				</tr>
			{/each}
		</tbody>
	</EntityList>
</main>

<!-- https://github.com/sveltejs/kit/issues/627 -->
<footer style="position: sticky; bottom: 0; z-index: 1020;">
	<div class="alert alert-success mb-0 border-0 rounded-0" role="alert">
		A simple success alert—check it out!
	</div>
</footer>
