<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import type { LoginResponse } from './index.json';
	import { session } from '$app/stores';
	import CustomLayout from '/src/routes/_customLayout.svelte';

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
			let json = await response.json();
			// TODO FIXME use server provided data (also id etc)
			$session.user = {
				name: user.name
			};
			return json;
		}
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<CustomLayout>
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
					<input
						autocomplete="username"
						type="text"
						class="form-control"
						id="login-name"
						bind:value={user.name}
					/>
				</div>
				<div class="mb-3">
					<label for="login-password" class="form-label">Passwort:</label>
					<input
						autocomplete="current-password"
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
</CustomLayout>
