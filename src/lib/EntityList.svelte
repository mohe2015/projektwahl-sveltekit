<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="typescript">
	import { query as query2 } from './writable_url';
	import type { Writable } from 'svelte/store';
	import type { BaseEntityType, BaseQueryType, EntityResponseBody } from './entites';
	import { writable } from 'svelte/store';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';

	export let initialQuery: BaseQueryType; // TODO FIXME we need generic components
	export let title: string;
	export let createUrl: string;
	export let response: EntityResponseBody;
	export let fullInvalidationUrl: string;

	export let query: Writable<BaseQueryType> = query2<BaseQueryType>(initialQuery);

	// TODO FIXME A/B testing for sorting (whether to priority first or last chosen option)
	// you wanna sort for type then name

	// TODO FIXME should sorting order change reset to page 1
	// TODO FIXMe should filter change reset to page 1?

	let paginationDirection: Writable<'forwards' | 'backwards' | null> = writable(null);
	let paginationCursor: Writable<BaseEntityType | null> = writable(null);

	export const headerClick = (sortType: string): void => {
		let value = $query['sorting[]'];
		let oldElementIndex = value.findIndex((e) => e.startsWith(sortType + ':'));
		let oldElement = value.splice(oldElementIndex, 1)[0];

		let newElement: string;
		switch (oldElement.split(':')[1]) {
			case 'down-up':
				newElement = 'ASC';
				break;
			case 'ASC':
				newElement = 'DESC';
				break;
			default:
				newElement = 'down-up';
		}

		$query['sorting[]'] = [...value, oldElement.split(':')[0] + ':' + newElement];
	};

	export async function refresh() {
		console.log('invalidate');
		await invalidate(fullInvalidationUrl);
	}

	export const currentSortValue = (sorting: string[], sortingType: string): string => {
		return sorting.find((e) => e.startsWith(sortingType + ':'))?.split(':')[1] ?? '';
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<h1 class="text-center">{title}</h1>

<div class="row justify-content-between">
	<div class="col-auto">
		<a class="btn btn-primary" href={createUrl} role="button">{title} erstellen</a>
		<slot name="buttons" />
	</div>

	<div class="col-3">
		<!-- svelte-ignore a11y-no-onchange -->
		<select
			bind:value={$query.pagination_limit}
			class="form-select"
			aria-label="Default select example"
		>
			<option value="10">10 pro Seite</option>
			<option value="25">25 pro Seite</option>
			<option value="50">50 pro Seite</option>
			<option value="100">100 pro Seite</option>
		</select>
	</div>
</div>

<table class="table">
	<slot name="filter" {headerClick} {currentSortValue} {query} />
	<slot name="response" {response} />
</table>

<nav aria-label="Navigation der Nutzerliste">
	<ul class="pagination justify-content-center">
		<li class="page-item {response.previousCursor ? '' : 'disabled'}">
			<a
				on:click|preventDefault={async () => {
					await goto($page.path + '?' + $page.query, {
						state: {
							paginationCursor: response.previousCursor,
							paginationDirection: 'backwards'
						}
					});
					await refresh(); // TODO FIXME backwards pagination should also invalidate
				}}
				class="page-link"
				href="/"
				aria-label="Vorherige Seite"
				tabindex={response.previousCursor ? undefined : -1}
				aria-disabled={!response.previousCursor}
			>
				<span aria-hidden="true">&laquo;</span>
			</a>
		</li>
		<li class="page-item {response.nextCursor ? '' : 'disabled'}">
			<a
				on:click|preventDefault={async () => {
					await goto($page.path + '?' + $page.query, {
						state: {
							paginationCursor: response.nextCursor,
							paginationDirection: 'forwards'
						}
					});
					await refresh();
				}}
				class="page-link"
				href="/"
				aria-label="Nächste Seite"
				tabindex={response.nextCursor ? undefined : -1}
				aria-disabled={!response.nextCursor}
			>
				<span aria-hidden="true">&raquo;</span>
			</a>
		</li>
	</ul>
</nav>
