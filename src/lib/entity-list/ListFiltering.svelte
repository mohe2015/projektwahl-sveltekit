<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseQuery } from '$lib/list-entities';

	import type { Writable } from 'svelte/store';

	type E = $$Generic;

	export let query: Writable<BaseQuery<E>>;
	export let name: keyof E;
	export let options: string[];
</script>

<th scope="col">
	<select
		bind:value={$query.filters[name]}
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
