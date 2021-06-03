// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';
import type { MyEndpointOutput, MyRequestHandler } from '$lib/request_helpers';
import { assertBoolean, assertNotEmpty, assertNumber, assertOneOf } from '$lib/validation';
import type { ReadOnlyFormData } from '@mohe2015/kit/types/helper';
import type { PostgresError } from 'postgres';

type CreateResponse = {
	errors: { [x: string]: string };
};

export const post: MyRequestHandler<CreateResponse, Record<string, any>, ReadOnlyFormData> =
	async function ({ body }) {
		const errors = {
			...assertNotEmpty(body, 'title'),
			...assertOneOf(body, 'type', ['voter', 'helper', 'admin']),
			...(body.get('type') === 'voter' ? assertNotEmpty(body, 'group') : {}),
			...(body.get('type') === 'voter' ? assertNumber(body, 'age') : {}),
			...assertBoolean(body, 'away')
		};

		if (Object.keys(errors).length !== 0) {
			const response: MyEndpointOutput<CreateResponse> = {
				body: {
					errors: errors
				}
			};
			return response;
		}

		try {
			const result =
				await sql`INSERT INTO users (name, password_hash, type, class, age, away) VALUES (${body.get(
					'name'
				)}, ${await hashPassword(body.get('password'))}, ${body.get('type')}, ${
					body.get('group') ?? null
				}, ${body.get('age') ?? null}, ${body.has('away')});`;

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
