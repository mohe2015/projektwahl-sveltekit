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
	const issuer = await Issuer.discover(process.env['OPENID_URL']!);

	const Client = issuer.Client;

	// TODO ERROR HANDLING

	const client = new Client({
		client_id: process.env['CLIENT_ID']!,
		client_secret: process.env['CLIENT_SECRET']
	});

	const result = await client.callback(`${process.env['THE_BASE_URL']}/redirect`, {
		session_state: request.query.get('session_state')!,
		code: request.query.get('code')!
	});

	const userinf = await client.userinfo(result, {});

	return {
		body: {
			errors: {}
		},
		status: 307,
		headers: {
			'Set-Cookie': [
				`strict_id=${result.id_token}; Max-Age=${48 * 60 * 60}; Secure; HttpOnly; SameSite=Strict`,
				`lax_id=${result.id_token}; Max-Age=${48 * 60 * 60}; Secure; HttpOnly; SameSite=Lax`
			] as unknown as string,
			Location: process.env['THE_BASE_URL']
		}
	};
};
