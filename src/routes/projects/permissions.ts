// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { assertBooleanProperty, assertNumberProperty, assertObjectType, assertOptionalNumberProperty, assertStringProperty, Validator } from '$lib/authorization';
import { andThen, mergeErrOr, ok, Result } from '$lib/result';
import type { Existing, RawProjectType, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

// TODO FIXME all important checks need to be at the database to prevent race conditions
export const validator: Validator<Existing<RawProjectType>, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<Existing<RawProjectType>, { [key: string]: string }> => {
	return andThen(assertObjectType(value), (value) => {
		const id = assertOptionalNumberProperty(value, 'id');
		const title = assertStringProperty(value, 'title');
		const info = assertStringProperty(value, 'info');
		const place = assertStringProperty(value, 'place');
		const costs = assertNumberProperty(value, 'costs');
		const min_age = assertNumberProperty(value, 'min_age');
		const max_age = assertNumberProperty(value, 'max_age');
		const min_participants = assertNumberProperty(value, 'min_participants');
		const max_participants = assertNumberProperty(value, 'max_participants');
		const presentation_type = assertStringProperty(value, 'presentation_type');
		const requirements = assertStringProperty(value, 'requirements');
		const random_assignments = assertBooleanProperty(value, 'random_assignments');
		return mergeErrOr(([id, title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments]) => {
			return ok({
				id, title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments
			})
		}, id, title, info, place, costs, min_age, max_age, min_participants, max_participants, presentation_type, requirements, random_assignments)
	});
};

export const viewValidator: Validator<Existing<RawProjectType>, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<Existing<RawProjectType>, { [key: string]: string }> => {
	return andThen(validator(user, value), value => {
		if (
			user?.type !== 'admin' &&
			user?.project_leader_id !== value.id // TODO FIXME only allow helpers to edit, not voters
		) {
			return {
				result: 'failure',
				failure: {
					authorization: 'Du kannst keine fremden Projekte ansehen und bist kein Admin.'
				}
			};
		}
		return ok(value)
	});
};


export const editValidator: Validator<Existing<RawProjectType>, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<Existing<RawProjectType>, { [key: string]: string }> => {
	return andThen(validator(user, value), value => {
		if (
			user?.type !== 'admin' &&
			user?.project_leader_id !== value.id // TODO FIXME only allow helpers to edit, not voters
		) {
			return {
				result: 'failure',
				failure: {
					authorization: 'Du kannst keine fremden Projekte ändern und bist kein Admin.'
				}
			};
		}
		return ok(value)
	});
};
