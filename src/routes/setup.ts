// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async function () {
	await sql.begin(async (sql) => {
		await sql.file('src/lib/setup.sql', undefined!, {
			cache: false
		});

		await sql`INSERT INTO users (name, password_hash, type) VALUES ('admin', ${await hashPassword(
			'changeme'
		)}, 'admin') ON CONFLICT DO NOTHING;`;
	});

	for (let i = 0; i < 1000; i++) {
		await sql`INSERT INTO users (name, password_hash, type) VALUES (${
			'user' + i
		}, NULL, 'voter') ON CONFLICT DO NOTHING;`;
	}

	for (let i = 0; i < 1000; i++) {
		await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments) VALUES (${
			'project' + i
		}, '', '', 0, 5, 13, 5, 20, '', '', FALSE) ON CONFLICT DO NOTHING;`;
	}

	return {
		body: {}
	};
};
