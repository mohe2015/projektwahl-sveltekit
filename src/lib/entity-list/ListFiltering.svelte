<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseQueryType } from '$lib/EntityList.svelte';
	import type { Writable } from 'svelte/store';

	export let query: Writable<BaseQueryType>;
	export let name: string;
	export let options: string[];
</script>

<th scope="col">
	<select
		bind:value={$query[`filter_${name}`]}
		class="form-select form-select-sm"
		multiple
		size={options.length}
		aria-label="Filter by {name}"
	>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</th>
