<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseQuery } from '$lib/list-entities';

	import type { Writable } from 'svelte/store';

	type K = $$Generic<string>;

	export let query: Writable<BaseQuery<Record<K, string>>>;
	export let name: K;
</script>

<th scope="col">
	<input
		bind:value={$query.filters[name]}
		type="text"
		class="form-control"
		id="projects-filter-{name}"
	/>
</th>
