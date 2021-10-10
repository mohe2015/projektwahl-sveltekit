// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { RawProjectType } from '$lib/types';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { MyLocals } from 'src/hooks';

export type ProjectsResponseBody = {
	entity: RawProjectType | null;
};

export const get: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<ProjectsResponseBody>> {
	const { params } = request;

	const [entity]: [RawProjectType?] =
		await sql`SELECT id, title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments FROM projects WHERE id = ${params.id} LIMIT 1`;

	return {
		body: {
			entity: entity ?? null
		}
	};
};
