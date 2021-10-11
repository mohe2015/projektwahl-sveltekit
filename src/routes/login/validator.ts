// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { assertObjectType, assertStringProperty, Validator } from '$lib/authorization';
import { andThen, mergeErrOr, ok, Result } from '$lib/result';
import type { Existing, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

export type LoginType = {
	name: string;
	password: string;
};

// TODO FIXME all important checks need to be at the database to prevent race conditions
export const validator: Validator<LoginType, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<LoginType, { [key: string]: string }> => {
	if (user?.type !== "voter") {
		return {
			result: 'failure',
			failure: {
				authorization: 'insufficient permissions'
			}
		};
	}
	return andThen(assertObjectType(value), (value) => {
		const name = assertStringProperty(value, 'name');
		const password = assertStringProperty(value, 'password');
		return mergeErrOr(([name, password]) => {
			return ok({
				name,
				password
			})
		}, name, password)
	});
};
