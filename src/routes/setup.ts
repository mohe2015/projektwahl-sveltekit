// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get() {
	await sql.begin(async (sql) => {
		await sql.file('src/lib/setup.sql', null, {
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

	return {
		body: {}
	};
}
