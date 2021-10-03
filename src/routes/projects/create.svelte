<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Form from './_form.svelte';
</script>

<svelte:head>
	<title>Projekt erstellen</title>
</svelte:head>

<main class="container">
	<Form
		entity={{
			costs: 0,
			min_age: 5,
			max_age: 13,
			min_participants: 5,
			max_participants: 15,
			random_assignments: false
		}}
	/>
</main>
