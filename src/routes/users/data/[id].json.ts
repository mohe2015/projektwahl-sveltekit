// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { Existing, RawUserType } from '$lib/types';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { MyLocals } from 'src/hooks';

export type UsersResponseBody = {
	entity: Existing<RawUserType> | null;
};

export const get: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<UsersResponseBody>> {
	const { params } = request;

	// TODO FIXME same database column names like attributes so this doesn't happen again
	const [entity]: [Existing<RawUserType>?] = await sql`SELECT ${sql([
		'id',
		'name',
		'type',
		'group',
		'age',
		'away'
	])} FROM users WHERE id = ${params.id} LIMIT 1`;

	return {
		body: {
			entity: entity ?? null
		}
	};
};
