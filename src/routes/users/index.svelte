<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/entity-list/EntityList.svelte';
	import ListFiltering from '$lib/entity-list/ListFiltering.svelte';
	import DeleteButton from '$lib/entity-list/DeleteButton.svelte';
	import { Writable, writable } from 'svelte/store';
	import type { Existing, RawUserType } from '$lib/types';
	import type { BaseQuery } from '$lib/list-entities';
	import NumberFiltering from '$lib/entity-list/NumberFiltering.svelte';
	import TextFiltering from '$lib/entity-list/TextFiltering.svelte';
	import { isErr, isOk } from '$lib/result';

	let list: EntityList<Existing<RawUserType>>;
	let query: Writable<BaseQuery<Existing<RawUserType>>> = writable({
		filters: {
			type: ['admin', 'helper', 'voter'] as unknown as 'admin'
		},
		paginationLimit: 10,
		sorting: ['id:down-up', 'name:down-up', 'type:down-up'],
		paginationCursor: null,
		paginationDirection: null
	});
</script>

<main class="container">
	<EntityList bind:this={list} url="users.json" {query} title="Nutzer" createUrl="/users/create">
		<a slot="buttons" class="btn btn-primary" href="/users/import" role="button"
			>Nutzer importieren</a
		>
		<thead slot="filter" let:headerClick let:currentSortValue>
			<tr>
				<Sorting name="id" title="#" {headerClick} {currentSortValue} {query} />
				<Sorting name="name" title="Name" {headerClick} {currentSortValue} {query} />
				<Sorting name="type" title="Typ" {headerClick} {currentSortValue} {query} />
				<th>Aktionen</th>
			</tr>
			<tr class="align-middle">
				<NumberFiltering name="id" {query} />
				<TextFiltering name="name" {query} />
				<ListFiltering name="type" options={['admin', 'helper', 'voter']} {query} />
				<th scope="col" />
			</tr>
		</thead>
		<tbody slot="response" let:response>
			{#if isErr(response)}
				<tr>
					<td colspan="4">
						<div class="alert alert-danger w-100" role="alert">
							Fehler {response.failure}
						</div>
					</td>
				</tr>
			{:else if isOk(response) || response.result === 'loading'}
				{#each response.success?.entities /* eslint-disable-line @typescript-eslint/no-unsafe-member-access */ ?? [] as entity (entity.id)}
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
								refreshList={() => {
									list.refresh(); /* eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
								}}
							/>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</EntityList>
</main>
