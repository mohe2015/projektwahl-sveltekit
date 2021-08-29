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

export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<MyEndpointOutput<LoginResponse>> {
	allowAnyone(request);

	const [user, errors] = hasPropertyType(request.body, ['name', 'password'], '');

	if (Object.keys(errors).length !== 0) {
		const response: MyEndpointOutput<LoginResponse> = {
			body: {
				errors: errors
			}
		};
		return response;
	}

	// https://mxtoolbox.com
	// https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc
	// https://login.microsoftonline.com/aesgb.de/v2.0/.well-known/openid-configuration

	// https://go.microsoft.com/fwlink/?linkid=2083908
	// https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

	// https://login.microsoftonline.com/aesgb.de/v2.0/.well-known/openid-configuration
	// https://login.microsoftonline.com/cf26c69d-b010-4a12-9b3b-7c85b4ee914b/oauth2/v2.0/authorize?scope=openid&response_type=id_token&nonce=test

	// NEW ONE
	// https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-authentication-flows
	// https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-web-app-sign-user-app-registration?tabs=aspnetcore
	// https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-web-app-sign-user-app-registration?tabs=aspnetcore#register-an-app-by-using-the-quickstarts
	// Starting November 9th, 2020 end users will no longer be able to grant consent to newly registered multitenant apps without verified publishers.  Add MPN ID to verify publisher

	// https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal
	const googleIssuer = await Issuer.discover('https://login.microsoftonline.com/common/v2.0');

	console.log(googleIssuer);

	const [entity]: [UserType?] =
		await sql`SELECT id, name, password_hash AS password, type FROM users WHERE name = ${user.name} LIMIT 1`;

	if (entity === undefined) {
		return {
			body: {
				errors: {
					name: 'Nutzer existiert nicht!'
				}
			}
		};
	}

	if (entity.password == null || !(await checkPassword(entity.password, user.password))) {
		return {
			body: {
				errors: {
					password: 'Falsches Passwort!'
				}
			}
		};
	}

	const [session] = await sql.begin('READ WRITE', async (sql) => {
		return await sql`INSERT INTO sessions (user_id) VALUES (${entity.id!}) RETURNING session_id`;
	});

	// TODO https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

	// TODO FIXME CSRF

	// TODO set session

	return {
		body: {
			errors: {},
			session
		},
		headers: {
			'Set-Cookie': [
				`strict_id=${session.session_id}; Max-Age=${
					48 * 60 * 60
				}; Secure; HttpOnly; SameSite=Strict`,
				`lax_id=${session.session_id}; Max-Age=${48 * 60 * 60}; Secure; HttpOnly; SameSite=Lax`
			] as unknown as string
		}
	};
};
