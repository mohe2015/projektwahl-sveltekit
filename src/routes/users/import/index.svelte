<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	// currently there will not be progress and this is not easily fixable with fetch so it's not gonna happen

	// https://github.com/sveltejs/kit/issues/1563
	// https://github.com/sveltejs/kit/issues/70

	let fileInput: HTMLInputElement;

	const importEntities = async (e: Event) => {
		e.preventDefault();

		let file: File = fileInput.files![0];

		file.slice();

		file.stream().getReader();

		// TOOD FIXME maybe https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#uploading_a_file

		let response = await fetch('/test', {
			method: 'POST',
			body: file //.slice()
		});
		let json = await response.text();
	};
</script>

<main class="container">
	<form on:submit={importEntities}>
		<input bind:this={fileInput} type="file" accept="text/csv" />

		<button type="submit">Importieren</button>
	</form>
</main>
