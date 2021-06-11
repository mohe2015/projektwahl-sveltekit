<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
	import ListFiltering from '$lib/entity-list/ListFiltering.svelte';
	import type { UserDeleteResponse } from './delete/[id].json';
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap/src';
	import CustomLayout from '/src/routes/_customLayout.svelte';
	/*
	type UsersQueryParameters = {
		'filter_types[]': string[];
		pagination_limit: string;
		'sorting[]': string[];
		filter_id?: string;
		filter_name?: string;
	};
*/

	let list: EntityList;

	let modalUser: string | null = null;
	let modalUserId: string | null = null;
	let modalDelete: Promise<void>;
	let deleteModalOpen = false;

	async function test(id: string, name: unknown) {
		modalUserId = id;
		modalUser = name as string;
		modalDelete = Promise.resolve();
		deleteModalOpen = true;
	}

	async function deleteUser() {
		let json: UserDeleteResponse;
		const response = await fetch(`/users/delete/${modalUserId}.json`, {
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
			await list.refresh();
			deleteModalOpen = false;
		}
	}
</script>

<CustomLayout>
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

	<EntityList
		bind:this={list}
		initialQuery={{
			'filter_types[]': ['admin', 'helper', 'voter'],
			pagination_limit: '10',
			'sorting[]': ['id:down-up', 'name:down-up', 'type:down-up']
		}}
		title="Nutzer"
		url="users.json"
		createUrl="/users/create"
	>
		<thead slot="filter" let:headerClick let:currentSortValue let:query>
			<tr>
				<Sorting name="id" title="#" {headerClick} {currentSortValue} {query} />
				<Sorting name="name" title="Name" {headerClick} {currentSortValue} {query} />
				<Sorting name="type" title="Typ" {headerClick} {currentSortValue} {query} />
				<th>Aktionen</th>
			</tr>
			<tr class="align-middle">
				<Filtering name="id" type="number" {query} />
				<Filtering name="name" type="text" {query} />
				<ListFiltering name="types[]" options={['admin', 'helper', 'voter']} {query} />
				<th scope="col" />
			</tr>
		</thead>
		<tbody slot="response" let:response>
			{#each response.entities as entity (entity.id)}
				<tr>
					<th scope="row">{entity.id}</th>
					<td>{entity.name}</td>
					<td>{entity.type}</td>
					<td>
						<!--
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-eye"></i>
				   </button>
				   -->
						<a class="btn btn-secondary" href="/users/edit/{entity.id}" role="button">
							<i class="bi bi-pen" />
						</a>
						<!--
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-key"></i>
				   	</button>
					-->
						<!--
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-person-check"></i>
				   	</button>
					<button class="btn btn-secondary" type="button">
						<i class="bi bi-person-x"></i>
				   	</button>
					-->

						<button class="btn btn-secondary" type="button">
							<i class="bi bi-box-arrow-in-right" />
						</button>

						<button
							on:click={() => test(entity.id, entity.name)}
							class="btn btn-secondary"
							type="button"
						>
							<i class="bi bi-trash" />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</EntityList>
</CustomLayout>
