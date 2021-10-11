<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import CreateForm from '$lib/form/CreateOrUpdateForm.svelte';
	import TextInput from '$lib/form/TextInput.svelte';
import type { RawUserType } from '$lib/types';

	export let entity: Partial<RawUserType>;
</script>

<CreateForm
	label="Nutzer"
	type="users"
	bind:entity
	keys={['name', 'password', 'group', 'age']}
	let:result
>
	<TextInput name="name" label="Name" bind:the_value={entity.name} {result} />
	<!--<TextInput
		name="password"
		label="Passwort"
		type="password"
		bind:the_value={entity.password}
		{feedback}
	/>-->

	<div class="mb-3">
		<label for="users-type" class="form-label">Nutzerart:</label>
		<select bind:value={entity.type} class="form-select" name="type" id="users-type">
			<option selected value="voter">Schüler</option>
			<option value="helper">Helfer</option>
			<option value="admin">Admin</option>
		</select>
	</div>
	{#if entity.type === 'voter'}
		<TextInput name="group" label="Klasse" bind:the_value={entity.group} {result} />
		<TextInput name="age" label="Jahrgang" type="number" bind:the_value={entity.age} {result} />
	{/if}
	<div class="mb-3 form-check">
		<input
			type="checkbox"
			class="form-check-input"
			name="away"
			id="users-away"
			bind:checked={entity.away}
		/>
		<label class="form-check-label" for="users-away">Abwesend</label>
	</div>
</CreateForm>
