<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="typescript">
	import { query as query2, query2location } from './writable_url';
	import type { Readable, Writable } from 'svelte/store';
	import type { BaseEntityType, BaseQueryType, EntityResponseBody } from './list-entities';
	import { writable, derived } from 'svelte/store';

	export let initialQuery: BaseQueryType; // TODO FIXME we need generic components
	export let reloadEntities: (
		query: BaseQueryType,
		paginationDirection: 'forwards' | 'backwards' | null,
		paginationCursor: BaseEntityType | null
	) => Promise<EntityResponseBody>;
	export let title: string;
	export let createUrl: string;
	export let initialData: EntityResponseBody;

	export let query: Writable<BaseQueryType> = query2<BaseQueryType>(initialQuery);

	// TODO FIXME A/B testing for sorting (whether to priority first or last chosen option)
	// you wanna sort for type then name

	// TODO FIXME should sorting order change reset to page 1
	// TODO FIXMe should filter change reset to page 1?

	let paginationDirection: Writable<'forwards' | 'backwards' | null> = writable(null);
	let paginationCursor: Writable<BaseEntityType | null> = writable(null);
	let refreshStoreHack: Writable<number> = writable(0);

	const response: Readable<EntityResponseBody> = derived(
		[query, paginationDirection, paginationCursor, refreshStoreHack],
		([$query, $paginationDirection, $paginationCursor, $refreshStoreHack], set) => {
			reloadEntities($query, $paginationDirection, $paginationCursor).then((data) => {
				console.log(data);
				set(data);
			});

			return (): void => {
				// We override the `set` function to eliminate race conditions
				// This does *not* abort running fetch() requests, it only prevents
				// them from overriding the store.
				// To learn about canceling fetch requests, search the internet for `AbortController`
				set = (): void => {
					// do nothing.
				};
			};
		},
		initialData
	);

	export const headerClick = (sortType: string): void => {
		let oldElementIndex = $query['sorting[]'].findIndex((e) => e.startsWith(sortType + ':'));
		let oldElement = $query['sorting[]'].splice(oldElementIndex, 1)[0];

		let newElement: string;
		switch (oldElement.split(':')[1]) {
			case 'down-up':
				newElement = 'up';
				break;
			case 'up':
				newElement = 'down';
				break;
			default:
				newElement = 'down-up';
		}

		$query['sorting[]'] = [...$query['sorting[]'], oldElement.split(':')[0] + ':' + newElement];
	};

	// TODO FIXME optimize - the initial load makes an additional request
	// TODO FIXME https://github.com/sveltejs/svelte/issues/2118 maybe use derived store instead

	export async function refresh() {
		refreshStoreHack.set($refreshStoreHack + 1);
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
	</div>

	<!-- filter (for filtering by name, type, ..) <i class="bi-filter" role="img" aria-label="Filter" />
	-->

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
	<slot name="response" response={$response} />
</table>

<nav aria-label="Navigation der Nutzerliste">
	<ul class="pagination justify-content-center">
		<li class="page-item {$response.previousCursor ? '' : 'disabled'}">
			<a
				on:click|preventDefault={() => {
					$paginationCursor = $response.previousCursor;
					$paginationDirection = 'backwards';
				}}
				class="page-link"
				href="/"
				aria-label="Vorherige Seite"
				tabindex={$response.previousCursor ? undefined : -1}
				aria-disabled={!$response.previousCursor}
			>
				<span aria-hidden="true">&laquo;</span>
			</a>
		</li>
		<li class="page-item {$response.nextCursor ? '' : 'disabled'}">
			<a
				on:click|preventDefault={() => {
					$paginationCursor = $response.nextCursor;
					$paginationDirection = 'forwards';
				}}
				class="page-link"
				href="/"
				aria-label="Nächste Seite"
				tabindex={$response.nextCursor ? undefined : -1}
				aria-disabled={!$response.nextCursor}
			>
				<span aria-hidden="true">&raquo;</span>
			</a>
		</li>
	</ul>
</nav>
