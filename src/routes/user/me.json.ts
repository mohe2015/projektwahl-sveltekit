// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { UserType } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/endpoint';
import type { MyLocals } from 'src/hooks';

export const get: RequestHandler<MyLocals, JSONValue> = async function ({
	locals
}): Promise<MyEndpointOutput<any>> {
	return {
		body: {
			user: {
				id: locals.user?.id,
				name: locals.user?.name,
				type: locals.user?.type
			}
		}
	};
};
