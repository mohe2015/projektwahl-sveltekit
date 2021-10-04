// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { ServerRequest } from '@sveltejs/kit/types/hooks';
import type { MyLocals } from 'src/hooks';
import type { Existing, RawUserType } from './types';

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
): Existing<RawUserType> => {
	if (!request.locals.user || !(allowedTypes as string[]).includes(request.locals.user.type)) {
		throw new HTTPError(403, 'Forbidden');
	}
	return request.locals.user;
};

export const allowAnyone = (_request: ServerRequest<MyLocals, unknown>): void => {
	// do nothing.
};

export type PermissionType = {
	view: (user: Existing<RawUserType> | null, entity: JSONValue) => boolean;
	edit: (user: Existing<RawUserType> | null, entity: JSONValue) => boolean;
};

export type PermissionsType<T> = {
	[index in keyof T]: PermissionType;
};

export const checkPermissions = <T>(
	permissions: PermissionsType<T>,
	user: Existing<RawUserType> | null,
	body: JSONValue,
	mode: 'view' | 'edit'
): T => {
	if (typeof body !== 'object' || Array.isArray(body) || body == null) {
		throw new HTTPError(401, `invalid type`);
	}
	const sanitizedValue: {
		[key: string]: string | number | boolean | null;
	} = {};
	for (const [key, checker] of Object.entries<PermissionType>(permissions)) {
		if (body[key] === undefined) continue;

		if (mode === 'edit') {
			if (!checker.edit(user, body)) {
				throw new HTTPError(401, `not allowed to change ${key}`);
			}
		}
		if (mode === 'view') {
			if (!checker.view(user, body)) {
				throw new HTTPError(401, `not allowed to view ${key}`);
			}
		}
		const val = body[key];
		if (val && (typeof val === 'object' || Array.isArray(val))) {
			throw new HTTPError(401, `invalid type at ${key}`);
		}
		sanitizedValue[key] = val;
	}
	for (const [key, _value] of Object.entries(body)) {
		if (!(key in permissions)) {
			throw new HTTPError(401, `additional ignored field ${key}`);
		}
	}
	// TODO FIXME check types of fields otherwise this is not correct
	return sanitizedValue as unknown as T;
};
