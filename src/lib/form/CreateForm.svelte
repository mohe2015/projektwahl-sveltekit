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

	async function create() {
		let formData = new FormData(document.querySelector<HTMLFormElement>(`#${randomId}-form`)!);

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
		// TODO FIXME scroll up
	}

	console.log($$props.$$slots);
</script>

<svelte:head>
	<title>{label} erstellen</title>
</svelte:head>

<h1 class="text-center">{label} erstellen</h1>

<div class="row justify-content-center">
	<div class="col-md-7 col-lg-8">
		<form on:submit|preventDefault={create} id="{randomId}-form">
			{#if unknownFeedback.length != 0}
				<div class="alert alert-danger" role="alert">
					{#each unknownFeedback as [attribute, message]}
						{attribute}: {message}<br />
					{/each}
				</div>
			{/if}

			<slot {feedback} />

			<button type="submit" class="btn btn-primary">{label} erstellen</button>
		</form>
	</div>
</div>
