// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import {
	assertBooleanProperty,
	assertNumberProperty,
	assertObjectType,
	assertOptionalPropertyOf,
	assertStringProperty,
	Validator
} from '$lib/authorization';
import { andThen, mergeErrOr, ok, Result } from '$lib/result';
import type { Existing, New, RawProjectType, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

// TODO FIXME all important checks need to be at the database to prevent race conditions
export const validator: Validator<Partial<New<RawProjectType>>, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<Partial<New<RawProjectType>>, { [key: string]: string }> => {
	return andThen(assertObjectType(value), (value) => {
		const id = assertOptionalPropertyOf(value, 'id', assertNumberProperty);
		const title = assertOptionalPropertyOf(value, 'title', assertStringProperty);
		const info = assertOptionalPropertyOf(value, 'info', assertStringProperty);
		const place = assertOptionalPropertyOf(value, 'place', assertStringProperty);
		const costs = assertOptionalPropertyOf(value, 'costs', assertNumberProperty);
		const min_age = assertOptionalPropertyOf(value, 'min_age', assertNumberProperty);
		const max_age = assertOptionalPropertyOf(value, 'max_age', assertNumberProperty);
		const min_participants = assertOptionalPropertyOf(
			value,
			'min_participants',
			assertNumberProperty
		);
		const max_participants = assertOptionalPropertyOf(
			value,
			'max_participants',
			assertNumberProperty
		);
		const presentation_type = assertOptionalPropertyOf(
			value,
			'presentation_type',
			assertStringProperty
		);
		const requirements = assertOptionalPropertyOf(value, 'requirements', assertStringProperty);
		const random_assignments = assertOptionalPropertyOf(
			value,
			'random_assignments',
			assertBooleanProperty
		);
		return mergeErrOr(
			([
				id,
				title,
				info,
				place,
				costs,
				min_age,
				max_age,
				min_participants,
				max_participants,
				presentation_type,
				requirements,
				random_assignments
			]) => {
				return ok({
					id,
					title,
					info,
					place,
					costs,
					min_age,
					max_age,
					min_participants,
					max_participants,
					presentation_type,
					requirements,
					random_assignments
				});
			},
			id,
			title,
			info,
			place,
			costs,
			min_age,
			max_age,
			min_participants,
			max_participants,
			presentation_type,
			requirements,
			random_assignments
		);
	});
};

export const viewValidator: Validator<Partial<New<RawProjectType>>, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<Partial<New<RawProjectType>>, { [key: string]: string }> => {
	return andThen(validator(user, value), (value) => {
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
		return ok(value);
	});
};

export const editValidator: Validator<Partial<New<RawProjectType>>, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<Partial<New<RawProjectType>>, { [key: string]: string }> => {
	return andThen(validator(user, value), (value) => {
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
		return ok(value);
	});
};
