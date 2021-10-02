// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType, checkPermissions } from '$lib/authorization';
import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { PostgresError } from 'postgres';
import type { MyLocals } from 'src/hooks';
import type { CreateResponse } from '../projects/create-or-update.json';
import { permissions } from './permissions';

export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<CreateResponse>> {
	allowUserType(request, ['admin']);
	const { body } = request;

	// TODO FIXME when implementing update don't accidentially destroy the password

	const user = checkPermissions(permissions, request.locals.user, body);

	try {
		// TODO FIXME allow helper to change this but only specific fields (NOT type)
		const [row] = await sql.begin('READ WRITE', async (sql) => {
			if ('id' in user) {
				return await sql`UPDATE users SET name = ${user.name}, password_hash = COALESCE(${
					user.password ? await hashPassword(user.password) : null
				}, password_hash), type = ${user.type}, class = ${user.group ?? null}, age = ${
					user.age ?? null
				}, away = ${user.away} WHERE id = ${user.id!} RETURNING id;`;
			} else {
				return await sql`INSERT INTO users (name, password_hash, type, class, age, away) VALUES (${
					user.name
				}, ${user.password ? await hashPassword(user.password) : null}, ${user.type}, ${
					user.group ?? null
				}, ${user.age ?? null}, ${user.away}) RETURNING id;`;
			}
		});

		const response: EndpointOutput<CreateResponse> = {
			body: {
				errors: {},
				id: row.id
			}
		};
		return response;
	} catch (error: unknown) {
		if (error instanceof Error && error.name === 'PostgresError') {
			const postgresError = error as PostgresError;
			if (postgresError.code === '23505' && postgresError.constraint_name === 'users_name_key') {
				// unique violation
				const response: EndpointOutput<CreateResponse> = {
					body: {
						errors: {
							name: 'Nutzer mit diesem Namen existiert bereits!'
						}
					}
				};
				return response;
			}
		}
		console.log(error);
		const response: EndpointOutput<CreateResponse> = {
			status: 500
		};
		return response;
	}
};
