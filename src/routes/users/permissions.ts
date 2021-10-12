// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { assertBooleanProperty, assertEnumProperty, assertNumberProperty, assertObjectType, assertOptionalPropertyOf, assertStringProperty, Validator } from '$lib/authorization';
import { andThen, mergeErrOr, ok, Result } from '$lib/result';
import type { Existing, New, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

// TODO FIXME all important checks need to be at the database to prevent race conditions
export const validator: Validator<Partial<New<RawUserType>>, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<Partial<New<RawUserType>>, { [key: string]: string }> => {
	return andThen(assertObjectType(value), (value) => {
		const id = assertOptionalPropertyOf(value, 'id', assertNumberProperty);
		const name = assertOptionalPropertyOf(value, 'name', assertStringProperty);
		const type = assertOptionalPropertyOf(value, 'type', assertEnumProperty(['admin', 'helper', 'voter']));
		const group = assertOptionalPropertyOf(value, 'group', assertStringProperty);
		const age = assertOptionalPropertyOf(value, 'age', assertNumberProperty);
		const away = assertOptionalPropertyOf(value, 'away', assertBooleanProperty);
		// TODO FIXME check in database query: if this is null we can update it.
		const project_leader_id = assertOptionalPropertyOf(value, 'project_leader_id', assertNumberProperty);
		const force_in_project_id = assertOptionalPropertyOf(value, 'force_in_project_id', assertNumberProperty);
		return mergeErrOr(([id, name, type, group, age, away, project_leader_id, force_in_project_id]) => {
			return ok({
				id, name, type, group, age, away, project_leader_id, force_in_project_id,
				password: ""
			})
		}, id, name, type, group, age, away, project_leader_id, force_in_project_id)
	});
};


export const viewValidator: Validator<Partial<New<RawUserType>>, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<Partial<New<RawUserType>>, { [key: string]: string }> => {
	return andThen(validator(user, value), value => {
		if (
			user?.type !== 'admin'
		) {
			return {
				result: 'failure',
				failure: {
					authorization: 'Du bist kein Admin.'
				}
			};
		}
		return ok(value)
	});
};


export const editValidator: Validator<Partial<New<RawUserType>>, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<Partial<New<RawUserType>>, { [key: string]: string }> => {
	return andThen(validator(user, value), value => {
		if (
			user?.type !== 'admin'
		) {
			return {
				result: 'failure',
				failure: {
					authorization: 'Du bist kein Admin.'
				}
			};
		}
		return ok(value)
	});
};
