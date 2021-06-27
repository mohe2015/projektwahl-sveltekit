// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { MyLocals } from 'src/hooks';
import type { ServerRequest } from '../../../kit/packages/kit/types/hooks';

export const allowUserType = (
	request: ServerRequest<MyLocals, unknown>,
	allowedTypes: ('voter' | 'helper' | 'admin' | undefined)[]
) => {
	if (!allowedTypes.includes(request.locals.user?.type)) {
		throw new Error('unauthorized');
	}
	// @ts-expect-error we don't want to show this property somewhere in the types
	request.locals.authorization_done = true;
};

export const allowAnyone = (request: ServerRequest<MyLocals, unknown>) => {
	// @ts-expect-error we don't want to show this property somewhere in the types
	request.locals.authorization_done = true;
};
