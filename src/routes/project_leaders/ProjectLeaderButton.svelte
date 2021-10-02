<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { BaseEntityType } from '$lib/entites';

	export let entity: BaseEntityType;
	export let project_id: number;

	let disabled = false;
</script>

<input
	{disabled}
	checked={entity.project_leader_id == project_id}
	type="checkbox"
	class="form-check-input"
	on:click={(e) => {
		disabled = true;
		// TODO edit user set project_leader_id
	}}
/>
