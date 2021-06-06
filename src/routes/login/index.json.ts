// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { checkPassword } from '$lib/password';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { UserType } from '$lib/types';
import { hasPropertyType } from '$lib/validation';
import type { RequestHandler } from '@mohe2015/kit';
import type { JSONValue } from '@mohe2015/kit/types/endpoint';

export type LoginResponse = {
	errors: { [x: string]: string };
};

export const post: RequestHandler<unknown, JSONValue> = async function ({
	body
}): Promise<MyEndpointOutput<LoginResponse>> {
	const [user, errors] = hasPropertyType(body, ['name', 'password'], '');

	if (Object.keys(errors).length !== 0) {
		const response: MyEndpointOutput<LoginResponse> = {
			body: {
				errors: errors
			}
		};
		return response;
	}

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

	if (entity.password == null || !checkPassword(user.password, entity.password)) {
		return {
			body: {
				errors: {
					name: 'Falsches Passwort!'
				}
			}
		};
	}

	// TODO https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

	// TODO FIXME CSRF

	// TODO set session

	return {
		body: {
			errors: {}
		}
	};
};
