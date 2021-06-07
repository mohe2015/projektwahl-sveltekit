// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { ProjectType } from '$lib/types';
import { hasPropertyType } from '$lib/validation';
import type { JSONValue, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { PostgresError } from 'postgres';

type CreateResponse = {
	errors: { [x: string]: string };
};

// generalization currently probably not really worth it.
export const post: RequestHandler<unknown, JSONValue> = async function ({
	body
}): Promise<MyEndpointOutput<CreateResponse>> {
	let errors: { [index: string]: string } = {};
	if (typeof body !== 'object') {
		throw new Error('wrong request format');
	}
	const project1 = body;
	const [project2, errors2] = hasPropertyType(
		project1,
		['title', 'info', 'place', 'presentation_type', 'requirements'],
		''
	);
	const [project3, errors3] = hasPropertyType(
		project2,
		['costs', 'min_age', 'max_age', 'min_participants', 'max_participants'],
		0
	);
	const [project4, errors4] = hasPropertyType(project3, ['random_assignments'], true);
	const project: ProjectType = project4;
	errors = {
		...errors,
		...errors2,
		...errors3,
		...errors4
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
		await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments) VALUES (${project.title}, ${project.info}, ${project.place}, ${project.costs}, ${project.min_age}, ${project.max_age}, ${project.min_participants}, ${project.max_participants}, ${project.presentation_type}, ${project.requirements}, ${project.random_assignments});`;

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
