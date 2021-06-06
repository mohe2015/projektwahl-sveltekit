// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { GetSession, Handle } from '@mohe2015/kit';
/*
export const handle: Handle = async ({ request, resolve }) => {
    // locals seem to only be available server side
	request.locals.user = await getUserInformation(request.headers.cookie);

	const response = await resolve(request);

	return {
		...response,
		headers: {
			...response.headers,
			'x-custom-header': 'potato'
		}
	};
}

export const getSession: GetSession = (request) => {
    // session seems to also be available client-side
	return {
		user: {
			// only include properties needed client-side —
			// exclude anything else attached to the user
			// like access tokens etc
			name: request.locals.user?.name,
			email: request.locals.user?.email,
			avatar: request.locals.user?.avatar
		}
	};
}
*/
