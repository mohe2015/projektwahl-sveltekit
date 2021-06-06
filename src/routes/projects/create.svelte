<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import CreateForm from '$lib/form/CreateOrUpdateForm.svelte';
	import TextInput from '$lib/form/TextInput.svelte';
	import type { ProjectType } from '$lib/types';

	export let entity: Partial<ProjectType> = {
		costs: 0,
		min_age: 5,
		max_age: 13,
		min_participants: 5,
		max_participants: 15,
		random_assignments: false
	};
</script>

<CreateForm
	bind:entity
	label="Projekt"
	url="/projects/create.json"
	let:feedback
	keys={[
		'title',
		'info',
		'place',
		'costs',
		'min_age',
		'max_age',
		'min_participants',
		'max_participants',
		'presentation_type',
		'requirements'
	]}
>
	<TextInput name="title" label="Titel" bind:the_value={entity.title} {feedback} />
	<TextInput name="info" label="Info" bind:the_value={entity.info} {feedback} />
	<TextInput name="place" label="Ort" bind:the_value={entity.place} {feedback} />
	<TextInput
		name="costs"
		label="Kosten"
		type="number"
		bind:the_value={entity.costs}
		step="0.01"
		{feedback}
	/>
	<TextInput
		name="min_age"
		label="Mindestalter"
		type="number"
		bind:the_value={entity.min_age}
		{feedback}
	/>
	<TextInput
		name="max_age"
		label="Höchstalter"
		type="number"
		bind:the_value={entity.max_age}
		{feedback}
	/>
	<TextInput
		name="min_participants"
		label="Minimale Teilnehmeranzahl"
		type="number"
		bind:the_value={entity.min_participants}
		{feedback}
	/>
	<TextInput
		name="max_participants"
		label="Maximale Teilnehmeranzahl"
		type="number"
		bind:the_value={entity.max_participants}
		{feedback}
	/>
	<TextInput
		name="presentation_type"
		label="Präsentationsart"
		bind:the_value={entity.presentation_type}
		{feedback}
	/>
	<TextInput
		name="requirements"
		label="Voraussetzungen"
		bind:the_value={entity.requirements}
		{feedback}
	/>
	<div class="mb-3 form-check">
		<input
			bind:checked={entity.random_assignments}
			type="checkbox"
			class="form-check-input"
			name="random-assignments"
			id="projects-random-assignments"
		/>
		<label class="form-check-label" for="projects-random-assignments"
			>Zufällige Projektzuweisungen erlaubt</label
		>
	</div>
</CreateForm>
