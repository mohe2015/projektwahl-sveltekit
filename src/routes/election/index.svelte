<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import Ranking from './_Ranking.svelte';
	import { flip } from 'svelte/animate';
	import { Readable, Writable, writable } from 'svelte/store';
	import EntityList from '$lib/entity-list/EntityList.svelte';
import type { EntityResponseBody, Existing, RawProjectType, ResettableChoiceType } from '$lib/types';
import { isErr, isOk, PromiseResult } from '$lib/result';
import NumberFiltering from '$lib/entity-list/NumberFiltering.svelte';
import TextFiltering from '$lib/entity-list/TextFiltering.svelte';
import type { BaseQuery } from '$lib/list-entities';

	// https://javascript.plainenglish.io/advanced-svelte-transition-features-ca285b653437

	type E = Existing<RawProjectType> & ResettableChoiceType;

	let list: EntityList<E>;
	let response: Readable<PromiseResult<EntityResponseBody<E>, { [key: string]: string }>>;

	let query: Writable<BaseQuery<E>> = writable({
		sorting: ['rank:ASC', 'id:down-up', 'title:down-up'],
		paginationLimit: 50,
		paginationDirection: null,
		paginationCursor: null,
		filters: {}
	});
</script>

<main class="container">
	<EntityList
		bind:this={list}
		bind:response
		url={'election.json'}
		{query}
		title="Wahl"
		createUrl={null}
	>
		<thead slot="filter" let:headerClick let:currentSortValue>
			<tr>
				<Sorting name="id" title="#" {headerClick} {currentSortValue} {query} />
				<Sorting name="title" title="Titel" {headerClick} {currentSortValue} {query} />
				<Sorting name="rank" title="Rang" {headerClick} {currentSortValue} {query} />
			</tr>
			<tr class="align-middle">
				<NumberFiltering name="id" {query} />
				<TextFiltering name="title" {query} />
				<NumberFiltering name="rank" {query} />
			</tr>
		</thead>
		<tbody slot="response">
			{#if isErr($response)}
				<tr>
					<td colspan="3">
						<div class="alert alert-danger w-100" role="alert">
							Fehler {$response.failure}
						</div>
					</td>
				</tr>
			{:else if isOk($response) }
				{#each $response?.success?.entities ?? [] as entity (entity.id)}
					<tr animate:flip={{ duration: 500 }}>
						<th scope="row">{entity.id}</th>
						<td>{entity.title}</td>
						<td>
							<Ranking {list} {entity} />
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</EntityList>
</main>

<!-- https://github.com/sveltejs/kit/issues/627 -->
<footer style="position: sticky; bottom: 0; z-index: 1020;">
	<div class="alert alert-success mb-0 border-0 rounded-0" role="alert">
		A simple success alert—check it out!
	</div>
</footer>
