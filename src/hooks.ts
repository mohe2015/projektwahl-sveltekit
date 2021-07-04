// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { AuthorizationError, HTTPError } from '$lib/authorization';
import { sql } from '$lib/database';
import type { UserType } from '$lib/types';
import type { GetSession, Handle } from '@sveltejs/kit';
import type { Location } from '../../kit/packages/kit/types/helper';
import type { ServerRequest } from '../../kit/packages/kit/types/hooks';

export type MyLocals = {
	session_id: string | null;
	user: UserType | null;
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
	try {
		const [session]: [UserType?] =
			await sql`SELECT users.id, users.name, users.type, users.class AS group, users.age, users.away FROM sessions, users WHERE sessions.session_id = ${session_id} AND users.id = sessions.user_id;`;

		console.log(request.path);
		console.log('ii', session);

		// locals seem to only be available server side
		request.locals.session_id = session_id!;
		request.locals.user = session ?? null;

		console.log(request.locals);
	} catch (e) {
		// we catch to allow opening /setup
		console.error(e);
		request.locals.session_id = null;
		request.locals.user = null;
	}

	try {
		const response = await resolve(request);

		return response;
	} catch (error: unknown) {
		console.error(error);
		if (error instanceof HTTPError) {
			return {
				status: error.status,
				body: error.statusText,
				headers: {}
			};
		} else {
			return {
				status: 500
			};
		}
	}
};

export const getSession: GetSession = ({ locals }) => {
	// session seems to also be available client-side
	if (locals.user) {
		return {
			user: {
				id: locals.user.id,
				name: locals.user.name,
				type: locals.user.type
			}
		};
	}
	return {
		user: null
	};
};
