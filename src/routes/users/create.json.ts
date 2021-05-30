import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';
import { assertBoolean, assertNotEmpty, assertNumber, assertOneOf } from '$lib/validation';
import type { RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { ReadOnlyFormData } from '@sveltejs/kit/types/helper';
import type { PostgresError } from 'postgres';

export const post: RequestHandler<unknown, ReadOnlyFormData> = async function({ body }) {
	const errors = {
		...assertNotEmpty(body, 'name'),
		...assertOneOf(body, 'type', ['voter', 'helper', 'admin']),
		...(body.get('type') === 'voter' ? assertNotEmpty(body, 'group') : {}),
		...(body.get('type') === 'voter' ? assertNumber(body, 'age') : {}),
		...assertBoolean(body, 'away')
	};

	if (Object.keys(errors).length !== 0) {
		return {
			body: {
				errors
			}
		};
	}

	try {
		const result =
			await sql`INSERT INTO users (name, password_hash, type, class, age, away) VALUES (${body.get(
				'name'
			)}, ${await hashPassword(body.get('password'))}, ${body.get('type')}, ${
				body.get('group') ?? null
			}, ${body.get('age') ?? null}, ${body.has('away')});`;

		return {
			body: {
				result
			}
		};
	} catch (error: unknown) {
		if (error instanceof Error && error.name === 'PostgresError') {
			const postgresError = error as PostgresError;
			if (postgresError.code === '23505' && postgresError.constraint_name === 'users_name_key') {
				// unique violation
				return {
					body: {
						errors: {
							name: 'Nutzer mit diesem Namen existiert bereits!'
						}
					}
				};
			}
		}
		console.log(error);
		return {
			status: 500
		};
	}
}
