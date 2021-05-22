// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import postgres from 'postgres';
import { hashPassword } from './password';

export const sql = postgres('postgres://projektwahl:changeme@localhost/projektwahl', {
	debug: true
});

export async function setup() {
	await sql.begin(async (sql) => {
		await sql.file('src/lib/setup.sql', null, {
			cache: false
		});

		await sql`INSERT INTO users (name, password_hash, type) VALUES ('admin', ${await hashPassword(
			'changeme'
		)}, 'admin') ON CONFLICT DO NOTHING;`;
	});

	return {};
}
