<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { goto } from '$app/navigation';

	import { navigating, page, session } from '$app/stores';
	import { myFetch } from '$lib/error-handling';
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

	function handleUpdate(event: CustomEvent<{ isOpen: boolean }>) {
		isNavbarOpen = event.detail.isOpen;
	}

	const logout = async () => {
		const _result = await myFetch(`/logout.json`, {
			method: 'POST',
			headers: {
				'x-csrf-protection': 'projektwahl'
			}
		});
		// TODO FIXME show error in UI
		$session.user = null; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		logoutModalOpen = false;
		await goto('/login');
	};

	const logoutUi = (e: MouseEvent) => {
		e.preventDefault();
		logoutModalOpen = true;
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

<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
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
				<a
					class="nav-link {$page /*eslint-disable-line @typescript-eslint/no-unsafe-member-access*/.path ===
					'/'
						? 'active'
						: ''}"
					aria-current="page"
					href="/">Start</a
				>
			</li>
			<li class="nav-item">
				<a
					class="nav-link {$page./*eslint-disable-line @typescript-eslint/no-unsafe-member-access*/ path /*eslint-disable-line @typescript-eslint/no-unsafe-call*/
						.startsWith('/users')
						? 'active'
						: ''}"
					href="/users">Nutzer</a
				>
			</li>
			<li class="nav-item">
				<a
					class="nav-link {$page./*eslint-disable-line @typescript-eslint/no-unsafe-member-access*/ path /*eslint-disable-line @typescript-eslint/no-unsafe-call*/
						.startsWith('/projects')
						? 'active'
						: ''}"
					href="/projects">Projekte</a
				>
			</li>
			<li class="nav-item">
				<a
					class="nav-link {$page./*eslint-disable-line @typescript-eslint/no-unsafe-member-access*/ path /*eslint-disable-line @typescript-eslint/no-unsafe-call*/
						.startsWith('/election')
						? 'active'
						: ''}"
					href="/election">Wahl</a
				>
			</li>
		</ul>
		<ul class="navbar-nav ms-auto mb-2 mb-lg-0">
			{#if $session /*eslint-disable-line @typescript-eslint/no-unsafe-member-access*/.user !== null}
				<li class="nav-item">
					<a class="nav-link" href="/no-javascript" on:click={logoutUi}
						>{$session/*eslint-disable-line @typescript-eslint/no-unsafe-member-access*/.user.name} abmelden</a
					>
				</li>
			{:else}
				<li class="nav-item">
					<a
						class="nav-link {$page /*eslint-disable-line @typescript-eslint/no-unsafe-member-access*/.path /*eslint-disable-line @typescript-eslint/no-unsafe-call*/
							.startsWith('/login')
							? 'active'
							: ''}"
						href="/login">Anmelden</a
					>
				</li>
			{/if}
		</ul>
	</Collapse>
</Navbar>

<slot />
