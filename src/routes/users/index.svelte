<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async function ({ fetch }) {
		console.log('load');
		const url = `${
			import.meta.env.VITE_BASE_URL
		}users.json?sorting[]=id:down-up,name:down-up,type:down-up&filter_type[]=admin,helper,voter&filter_name=`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: {
					users: await res.json()
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	// TODO FIXME A/B testing for sorting (whether to priority first or last chosen option)
	// you wanna sort for type then name

	let initialRender = true;
	export let users: ArrayLike<{ id: number; name: string; type: string }> = [];
	let priority = 0;
	let sorting: Map<string, { order: string; priority: number }> = new Map([
		[
			'id',
			{
				order: 'down-up',
				priority
			}
		],
		[
			'name',
			{
				order: 'down-up',
				priority
			}
		],
		[
			'type',
			{
				order: 'down-up',
				priority
			}
		]
	]);
	let filteredTypes: string[] = ['admin', 'helper', 'voter'];
	let filterName = '';
	let filterId = '';

	function headerClick(sortType: string) {
		let newOrder: string;
		switch (sorting.get(sortType).order) {
			case 'down-up':
				newOrder = 'up';
				break;
			case 'up':
				newOrder = 'down';
				break;
			default:
				newOrder = 'down-up';
		}
		sorting.set(sortType, {
			order: newOrder,
			priority
		});
		sorting = sorting;
		priority += 1;
	}

	async function reloadUsers(
		sorting: Map<string, { order: string; priority: number }>,
		filterId: string,
		filterName: string,
		filteredTypes: string[]
	) {
		// this is a hack as the load function is reponsible for initial load
		if (initialRender) {
			initialRender = false;
			return;
		}

		let sorted = [...sorting.entries()].sort((a, b) => a[1].priority - b[1].priority);
		const urlSearchParams = new URLSearchParams();
		sorted
			.map((e) => e[0] + ':' + e[1].order)
			.forEach((e) => {
				urlSearchParams.append('sorting[]', e);
			});
		filteredTypes.forEach((t) => urlSearchParams.append('filter_type[]', t));
		urlSearchParams.set('filter_name', filterName);
		if (filterId.length != 0) {
			urlSearchParams.set('filter_id', filterId);
		}
		const url = `${import.meta.env.VITE_BASE_URL}users.json?${urlSearchParams}`;
		console.log(url);
		const res = await fetch(url);
		users = await res.json();
	}

	// TODO FIXME optimize - the initial load makes an additional request
	// TODO FIXME https://github.com/sveltejs/svelte/issues/2118 maybe use derived store instead
	$: reloadUsers(sorting, filterId, filterName, filteredTypes);
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
		<select class="form-select" aria-label="Default select example">
			<option selected>Einträge pro Seite</option>
			<option value="10">10</option>
			<option value="25">25</option>
			<option value="50">50</option>
			<option value="100">100</option>
		</select>
	</div>
</div>

<table class="table">
	<thead>
		<tr>
			<th on:click={() => headerClick('id')} class="table-cell-hover" scope="col"
				>#<i class="bi-arrow-{sorting.get('id').order}" role="img" aria-label="Sort by id" /></th
			>
			<th on:click={() => headerClick('name')} class="table-cell-hover" scope="col"
				>Name<i
					class="bi-arrow-{sorting.get('name').order}"
					role="img"
					aria-label="Sort by name"
				/></th
			>
			<th on:click={() => headerClick('type')} class="table-cell-hover" scope="col"
				>Typ<i
					class="bi-arrow-{sorting.get('type').order}"
					role="img"
					aria-label="Sort by type"
				/></th
			>
		</tr>
		<tr class="align-middle">
			<th scope="col">
				<input bind:value={filterId} type="number" class="form-control" id="users-filter-id" />
			</th>
			<th scope="col">
				<input bind:value={filterName} type="text" class="form-control" id="users-filter-name" />
			</th>
			<th scope="col">
				<select
					bind:value={filteredTypes}
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
		{#each users as { id, name, type } (id)}
			<tr>
				<th scope="row">{id}</th>
				<td>{name}</td>
				<td>{type}</td>
			</tr>
		{/each}
	</tbody>
</table>

<nav aria-label="Page navigation example">
	<ul class="pagination justify-content-center">
		<li class="page-item">
			<a class="page-link" href="#" aria-label="Previous">
				<span aria-hidden="true">&laquo;</span>
			</a>
		</li>
		<li class="page-item"><a class="page-link" href="#">1</a></li>
		<li class="page-item"><a class="page-link" href="#">2</a></li>
		<li class="page-item"><a class="page-link" href="#">3</a></li>
		<li class="page-item">
			<a class="page-link" href="#" aria-label="Next">
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
