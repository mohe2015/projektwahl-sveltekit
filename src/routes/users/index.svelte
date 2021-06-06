<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
	import ListFiltering from '$lib/entity-list/ListFiltering.svelte';
	import type { Modal } from 'bootstrap';
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
	let modal: Modal;

	async function test(id: string, name: unknown) {
		modalUserId = id;
		modalUser = name as string;
		// TODO FIXME don't load bootstrap like this - if it fails it will be funny
		modal = new (await import('bootstrap')).Modal(document.getElementById('exampleModal')!, {});
		// potentially reimplement this natively in svelte so hot-reloading etc. work and it doesn't break unexpectedly
		modal.show();
	}

	async function deleteUser() {
		let json;
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
			await list.refresh();
			modal.hide();
			// TODO FIXME reload data
		}
	}
</script>

<div
	class="modal fade"
	id="exampleModal"
	tabindex="-1"
	aria-labelledby="exampleModalLabel"
	aria-hidden="true"
>
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="exampleModalLabel">{modalUser} löschen?</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
			</div>
			<div class="modal-body">
				Möchtest du {modalUser} wirklich löschen?

				<!-- svelte-ignore empty-block -->
				{#await modalDelete}<div />{:then}<div />{:catch error}
					<div class="alert alert-danger" role="alert">
						Löschen fehlgeschlagen: {error}
					</div>
				{/await}
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-danger" on:click={() => (modalDelete = deleteUser())}
					>{#await modalDelete}Wird gelöscht...{:then}Löschen{:catch}Löschen{/await}</button
				>
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
			</div>
		</div>
	</div>
</div>

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
