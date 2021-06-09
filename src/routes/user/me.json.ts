// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { UserType } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/endpoint';
import type { MyLocals } from 'src/hooks';

export type MeResponse = {
	user: UserType | null;
};

export const get: RequestHandler<MyLocals, JSONValue> = async function ({
	locals
}): Promise<MyEndpointOutput<MeResponse>> {
	if (locals.user) {
		return {
			body: {
				user: {
					id: locals.user.id,
					name: locals.user.name,
					// @ts-expect-error I don't know why - need to look into this further
					type: locals.user.type
				}
			}
		};
	}
	return {
		body: {
			user: null
		}
	};
};
