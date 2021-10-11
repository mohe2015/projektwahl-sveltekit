<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { session } from '$app/stores';

	import TextInput from '$lib/form/TextInput.svelte';
	import { goto } from '$app/navigation';
import type { Login } from './index.json';
import { myFetch } from '$lib/error-handling';
import { errOrDefault, isOk, OptionalPromiseResult, PromiseResult } from '$lib/result';

	let user: {
		name: string | null;
		password: string | null;
	} = {
		name: null,
		password: null
	};

	let result: OptionalPromiseResult<Login, { [key: string]: string }> = {
		result: "none"
	};

	async function login() {
		result = {
			result: "loading"
		}
		result = await myFetch<Login>('/login.json', {
			method: 'POST',
			body: JSON.stringify(user),
			headers: {
				'Content-Type': 'application/json',
				'x-csrf-protection': 'projektwahl'
			}
		});
		if (isOk(result)) {
			// TODO FIXME use server provided data (also id etc)
			$session.user = {
				name: user.name
			};
			await goto('/', { replaceState: true });
		}
		return result
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<main class="container">
	<h1 class="text-center">Login</h1>

	<div class="row justify-content-center">
		<div class="col-md-7 col-lg-8">
			
			{#if result && result.result !== "loading"}
				{#if Object.entries(errOrDefault(result, {})).filter(([a, _m]) => !['password', 'name'].includes(a)).length > 0}
					<div class="alert alert-danger" role="alert">
						Fehler!
						{#each Object.entries(errOrDefault(result, {})).filter(([a, _m]) => !['password', 'name'].includes(a)) as [attribute, message]}
							{attribute}: {message}<br />
						{/each}
					</div>
				{/if}
			{/if}

			<form
				method="POST"
				action="/no-javascript"
				on:submit|preventDefault={login}
			>
				<TextInput
					type="text"
					autocomplete="username"
					label="Name"
					bind:the_value={user.name}
					name="name"
					{result}
				/>
				<TextInput
					label="Passwort"
					name="password"
					bind:the_value={user.password}
					type="password"
					autocomplete="current-password"
					{result}
				/>
			
				<button type="submit" class="btn btn-primary">Login</button>
			</form>
		</div>
	</div>
</main>
