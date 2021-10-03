// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit';
import type { MyLocals } from 'src/hooks';
import { dev } from '$app/env';
import type { JSONValue } from '@sveltejs/kit/types/helper';

export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<any>> {
	console.log('yay');
	if (!dev) {
		throw new Error('only available in dev');
	}
	console.log('Jo');

	allowUserType(request, ['admin']);
	const { body } = request;

	await sql.begin('READ WRITE', async (sql) => {
		await sql`DROP TABLE IF EXISTS test1`;
		await sql`CREATE TABLE test1 (id SERIAL, a VARCHAR, b VARCHAR, c VARCHAR)`;
		for (let i = 0; i < 100; i++) {
			await sql`INSERT INTO test1 (a, b, c) VALUES ('', '', '')`;
		}
	});

	return {
		body: {}
	};
};
