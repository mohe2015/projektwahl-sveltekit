<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	export let feedback: Map<string, string> = new Map();
	export let label: string;
	export let name: string;
	export let type = 'text';
	export let the_value: string | number | string[] | null | undefined;
	let randomId: string = 'id' + Math.random().toString().replace('.', '');
</script>

<!-- because of a limitation of svelte (binding with dynamic type not possible) we need to duplicate the code here -->
{#if type === 'text'}
	<div class="mb-3">
		<label for="{randomId}-{name}" class="form-label">{label}:</label>
		<input
			type="text"
			class="form-control {feedback.has(name) ? 'is-invalid' : ''}"
			{name}
			id="{randomId}-{name}"
			aria-describedby="{randomId}-{name}-feedback"
			bind:value={the_value}
		/>
		{#if feedback.has(name)}
			<div id="{randomId}-{name}-feedback" class="invalid-feedback">
				{feedback.get(name)}
			</div>
		{/if}
	</div>
{:else if type === 'number'}
	<div class="mb-3">
		<label for="{randomId}-{name}" class="form-label">{label}:</label>
		<input
			type="number"
			class="form-control {feedback.has(name) ? 'is-invalid' : ''}"
			{name}
			id="{randomId}-{name}"
			aria-describedby="{randomId}-{name}-feedback"
			bind:value={the_value}
		/>
		{#if feedback.has(name)}
			<div id="{randomId}-{name}-feedback" class="invalid-feedback">
				{feedback.get(name)}
			</div>
		{/if}
	</div>
{:else if type === 'password'}
	<div class="mb-3">
		<label for="{randomId}-{name}" class="form-label">{label}:</label>
		<input
			type="password"
			class="form-control {feedback.has(name) ? 'is-invalid' : ''}"
			{name}
			id="{randomId}-{name}"
			aria-describedby="{randomId}-{name}-feedback"
			bind:value={the_value}
		/>
		{#if feedback.has(name)}
			<div id="{randomId}-{name}-feedback" class="invalid-feedback">
				{feedback.get(name)}
			</div>
		{/if}
	</div>
{:else}
	<div class="alert alert-danger" role="alert">
		Interner Fehler: Unbekannter Eingabe-Typ: {type}
	</div>
{/if}
