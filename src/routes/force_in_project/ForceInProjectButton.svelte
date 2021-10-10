<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
import { myFetch } from "$lib/error-handling";

import FailureResult from "$lib/FailureResult.svelte";
import type { Result } from "$lib/result";
import type { Existing, RawUserType } from "$lib/types";

	// TODO FIXME duplication with project_leaders/

	export let project_id: number;
	export let entity: Existing<RawUserType>;
	let checked: boolean = entity.force_in_project_id == project_id;

	let disabled = false;

	let result: Result<Existing<RawUserType>>;
</script>

<input
	{disabled}
	bind:checked
	type="checkbox"
	class="form-check-input"
	on:change={async () => {
		disabled = true;
		result = await myFetch(`/users/create-or-update.json`, {
			method: 'POST',
			body: JSON.stringify({
				id: entity.id,
				force_in_project_id: checked ? project_id : null
			}),
			headers: {
				'Content-Type': 'application/json',
				'x-csrf-protection': 'projektwahl'
			}
		});
		if (!hasErrors(result)) {
			// TODO refresh list
		}
		disabled = false;
	}}
/>
<FailureResult {result} />