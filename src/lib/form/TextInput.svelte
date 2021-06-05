<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	export let feedback: Map<string, string> = new Map();
	export let label: string;
	export let name: string;
	export let type = 'text';
	let randomId: string = 'id' + Math.random().toString().replace('.', '');
</script>

<div class="mb-3">
	<label for="{randomId}-{name}" class="form-label">{label}:</label>
	<input
		{type}
		class="form-control {feedback.has(name) ? 'is-invalid' : ''}"
		{name}
		id="{randomId}-{name}"
		aria-describedby="{randomId}-{name}-feedback"
		{...$$restProps}
	/>
	<!-- $$restProps can't be optimized well -->
	{#if feedback.has(name)}
		<div id="{randomId}-{name}-feedback" class="invalid-feedback">
			{feedback.get(name)}
		</div>
	{/if}
</div>
