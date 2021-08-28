<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { goto } from '$app/navigation';

	import { navigating, page, session } from '$app/stores';
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
	} from 'sveltestrap/src';

	let logoutModalOpen = false;

	let isNavbarOpen = true; // TODO FIXME why does this hide the navbar on loading

	const handleNavigationEnd = () => {
		isNavbarOpen = true; // TODO FIXME false
	};

	function handleUpdate(event: CustomEvent<any>) {
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
			$session.user = null;
			logoutModalOpen = false;
			goto('/login');
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

<div style="position: absolute; top: 50%; left: 50%;">
	{#if $navigating}
		<div class="spinner-grow text-primary" role="status">
			<span class="visually-hidden">Loading...</span>
		</div>
	{/if}
</div>

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
			<li class="nav-item">
				<a class="nav-link {$page.path.startsWith('/election') ? 'active' : ''}" href="/election"
					>Wahl</a
				>
			</li>
		</ul>
		<ul class="navbar-nav ms-auto mb-2 mb-lg-0">
			{#if $session.user !== null}
				<li class="nav-item">
					<a
						class="nav-link"
						href="/no-javascript"
						on:click={(e) => {
							e.preventDefault();
							logoutModalOpen = true;
						}}>{$session.user.name} abmelden</a
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

<slot />
