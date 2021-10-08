// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { Existing, RawSessionType, RawUserType } from '$lib/types';
import type { GetSession, Handle } from '@sveltejs/kit';
import dotenv from 'dotenv';

export type MyLocals = {
	session_id: string | null;
	user: Existing<RawUserType> | null;
};

// maybe use bearer token / oauth?
export const handle: Handle<MyLocals> = async ({ request, resolve }) => {
	if (request.path == '/no-javascript') {
		request.method = 'GET'; // Potentially dangerous as POST may still be somewhere else
	}

	// TODO FIXME hack because VITE doesn't load all env vars
	dotenv.config();

	let session_id: string | undefined = undefined;
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
		if (request.headers['x-csrf-protection'] !== 'projektwahl') {
			throw new Error('No CSRF header!');
		}
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
			const [session]: [(Existing<RawUserType> & RawSessionType)?] =
				// eslint-disable-next-line @typescript-eslint/await-thenable
				await sql`SELECT sessions.updated_at, users.id, users.name, users.type, users.group, users.age, users.away, users.project_leader_id FROM sessions, users WHERE sessions.session_id = ${session_id} AND users.id = sessions.user_id;`;

			if (session) {
				request.locals.session_id = session_id;
				request.locals.user = session ?? null;

				const updated_at: Date = session.updated_at;
				const millies = new Date().getTime() - updated_at.getTime();
				if (!(millies < 60 * 60 * 1000)) {
					// 1 hour
					throw new Error('session timeout');
				}

				await sql.begin('READ WRITE', async (sql) => {
					// eslint-disable-next-line @typescript-eslint/await-thenable
					await sql`UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE session_id = ${session.session_id}`;
				});

				// maybe don't delete sessions for now so we can track back if somebody complains

				/*const issuer = await Issuer.discover(process.env['OPENID_URL']!);
	
				const Client = issuer.Client;
	
				// TODO ERROR HANDLING
	
				const client = new Client({
					client_id: process.env['CLIENT_ID']!,
					client_secret: process.env['CLIENT_SECRET']
				});
	
				const result = await client.callback(`${process.env['THE_BASE_URL']}/redirect`, {
					id_token: session_id
				});
	
				const claims = result.claims();
	
				//let roles = (claims.realm_access as any).roles as string[];
				//roles = roles.filter((r: string) => ['voter', 'helper', 'admin'].includes(r));
				//if (roles.length != 1) {
				//} else {
				// locals seem to only be available server side
				request.locals.session_id = session_id!;
				request.locals.user = {
					...claims,
					type: 'voter' //roles[0] // TODO FIXME select from database
				};
				//}*/
			}
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
		return {
			status: 500,
			headers: {}
		};
	}
};

export const getSession: GetSession<MyLocals> = ({ locals }) => {
	// session seems to also be available client-side
	if (locals.user) {
		return {
			user: {
				// https://openid.net/specs/openid-connect-core-1_0.html#IDToken
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
