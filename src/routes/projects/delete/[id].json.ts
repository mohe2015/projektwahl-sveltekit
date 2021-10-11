// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { PostgresError } from 'postgres';
import type { MyLocals } from 'src/hooks';

export type ProjectDeleteResponse = {
	errors: { [x: string]: string };
};

export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<ProjectDeleteResponse>> {
	const { params } = request;
	try {
		await sql.begin('READ WRITE', async (sql) => {
			await sql`DELETE FROM projects WHERE id = ${params.id}`;
		});

		return {
			body: {
				errors: {}
			}
		};
	} catch (error: unknown) {
		if (error instanceof Error && error.name === 'PostgresError') {
			const postgresError = error as PostgresError;
			if (
				postgresError.code === '23503' &&
				postgresError.constraint_name === 'choices_project_id_fkey'
			) {
				// unique violation
				const response: EndpointOutput<ProjectDeleteResponse> = {
					body: {
						errors: {
							user: 'Jemand hat das Projekt noch gewählt!'
						}
					}
				};
				return response;
			}
		}
		console.log(error);
		const response: EndpointOutput<ProjectDeleteResponse> = {
			status: 500
		};
		return response;
	}
};
