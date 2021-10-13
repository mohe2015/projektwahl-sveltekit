<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { myFetch } from '$lib/error-handling';
	import FailureResult from '$lib/FailureResult.svelte';
	import type { OptionalPromiseResult } from '$lib/result';

	import type { Existing, RawUserType } from '$lib/types';

	export let project_id: number;
	export let entity: Existing<RawUserType>;
	let checked: boolean = entity.project_leader_id == project_id;

	let disabled = false;

	let result: OptionalPromiseResult<unknown, { [key: string]: string }>;

	const changeFun = async () => {
		disabled = true;
		// TODO edit user set project_leader_id
		result = await myFetch(`/users/create-or-update.json`, {
			method: 'POST',
			body: JSON.stringify({
				id: entity.id,
				project_leader_id: checked ? project_id : null
			}),
			headers: {
				'Content-Type': 'application/json',
				'x-csrf-protection': 'projektwahl'
			}
		});
		disabled = false;
	};
</script>

<input {disabled} bind:checked type="checkbox" class="form-check-input" on:change={changeFun} />
<FailureResult {result} />
