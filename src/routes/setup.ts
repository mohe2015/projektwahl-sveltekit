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
	allowUserType(request, []);

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
			await sql`INSERT INTO users (name, password_hash, type, class, age) VALUES (${
				'user' + i
			}, NULL, 'voter', 'a', 10) ON CONFLICT DO NOTHING;`;
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
