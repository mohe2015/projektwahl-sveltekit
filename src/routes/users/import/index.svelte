<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import CreateForm from '$lib/form/CreateOrUpdateForm.svelte';
	import { FormGroup, FormText, Input, Label } from 'sveltestrap';
	import type { UserImportRequest } from './create-or-update.json';

	export let entity: UserImportRequest = {
		id: 42 // TODO FIXME investigate influence and try solving differently
	};
	let fileInput: FileList;

	$: {
		// TODO FIXME hacks over hacks
		void (async (fileInput) => {
			entity.fileInput = fileInput ? await fileInput[0].text() : undefined;
		})(fileInput);
	}

	// currently there will not be progress and this is not easily fixable with fetch so it's not gonna happen

	// https://github.com/sveltejs/kit/issues/1563
	// https://github.com/sveltejs/kit/issues/70

	// TOOD FIXME maybe https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#uploading_a_file
</script>

<CreateForm label="Nutzer" type="users/import" bind:entity keys={['file']}>
	<FormGroup>
		<Label for="exampleFile">Importieren:</Label>
		<Input bind:files={fileInput} type="file" accept="text/csv" name="file" id="file" />
		<FormText color="muted">
			Die erste Zeile enthält die Spaltennamen (name, password, away, type, group?, age?), wobei
			type einer von admin, helper, voter ist.
		</FormText>
	</FormGroup>
</CreateForm>
