<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { derived, Readable, writable, Writable } from 'svelte/store';
	import type { BaseEntityType, BaseQueryType, EntityResponseBody, FetchResponse } from './entites';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { HTTPError } from './authorization';
	import type { BaseQuery } from './list-entities';
	import { browser } from '$app/env';
	import { update_await_block_branch } from 'svelte/internal';

	export let title: string;
	export let createUrl: string | null;

	// TODO FIXME A/B testing for sorting (whether to priority first or last chosen option)
	// you wanna sort for type then name

	// TODO FIXME should sorting order change reset to page 1
	// TODO FIXMe should filter change reset to page 1?

	// TODO FIXME pagination add "first" and "last"

	export let query: Writable<BaseQuery>;

	export let url: string;

	export let loading: Writable<boolean> = writable(true);

	export let response: Readable<FetchResponse<EntityResponseBody>> = derived(
		query,
		($query, set) => {
			if (browser) {
				// TODO FIXME
				(async () => {
					loading.set(true);

					const fullUrl = 'http://' + $page.host + `/${url}?${btoa(JSON.stringify($query))}`;
					console.log(fullUrl);
					const res = await fetch(fullUrl, {
						method: 'GET',
						credentials: 'include'
					});
					if (!res.ok) {
						set({
							success: undefined,
							error: res.status + ' ' + res.statusText
						} as FetchResponse<EntityResponseBody>);
					} else {
						set({
							success: (await res.json()) as EntityResponseBody,
							error: undefined
						} as FetchResponse<EntityResponseBody>);
					}
					loading.set(false);
					// TODO FIXME we probably need to unset previous set to prevent race conditions
				})();
			}
		},
		{
			success: undefined,
			error: undefined
		} as FetchResponse<EntityResponseBody>
	);

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
		$query = $query;
	}

	export const currentSortValue = (sorting: string[], sortingType: string): string => {
		return sorting.find((e) => e.startsWith(sortingType + ':'))?.split(':')[1] ?? '';
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div style="position: absolute; top: 50%; left: 50%;">
	{#if $loading}
		<div class="spinner-grow text-primary" role="status">
			<span class="visually-hidden">Loading...</span>
		</div>
	{/if}
</div>

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
			<option value={10}>10 pro Seite</option>
			<option value={25}>25 pro Seite</option>
			<option value={50}>50 pro Seite</option>
			<option value={100}>100 pro Seite</option>
		</select>
	</div>
</div>

<table class="table">
	<slot name="filter" {headerClick} {currentSortValue} {query} />
	<slot name="response" {response} />
</table>
<nav aria-label="Navigation der Nutzerliste">
	<ul class="pagination justify-content-center">
		<!-- { # await only works in blocks -->
		<li class="page-item {$response.success?.previousCursor ? '' : 'disabled'}">
			<a
				on:click|preventDefault={() => {
					($query.paginationCursor = $response.success?.previousCursor ?? null),
						($query.paginationDirection = 'backwards');
				}}
				class="page-link"
				href="/"
				aria-label="Vorherige Seite"
				tabindex={$response.success?.previousCursor ? undefined : -1}
				aria-disabled={!$response.success?.previousCursor}
			>
				<span aria-hidden="true">&laquo;</span>
			</a>
		</li>
		<li class="page-item {$response.success?.nextCursor ? '' : 'disabled'}">
			<a
				on:click|preventDefault={() => {
					($query.paginationCursor = $response.success?.nextCursor ?? null),
						($query.paginationDirection = 'forwards');
				}}
				class="page-link"
				href="/"
				aria-label="Nächste Seite"
				tabindex={$response.success?.nextCursor ? undefined : -1}
				aria-disabled={!$response.success?.nextCursor}
			>
				<span aria-hidden="true">&raquo;</span>
			</a>
		</li>
	</ul>
</nav>
