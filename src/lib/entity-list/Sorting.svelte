<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseQueryType } from '$lib/EntityList.svelte';
	import type { Writable } from 'svelte/store';

	export let title: string;
	export let name: string;
	export let headerClick: (sortType: string) => void;
	export let currentSortValue: (sorting: any, sortingType: string) => string;
	export let query: Writable<BaseQueryType>;
</script>

<th on:click={() => headerClick(name)} class="table-cell-hover" scope="col"
	>{title}<i
		class="bi-arrow-{currentSortValue($query['sorting[]'], name)}"
		role="img"
		aria-label="Nach {title} sortieren"
	/></th
>
