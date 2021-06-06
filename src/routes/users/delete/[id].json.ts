// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { RequestHandler } from '@mohe2015/kit';
import type { JSONValue } from '@mohe2015/kit/types/endpoint';

export const post: RequestHandler<unknown, JSONValue> = async function ({
	body
}): Promise<MyEndpointOutput<any>> {
	return {
		status: 200,
		body: {}
	};
};
