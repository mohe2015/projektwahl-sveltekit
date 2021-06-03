<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { UsersResponseBody } from '../users.json';
	import { query as query2 } from '$lib/writable_url';

	let query = query2({
		'filter_types[]': ['admin', 'helper', 'voter'] as unknown as string, // HACK
		pagination_limit: '10',
		'sorting[]': ['id:down-up', 'name:down-up', 'type:down-up'] as unknown as string
	});

	// TODO FIXME A/B testing for sorting (whether to priority first or last chosen option)
	// you wanna sort for type then name

	export let response: UsersResponseBody = {
		users: [],
		previousCursor: null,
		nextCursor: null
	};

	let paginationDirection: 'forwards' | 'backwards' | null = null;
	let paginationCursor: number | null = null;

	function headerClick(sortType: 'id' | 'name' | 'type') {
		let oldElementIndex = ($query['sorting[]'] as never as string[]).findIndex((e) =>
			e.startsWith(sortType + ':')
		);
		let oldElement = ($query['sorting[]'] as never as string[]).splice(oldElementIndex, 1)[0];

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

		$query['sorting[]'] = [
			...$query['sorting[]'],
			oldElement.split(':')[0] + ':' + newElement
		] as never as string;
	}

	async function reloadUsers(
		sorting: string[],
		filterId: string,
		filterName: string,
		filteredTypes: string[],
		paginationLimit: string,
		paginationDirection: 'forwards' | 'backwards' | null,
		paginationCursor: number | null
	) {
		// this is a hack as the load function is reponsible for initial load
		//if (initialRender) {
		//	initialRender = false;
		//	return;
		//}
		const urlSearchParams = new URLSearchParams();
		sorting.forEach((e) => urlSearchParams.append('sorting[]', e));
		filteredTypes.forEach((e) => urlSearchParams.append('filter_type[]', e));
		if (filterName) {
			urlSearchParams.set('filter_name', filterName);
		}
		if (filterId) {
			urlSearchParams.set('filter_id', filterId);
		}
		urlSearchParams.set('pagination_limit', paginationLimit);
		if (paginationDirection !== null) {
			urlSearchParams.set('pagination_direction', paginationDirection);
		}
		if (paginationCursor !== null) {
			urlSearchParams.set('pagination_cursor', paginationCursor.toString());
		}
		const url = `${import.meta.env.VITE_BASE_URL}users.json?${urlSearchParams}`;
		console.log(url);
		const res = await fetch(url);
		response = await res.json();
	}

	// TODO FIXME optimize - the initial load makes an additional request
	// TODO FIXME https://github.com/sveltejs/svelte/issues/2118 maybe use derived store instead
	$: reloadUsers(
		$query['sorting[]'] as unknown as string[],
		$query.filter_id,
		$query.filter_name,
		$query['filter_types[]'] as unknown as string[],
		$query.pagination_limit,
		paginationDirection,
		paginationCursor
	);

	function currentSortValue(sorting: any, sortingType: string) {
		return (sorting as unknown as string[])
			.find((e) => e.startsWith(sortingType + ':'))!
			.split(':')[1];
	}
</script>

<svelte:head>
	<title>Nutzer</title>
</svelte:head>

<h1 class="text-center">Nutzer</h1>

<div class="row justify-content-between">
	<div class="col-auto">
		<a class="btn btn-primary" href="/users/create" role="button">Nutzer erstellen</a>
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
	<thead>
		<tr>
			<th on:click={() => headerClick('id')} class="table-cell-hover" scope="col"
				>#<i
					class="bi-arrow-{currentSortValue($query['sorting[]'], 'id')}"
					role="img"
					aria-label="Sort by id"
				/></th
			>
			<th on:click={() => headerClick('name')} class="table-cell-hover" scope="col"
				>Name<i
					class="bi-arrow-{currentSortValue($query['sorting[]'], 'name')}"
					role="img"
					aria-label="Sort by name"
				/></th
			>
			<th on:click={() => headerClick('type')} class="table-cell-hover" scope="col"
				>Typ<i
					class="bi-arrow-{currentSortValue($query['sorting[]'], 'type')}"
					role="img"
					aria-label="Sort by type"
				/></th
			>
		</tr>
		<tr class="align-middle">
			<th scope="col">
				<input
					bind:value={$query.filter_id}
					type="number"
					class="form-control"
					id="users-filter-id"
				/>
			</th>
			<th scope="col">
				<input
					bind:value={$query.filter_name}
					type="text"
					class="form-control"
					id="users-filter-name"
				/>
			</th>
			<th scope="col">
				<select
					bind:value={$query['filter_types[]']}
					class="form-select form-select-sm"
					multiple
					size="3"
					aria-label="Filter by type"
				>
					<option value="admin">admin</option>
					<option value="helper">helper</option>
					<option value="voter">voter</option>
				</select>
			</th>
		</tr>
	</thead>
	<tbody>
		{#each response.users as { id, name, type } (id)}
			<tr>
				<th scope="row">{id}</th>
				<td>{name}</td>
				<td>{type}</td>
			</tr>
		{/each}
	</tbody>
</table>

<nav aria-label="Navigation der Nutzerliste">
	<ul class="pagination justify-content-center">
		<li class="page-item">
			<a
				on:click|preventDefault={() => {
					paginationCursor = response.previousCursor;
					paginationDirection = 'backwards';
				}}
				class="page-link"
				href="/"
				aria-label="Nächste Seite"
			>
				<span aria-hidden="true">&laquo;</span>
			</a>
		</li>
		<li class="page-item">
			<a
				on:click|preventDefault={() => {
					paginationCursor = response.nextCursor;
					paginationDirection = 'forwards';
				}}
				class="page-link"
				href="/"
				aria-label="Vorherige Seite"
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
