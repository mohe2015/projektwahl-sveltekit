<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { session } from '$app/stores';
</script>

<svelte:head>
	<title>Willkommen</title>
</svelte:head>

<h1 class="text-center">Willkommen</h1>

{#if $session && $session.user}
	Hallo {$session.user.name}!
{:else}
	Noch nicht angemeldet.
{/if}
