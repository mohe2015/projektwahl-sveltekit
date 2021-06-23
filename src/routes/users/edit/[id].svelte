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
	import type { UserType } from '$lib/types';

	import type { Load } from '@sveltejs/kit';
	import Form from '../_form.svelte';
	import CustomLayout from '/src/routes/_customLayout.svelte';

	export let entity: UserType;
</script>

<CustomLayout>
	<a href="https://xkcd.com/936/"
		><img alt="" src="https://imgs.xkcd.com/comics/password_strength.png" /></a
	>

	<Form {entity} />
</CustomLayout>
