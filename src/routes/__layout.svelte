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
	import { page } from '$app/stores';
	import type { UserType } from '$lib/types';
	import {
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		Collapse,
		Navbar,
		NavbarToggler,
		NavbarBrand
	} from 'sveltestrap';
	let logoutModalOpen = false;

	export let user: UserType | undefined = undefined;
	let isNavbarOpen = false; // TODO FIXME why does this hide the navbar on loading

	const handleNavigationEnd = () => {
		isNavbarOpen = false;
	};

	function handleUpdate(event: { detail: { isOpen: boolean } }) {
		isNavbarOpen = event.detail.isOpen;
	}

	const logout = async () => {
		let json;
		const response = await fetch(`/logout.json`, {
			method: 'POST',
			body: null,
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) {
			throw new Error(response.status + ' ' + response.statusText);
		} else {
			json = await response.json();
			if (Object.entries(json.errors).length > 0) {
				throw new Error(
					Object.entries(json.errors)
						.map((e) => e[1])
						.join('\n')
				);
			}
			logoutModalOpen = false;
		}
	};
</script>

<svelte:window on:sveltekit:navigation-end={handleNavigationEnd} />

<Modal isOpen={logoutModalOpen} toggle={() => (logoutModalOpen = false)}>
	<ModalHeader>Abmeldung</ModalHeader>
	<ModalBody>Möchtest du dich wirklich abmelden?</ModalBody>
	<ModalFooter>
		<Button color="primary" on:click={logout}>Abmelden</Button>
		<Button color="secondary" on:click={() => (logoutModalOpen = false)}>Abbrechen</Button>
	</ModalFooter>
</Modal>

<Navbar color="light" light expand="lg" class="shadow p-3 mb-5">
	<NavbarBrand href="/">Projektwahl</NavbarBrand>
	<NavbarToggler on:click={() => (isNavbarOpen = !isNavbarOpen)} />
	<Collapse isOpen={isNavbarOpen} navbar expand="lg" on:update={handleUpdate}>
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
					<a
						class="nav-link"
						href="/no-javascript"
						on:click={(e) => {
							e.preventDefault();
							logoutModalOpen = true;
						}}>{user.name} abmelden</a
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
	</Collapse>
</Navbar>

<main class="container">
	<slot />
</main>
