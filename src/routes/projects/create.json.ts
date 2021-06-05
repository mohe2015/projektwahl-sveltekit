// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { MyEndpointOutput, MyRequestHandler } from '$lib/request_helpers';
import { assertBoolean, assertNotEmpty, assertNumber } from '$lib/validation';
import type { ReadOnlyFormData } from '@mohe2015/kit/types/helper';
import type { PostgresError } from 'postgres';

type CreateResponse = {
	errors: { [x: string]: string };
};

// generalization currently probably not really worth it.
export const post: MyRequestHandler<CreateResponse, unknown, ReadOnlyFormData> = async function ({
	body
}) {
	const errors = {
		...assertNotEmpty(body, 'title'),
		...assertNotEmpty(body, 'info'),
		...assertNotEmpty(body, 'place'),
		...assertNumber(body, 'costs'),
		...assertNumber(body, 'min_age'),
		...assertNumber(body, 'max_age'),
		...assertNumber(body, 'min_participants'),
		...assertNumber(body, 'max_participants'),
		...assertNotEmpty(body, 'presentation_type'),
		...assertNotEmpty(body, 'requirements'),
		...assertBoolean(body, 'random_assignments')
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
		await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments) VALUES (${body.get(
			'title'
		)}, ${body.get('info')}, ${body.get('place')}, ${body.get('costs')}, ${body.get(
			'min_age'
		)}, ${body.get('max_age')}, ${body.get('min_participants')}, ${body.get(
			'max_participants'
		)}, ${body.get('presentation_type')}, ${body.get('requirements')}, ${body.has(
			'random_assignments'
		)});`;

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
			if (postgresError.code === '22003') {
				// numeric_value_out_of_range
				const response: MyEndpointOutput<CreateResponse> = {
					body: {
						errors: {
							costs: 'Die Kosten sind zu hoch!'
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
