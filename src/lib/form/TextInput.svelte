<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	import { errOrDefault, PromiseResult, Result } from '$lib/result';

	type E = $$Generic;

	export let label: string;
	export let name: string;
	export let type: 'text' | 'number' | 'password' = 'text';
	export let the_value: string | number | string[] | null | undefined;
	export let step: string | undefined = undefined;
	export let autocomplete: string | undefined = undefined;
	let randomId: string = 'id' + Math.random().toString().replace('.', '');

	export let result: PromiseResult<E, { [key: string]: string }>;
</script>

<!-- because of a limitation of svelte (binding with dynamic type not possible) we need to duplicate the code here -->
{#if type === 'text'}
	<div class="mb-3">
		<label for="{randomId}-{name}" class="form-label">{label}:</label>
		<input
			type="text"
			class="form-control {name in errOrDefault(result, {}) ? 'is-invalid' : ''}"
			{name}
			id="{randomId}-{name}"
			aria-describedby="{randomId}-{name}-feedback"
			bind:value={the_value}
		/>
		{#if name in errOrDefault(result, {})}
			<div id="{randomId}-{name}-feedback" class="invalid-feedback">
				{errOrDefault(result, {})[name]}
			</div>
		{/if}
	</div>
{:else if type === 'number'}
	<div class="mb-3">
		<label for="{randomId}-{name}" class="form-label">{label}:</label>
		<input
			type="number"
			class="form-control {name in errOrDefault(result, {}) ? 'is-invalid' : ''}"
			{name}
			id="{randomId}-{name}"
			aria-describedby="{randomId}-{name}-feedback"
			{step}
			bind:value={the_value}
		/>
		{#if name in errOrDefault(result, {})}
			<div id="{randomId}-{name}-feedback" class="invalid-feedback">
				{errOrDefault(result, {})[name]}
			</div>
		{/if}
	</div>
{:else if type === 'password'}
	<div class="mb-3">
		<label for="{randomId}-{name}" class="form-label">{label}:</label>
		<input
			type="password"
			class="form-control {name in errOrDefault(result, {}) ? 'is-invalid' : ''}"
			{name}
			id="{randomId}-{name}"
			aria-describedby="{randomId}-{name}-feedback passwordHelp"
			bind:value={the_value}
			{autocomplete}
		/>
		{#if name in errOrDefault(result, {})}
			<div id="{randomId}-{name}-feedback" class="invalid-feedback">
				{errOrDefault(result, {})[name]}
			</div>
		{/if}
		<div id="passwordHelp" class="form-text">
			<a target="_blank" href="https://imgs.xkcd.com/comics/password_strength.png"
				>Denk dran: Lange Passwörter sind viel sicherer als welche mit vielen Sonderzeichen.</a
			><br />
			Also lieber "Ich mag fliegende Autos." anstatt "Moritz1234!".<br />
			Du kannst auch einen Passwort-Manager verwenden, z.B.
			<a target="_blank" href="https://bitwarden.com/download/">Bitwarden</a>
		</div>
	</div>
{:else}
	<div class="alert alert-danger" role="alert">
		Interner Fehler: Unbekannter Eingabe-Typ: {type}
	</div>
{/if}
