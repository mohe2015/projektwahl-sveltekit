// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import type { EntityResponseBody } from '$lib/entites';
import { hashPassword } from '$lib/password';
import type { UserType } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import postgres from 'postgres';
import type { MyLocals } from 'src/hooks';

function between(min: number, max: number) {
	return Math.floor(Math.random() * (max - min) + min);
}

export const get: RequestHandler<MyLocals, EntityResponseBody> = async function (request) {
	//allowUserType(request, []);

	const nodbsql = postgres(process.env['DATABASE_URL']!, {
		database: 'postgres',
		debug: true
	});

	try {
		await nodbsql`CREATE DATABASE projektwahl`;
	} catch (err) {
		console.log(err);
		console.log("couldn't create database - possibly it already exists then ignore this");
	}

	await sql.begin('READ WRITE', async (sql) => {
		await sql.file('src/lib/setup.sql', undefined!, {
			cache: false // TODO FIXME doesnt seem to work properly
		});
	});

	await sql.begin('READ WRITE', async (sql) => {
		await sql`INSERT INTO users (name, password_hash, type) VALUES ('admin', ${await hashPassword(
			'changeme'
		)}, 'admin') ON CONFLICT DO NOTHING;`;

		const projects =
			await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments) (SELECT generate_series, '', '', 0, 5, 13, 5, 20, '', '', FALSE FROM generate_series(1, 10000)) RETURNING *;`;

		console.log(projects);

		for (let i = 0; i < 100_000; i++) {
			if (i % 1000 == 0) {
				console.log(i);
			}
			// TODO FIXME add user to keycloak / import users from keycloak (probably easier)
			// https://www.keycloak.org/documentation
			// https://www.keycloak.org/docs-api/15.0/rest-api/index.html

			// TODO compare our approach in general with https://github.com/keycloak/keycloak-quickstarts

			// https://github.com/keycloak/keycloak-documentation/blob/master/server_admin/topics/admin-cli.adoc

			// INTERESTING https://www.keycloak.org/docs/latest/server_admin/index.html#automatically-link-existing-first-login-flow
			// https://github.com/keycloak/keycloak-documentation/blob/master/server_admin/topics/identity-broker/first-login-flow.adoc

			// https://www.keycloak.org/docs-api/15.0/rest-api/index.html

			// TODO we could use that admin URL
			// Remove all user sessions associated with the user Also send notification to all clients that have an admin URL to invalidate the sessions for the particular user.
			/*
			const response = await fetch(process.env['OPENID_ADMIN_URL']!, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env['PROJEKTWAHL_ADMIN_ACCESS_TOKEN']}`
				},
				redirect: 'manual',
				body: JSON.stringify({
					username: `user${Math.random()}`,
					//email: `user${i}@example.org`,
					enabled: true
				})
			});
			console.log(await response.text());
			console.log(response.headers);
			console.log(response.headers.get('location'));
			const userResponse = await fetch(response.headers.get('location')!, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env['PROJEKTWAHL_ADMIN_ACCESS_TOKEN']}`
				}
			});
			const keycloakUser = await userResponse.json();
			console.log(keycloakUser);
			*/

			const [user] = await sql<
				[UserType]
			>`INSERT INTO users (name, type, class, age) VALUES (${`user${Math.random()}`}, 'voter', 'a', 10) ON CONFLICT DO NOTHING RETURNING *;`;
			for (let j = 1; j <= 5; j++) {
				// failed transactions still update the autoincrement count - then this project id here is wrong
				await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${user.id}, ${
					projects[Math.floor(Math.random() * projects.length)].id
				}, ${j}) ON CONFLICT DO NOTHING;`;
			}
		}
	});

	return {
		body: {}
	};
};
