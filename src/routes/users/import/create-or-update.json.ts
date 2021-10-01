// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { UserHelperAdminType, UserType, UserVoterType } from '$lib/types';
import { hasEnumProperty, hasPropertyType } from '$lib/validation';
import type { JSONValue, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { PostgresError } from 'postgres';
import type { MyLocals } from 'src/hooks';
import type { CreateResponse } from '../../projects/create-or-update.json';
import parse from 'csv-parse';
import { Readable } from 'stream';

export type UserImportRequest = { [x: string]: any; fileInput?: string; id?: number | undefined };

export const post: RequestHandler<MyLocals, UserImportRequest> = async function (
	request
): Promise<MyEndpointOutput<CreateResponse>> {
	allowUserType(request, ['admin']);

	const parser = Readable.from(request.body.fileInput!).pipe(
		parse({
			trim: true,
			columns: true,
			delimiter: ';'
		})
	);

	const response = await sql.begin('READ WRITE', async (sql) => {
		for await (const body of parser) {
			console.log(body);
			let user: UserType = undefined!;
			let errors: { [index: string]: string } = {};
			if (typeof body === 'object') {
				const user1 = body;
				const [user2, errors2] = hasPropertyType(user1, ['name' /*, 'password'*/], ''); // TODO name nonempty
				//const user3 = hasPropertyType(user2, ['id'], 0); // TODO FIXME
				//const [user3, errors3] = hasPropertyType(user2, ['away'], true);
				const types = ['voter' as const, 'helper' as const, 'admin' as const];
				const [user4, errors4] = hasEnumProperty<
					typeof user2,
					'type',
					'voter' | 'helper' | 'admin'
				>(user2, ['type'], types);
				if (user4.type === 'voter') {
					const [user5, errors5] = hasPropertyType(user4, ['group'], ''); // TODO nonempty
					const [user6, errors6] = hasPropertyType(user5, ['age'], 0);
					const user7: UserVoterType = user6 as unknown as UserVoterType;
					user = user7;
					errors = {
						...errors,
						...errors5,
						...errors6
					};
				} else if (user4.type === 'helper' || user4.type === 'admin') {
					const user5: UserHelperAdminType = user4 as unknown as UserHelperAdminType;
					user = user5;
				}
				errors = {
					...errors,
					...errors2,
					//...errors3,
					...errors4
				};
			} else {
				throw new Error('wrong request format');
			}

			console.log(errors);

			if (Object.keys(errors).length !== 0) {
				const response: MyEndpointOutput<CreateResponse> = {
					status: 200,
					body: {
						errors: errors
					}
				};
				return response;
			}

			try {
				await sql`INSERT INTO users (name, password_hash, type, class, age, away) VALUES (${
					user.name
				}, ${user.password ? await hashPassword(user.password) : null}, ${user.type}, ${
					user.group ?? null
				}, ${user.age ? user.age : null}, ${user.away ?? false}) RETURNING id;`;
			} catch (error: unknown) {
				if (error instanceof Error && error.name === 'PostgresError') {
					const postgresError = error as PostgresError;
					if (
						postgresError.code === '23505' &&
						postgresError.constraint_name === 'users_name_key'
					) {
						// unique violation
						const response: MyEndpointOutput<CreateResponse> = {
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
				const response: MyEndpointOutput<CreateResponse> = {
					status: 500
				};
				return response;
			}
		}
		return {
			body: {
				errors: {}
			}
		};
	});
	console.log(response);

	return response;
};
