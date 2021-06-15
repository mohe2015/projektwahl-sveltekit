// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';
import type { RequestHandler } from '@sveltejs/kit';

function between(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

export const get: RequestHandler = async function () {
	await sql.begin(async (sql) => {
		await sql.file('src/lib/setup.sql', undefined!, {
			cache: false
		});
	});

	await sql.begin(async (sql) => {
		await sql`INSERT INTO users (name, password_hash, type) VALUES ('admin', ${await hashPassword(
			'changeme'
		)}, 'admin') ON CONFLICT DO NOTHING;`;

		for (let i = 0; i < 1000; i++) {
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
					10,
					900
				)}, ${j}) ON CONFLICT DO NOTHING;`; // TODO FIXME use real user_id as they could differ
			}
		}
	});

	return {
		body: {}
	};
};
