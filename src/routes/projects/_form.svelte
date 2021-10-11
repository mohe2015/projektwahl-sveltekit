<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import ListFiltering from '$lib/entity-list/ListFiltering.svelte';

	import Sorting from '$lib/entity-list/Sorting.svelte';

	import EntityList from '$lib/entity-list/EntityList.svelte';

	import CreateForm from '$lib/form/CreateOrUpdateForm.svelte';
	import TextInput from '$lib/form/TextInput.svelte';
	import type { BaseQuery } from '$lib/list-entities';
import type { EntityResponseBody, Existing, New, RawProjectType, RawUserType } from '$lib/types';
	import { Readable, Writable, writable } from 'svelte/store';
	import ForceInProjectButton from '../force_in_project/ForceInProjectButton.svelte';
	import ProjectLeaderButton from '../project_leaders/ProjectLeaderButton.svelte';
import NumberFiltering from '$lib/entity-list/NumberFiltering.svelte';
import BooleanFiltering from '$lib/entity-list/BooleanFiltering.svelte';
import TextFiltering from '$lib/entity-list/TextFiltering.svelte';
import type { Result } from '$lib/result';

	export let entity: Partial<New<RawProjectType>>;

	let project_leader_list: EntityList<Existing<RawUserType>>;

	let project_leader_query: Writable<BaseQuery<Existing<RawUserType>>> = writable({
		filters: {
			type: ['admin', 'helper', 'voter'] as unknown as "admin" | "helper" | undefined,
			is_project_leader: false
		},
		paginationLimit: 10,
		sorting: ['id:down-up', 'is_project_leader:DESC', 'name:down-up', 'type:down-up'],
		paginationCursor: null,
		paginationDirection: null,
		project_leader_id: entity.id // DONTREMOVE it's this lines fault? maybe this updates all the time as its a dependend value?
	});

	let force_in_project_list: EntityList<Existing<RawUserType>>;
	let force_in_project_query: Writable<BaseQuery<Existing<RawUserType>>> = writable({
		filters: {
			type: ['admin', 'helper', 'voter'] as unknown as "admin" | "helper" | undefined
		},
		paginationLimit: 10,
		sorting: ['id:down-up', 'is_force_in_project:DESC', 'name:down-up', 'type:down-up'],
		paginationCursor: null,
		paginationDirection: null,
		force_in_project_id: entity.id // DONTREMOVE it's this lines fault? maybe this updates all the time as its a dependend value?
	});
</script>

<CreateForm
	bind:entity
	label="Projekt"
	type="projects"
	keys={[
		'title',
		'info',
		'place',
		'costs',
		'min_age',
		'max_age',
		'min_participants',
		'max_participants',
		'presentation_type',
		'requirements'
	]}
	let:result
>
	<TextInput name="title" label="Titel" bind:the_value={entity.title} {result} />
	<TextInput name="info" label="Info" bind:the_value={entity.info} {result} />
	<TextInput name="place" label="Ort" bind:the_value={entity.place} {result} />
	<TextInput
		name="costs"
		label="Kosten"
		type="number"
		bind:the_value={entity.costs}
		step="0.01"
		{result}
	/>
	<TextInput
		name="min_age"
		label="Mindestalter"
		type="number"
		bind:the_value={entity.min_age}
		{result}
	/>
	<TextInput
		name="max_age"
		label="Höchstalter"
		type="number"
		bind:the_value={entity.max_age}
		{result}
	/>
	<TextInput
		name="min_participants"
		label="Minimale Teilnehmeranzahl"
		type="number"
		bind:the_value={entity.min_participants}
		{result}
	/>
	<TextInput
		name="max_participants"
		label="Maximale Teilnehmeranzahl"
		type="number"
		bind:the_value={entity.max_participants}
		{result}
	/>
	<TextInput
		name="presentation_type"
		label="Präsentationsart"
		bind:the_value={entity.presentation_type}
		{result}
	/>
	<TextInput
		name="requirements"
		label="Voraussetzungen"
		bind:the_value={entity.requirements}
		{result}
	/>
	{#if entity.id}
		<!-- for now only implement this on updating -->
		<!-- TODO FIXME also take care that you cant override somebody else if there are already project leader somewhere else -->
		<!-- TODO FIXME do we want to allow this at creation? then the approach needs to be different -->
		<!-- we could store the selected ones in the response (so also locally and ensure it doesnt get removed) -->
		<EntityList
			bind:this={project_leader_list}
			url="project_leaders.json"
			query={project_leader_query}
			title="Projektleitende"
			createUrl={null}
		>
			<thead slot="filter" let:headerClick let:currentSortValue>
				<tr>
					<Sorting
						name="id"
						title="#"
						{headerClick}
						{currentSortValue}
						query={project_leader_query}
					/>
					<Sorting
						name="is_project_leader"
						title="Projektleiter"
						{headerClick}
						{currentSortValue}
						query={project_leader_query}
					/>
					<Sorting
						name="name"
						title="Name"
						{headerClick}
						{currentSortValue}
						query={project_leader_query}
					/>
					<Sorting
						name="type"
						title="Typ"
						{headerClick}
						{currentSortValue}
						query={project_leader_query}
					/>
					<th>Aktionen</th>
				</tr>
				<tr class="align-middle">
					<NumberFiltering name="id" query={project_leader_query} />
					<BooleanFiltering name="is_project_leader" query={project_leader_query} />
					<TextFiltering name="name" query={project_leader_query} />
					<ListFiltering
						name="type"
						options={['admin', 'helper', 'voter']}
						query={project_leader_query}
					/>
					<th scope="col" />
				</tr>
			</thead>
			<tbody slot="response" let:response>
				{#if response?.failure}
					<tr>
						<td colspan="4">
							<div class="alert alert-danger w-100" role="alert">
								Fehler {response.failure}
							</div>
						</td>
					</tr>
				{:else}
					{#each response?.success?.entities ?? [] as user (user.id)}
						<tr>
							<th scope="row">{user.id}</th>
							<td>
								<ProjectLeaderButton project_id={entity.id} entity={user} />
							</td>
							<td>{user.name}</td>
							<td>{user.type}</td>
							<td />
						</tr>
					{/each}
				{/if}
			</tbody>
		</EntityList>
	{:else}
		<p>
			Projektleitende können erst nach Erstellung des Projekts hinzugefügt werden. Du wirst jedoch
			automatisch hinzugefügt.
		</p>
	{/if}

	{#if entity.id}
		<!-- for now only implement this on updating -->
		<!-- TODO FIXME also take care that you cant override somebody else if there are already project leader somewhere else -->
		<!-- TODO FIXME do we want to allow this at creation? then the approach needs to be different -->
		<!-- we could store the selected ones in the response (so also locally and ensure it doesnt get removed) -->
		<EntityList
			bind:this={force_in_project_list}
			url="force_in_project.json"
			query={force_in_project_query}
			title="garantiert Teilnehmende"
			createUrl={null}
		>
			<thead slot="filter" let:headerClick let:currentSortValue>
				<tr>
					<Sorting
						name="id"
						title="#"
						{headerClick}
						{currentSortValue}
						query={force_in_project_query}
					/>
					<Sorting
						name="is_force_in_project"
						title="garantiert Teilnehmende"
						{headerClick}
						{currentSortValue}
						query={force_in_project_query}
					/>
					<Sorting
						name="name"
						title="Name"
						{headerClick}
						{currentSortValue}
						query={force_in_project_query}
					/>
					<Sorting
						name="type"
						title="Typ"
						{headerClick}
						{currentSortValue}
						query={force_in_project_query}
					/>
					<th>Aktionen</th>
				</tr>
				<tr class="align-middle">
					<NumberFiltering name="id" query={force_in_project_query} />
					<BooleanFiltering name="is_force_in_project" query={force_in_project_query} />
					<TextFiltering name="name" query={force_in_project_query} />
					<ListFiltering
						name="type"
						options={['admin', 'helper', 'voter']}
						query={force_in_project_query}
					/>
					<th scope="col" />
				</tr>
			</thead>
			<tbody slot="response" let:response>
				{#if response?.failure}
					<tr>
						<td colspan="4">
							<div class="alert alert-danger w-100" role="alert">
								Fehler {response.failure}
							</div>
						</td>
					</tr>
				{:else}
					{#each response?.success?.entities ?? [] as user (user.id)}
						<tr>
							<th scope="row">{user.id}</th>
							<td>
								<ForceInProjectButton project_id={entity.id} entity={user} />
							</td>
							<td>{user.name}</td>
							<td>{user.type}</td>
							<td />
						</tr>
					{/each}
				{/if}
			</tbody>
		</EntityList>
	{:else}
		<p>Garantiert Teilnehmende können erst nach Erstellung des Projekts hinzugefügt werden.</p>
	{/if}

	<div class="mb-3 form-check">
		<input
			bind:checked={entity.random_assignments}
			type="checkbox"
			class="form-check-input"
			name="random-assignments"
			id="projects-random-assignments"
		/>
		<label class="form-check-label" for="projects-random-assignments"
			>Zufällige Projektzuweisungen erlaubt</label
		>
	</div>
</CreateForm>
