<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	// TODO FIXME duplication with project_leaders/

	import type { BaseEntityType } from '$lib/entites';

	export let project_id: number;
	export let entity: BaseEntityType;
	let checked: boolean = entity.force_in_project_id == project_id;

	let disabled = false;

	let feedback: Map<string, string> = new Map();
</script>

<input
	{disabled}
	bind:checked
	type="checkbox"
	class="form-check-input"
	on:change={async () => {
		disabled = true;
		const response = await fetch(`/users/create-or-update.json`, {
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
		if (!response.ok) {
			feedback = new Map();
			feedback.set('network_error', 'Serverfehler: ' + response.status + ' ' + response.statusText);
		} else {
			let json = await response.json();
			feedback = new Map(Object.entries(json.errors));
			if (feedback.size == 0) {
				// TODO refresh list
			}
		}
		disabled = false;
	}}
/>
{#if feedback.size != 0}
	<div class="alert alert-danger" role="alert">
		Einige Eingaben sind nicht gültig.
		{#each [...feedback.entries()] as [attribute, message]}
			{attribute}: {message}<br />
		{/each}
	</div>
{/if}
