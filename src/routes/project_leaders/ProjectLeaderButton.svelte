<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseEntityType } from '$lib/entites';

	export let project_id: number;
	export let entity: BaseEntityType;
	let checked: boolean = entity.project_leader_id == project_id;

	let disabled = false;
</script>

<input
	{disabled}
	{checked}
	type="checkbox"
	class="form-check-input"
	on:click={async (e) => {
		let feedback;
		disabled = true;
		// TODO edit user set project_leader_id
		const response = await fetch(`/users/create-or-update.json`, {
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
		if (!response.ok) {
			feedback = new Map();
			feedback.set('network_error', 'Serverfehler: ' + response.status + ' ' + response.statusText);
		} else {
			let json = await response.json();
			feedback = new Map(Object.entries(json.errors));
			if (feedback.size == 0) {
				disabled = false;
				// TODO refresh list
			}
		}
		console.log(feedback);
	}}
/>
