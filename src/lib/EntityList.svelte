<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts" context="module">
	export type BaseQuery = {
		paginationDirection: 'forwards' | 'backwards' | null;
		paginationCursor: BaseEntityType | null;
		sorting: string[]; // TODO FIXME format
		paginationLimit: number;
		filters: any;
	};
</script>

<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { BaseEntityType, BaseQueryType, EntityResponseBody } from './entites';
	import { writable } from 'svelte/store';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { HTTPError } from './authorization';

	export let title: string;
	export let createUrl: string | null;
	export let response: Promise<EntityResponseBody>;
	export let fullInvalidationUrl: string;

	// TODO FIXME A/B testing for sorting (whether to priority first or last chosen option)
	// you wanna sort for type then name

	// TODO FIXME should sorting order change reset to page 1
	// TODO FIXMe should filter change reset to page 1?

	// TODO FIXME pagination add "first" and "last"

	export let query: Writable<BaseQuery>;

	export let url: string;

	export const headerClick = (sortType: string): void => {
		let oldElementIndex = $query.sorting.findIndex((e) => e.startsWith(sortType + ':'));
		let oldElement = $query.sorting.splice(oldElementIndex, 1)[0];

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

		$query.sorting = [...$query.sorting, oldElement.split(':')[0] + ':' + newElement];
	};

	export async function refresh() {
		await invalidate(fullInvalidationUrl);
	}

	export const currentSortValue = (sorting: string[], sortingType: string): string => {
		return sorting.find((e) => e.startsWith(sortingType + ':'))?.split(':')[1] ?? '';
	};

	$: response = (async () => {
		const fullUrl = `/${url}?${JSON.stringify(query)}`;
		const res = await fetch(fullUrl, {
			credentials: 'same-origin'
		});
		if (!res.ok) {
			throw new HTTPError(res.status, res.statusText);
		}
		return (await res.json()) as EntityResponseBody;
	})();
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<h1 class="text-center">{title}</h1>

<div class="row justify-content-between">
	<div class="col-auto">
		{#if createUrl}<a class="btn btn-primary" href={createUrl} role="button">{title} erstellen</a
			>{/if}
		<slot name="buttons" />
	</div>

	<div class="col-3">
		<!-- svelte-ignore a11y-no-onchange -->
		<select
			bind:value={$query.paginationLimit}
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

{#await response}
	Wird geladen...
{:then response}
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
{/await}
