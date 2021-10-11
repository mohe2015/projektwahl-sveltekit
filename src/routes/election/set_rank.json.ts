// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { isOk, Result } from '$lib/result';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { MyLocals } from 'src/hooks';
import { validator } from './permissions';

export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<Result<Record<string, never>, { [key: string]: string; }>>> {
	const result = validator(request.locals.user, request.body);
	if (!isOk(result)) {
		return {
			body: result
		};
	}
	const entity = result.success;

	// TODO FIXME validate rank value range
	// TODO FIXME add rank check constraint to sql
	await sql.begin('READ WRITE', async (sql) => {
		if (entity.rank === null) {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			await sql`DELETE FROM choices WHERE user_id = ${request.locals.user.id} AND project_id = ${entity.project_id}`;
		} else {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${request.locals.user.id}, ${entity.project_id}, ${entity.rank}) ON CONFLICT (user_id, project_id) DO UPDATE SET rank = ${entity.rank};`;
		}
	});

	// TODO FIXME return error on crash (and also show it and network errors on client)
	return {
		body: {
			result: "success",
			success: {}
		},
		headers: {}
	};
};
