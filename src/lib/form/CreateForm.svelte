<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	export let label: string;
	export let url: string;
	export let keys: string[];
	let randomId: string = 'id' + Math.random().toString().replace('.', '');
	let feedback: Map<string, string> = new Map();
	let unknownFeedback: [string, string][] = [];
	let submitPromise: Promise<void>;

	async function create() {
		let form = document.querySelector<HTMLFormElement>(`#${randomId}-form`);
		if (!form) {
			throw new Error('Could not find form!');
		}
		let formData = new FormData(form);

		let json;
		try {
			const response = await fetch(url, {
				method: 'POST',
				body: formData
			});
			if (!response.ok) {
				feedback = new Map();
				feedback.set(
					'network_error',
					'Serverfehler: ' + response.status + ' ' + response.statusText
				);
			} else {
				json = await response.json();
				if ('errors' in json) {
					feedback = new Map(Object.entries(json.errors));
				} else {
					feedback = new Map();
				}
			}
		} catch (error) {
			feedback = new Map();
			feedback.set('unknown_error', 'Unbekannter Fehler: ' + error);
		}
		unknownFeedback = [...feedback.entries()].filter((e) => !keys.includes(e[0]));
		if (feedback.size > 0 || unknownFeedback.length > 0) {
			window.scrollTo(0, 0);
		}
	}
</script>

<svelte:head>
	<title>{label} erstellen</title>
</svelte:head>

<h1 class="text-center">{label} erstellen</h1>

<div class="row justify-content-center">
	<div class="col-md-7 col-lg-8">
		<form on:submit|preventDefault={() => (submitPromise = create())} id="{randomId}-form">
			{#if unknownFeedback.length != 0 || feedback.size != 0}
				<div class="alert alert-danger" role="alert">
					Einige Eingaben sind nicht gültig.
					{#each unknownFeedback as [attribute, message]}
						{attribute}: {message}<br />
					{/each}
				</div>
			{/if}

			<slot {feedback} />

			{#await submitPromise}
				<button type="submit" class="btn btn-primary disabled">{label} wird erstellt...</button>
			{:then result}
				<button type="submit" class="btn btn-primary">{label} erstellen</button>
			{:catch error}
				<div class="alert alert-danger" role="alert">
					Unbekannter Fehler: {error.message}
				</div>
			{/await}
		</form>
	</div>
</div>
