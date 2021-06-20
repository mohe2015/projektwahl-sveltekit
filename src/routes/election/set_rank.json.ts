// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { checkPassword } from '$lib/password';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { UserType } from '$lib/types';
import { hasPropertyType } from '$lib/validation';
import type { RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/endpoint';

export type SetRankResponse = {
	errors: { [x: string]: string };
};

export const post: RequestHandler<unknown, JSONValue> = async function ({
	locals,
	body
}): Promise<MyEndpointOutput<SetRankResponse>> {
	// TODO FIXME validate rank value range
	// TODO FIXME add rank check constraint to sql
	await sql.begin('READ WRITE', async (sql) => {
		if (body.rank === null) {
			sql`DELETE FROM choices WHERE user_id = ${locals.user?.id ?? null} AND project_id = ${
				body.project
			}`;
		} else {
			console.log(body);
			sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${locals.user?.id ?? null}, ${
				body.project
			}, ${body.rank}) ON CONFLICT (user_id, project_id) DO UPDATE SET rank = ${body.rank};`;
		}
	});

	// TODO FIXME return error on crash (and also show it and network errors on client)
	return {
		body: {
			errors: {}
		},
		headers: {}
	};
};