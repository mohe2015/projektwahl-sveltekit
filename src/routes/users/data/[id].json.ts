// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { EntityResponseBody } from '$lib/list-entities';
import type { MyRequestHandler } from '$lib/request_helpers';

export type UserType = { id: number; name: string; type: string }; // TODO FIXME is id really returned as number?

export type UsersResponseBody = {
	entity: UserType | null;
};

export const get: MyRequestHandler<UsersResponseBody> = async function ({ params }) {
	const [entity]: [UserType?] =
		await sql`SELECT id, name, type FROM users WHERE id = ${params.id} LIMIT 1`;

	console.log(entity);

	return {
		body: {
			entity: entity ?? null
		}
	};
};
