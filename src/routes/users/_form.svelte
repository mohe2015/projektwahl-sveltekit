<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import CreateForm from '$lib/form/CreateOrUpdateForm.svelte';
	import TextInput from '$lib/form/TextInput.svelte';

	export let entity: any;
</script>

<CreateForm
	{entity}
	label="Nutzer"
	url="/users/create-or-update.json"
	let:feedback
	keys={['name', 'password', 'group', 'age']}
>
	<TextInput name="name" label="Name" bind:value={entity.name} {feedback} />
	<TextInput
		name="password"
		label="Passwort"
		type="password"
		bind:value={entity.password}
		{feedback}
	/>

	<div class="mb-3">
		<label for="users-type" class="form-label">Nutzerart:</label>
		<select bind:value={entity.type} class="form-select" name="type" id="users-type">
			<option selected value="voter">Schüler</option>
			<option value="helper">Helfer</option>
			<option value="admin">Admin</option>
		</select>
	</div>
	{#if entity.type === 'voter'}
		<TextInput name="group" label="Klasse" bind:value={entity.group} {feedback} />
		<TextInput name="age" label="Jahrgang" type="number" bind:value={entity.age} {feedback} />
	{/if}
	<div class="mb-3 form-check">
		<input
			type="checkbox"
			class="form-check-input"
			name="away"
			id="users-away"
			bind:value={entity.away}
		/>
		<label class="form-check-label" for="users-away">Abwesend</label>
	</div>
</CreateForm>
