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
import { save } from '../create-or-update.json';

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

	return await save(parser, request.locals.user);
};
