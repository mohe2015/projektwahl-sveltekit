<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import CreateForm from '$lib/form/CreateOrUpdateForm.svelte';
	import TextInput from '$lib/form/TextInput.svelte';
	import type { PartialUser, UserType } from '$lib/types';
	import { FormGroup, FormText, Input, Label } from 'sveltestrap';

	export let entity: { [x: string]: any; fileInput?: any; id?: number | undefined } = {};

	// currently there will not be progress and this is not easily fixable with fetch so it's not gonna happen

	// https://github.com/sveltejs/kit/issues/1563
	// https://github.com/sveltejs/kit/issues/70

	const importEntities = async (e: Event) => {
		e.preventDefault();

		let file: File = entity.fileInput.files![0];

		// TOOD FIXME maybe https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#uploading_a_file

		let response = await fetch('/users/import.json', {
			method: 'POST',
			headers: {
				'content-type': 'text/plain',
				'x-csrf-protection': 'projektwahl'
			},
			body: file
		});
		let json = await response.text();
	};
</script>

<CreateForm label="Nutzer" type="users/import" let:feedback bind:entity keys={['file']}>
	<FormGroup>
		<Label for="exampleFile">Importieren:</Label>
		<Input bind:this={entity.fileInput} type="file" accept="text/csv" name="file" id="file" />
		<FormText color="muted">
			Die erste Zeile enthält die Spaltennamen (name, password, away, type, group?, age?), wobei
			type einer von admin, helper, voter ist.
		</FormText>
	</FormGroup>
</CreateForm>
