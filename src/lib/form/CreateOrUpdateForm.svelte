<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { CreateResponse } from 'src/routes/projects/create-or-update.json';

	export let label: string;
	export let type: string;
	export let keys: string[];
	let randomId: string = 'id' + Math.random().toString().replace('.', '');
	let feedback: Map<string, string> = new Map();
	let unknownFeedback: [string, string][] = [];
	let submitPromise: Promise<void>;
	export let entity: {
		id?: number;
		[key: string]: any;
	};

	async function create() {
		let json: CreateResponse;
		try {
			const response = await fetch(`/${type}/create-or-update.json`, {
				method: 'POST',
				body: JSON.stringify(entity),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!response.ok) {
				feedback = new Map();
				feedback.set(
					'network_error',
					'Serverfehler: ' + response.status + ' ' + response.statusText
				);
			} else {
				json = await response.json();
				feedback = new Map(Object.entries(json.errors));
				if (feedback.size == 0) {
					//await goto(`/${type}/edit/${json.id}`);
					await goto(`/${type}`);
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
	<title>{label} {entity.id !== undefined ? 'ändern' : 'erstellen'}</title>
</svelte:head>

<h1 class="text-center">{label} {entity.id !== undefined ? 'ändern' : 'erstellen'}</h1>

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

			<slot {feedback} {entity} />

			{#await submitPromise}
				<button type="submit" class="btn btn-primary disabled"
					>{label} wird {entity.id !== undefined ? 'geändert' : 'erstellt'}...</button
				>
			{:then result}
				<button type="submit" class="btn btn-primary"
					>{label} {entity.id !== undefined ? 'ändern' : 'erstellen'}</button
				>
			{:catch error}
				<div class="alert alert-danger" role="alert">
					Unbekannter Fehler: {error.message}
				</div>
			{/await}
		</form>
	</div>
</div>
