// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowAnyone } from '$lib/authorization';
import { sql } from '$lib/database';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { MyLocals } from 'src/hooks';

export type LogoutResponse = {
	errors: { [x: string]: string };
};

export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<MyEndpointOutput<LogoutResponse>> {
	console.log('logout');

	allowAnyone(request); // you could argue that this should only be available to logged in users but I think this makes it more user friendly if you're actually already logged out e.g. because you logged out in another tab.
	const { locals } = request;

	await sql.begin('READ WRITE', async (sql) => {
		await sql`DELETE FROM sessions WHERE session_id = ${locals.session_id}`;
	});

	// TODO FIXME send session deauth to keycloak

	return {
		body: {
			errors: {}
		},
		headers: {
			'Set-Cookie': [
				`strict_id=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Strict`,
				`lax_id=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax`
			] as unknown as string
		}
	};
};
