<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { LoginResponse } from './index.json';

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
			return await response.json();
		}
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<h1 class="text-center">Login</h1>

<div class="row justify-content-center">
	<div class="col-md-7 col-lg-8">
		{#await loginPromise}
			<span />
		{:then result}
			{#if Object.entries(result.errors).length > 0}
				<div class="alert alert-danger" role="alert">
					Fehler!
					{#each Object.entries(result.errors) as [attribute, message]}
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
			<div class="mb-3">
				<label for="login-name" class="form-label">Name:</label>
				<input type="name" class="form-control" id="login-name" bind:value={user.name} />
			</div>
			<div class="mb-3">
				<label for="login-password" class="form-label">Passwort:</label>
				<input
					type="password"
					class="form-control"
					id="login-password"
					bind:value={user.password}
				/>
			</div>
			<button type="submit" class="btn btn-primary">Login</button>
		</form>
	</div>
</div>
