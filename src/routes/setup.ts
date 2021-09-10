// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import type { EntityResponseBody } from '$lib/entites';
import { hashPassword } from '$lib/password';
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
		await sql`INSERT INTO users (name, password_hash, type) VALUES ('admin', ${await hashPassword(
			'changeme'
		)}, 'admin') ON CONFLICT DO NOTHING;`;

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

			/*

			"federatedIdentities": [{
                "identityProvider": "github",
                "userId": "13287984",
                "userName": "mohe2015"
            }]

			What's extremely nice is that we get
			"User with email moritz.hedtke@t-online.de already exists. How do you want to continue?"
			with an identity provider and existing email. So if we get the emails and a provider we can implement single sign-on.

			UNFORTUNATELY you need the password of that account then. Try linking only email then.

			*/

			// INTERESTING https://www.keycloak.org/docs/latest/server_admin/index.html#automatically-link-existing-first-login-flow
			// https://github.com/keycloak/keycloak-documentation/blob/master/server_admin/topics/identity-broker/first-login-flow.adoc

			/*
			# https://www.keycloak.org/docs-api/15.0/rest-api/index.html#_partialimportrepresentation
			access_token=`curl --data "grant_type=password&username=admin&password=admin&client_secret=secret&client_id=admin-cli" http://localhost:8888/auth/realms/master/protocol/openid-connect/token | jq -r .access_token`
			curl -X POST -H 'Accept: application/json' -H 'Content-Type: application/json' -H "Authorization: Bearer $access_token"  --data "@src/lib/test-users.json"  http://localhost:8888/auth/admin/realms/projektwahl/partialImport

			curl -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' -H "Authorization: Bearer $access_token" http://localhost:8888/auth/admin/realms/projektwahl/users | jq
			*/

			// GET /{realm}/users

			// TODO we could use that admin URL
			// Remove all user sessions associated with the user Also send notification to all clients that have an admin URL to invalidate the sessions for the particular user.

			await sql`INSERT INTO users (name, type, class, age) VALUES (${
				'user' + i
			}, 'voter', 'a', 10) ON CONFLICT DO NOTHING;`;
			for (let j = 1; j <= 5; j++) {
				await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${i + 1}, ${between(
					1,
					PROJECT_COUNT + 1
				)}, ${j}) ON CONFLICT DO NOTHING;`; // TODO FIXME use real user_id as they could differ
			}
		}
	});

	return {
		body: {}
	};
};
