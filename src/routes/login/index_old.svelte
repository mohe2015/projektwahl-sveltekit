<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { LoginResponse } from './inde';
	import { session } from '$app/stores';

	import TextInput from '$lib/form/TextInput.svelte';
	import { goto } from '$app/navigation';

	let user: {
		name: string | null;
		password: string | null;
	} = {
		name: null,
		password: null
	};
	let loginPromise: Promise<LoginResponse> = Promise.resolve({
		errors: {}
	});
	// TODO FIXME derived store?

	async function login(): Promise<LoginResponse> {
		const response = await fetch('/login.json', {
			method: 'POST',
			body: JSON.stringify(user),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) {
			throw new Error(response.status + ' ' + response.statusText);
		} else {
			let json = await response.json();
			if (Object.entries(json.errors).length == 0) {
				// TODO FIXME use server provided data (also id etc)
				$session.user = {
					name: user.name
				};
				await goto('/', { replaceState: true });
			}
			return json;
		}
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<main class="container">
	<h1 class="text-center">Login</h1>

	<div class="row justify-content-center">
		<div class="col-md-7 col-lg-8">
			{#await loginPromise}
				<span />
			{:then result}
				{#if Object.entries(result.errors).filter(([a, m]) => !['password', 'name'].includes(a)).length > 0}
					<div class="alert alert-danger" role="alert">
						Fehler!
						{#each Object.entries(result.errors).filter(([a, m]) => !['password', 'name'].includes(a)) as [attribute, message]}
							{attribute}: {message}<br />
						{/each}
					</div>
				{/if}
			{:catch error}
				<div class="alert alert-danger" role="alert">
					{error}
				</div>
			{/await}

			<form on:submit|preventDefault={() => (loginPromise = login())}>
				<!-- TODO FIXME extract this pattern -->
				{#await loginPromise}
					<TextInput
						type="text"
						autocomplete="username"
						label="Name"
						bind:the_value={user.name}
						name="name"
					/>
					<TextInput
						label="Passwort"
						name="password"
						bind:the_value={user.password}
						type="password"
						autocomplete="current-password"
					/>
				{:then result}
					<TextInput
						type="text"
						autocomplete="username"
						label="Name"
						bind:the_value={user.name}
						feedback={new Map(Object.entries(result.errors))}
						name="name"
					/>
					<TextInput
						label="Passwort"
						name="password"
						bind:the_value={user.password}
						type="password"
						feedback={new Map(Object.entries(result.errors))}
						autocomplete="current-password"
					/>
				{:catch error}
					<TextInput
						type="text"
						autocomplete="username"
						label="Name"
						bind:the_value={user.name}
						name="name"
					/>
					<TextInput
						label="Passwort"
						name="password"
						bind:the_value={user.password}
						type="password"
						autocomplete="current-password"
					/>
				{/await}
				<button type="submit" class="btn btn-primary">Login</button>
			</form>
		</div>
	</div>
</main>
