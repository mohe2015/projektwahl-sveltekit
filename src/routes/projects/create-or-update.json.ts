// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { isOk } from '$lib/result';
import type { Existing, RawProjectType } from '$lib/types';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { MyLocals } from 'src/hooks';
import { editValidator, validator } from './permissions';

export const post: RequestHandler<MyLocals, JSONValue> = async function (request) {
	const { body } = request;

	const result = validator(request.locals.user, body);
	if (!isOk(result)) {
		return {
			body: result
		}
	}
	const project = result.success;

	try {
		let row: Existing<RawProjectType>;
		if (project.id !== undefined) {
			const result = editValidator(request.locals.user, body);
			if (!isOk(result)) {
				return {
					body: result
				}
			}
			[row] = await sql.begin('READ WRITE', async (sql) => {
				return await sql`UPDATE projects SET
title = CASE WHEN ${project.title !== undefined} THEN ${project.title ?? null} ELSE title END,
info = CASE WHEN ${project.info !== undefined} THEN ${project.info ?? null} ELSE info END,
place = CASE WHEN ${project.place !== undefined} THEN ${project.place ?? null} ELSE place END,
costs = CASE WHEN ${project.costs !== undefined} THEN ${project.costs ?? null} ELSE costs END,
min_age = CASE WHEN ${project.min_age !== undefined} THEN ${
					project.min_age ?? null
				} ELSE min_age END,
max_age = CASE WHEN ${project.max_age !== undefined} THEN ${
					project.max_age ?? null
				} ELSE max_age END,
min_participants = CASE WHEN ${project.min_participants !== undefined} THEN ${
					project.min_participants ?? null
				} ELSE max_participants END,
max_participants = CASE WHEN ${project.max_participants !== undefined} THEN ${
					project.max_participants ?? null
				} ELSE max_participants END,
presentation_type = CASE WHEN ${project.presentation_type !== undefined} THEN ${
					project.presentation_type ?? null
				} ELSE presentation_type END,
requirements = CASE WHEN ${project.requirements !== undefined} THEN ${
					project.requirements ?? null
				} ELSE requirements END,
random_assignments = CASE WHEN ${project.random_assignments !== undefined} THEN ${
					project.random_assignments ?? null
				} ELSE random_assignments END
WHERE id = ${project.id} RETURNING id;`;
			});
		} else {
			const result = editValidator(request.locals.user, body);
			if (!isOk(result)) {
				return {
					body: result
				}
			}
			// (CASE WHEN ${project.title !== undefined} THEN ${project.title ?? null} ELSE DEFAULT END,
			// would be dream but is a syntax error. we probably need to build the queries custom
			[row] = await sql.begin('READ WRITE', async (sql) => {
				return await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments) VALUES
(${project.title ?? null},
${project.info ?? null},
${project.place ?? null},
${project.costs ?? 0},
${project.min_age ?? null},
${project.max_age ?? null},
${project.min_participants ?? null},
${project.max_participants ?? null},
${project.presentation_type ?? null},
${project.requirements ?? null},
${project.random_assignments ?? false})
RETURNING id;`;
			});
		}

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
			if (postgresError.code === '22003') {
				// numeric_value_out_of_range
				const response: EndpointOutput<CreateResponse> = {
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
		const response: EndpointOutput<CreateResponse> = {
			status: 500
		};
		return response;
	}
};
