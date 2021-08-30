// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowAnyone, allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import { checkPassword } from '$lib/password';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { UserType } from '$lib/types';
import { hasPropertyType } from '$lib/validation';
import type { RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/endpoint';
import type { MyLocals } from 'src/hooks';
import { Issuer } from 'openid-client';

export type LoginResponse = {
	errors: { [x: string]: string };
	session?: any;
};

export const get: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<MyEndpointOutput<any>> {
	allowAnyone(request);

	// https://github.com/panva/node-openid-client/blob/main/docs/README.md
	// .well-known/openid-configuration
	const issuer = await Issuer.discover('http://localhost:8888/auth/realms/projektwahl');

	const Client = issuer.Client;

	// TODO ERROR HANDLING

	const client = new Client({
		client_id: 'projektwahl',
		client_secret: '5b4e5809-0b49-48df-979d-72bf4ee80878'
	});

	const result = await client.callback('http://localhost:3000/redirect', {
		session_state: request.query.get('session_state')!,
		code: request.query.get('code')!
	});

	console.log(result);

	console.log(result.claims());

	const userinf = await client.userinfo(result);

	console.log(userinf);

	return {
		body: {
			errors: {}
		},
		status: 307,
		headers: {
			Location: 'http://localhost:3000'
		}
	};
};
