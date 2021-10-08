// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { JSONString, JSONValue } from '@sveltejs/kit/types/helper';
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

export type ValidatorProperty<T> = {
	validate: (user: Existing<RawUserType> | null, unsanitizedValue: JSONValue) => T;
};

export type ValidatorType<T> = {
	[index in keyof T]: ValidatorProperty<T[index]>;
};

export const assertStringProperty = (value: JSONValue, key: string): string => {
	const value2 = assertObjectType(value);
	const value3 = value2[key]
	if (typeof value3 !== 'string') {
		throw new HTTPError(401, `not a string at ${key}`)
	}
	return value3
}

export const assertObjectType = (value: JSONValue): {
    [key: string]: JSONString;
} => {
	if (
		typeof value !== 'object' ||
		Array.isArray(value) ||
		value == null
	) {
		throw new HTTPError(401, `invalid type`);
	}
	return value
}

// TODO FIXME this could be a subtype of ValidatorProperty
export const validateObject = <T extends Record<string, unknown>>(
	validator: ValidatorType<T>,
	user: Existing<RawUserType> | null,
	unsanitizedValue: JSONValue
): T => {
	const unsanitizedValue2 = assertObjectType(unsanitizedValue);
	const sanitizedValue: T = {} as T;
	for (const key in validator) {
		sanitizedValue[key] = validator[key].validate(user, unsanitizedValue2);
	}
	for (const key in unsanitizedValue2) {
		if (!(key in validator)) {
			throw new HTTPError(401, `additional ignored field ${key}`);
		}
	}
	return sanitizedValue;
};
