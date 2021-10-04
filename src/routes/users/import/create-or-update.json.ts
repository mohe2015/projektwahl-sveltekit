// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { MyLocals } from 'src/hooks';
import type { CreateResponse } from '../../projects/create-or-update.json';
import parse from 'csv-parse';
import { Readable } from 'stream';
import { save } from '../create-or-update.json';

export type UserImportRequest = { fileInput?: string; id: number };

export const post: RequestHandler<MyLocals, UserImportRequest> = async function (
	request
): Promise<EndpointOutput<CreateResponse>> {
	allowUserType(request, ['admin']);

	// TODO FIXME use validation system
	if (!request.body.fileInput) {
		return {
			status: 400
		};
	}

	const parser = Readable.from(request.body.fileInput).pipe(
		parse({
			trim: true,
			columns: true,
			delimiter: ';'
		})
	);

	return await save(parser, request.locals.user);
};
