// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';
import type { MyEndpointOutput, MyRequestHandler } from '$lib/request_helpers';
import type { UserHelperAdminType, UserType, UserVoterType } from '$lib/types';
import { hasEnumProperty, hasPropertyType } from '$lib/validation';
import type { JSONValue } from '@mohe2015/kit/types/endpoint';
import type { PostgresError } from 'postgres';

type CreateResponse = {
	errors: { [x: string]: string };
};

export const post: MyRequestHandler<CreateResponse, unknown, JSONValue> = async function ({
	body
}) {
	let user: UserType;
	let errors: { [index: string]: string } = {};
	if (typeof body === 'object') {
		const user1 = body;
		const [user2, errors2] = hasPropertyType(user1, ['name', 'password'], ''); // TODO name nonempty
		//const user3 = hasPropertyType(user2, ['id'], 0); // TODO FIXME
		const [user3, errors3] = hasPropertyType(user2, ['away'], true);
		const types = ['voter' as const, 'helper' as const, 'admin' as const];
		const [user4, errors4] = hasEnumProperty<typeof user3, 'type', 'voter' | 'helper' | 'admin'>(
			user3,
			['type'],
			types
		);
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
		} else {
			throw new Error('unreachable');
		}
		errors = {
			...errors,
			...errors2,
			...errors3,
			...errors4
		};
	} else {
		throw new Error('wrong request format');
	}

	if (Object.keys(errors).length !== 0) {
		const response: MyEndpointOutput<CreateResponse> = {
			body: {
				errors: errors
			}
		};
		return response;
	}

	try {
		await sql`INSERT INTO users (name, password_hash, type, class, age, away) VALUES (${
			user.name
		}, ${await hashPassword(user.password)}, ${user.type}, ${user.group ?? null}, ${
			user.age ?? null
		}, ${'away' in user});`;

		const response: MyEndpointOutput<CreateResponse> = {
			body: {
				errors: {}
			}
		};
		return response;
	} catch (error: unknown) {
		if (error instanceof Error && error.name === 'PostgresError') {
			const postgresError = error as PostgresError;
			if (postgresError.code === '23505' && postgresError.constraint_name === 'users_name_key') {
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
};
