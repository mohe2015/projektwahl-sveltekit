<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="typescript" context="module">
	export type BaseQueryType = {
		'sorting[]': string[];
		[x: string]: any;
	};
</script>

<script lang="typescript">
	import { query as query2, query2location } from '$lib/writable_url';
	import type { Writable } from 'svelte/store';

	type BaseEntityType = {
		id: string;
		[x: string]: any;
	};

	type EntityResponseBody = {
		entities: Array<BaseEntityType>; // TODO FIXME we need generic components
		previousCursor: number | null;
		nextCursor: number | null;
	};

	export let initialQuery: BaseQueryType; // TODO FIXME we need generic components
	export let url: string;
	export let title: string;
	export let createUrl: string;

	export let query: Writable<BaseQueryType> = query2<BaseQueryType>(initialQuery);

	// TODO FIXME A/B testing for sorting (whether to priority first or last chosen option)
	// you wanna sort for type then name

	export let response: EntityResponseBody = {
		entities: [],
		previousCursor: null,
		nextCursor: null
	};

	let paginationDirection: 'forwards' | 'backwards' | null = 'forwards';
	let paginationCursor: number | null = null;

	export const headerClick = (sortType: string) => {
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

	async function reloadEntities(
		query: BaseQueryType,
		paginationDirection: 'forwards' | 'backwards' | null,
		paginationCursor: number | null
	) {
		const urlSearchParams = new URLSearchParams(query2location(query));
		if (paginationDirection !== null) {
			urlSearchParams.set('pagination_direction', paginationDirection);
		}
		if (paginationCursor !== null) {
			urlSearchParams.set('pagination_cursor', paginationCursor.toString());
		}
		const fullUrl = `${import.meta.env.VITE_BASE_URL}${url}?${urlSearchParams}`;
		console.log(fullUrl);
		const res = await fetch(fullUrl);
		response = await res.json();
	}

	// TODO FIXME optimize - the initial load makes an additional request
	// TODO FIXME https://github.com/sveltejs/svelte/issues/2118 maybe use derived store instead
	$: reloadEntities($query, paginationDirection, paginationCursor);

	export const currentSortValue = (sorting: any, sortingType: string) => {
		return (sorting as unknown as string[])
			.find((e) => e.startsWith(sortingType + ':'))!
			.split(':')[1];
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
	<slot name="response" {response} />
</table>

<nav aria-label="Navigation der Nutzerliste">
	<ul class="pagination justify-content-center">
		<li class="page-item {response.previousCursor ? '' : 'disabled'}">
			<a
				on:click|preventDefault={() => {
					paginationCursor = response.previousCursor;
					paginationDirection = 'backwards';
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
				on:click|preventDefault={() => {
					paginationCursor = response.nextCursor;
					paginationDirection = 'forwards';
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

<style>
	.table-cell-hover:hover {
		--bs-table-accent-bg: var(--bs-table-hover-bg);
		color: var(--bs-table-hover-color);
	}
</style>
