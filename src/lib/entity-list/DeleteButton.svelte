<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap/src';

	export let path: string;
	export let entityId: number;
	export let entityName: any;
	export let refreshList: () => Promise<void>;
	let modalUser: string | null = null;
	let modalUserId: number | null = null;
	let modalDelete: Promise<void>;
	let deleteModalOpen = false;

	async function test(id: number, name: unknown) {
		modalUserId = id;
		modalUser = name as string;
		modalDelete = Promise.resolve();
		deleteModalOpen = true;
	}

	async function deleteUser() {
		let json;
		const response = await fetch(`/${path}/delete/${modalUserId}.json`, {
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
		{#await modalDelete}<div />{:then}<div />{:catch error}
			<div class="alert alert-danger" role="alert">
				Löschen fehlgeschlagen: {error}
			</div>
		{/await}
	</ModalBody>
	<ModalFooter>
		<Button color="danger" on:click={() => (modalDelete = deleteUser())}
			>{#await modalDelete}Wird gelöscht...{:then}Löschen{:catch}Löschen{/await}</Button
		>
		<Button color="secondary" on:click={() => (deleteModalOpen = false)}>Abbrechen</Button>
	</ModalFooter>
</Modal>

<button on:click={() => test(entityId, entityName)} class="btn btn-secondary" type="button">
	<i class="bi bi-trash" />
</button>
