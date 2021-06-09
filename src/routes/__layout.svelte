<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit/types/page';

	export const load: Load = async function ({ page, fetch, session, context }) {
		let url = '/user/me.json';
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: await res.json()
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import type { Collapse } from 'bootstrap';
	import type { UserType } from '$lib/types';

	export let user: UserType | undefined = undefined;

	let bootstrap: Promise<any>;
	if (browser) {
		bootstrap = import('bootstrap');
	}

	const handleNavigationEnd = async () => {
		let navbar: Collapse = new (await bootstrap).Collapse(
			document.querySelector('#navbarSupportedContent')!,
			{
				toggle: false
			}
		);
		navbar.hide();
	};
</script>

<svelte:window on:sveltekit:navigation-end={handleNavigationEnd} />

<nav class="navbar navbar-expand-lg navbar-light bg-light shadow p-3 mb-5">
	<div class="container-fluid">
		<a class="navbar-brand" href="/">Projektwahl</a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon" />
		</button>
		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav me-auto mb-2 mb-lg-0">
				<li class="nav-item">
					<a class="nav-link {$page.path === '/' ? 'active' : ''}" aria-current="page" href="/"
						>Start</a
					>
				</li>
				<li class="nav-item">
					<a class="nav-link {$page.path.startsWith('/users') ? 'active' : ''}" href="/users"
						>Nutzer</a
					>
				</li>
				<li class="nav-item">
					<a class="nav-link {$page.path.startsWith('/projects') ? 'active' : ''}" href="/projects"
						>Projekte</a
					>
				</li>
			</ul>
			<ul class="navbar-nav ms-auto mb-2 mb-lg-0">
				{#if user}
					<li class="nav-item">
						<a class="nav-link {$page.path.startsWith('/logout') ? 'active' : ''}" href="/logout"
							>{user.name} abmelden</a
						>
					</li>
				{:else}
					<li class="nav-item">
						<a class="nav-link {$page.path.startsWith('/login') ? 'active' : ''}" href="/login"
							>Anmelden</a
						>
					</li>
				{/if}
			</ul>
		</div>
	</div>
</nav>

<main class="container">
	<slot />
</main>
