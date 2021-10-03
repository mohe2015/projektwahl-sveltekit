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

// TODO FIXME these could probably also be generalized by adding mapper functions (e.g. for the password here)
export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<CreateResponse>> {
	allowUserType(request, ['admin']);
	const { body } = request;

	// TODO FIXME when implementing update don't accidentially destroy the password
	// TODO FIXME if you erase the field you get an empty password - we need a way to reset the password and one to leave it like it was

	const user = checkPermissions(permissions, request.locals.user, body);

	try {
		// TODO FIXME allow helper to change this but only specific fields (NOT type)
		const [row] = await sql.begin('READ WRITE', async (sql) => {
			if (user.id !== undefined) {
				return await sql`UPDATE users SET
name = CASE WHEN ${user.name !== undefined} THEN ${user.name ?? null} ELSE name END,
password_hash = CASE WHEN ${user.password !== undefined} THEN ${
					user.password ? await hashPassword(user.password) : null
				} ELSE password_hash END,
type = CASE WHEN ${user.type !== undefined} THEN ${user.type ?? null} ELSE type END,
"group" = CASE WHEN ${user.group !== undefined} THEN ${user.group ?? null} ELSE "group" END,
age = CASE WHEN ${user.age !== undefined} THEN ${user.age ?? null} ELSE age END,
away = CASE WHEN ${user.away !== undefined} THEN ${user.away ?? null} ELSE away END,
project_leader_id = CASE WHEN ${user.project_leader_id !== undefined} THEN ${
					user.project_leader_id ?? null
				} ELSE project_leader_id END
WHERE id = ${user.id!} RETURNING id;`;
			} else {
				return await sql`INSERT INTO users (name, password_hash, type, "group", age, away) VALUES (${
					user.name ?? null
				}, ${user.password ? await hashPassword(user.password) : null}, ${user.type ?? null}, ${
					user.group ?? null
				}, ${user.age ?? null}, ${user.away ?? false}) RETURNING id;`;
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
