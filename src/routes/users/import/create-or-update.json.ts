// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType, checkPermissions } from '$lib/authorization';
import { sql } from '$lib/database';
import { hashPassword } from '$lib/password';
import type { UserHelperAdminType, UserType, UserVoterType } from '$lib/types';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { MyLocals } from 'src/hooks';
import type { CreateResponse } from '../../projects/create-or-update.json';
import parse from 'csv-parse';
import { Readable } from 'stream';
import type { PostgresError } from 'postgres';
import { permissions } from '../permissions';

export type UserImportRequest = { [x: string]: any; fileInput?: string; id?: number | undefined };

export const post: RequestHandler<MyLocals, UserImportRequest> = async function (
	request
): Promise<EndpointOutput<CreateResponse>> {
	allowUserType(request, ['admin']);

	const parser = Readable.from(request.body.fileInput!).pipe(
		parse({
			trim: true,
			columns: true,
			delimiter: ';'
		})
	);

	const response = await sql.begin('READ WRITE', async (sql) => {
		// TODO FIXME do this in users and make create-or-update a many-update operatoin
		for await (const body of parser) {
			const user = checkPermissions(permissions, request.locals.user, body);

			try {
				await sql`INSERT INTO users (name, password_hash, type, group, age, away) VALUES (${
					user.name
				}, ${user.password ? await hashPassword(user.password) : null}, ${user.type}, ${
					user.group ?? null
				}, ${user.age ? user.age : null}, ${user.away ?? false}) RETURNING id;`;
			} catch (error: unknown) {
				if (error instanceof Error && error.name === 'PostgresError') {
					const postgresError = error as PostgresError;
					if (
						postgresError.code === '23505' &&
						postgresError.constraint_name === 'users_name_key'
					) {
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
				}
				const response: EndpointOutput<CreateResponse> = {
					status: 500
				};
				return response;
			}
		}
		return {
			body: {
				errors: {}
			}
		};
	});

	return response;
};
