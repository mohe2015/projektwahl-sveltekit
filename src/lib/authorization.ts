// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { MyLocals } from 'src/hooks';
import type { ServerRequest } from '../../../kit/packages/kit/types/hooks';

export class HTTPError extends Error {
	status: number;
	statusText: string;

	constructor(status: number, statusText: string) {
		super(`HTTP-Fehler ${status} ${statusText}`);
		this.name = 'HTTPError';
		this.status = status;
		this.statusText = statusText;
	}
}

export const allowUserType = (
	request: ServerRequest<MyLocals, unknown>,
	allowedTypes: ('voter' | 'helper' | 'admin' | undefined)[]
) => {
	if (!allowedTypes.includes(request.locals.user?.type)) {
		throw new HTTPError(403, 'Forbidden');
	}
};

export const allowAnyone = (request: ServerRequest<MyLocals, unknown>) => {
	// do nothing.
};
