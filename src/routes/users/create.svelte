<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
<script lang="ts">
	let type = "voter";

    async function createUser() {
        let formData = new FormData(document.querySelector("#form-users"))
        fetch("/users/create.json", {
            method: "POST",
            body: formData
        })
    }
</script>

<svelte:head>
	<title>Nutzer erstellen</title>
</svelte:head>

<h1 class="text-center">Nutzer erstellen</h1>

<div class="row justify-content-center">
	<div class="col-md-7 col-lg-8">
		<form on:submit|preventDefault={createUser} id="form-users">
			<div class="mb-3">
				<label for="users-name" class="form-label">Name:</label>
				<input required type="text" class="form-control" name="name" id="users-name" />
			</div>
			<div class="mb-3">
				<label for="users-password" class="form-label">Passwort:</label>
				<input type="password" class="form-control" name="password" id="users-password" />
			</div>
			<div class="mb-3">
				<label for="users-type" class="form-label">Nutzerart:</label>
				<select required bind:value={type} class="form-select" name="type" id="users-type">
					<option selected value="voter">Schüler</option>
					<option value="helper">Helfer</option>
					<option value="admin">Admin</option>
				</select>
			</div>
			{#if type === 'voter'}
				<div class="mb-3">
					<label for="users-group" class="form-label">Klasse:</label>
					<input required type="text" class="form-control" name="group" id="users-group" />
				</div>
                <div class="mb-3">
					<label for="users-age" class="form-label">Jahrgang:</label>
					<input required type="text" class="form-control" name="age" id="users-age" />
				</div>
			{/if}
			<div class="mb-3 form-check">
				<input type="checkbox" class="form-check-input" name="away" id="users-away" />
				<label class="form-check-label" for="users-away">Abwesend</label>
			</div>
			<button type="submit" class="btn btn-primary">Nutzer erstellen</button>
		</form>
	</div>
</div>
