<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Filtering from '$lib/entity-list/Filtering.svelte';
	import Sorting from '$lib/entity-list/Sorting.svelte';
	import EntityList from '$lib/EntityList.svelte';
	import CustomLayout from '/src/routes/_customLayout.svelte';
</script>

<CustomLayout>
	<EntityList
		initialQuery={{
			pagination_limit: '50',
			'sorting[]': ['rank:up', 'id:down-up', 'title:down-up']
		}}
		title="Wahl"
		url="election.json"
		createUrl="/404"
	>
		<thead slot="filter" let:headerClick let:currentSortValue let:query>
			<tr>
				<Sorting name="rank" title="Rang" {headerClick} {currentSortValue} {query} />
				<Sorting name="id" title="#" {headerClick} {currentSortValue} {query} />
				<Sorting name="title" title="Titel" {headerClick} {currentSortValue} {query} />
			</tr>
			<tr class="align-middle">
				<Filtering name="rank" type="number" {query} />
				<Filtering name="id" type="number" {query} />
				<Filtering name="title" type="text" {query} />
			</tr>
		</thead>
		<tbody slot="response" let:response>
			{#each response.entities as entity (entity.id)}
				<tr>
					<td>{entity.rank ?? '-'}</td>
					<th scope="row">{entity.id}</th>
					<td>{entity.title}</td>
					<td>
						<!-- https://getbootstrap.com/docs/5.0/components/button-group/ -->
						<div class="btn-group" role="group" aria-label="Basic radio toggle button group">
							<input
								type="radio"
								class="btn-check"
								name="{entity.id}btnradio"
								id="{entity.id}btnradio1"
								autocomplete="off"
							/>
							<label class="btn btn-outline-primary" for="{entity.id}btnradio1">1</label>

							<input
								type="radio"
								class="btn-check"
								name="{entity.id}btnradio"
								id="{entity.id}btnradio2"
								autocomplete="off"
							/>
							<label class="btn btn-outline-primary" for="{entity.id}btnradio2">2</label>

							<input
								type="radio"
								class="btn-check"
								name="{entity.id}btnradio"
								id="{entity.id}btnradio3"
								autocomplete="off"
							/>
							<label class="btn btn-outline-primary" for="{entity.id}btnradio3">3</label>

							<input
								type="radio"
								class="btn-check"
								name="{entity.id}btnradio"
								id="{entity.id}btnradio4"
								autocomplete="off"
							/>
							<label class="btn btn-outline-primary" for="{entity.id}btnradio4">4</label>

							<input
								type="radio"
								class="btn-check"
								name="{entity.id}btnradio"
								id="{entity.id}btnradio5"
								autocomplete="off"
							/>
							<label class="btn btn-outline-primary" for="{entity.id}btnradio5">5</label>

							<input
								type="radio"
								class="btn-check"
								name="{entity.id}btnradio"
								id="{entity.id}btnradiox"
								autocomplete="off"
								checked
							/>
							<label class="btn btn-outline-primary" for="{entity.id}btnradiox">X</label>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</EntityList>

	<!-- https://github.com/sveltejs/kit/issues/627 -->
	<footer slot="footer" style="position: sticky; bottom: 0; z-index: 1020;">
		<div class="alert alert-success mb-0 border-0 rounded-0" role="alert">
			A simple success alert—check it out!
		</div>
	</footer>
</CustomLayout>
