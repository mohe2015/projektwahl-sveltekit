<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts" context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, context }) {
		console.log('load');
		const url = `/users.json`;
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
	}
</script>

<script lang="ts">
	export let users: ArrayLike<{ id: any; name: any; type: any }>;
	let priority: number = 0;
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
		reloadUsers();
	}

	async function reloadUsers() {
		let sorted = [...sorting.entries()].sort((a, b) => b[1].priority - a[1].priority);
		const urlSearchParams = new URLSearchParams();
		sorted
			.map((e) => e[0] + ':' + e[1].order)
			.forEach((e) => {
				urlSearchParams.append('sorting[]', e);
			});
		const url = `/users.json?${urlSearchParams}`;
		const res = await fetch(url);
		users = await res.json();
	}
</script>

<svelte:head>
	<title>Nutzer</title>
</svelte:head>

<h1 class="text-center">Nutzer</h1>

<a class="btn btn-primary" href="/users/create" role="button">Nutzer erstellen</a>

<!-- filter (for filtering by name, type, ..) -->

<table class="table">
	<thead>
		<tr>
			<th on:click={(e) => headerClick('id')} class="table-cell-hover" scope="col"
				>#<i class="bi-arrow-{sorting.get('id').order}" role="img" aria-label="Sort by id" /></th
			>
			<th on:click={(e) => headerClick('name')} class="table-cell-hover" scope="col"
				>Name<i
					class="bi-arrow-{sorting.get('name').order}"
					role="img"
					aria-label="Sort by name"
				/></th
			>
			<th on:click={(e) => headerClick('type')} class="table-cell-hover" scope="col"
				>Typ<i
					class="bi-arrow-{sorting.get('type').order}"
					role="img"
					aria-label="Sort by type"
				/></th
			>
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

<style>
	.table-cell-hover:hover {
		--bs-table-accent-bg: var(--bs-table-hover-bg);
		color: var(--bs-table-hover-color);
	}
</style>
