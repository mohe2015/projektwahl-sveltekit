// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import postgres from 'postgres';
import { argon2id, hash } from 'argon2';

export const sql = postgres('postgres://projektwahl:changeme@localhost/projektwahl');

export async function setup() {
	await sql.begin(async (sql) => {
		await sql.file('src/lib/setup.sql', null, {
			cache: false
		});

		// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
		// https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-argon2-13

		await hash('test', {
			type: argon2id,
			timeCost: 3,
			memoryCost: 64 * 1024, // 64 MiB
			saltLength: 128, // TODO FIXME check
			hashLength: 256, // TODO FIXME check
			parallelism: 4
		});

		await sql`INSERT INTO users (name, password_hash, type) VALUES ('admin', ${'hi'}, 'admin') ON CONFLICT DO NOTHING;`;
	});

	return {};
}
