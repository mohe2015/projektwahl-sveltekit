// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';
import { isOk, Result } from '$lib/result';
import type { Existing, RawUserType } from '$lib/types';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { PostgresError } from 'postgres';
import type { MyLocals } from 'src/hooks';
import { editValidator } from './permissions';
//import { webcrypto as crypto } from 'crypto';

// TODO FIXME somehow validate if a field is not used? for that checkPermissions would first need to return a typed object
export const save = async (
	data: AsyncIterable<JSONValue>,
	loggedInUser: Existing<RawUserType> | null
): Promise<EndpointOutput<Result<{ id?: number }, { [key: string]: string }>>> => {
	return await sql.begin('READ WRITE', async (sql) => {
		let row;
		for await (const entry of data) {
			const result = editValidator(loggedInUser, entry);
			if (!isOk(result)) {
				return {
					body: result
				};
			}
			const user = result.success;

			//const generatedPassword = Buffer.from(crypto.getRandomValues(new Uint8Array(8))).toString(
			//	'hex'
			//);

			try {
				// TODO FIXME allow helper to change this but only specific fields (NOT type)
				if (user.id !== undefined) {
					// eslint-disable-next-line @typescript-eslint/await-thenable
					[row] = await sql`UPDATE users SET
	name = CASE WHEN ${user.name !== undefined} THEN ${user.name ?? null} ELSE name END,
	password_hash = CASE WHEN ${user.password !== undefined} THEN ${
						user.password ? await hashPassword(user.password) : null
					} ELSE password_hash END,
	type = CASE WHEN ${user.type !== undefined} THEN ${user.type ?? null} ELSE type END,
	"group" = CASE WHEN ${user.group !== undefined} THEN ${user.group ?? null} ELSE "group" END,
	age = CASE WHEN ${!!user.age /*for csv import*/} THEN ${user.age ?? null} ELSE age END,
	away = CASE WHEN ${user.away !== undefined} THEN ${user.away ?? null} ELSE away END,
	project_leader_id = CASE WHEN ${user.project_leader_id !== undefined} THEN ${
						user.project_leader_id ?? null
					} ELSE project_leader_id END,
	force_in_project_id = CASE WHEN ${user.force_in_project_id !== undefined} THEN ${
						user.force_in_project_id ?? null
					} ELSE force_in_project_id END
	WHERE id = ${user.id} RETURNING id;`;
				} else {
					[row] =
						await sql`INSERT INTO users (name, password_hash, type, "group", age, away) VALUES (${
							user.name ?? null
						}, ${user.password ? await hashPassword(user.password) : null}, ${user.type ?? null}, ${
							user.group ?? null
						}, ${user.age ? user.age : null /* for csv import */}, ${
							user.away ?? false
						}) RETURNING id;`;
				}
			} catch (error: unknown) {
				console.log(error);
				if (error instanceof Error && error.name === 'PostgresError') {
					const postgresError = error as PostgresError;
					if (
						postgresError.code === '23505' &&
						postgresError.constraint_name === 'users_name_key'
					) {
						// unique violation
						const response: EndpointOutput<Result<{ id?: number }, { [key: string]: string }>> = {
							body: {
								result: 'failure',
								failure: {
									name: 'Nutzer mit diesem Namen existiert bereits!'
								}
							}
						};
						return response;
					}
				}
				const response: EndpointOutput<Result<{ id?: number }, { [key: string]: string }>> = {
					status: 500
				};
				return response;
			}
		}
		return {
			body: {
				result: 'success',
				success: {
					id: row.id
				}
			}
		};
	});
};

// TODO FIXME these could probably also be generalized by adding mapper functions (e.g. for the password here)
export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<Result<{ id?: number }, { [key: string]: string }>>> {
	const { body } = request;

	return await save([body], request.locals.user);

	// TODO FIXME when implementing update don't accidentially destroy the password
	// TODO FIXME if you erase the field you get an empty password - we need a way to reset the password and one to leave it like it was
};
