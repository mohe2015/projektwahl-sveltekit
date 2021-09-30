// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import type { EntityResponseBody } from '$lib/entites';
import { hashPassword } from '$lib/password';
import type { UserType } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import type { MyLocals } from 'src/hooks';

function between(min: number, max: number) {
	return Math.floor(Math.random() * (max - min) + min);
}

export const get: RequestHandler<MyLocals, EntityResponseBody> = async function (request) {
	//allowUserType(request, []);

	await sql.begin('READ WRITE', async (sql) => {
		await sql.file('src/lib/setup.sql', undefined!, {
			cache: false // TODO FIXME doesnt seem to work properly
		});
	});

	await sql.begin('READ WRITE', async (sql) => {
		//await sql`INSERT INTO users (name, type) VALUES ('admin', 'admin') ON CONFLICT DO NOTHING;`;

		const PROJECT_COUNT = 100;
		for (let i = 0; i < PROJECT_COUNT; i++) {
			await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments) VALUES (${
				'project' + i
			}, '', '', 0, 5, 13, 5, 20, '', '', FALSE) ON CONFLICT DO NOTHING;`;
		}

		for (let i = 0; i < 1000; i++) {
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

			const response = await fetch(process.env['OPENID_ADMIN_URL']!, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env['PROJEKTWAHL_ADMIN_ACCESS_TOKEN']}`
				},
				redirect: 'manual',
				body: JSON.stringify({
					username: `4user${i}`,
					email: `4user${i}@example.org`,
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

			const [user] = await sql<
				[UserType]
			>`INSERT INTO users (id, name, type, class, age) VALUES (${keycloakUser.id}, ${keycloakUser.username}, 'voter', 'a', 10) ON CONFLICT DO NOTHING RETURNING *;`;
			for (let j = 1; j <= 5; j++) {
				await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${user.id}, ${between(
					1,
					PROJECT_COUNT + 1
				)}, ${j}) ON CONFLICT DO NOTHING;`;
			}
		}
	});

	return {
		body: {}
	};
};
