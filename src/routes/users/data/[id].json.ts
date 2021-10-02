// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { UserType } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { MyLocals } from 'src/hooks';

export type UsersResponseBody = {
	entity: UserType | null;
};

export const get: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<MyEndpointOutput<UsersResponseBody>> {
	allowUserType(request, ['admin', 'helper']);
	const { params } = request;

	// TODO FIXME same database column names like attributes so this doesn't happen again
	const [entity]: [UserType?] =
		await sql`SELECT id, name, type, class AS group, age, away FROM users WHERE id = ${params.id} LIMIT 1`;

	return {
		body: {
			entity: entity ?? null
		}
	};
};
