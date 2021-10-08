// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { JSONString, JSONValue } from '@sveltejs/kit/types/helper';
import { andThen, Result } from './result';
import type { Existing, RawUserType } from './types';

export type Validator<T> = (user: Existing<RawUserType> | null, unsanitizedValue: JSONValue) => Result<T>;

export const assertStringProperty = (value: JSONValue, key: string): Result<string> => {
	return andThen(assertObjectType(value), value => {
		const value3 = value2[key]
		if (typeof value3 !== 'string') {
			return {
				failure: {
					[key]: "not a text"
				}
			}
		}
		return {
			success: value3,
			failure: {}
		}
	}
}

export const assertObjectType = (value: JSONValue): Result<{
    [key: string]: JSONString;
}> => {
	if (
		typeof value !== 'object' ||
		Array.isArray(value) ||
		value == null
	) {
		return {
			failure: {
				value: "not of type object"
			}
		}
	}
	return {
		success: value,
		failure: {}
	}
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
