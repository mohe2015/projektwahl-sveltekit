// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { MyLocals } from 'src/hooks';
import type { PostgresError } from 'postgres';

export type UserDeleteResponse = {
	errors: { [x: string]: string };
};

export const post: RequestHandler<MyLocals, JSONValue> = async function (
	request
): Promise<EndpointOutput<UserDeleteResponse>> {
	allowUserType(request, ['admin']);
	const { params } = request;
	try {
		await sql.begin('READ WRITE', async (sql) => {
			await sql`DELETE FROM users WHERE id = ${params.id}`;
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
				postgresError.constraint_name === 'sessions_user_id_fkey'
			) {
				// unique violation
				const response: EndpointOutput<UserDeleteResponse> = {
					body: {
						errors: {
							user: 'Nutzer ist noch angemeldet!'
						}
					}
				};
				return response;
			}
		}
		console.log(error);
		const response: EndpointOutput<UserDeleteResponse> = {
			status: 500
		};
		return response;
	}
};
