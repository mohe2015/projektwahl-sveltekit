// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { HTTPError } from '$lib/authorization';
import { sql } from '$lib/database';
import type { UserType } from '$lib/types';
import type { GetSession, Handle } from '@sveltejs/kit';
import { IdTokenClaims, Issuer, TokenSet } from 'openid-client';

export type MyLocals = {
	session_id: string | null;
	user: IdTokenClaims | null;
};

// maybe use bearer token / oauth?
export const handle: Handle<MyLocals> = async ({ request, resolve }) => {
	/*if (request.headers['X-CSRF-Projection'] !== 'PROJEKTWAHL') {
		throw new Error('No CSRF header!');
	}*/

	let session_id = undefined;
	// TODO FIXME same site cookies are not same-origin but same-site and therefore useless in some cases
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
	if (session_id) {
		try {
			/*
			const [session]: [UserType?] =
				await sql`SELECT users.id, users.name, users.type, users.class AS group, users.age, users.away FROM sessions, users WHERE sessions.session_id = ${session_id} AND users.id = sessions.user_id;`;
	*/
			const issuer = await Issuer.discover('http://localhost:8888/auth/realms/projektwahl');

			const Client = issuer.Client;

			// TODO ERROR HANDLING

			const client = new Client({
				client_id: 'projektwahl',
				client_secret: '5748ce04-8a61-4bb3-99dc-f07b5b41d2bf' // TODO FIXME put this into file / env variable
			});

			const result = await client.callback('http://localhost:3000/redirect', {
				id_token: session_id
			});

			// ahh the id_token is probably signed by the server but not by the client

			// TODO FIXME seems like this is not signed which is pretty bad
			// TODO FIXME this doesn't seem to do any verfiication
			// exp     REQUIRED. Expiration time on or after which the ID Token MUST NOT be accepted for processing. The processing of this parameter requires that the current date/time MUST be before the expiration date/time listed in the value. Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew. Its value is a JSON number representing the number of seconds from 1970-01-01T0:0:0Z as measured in UTC until the date/time. See RFC 3339 [RFC3339] for details regarding date/times in general and UTC in particular.

			// locals seem to only be available server side
			request.locals.session_id = session_id!;
			request.locals.user = result.claims();
			let roles = (request.locals.user.realm_access as any).roles as string[];
			roles = roles.filter((r: string) => ['voter', 'helper', 'admin'].includes(r));
			request.locals.user.type = roles.length == 1 ? roles[0] : null;
		} catch (e) {
			// we catch to allow opening /setup
			console.error(e);
			request.locals.session_id = null;
			request.locals.user = null;
		}
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
				status: 500,
				headers: {}
			};
		}
	}
};

export const getSession: GetSession = ({ locals }) => {
	// session seems to also be available client-side
	if (locals.user) {
		return {
			user: {
				// https://openid.net/specs/openid-connect-core-1_0.html#IDToken
				id: locals.user.sub,
				preferred_username: locals.user.preferred_username,
				type: locals.user.type
			}
		};
	}
	return {
		user: null
	};
};
