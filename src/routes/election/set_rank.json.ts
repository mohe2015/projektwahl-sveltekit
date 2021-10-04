// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { MyLocals } from 'src/hooks';

export type SetRankResponse = {
	errors: { [x: string]: string };
};

export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<SetRankResponse>> {
	const user = allowUserType(request, ['voter']);
	const { body }: { body: any } = request;
	// TODO FIXME validate rank value range
	// TODO FIXME add rank check constraint to sql
	await sql.begin('READ WRITE', async (sql) => {
		if (body.rank === null) {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			await sql`DELETE FROM choices WHERE user_id = ${user.id} AND project_id = ${body.project}`;
		} else {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${user.id}, ${body.project}, ${body.rank}) ON CONFLICT (user_id, project_id) DO UPDATE SET rank = ${body.rank};`;
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
