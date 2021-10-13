<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type EntityList from '$lib/entity-list/EntityList.svelte';
	import { myFetch } from '$lib/error-handling';
	import { isOk } from '$lib/result';
	import type { Existing, RawProjectType, ResettableChoiceType } from '$lib/types';

	let disabled = false;
	export let entity: ResettableChoiceType;
	export let list: EntityList<Existing<RawProjectType>>;

	async function setRank(rank: number | null) {
		disabled = true;

		const result = await myFetch('/election/set_rank.json', {
			method: 'POST',
			body: JSON.stringify({
				project_id: entity.project_id,
				rank: rank
			}),
			headers: {
				'Content-Type': 'application/json',
				'x-csrf-protection': 'projektwahl'
			}
		});
		if (isOk(result)) {
			entity.rank = rank;
		}
		// TODO FIXME show error message

		list.refresh(); // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call

		disabled = false;

		return result;
	}
</script>

<!-- https://getbootstrap.com/docs/5.0/components/button-group/ -->
<div class="btn-group" role="group" aria-label="Basic example">
	<!--TODO FIXME foreach?-->
	<button
		{disabled}
		on:click={() => setRank(1)}
		type="button"
		class="btn {disabled
			? 'btn-secondary'
			: entity.rank == 1
			? 'btn-primary'
			: 'btn-outline-primary'}">1</button
	>
	<button
		{disabled}
		on:click={() => setRank(2)}
		type="button"
		class="btn {disabled
			? 'btn-secondary'
			: entity.rank == 2
			? 'btn-primary'
			: 'btn-outline-primary'}">2</button
	>
	<button
		{disabled}
		on:click={() => setRank(3)}
		type="button"
		class="btn {disabled
			? 'btn-secondary'
			: entity.rank == 3
			? 'btn-primary'
			: 'btn-outline-primary'}">3</button
	>
	<button
		{disabled}
		on:click={() => setRank(4)}
		type="button"
		class="btn {disabled
			? 'btn-secondary'
			: entity.rank == 4
			? 'btn-primary'
			: 'btn-outline-primary'}">4</button
	>
	<button
		{disabled}
		on:click={() => setRank(5)}
		type="button"
		class="btn {disabled
			? 'btn-secondary'
			: entity.rank == 5
			? 'btn-primary'
			: 'btn-outline-primary'}">5</button
	>
	<button
		{disabled}
		on:click={() => setRank(null)}
		type="button"
		class="btn {disabled
			? 'btn-secondary'
			: entity.rank == null
			? 'btn-primary'
			: 'btn-outline-primary'}">X</button
	>
</div>
