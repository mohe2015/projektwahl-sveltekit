// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit/types/endpoint';
import type { MyLocals } from 'src/hooks';
import parse from 'csv-parse';
import { Readable } from 'stream';
import { save } from '../create-or-update.json';
import { Transform } from 'stream';
import type { Result } from '$lib/result';

export type UserImportRequest = { fileInput?: string; id: number };

export const post: RequestHandler<MyLocals, UserImportRequest> = async function (
	request
): Promise<EndpointOutput<Result<{ id?: number }, { [key: string]: string }>>> {
	// TODO FIXME use validation system
	if (!request.body.fileInput) {
		return {
			status: 400
		};
	}

	const transformStream = new Transform({
		readableObjectMode: true,
		writableObjectMode: true
	});

	transformStream._transform = (chunk, encoding, callback) => {
		if (chunk.age === '') {
			chunk.age = undefined;
		}
		if (chunk.group === '') {
			chunk.group = undefined;
		}
		console.log(chunk);
		transformStream.push(chunk);
		callback();
	};

	const parser = Readable.from(request.body.fileInput)
		.pipe(
			parse({
				trim: true,
				columns: true,
				delimiter: ';',
				cast: true
			})
		)
		.pipe(transformStream);

	return await save(parser, request.locals.user);
};
