// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { RequestHandler } from '@mohe2015/kit';
import type { JSONValue } from '@mohe2015/kit/types/endpoint';

export const post: RequestHandler<unknown, JSONValue> = async function ({
	params
}): Promise<MyEndpointOutput<Record<string, never>>> {
	await sql`DELETE FROM users WHERE id = ${params.id}`;

	return {
		body: {}
	};
};
