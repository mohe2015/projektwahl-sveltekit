// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { assertObjectType, assertStringProperty, Validator } from '$lib/authorization';
import { andThen, ok, Result } from '$lib/result';
import type { Existing, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

export type LoginType = {
	name: string;
	password: string;
}

// TODO FIXME all important checks need to be at the database to prevent race conditions
export const validator: Validator<LoginType> = (user: Existing<RawUserType> | null, value: JSONValue): Result<LoginType> => {
	return andThen(assertObjectType(value), value => {
		const name = assertStringProperty(value, "name");
		const password = assertStringProperty(value, "password");
		return andThen(name, (name) => {
			return andThen(password, (password) => {
				return ok({
					name,
					password
				})
			})
		})
	});
}


/*{
	name: {
		validate: (_user: Existing<RawUserType> | null, entity: JSONValue) => assertStringProperty(entity, "name"),
	},
	password: {
		validate: (_user: Existing<RawUserType> | null, entity: JSONValue) => {
			return andThen(assertStringProperty(entity, "password"), value => {
				if (value === "") {
					throw new Error("empty password not allowed")
				}
				return ok(value);
			});
		},
	},
};
*/