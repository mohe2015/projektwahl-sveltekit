<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
import { hasErrors, myFetch } from '$lib/error-handling';
import FailureResult from '$lib/FailureResult.svelte';
import type { Result } from '$lib/types';

	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap/src';

	export let path: string;
	export let entityId: number;
	export let entityName: string;
	export let refreshList: () => Promise<void>;
	let modalUser: string | null = null;
	let modalUserId: number | null = null;
	let modalDelete: Promise<void>;
	let deleteModalOpen = false;
	let result: Result<unknown>;

	function test(id: number, name: unknown) {
		modalUserId = id;
		modalUser = name as string;
		modalDelete = Promise.resolve();
		deleteModalOpen = true;
	}

	async function deleteUser() {
		result = await myFetch(`/${path}/delete/${modalUserId}.json`, {
			method: 'POST',
			body: null,
			headers: {
				'Content-Type': 'application/json',
				'x-csrf-protection': 'projektwahl'
			}
		})
		if (!hasErrors(result)) {
			await refreshList();
			deleteModalOpen = false;
		}
	}
</script>

<Modal isOpen={deleteModalOpen} toggle={() => (deleteModalOpen = false)}>
	<ModalHeader>{modalUser} löschen?</ModalHeader>
	<ModalBody>
		Möchtest du {modalUser} wirklich löschen?

		<!-- svelte-ignore empty-block -->
		{#await modalDelete}<div />{:then}
			<FailureResult {result} />
		{/await}
	</ModalBody>
	<ModalFooter>
		<Button color="danger" on:click={() => (modalDelete = deleteUser())}
			>{#await modalDelete}Wird gelöscht...{:then}Löschen{/await}</Button
		>
		<Button color="secondary" on:click={() => (deleteModalOpen = false)}>Abbrechen</Button>
	</ModalFooter>
</Modal>

<button on:click={() => test(entityId, entityName)} class="btn btn-secondary" type="button">
	<i class="bi bi-trash" />
</button>
