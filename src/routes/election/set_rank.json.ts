// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType, checkPermissions } from '$lib/authorization';
import { sql } from '$lib/database';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { MyLocals } from 'src/hooks';
import { permissions } from './permissions';

export type SetRankResponse = {
	errors: { [x: string]: string };
};

export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<SetRankResponse>> {
	const user = allowUserType(request, ['voter']);

	const entity = checkPermissions(permissions, request.locals.user, request.body, "edit");

	// TODO FIXME validate rank value range
	// TODO FIXME add rank check constraint to sql
	await sql.begin('READ WRITE', async (sql) => {
		if (entity.rank === null) {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			await sql`DELETE FROM choices WHERE user_id = ${user.id} AND project_id = ${entity.project_id}`;
		} else {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${user.id}, ${entity.project_id}, ${entity.rank}) ON CONFLICT (user_id, project_id) DO UPDATE SET rank = ${entity.rank};`;
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
