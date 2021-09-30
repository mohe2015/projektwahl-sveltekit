// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import type { MyEndpointOutput } from '$lib/request_helpers';
import type { ProjectType } from '$lib/types';
import type { JSONValue, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { MyLocals } from 'src/hooks';

export type ProjectsResponseBody = {
	entity: ProjectType | null;
};

export const get: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<MyEndpointOutput<ProjectsResponseBody>> {
	allowUserType(request, ['admin']);
	const { params } = request;

	const [entity]: [ProjectType?] =
		await sql`SELECT id, title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments FROM projects WHERE id = ${params.id} LIMIT 1`;

	return {
		body: {
			entity: entity ?? null
		}
	};
};
