<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseQueryType } from '$lib/entites';
import type { BaseQuery } from '$lib/EntityList.svelte';

	import type { Writable } from 'svelte/store';

	export let title: string;
	export let name: string;
	export let headerClick: (sortType: string) => void;
	export let currentSortValue: (sorting: string[], sortingType: string) => string;
	export let query: Writable<BaseQuery>;

	let curr = currentSortValue($query.sorting, name);

	$: {
		curr = currentSortValue($query.sorting, name);
	}
</script>

<th on:click={() => headerClick(name)} class="table-cell-hover" scope="col"
	>{title}<i
		class="bi-arrow-{curr == 'ASC' ? 'up' : curr == 'DESC' ? 'down' : 'down-up'}"
		role="img"
		aria-label="Nach {title} sortieren"
	/></th
>

<style>
	.table-cell-hover:hover {
		--bs-table-accent-bg: var(--bs-table-hover-bg);
		color: var(--bs-table-hover-color);
	}
</style>
