<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script context="module" lang="ts">
	import type { LoadOutput } from '@sveltejs/kit';

	export const load = function ({ error, status }: LoadOutput): LoadOutput {
		// we can't check instanceof as this could be a serialized value
		//if ((error as Error).name === 'HTTPError') {
		//	status = (error as HTTPError).status;
		//}
		return {
			props: {
				status: status,
				error: error
			}
		};
	};
</script>

<script lang="ts">
	export let status: number;
	export let error: Error;
</script>

<main class="container">
	<div class="alert alert-danger" role="alert">
		<h4 class="alert-heading"><i class="bi bi-exclamation-triangle-fill" /> Fehler {status}</h4>
		<p>{error.name}: {error.message}</p>
		<pre>{error.stack}</pre>
		<hr />
		<p class="mb-0">
			{#if status === 500}
				Beep boop. Das tut uns Leid. Versuche es später erneut.
			{:else if status === 404}
				Mmh. Entweder du hast dich vertippt oder wir sind schuld.
			{:else if status === 403}
				Einbrecher. Du hast hierauf definitiv keinen Zugriff.
			{:else}
				Mist. Wir haben keine Ahnung was los ist!
			{/if}
		</p>
	</div>
</main>
