// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { ServerRequest } from '@sveltejs/kit/types/hooks';
import type { MyLocals } from 'src/hooks';
import type { UserType } from './types';

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
	allowedTypes: ('voter' | 'helper' | 'admin')[]
): UserType => {
	if (!request.locals.user || !(allowedTypes as string[]).includes(request.locals.user.type)) {
		throw new HTTPError(403, 'Forbidden');
	}
	return request.locals.user;
};

export const allowAnyone = (_request: ServerRequest<MyLocals, unknown>): void => {
	// do nothing.
};

export type PermissionType = {
	view: (user: UserType | null, entity: JSONValue) => boolean;
	edit: (user: UserType | null, entity: JSONValue) => boolean;
};

export type PermissionsType = Map<string, PermissionType>;

export const checkPermissions = (
	permissions: PermissionsType,
	user: UserType | null,
	body: JSONValue
): {
	[key: string]: string | number | boolean | null;
} => {
	if (typeof body !== 'object' || Array.isArray(body) || body == null) {
		throw new HTTPError(401, `invalid type`);
	}
	const sanitizedValue: {
		[key: string]: string | number | boolean | null;
	} = {};
	for (const [key, checker] of permissions) {
		if (body[key] === undefined) continue;

		if (!checker.edit(user, body)) {
			throw new HTTPError(401, `not allowed to change ${key}`);
		}
		const val = body[key];
		if (val && (typeof val === 'object' || Array.isArray(val))) {
			throw new HTTPError(401, `invalid type at ${key}`);
		}
		sanitizedValue[key] = val;
	}
	for (const [key, _value] of Object.entries(body)) {
		if (!permissions.has(key)) {
			throw new HTTPError(401, `additional ignored field ${key}`);
		}
	}
	// TODO FIXME check that no unchecked values are in the original thing - otherwise we could accidentially loose data
	return sanitizedValue;
};
