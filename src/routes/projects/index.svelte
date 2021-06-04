<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { ProjectResponseBody } from '../projects/index.json';
	import { query as query2, query2location } from '$lib/writable_url';
	import type { Writable } from 'svelte/store';

	type ProjectsQueryParameters = {
		pagination_limit: string;
		'sorting[]': string[];
		filter_id?: string;
		filter_title?: string;
	};

	let query: Writable<ProjectsQueryParameters> = query2<ProjectsQueryParameters>({
		pagination_limit: '10',
		'sorting[]': ['id:down-up', 'title:down-up']
	});

	// TODO FIXME A/B testing for sorting (whether to priority first or last chosen option)
	// you wanna sort for type then name

	export let response: ProjectResponseBody = {
		projects: [],
		previousCursor: null,
		nextCursor: null
	};

	let paginationDirection: 'forwards' | 'backwards' | null = 'forwards';
	let paginationCursor: number | null = null;

	function headerClick(sortType: 'id' | 'title') {
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
	}

	async function reloadUsers(
		query: ProjectsQueryParameters,
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
		const url = `${import.meta.env.VITE_BASE_URL}projects.json?${urlSearchParams}`;
		console.log(url);
		const res = await fetch(url);
		response = await res.json();
	}

	// TODO FIXME optimize - the initial load makes an additional request
	// TODO FIXME https://github.com/sveltejs/svelte/issues/2118 maybe use derived store instead
	$: reloadUsers($query, paginationDirection, paginationCursor);

	function currentSortValue(sorting: any, sortingType: string) {
		return (sorting as unknown as string[])
			.find((e) => e.startsWith(sortingType + ':'))!
			.split(':')[1];
	}
</script>

<svelte:head>
	<title>Projekte</title>
</svelte:head>

<h1 class="text-center">Projekte</h1>

<div class="row justify-content-between">
	<div class="col-auto">
		<a class="btn btn-primary" href="/projects/create" role="button">Projekt erstellen</a>
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
			<th on:click={() => headerClick('title')} class="table-cell-hover" scope="col"
				>Titel<i
					class="bi-arrow-{currentSortValue($query['sorting[]'], 'title')}"
					role="img"
					aria-label="Sort by title"
				/></th
			>
		</tr>
		<tr class="align-middle">
			<th scope="col">
				<input
					bind:value={$query.filter_id}
					type="number"
					class="form-control"
					id="projects-filter-id"
				/>
			</th>
			<th scope="col">
				<input
					bind:value={$query.filter_title}
					type="text"
					class="form-control"
					id="projects-filter-title"
				/>
			</th>
		</tr>
	</thead>
	<tbody>
		{#each response.projects as { id, title } (id)}
			<tr>
				<th scope="row">{id}</th>
				<td>{title}</td>
			</tr>
		{/each}
	</tbody>
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
