<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts" context="module">
	export const load: Load = async ({ page, fetch }) => {
		const url = `/users/data/${page.params.id}.json`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: await res.json()
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	import type { Load } from '@mohe2015/kit';
	import Form from '../_form.svelte';

	export let entity: any;
</script>

<Form {entity} />
