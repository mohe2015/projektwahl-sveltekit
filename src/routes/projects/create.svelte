<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import TextInput from '$lib/form/TextInput.svelte';

	let feedback: Map<string, string> = new Map();
	let unknownFeedback: [string, string][] = [];

	async function create() {
		let formData = new FormData(document.querySelector<HTMLFormElement>('#form-projects')!);
		const reponse = await fetch('/projects/create.json', {
			method: 'POST',
			body: formData
		});
		const json = await reponse.json();
		if ('errors' in json) {
			feedback = new Map(Object.entries(json.errors));
		} else {
			feedback = new Map();

			console.log(json.result);
		}
	}

	$: {
		unknownFeedback = [...feedback.entries()].filter((e) => !['name'].includes(e[0]));
	}
</script>

<svelte:head>
	<title>Projekt erstellen</title>
</svelte:head>

<h1 class="text-center">Projekt erstellen</h1>

<div class="row justify-content-center">
	<div class="col-md-7 col-lg-8">
		<form on:submit|preventDefault={create} id="form-projects">
			{#if unknownFeedback.length != 0}
				<div class="alert alert-danger" role="alert">
					{#each unknownFeedback as [attribute, message]}
						{attribute}: {message}<br />
					{/each}
				</div>
			{/if}

			<TextInput name="title" label="Titel" {feedback} />
			<div class="mb-3">
				<label for="users-password" class="form-label">Passwort:</label>
				<input type="password" class="form-control" name="password" id="users-password" />
			</div>
			<div class="mb-3">
				<label for="users-type" class="form-label">Nutzerart:</label>
				<select value={'admin'} class="form-select" name="type" id="users-type">
					<option selected value="voter">Schüler</option>
					<option value="helper">Helfer</option>
					<option value="admin">Admin</option>
				</select>
			</div>
			<div class="mb-3">
				<label for="users-group" class="form-label">Klasse:</label>
				<input type="text" class="form-control" name="group" id="users-group" />
			</div>
			<div class="mb-3">
				<label for="users-age" class="form-label">Jahrgang:</label>
				<input type="number" class="form-control" name="age" id="users-age" />
			</div>
			<div class="mb-3 form-check">
				<input type="checkbox" class="form-check-input" name="away" id="users-away" />
				<label class="form-check-label" for="users-away">Abwesend</label>
			</div>
			<button type="submit" class="btn btn-primary">Nutzer erstellen</button>
		</form>
	</div>
</div>
