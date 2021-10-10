<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { myFetch } from '$lib/error-handling';
import FailureResult from '$lib/FailureResult.svelte';
import { isErr, isOk, PromiseResult, Result } from '$lib/result';
	import type { Existing, New } from '$lib/types';

	type E = $$Generic;

	export let label: string;
	export let type: string;
	export let keys: string[];
	let randomId: string = 'id' + Math.random().toString().replace('.', '');
	let result: PromiseResult<Existing<E>, { [key: string]: string }>;
	export let entity: New<E>;

	async function create() {
		result = {
			result: "loading"
		}
		result = await myFetch(`/${type}/create-or-update.json`, {
			method: 'POST',
			body: JSON.stringify(entity),
			headers: {
				'Content-Type': 'application/json',
				'x-csrf-protection': 'projektwahl'
			}
		});
		if (isOk(result)) {
			//await goto(`/${type}/edit/${json.id}`);
			await goto(`/${type.split('/')[0]}`);
		} else {
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
		<form
			method="POST"
			action="/no-javascript"
			on:submit|preventDefault={create}
			id="{randomId}-form"
		>
			<slot {result} {entity} />

			{#if result.result === "loading" }
				<button type="submit" class="btn btn-primary disabled"
					>{label} wird {entity.id !== undefined ? 'geändert' : 'erstellt'}...</button
				>
			{:else}
				{#if isErr(result) }
					<div class="alert alert-danger" role="alert">
						Einige Eingaben sind nicht gültig.
						{#each [...Object.entries(result.failure)].filter((e) => !keys.includes(e[0])) as [attribute, message]}
							{attribute}: {message}<br />
						{/each}
					</div>
				{/if}

				<FailureResult {result} />
				<button type="submit" class="btn btn-primary"
					>{label} {entity.id !== undefined ? 'ändern' : 'erstellen'}</button
				>
			{/if}
		</form>
	</div>
</div>
