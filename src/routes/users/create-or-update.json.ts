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
	if (typeof body === 'object') {
		const user1 = body;
		const user2 = hasPropertyType(user1, ['name', 'password'], ''); // TODO name nonempty
		const user3 = hasPropertyType(user2, ['id'], 0);
		const user3_1 = hasPropertyType(user3, ['away'], true);
		const test = ['voter' as const, 'helper' as const, 'admin' as const];
		const user4 = hasEnumProperty<typeof user3_1, 'type', 'voter' | 'helper' | 'admin'>(
			user3_1,
			['type'],
			test
		);
		if (user4.type === 'voter') {
			const user3_5 = hasPropertyType(user4, ['group'], ''); // TODO nonempty
			const user4_5 = hasPropertyType(user3_5, ['age'], 0);
			const user3_2: UserVoterType = user4_5 as UserVoterType;
			user = user3_2;
		} else if (user4.type === 'helper' || user4.type === 'admin') {
			const user3_5: UserHelperAdminType = user4 as unknown as UserHelperAdminType;
			user = user3_5;
		} else {
			throw new Error('unreachable');
		}
	} else {
		throw new Error('wrong request format');
	}

	const errors = {};

	if (Object.keys(errors).length !== 0) {
		const response: MyEndpointOutput<CreateResponse> = {
			body: {
				errors: errors
			}
		};
		return response;
	}

	try {
		await sql`INSERT INTO users (name, password_hash, type, class, age, away) VALUES (${body.get(
			'name'
		)}, ${await hashPassword(user.password)}, ${user.type}, ${user.group ?? null}, ${
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
