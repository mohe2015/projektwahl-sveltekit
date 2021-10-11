// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { JSONString, JSONValue } from '@sveltejs/kit/types/helper';
import type { Result } from './result';
import { andThen } from './result';
import type { Existing, RawUserType } from './types';

export type Validator<T, E extends { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	unsanitizedValue: JSONValue
) => Result<T, E>;

export const assertStringProperty = (value: JSONValue, key: string): Result<string, { [key: string]: string }> => {
	return andThen(assertObjectType(value), (value) => {
		const value3 = value[key];
		if (typeof value3 !== 'string') {
			return {
				result: 'failure',
				failure: {
					[key]: 'not a text'
				}
			};
		}
		return {
			result: 'success',
			success: value3
		};
	});
};

export const assertOptionalNumberProperty = (value: JSONValue, key: string): Result<number | undefined, { [key: string]: string }> => {
	return andThen(assertObjectType(value), (value) => {
		if (!(key in value)) {
			return {
				result: 'success',
				success: undefined
			};
		}
		const value3 = value[key];
		if (typeof value3 === 'number') {
			return {
				result: 'success',
				success: value3
			};
		}
		return {
			result: 'failure',
			failure: {
				[key]: 'not a number'
			}
		};
	});
};

export const assertNumberProperty = (value: JSONValue, key: string): Result<number, { [key: string]: string }> => {
	return andThen(assertObjectType(value), (value) => {
		const value3 = value[key];
		if (typeof value3 !== 'number') {
			return {
				result: 'failure',
				failure: {
					[key]: 'not a number'
				}
			};
		}
		return {
			result: 'success',
			success: value3
		};
	});
};

export const assertBooleanProperty = (value: JSONValue, key: string): Result<boolean, { [key: string]: string }> => {
	return andThen(assertObjectType(value), (value) => {
		const value3 = value[key];
		if (typeof value3 !== 'boolean') {
			return {
				result: 'failure',
				failure: {
					[key]: 'not a boolean'
				}
			};
		}
		return {
			result: 'success',
			success: value3
		};
	});
};

export const assertObjectType = (
	value: JSONValue
): Result<{
	[key: string]: JSONString;
}, { [key: string]: string }> => {
	if (typeof value !== 'object' || Array.isArray(value) || value == null) {
		return {
			result: 'failure',
			failure: {
				value: 'not of type object'
			}
		};
	}
	return {
		result: 'success',
		success: value
	};
};

/*
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
	/*
	TODO FIXME: add this back soon
	for (const key in unsanitizedValue2) {
		if (!(key in validator)) {
			throw new HTTPError(401, `additional ignored field ${key}`);
		}
	}
	
	return sanitizedValue;
};
*/
