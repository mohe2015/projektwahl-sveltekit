<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import CreateForm from '$lib/form/CreateForm.svelte';
	import TextInput from '$lib/form/TextInput.svelte';
</script>

<CreateForm
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
	<TextInput name="title" label="Titel" {feedback} />
	<TextInput name="info" label="Info" {feedback} />
	<TextInput name="place" label="Ort" {feedback} />
	<TextInput name="costs" label="Kosten" type="number" value="0" step="0.01" {feedback} />
	<TextInput name="min_age" label="Mindestalter" type="number" value="5" {feedback} />
	<TextInput name="max_age" label="Höchstalter" type="number" value="13" {feedback} />
	<TextInput
		name="min_participants"
		label="Minimale Teilnehmeranzahl"
		type="number"
		value="5"
		{feedback}
	/>
	<TextInput
		name="max_participants"
		label="Maximale Teilnehmeranzahl"
		type="number"
		value="15"
		{feedback}
	/>
	<TextInput name="presentation_type" label="Präsentationsart" {feedback} />
	<TextInput name="requirements" label="Voraussetzungen" {feedback} />
	<div class="mb-3 form-check">
		<input type="checkbox" class="form-check-input" name="away" id="users-away" />
		<label class="form-check-label" for="users-away">Abwesend</label>
	</div>
</CreateForm>
