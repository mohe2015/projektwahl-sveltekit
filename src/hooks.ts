// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { UserType } from '$lib/types';
import type { GetSession, Handle } from '@sveltejs/kit';

export type MyLocals = {
	session_id: string;
	user: UserType;
};

export const handle: Handle<MyLocals> = async ({ request, resolve }) => {
	let session_id = null;
	if (request.method === 'GET') {
		const cookie = request.headers.cookie
			?.split('; ')
			.map((c) => c.split('='))
			.find((c) => c[0] == 'lax_id');
		if (cookie) {
			session_id = cookie[1];
		}
	} else if (request.method === 'POST') {
		const cookie = request.headers.cookie
			?.split('; ')
			.map((c) => c.split('='))
			.find((c) => c[0] == 'strict_id');
		if (cookie) {
			session_id = cookie[1];
		}
	} else {
		throw new Error('Unsupported HTTP method!');
	}
	const [session] = await sql<
		UserType[]
	>`SELECT users.id, users.name, users.type, users.class AS group, users.age, users.away FROM sessions, users WHERE sessions.session_id = ${session_id} AND users.id = sessions.user_id;`;

	// locals seem to only be available server side
	request.locals.session_id = session_id;
	request.locals.user = session;

	console.log(request.locals);

	const response = await resolve(request);

	return response;
};
/*
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
