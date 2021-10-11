// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { assertNumberProperty, assertObjectType, Validator } from '$lib/authorization';
import { andThen, mergeErrOr, ok, Result } from '$lib/result';
import type { Existing, RawChoiceType, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

export const validator: Validator<RawChoiceType, { [key: string]: string }> = (
	user: Existing<RawUserType> | null,
	value: JSONValue
): Result<RawChoiceType, { [key: string]: string }> => {
	return andThen(assertObjectType(value), (value) => {
		const project_id = assertNumberProperty(value, 'project_id');
		const user_id = assertNumberProperty(value, 'user_id');
		const rank = assertNumberProperty(value, 'rank');
		return mergeErrOr(([project_id, user_id, rank]) => {
			return ok({
				project_id,
				user_id,
				rank
			})
		}, project_id, user_id, rank)
	});
};