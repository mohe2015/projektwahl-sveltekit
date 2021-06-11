<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import Form from './_form.svelte';
	import CustomLayout from '/src/routes/_customLayout.svelte';
</script>

<CustomLayout>
	<Form entity={{ type: 'voter', away: false }} />
</CustomLayout>
