// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { assertStringProperty, ValidatorType } from '$lib/authorization';
import type { Existing, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

export type LoginType = {
	name: string;
	password: string;
}

// TODO FIXME all important checks need to be at the database to prevent race conditions
export const validator: ValidatorType<LoginType> = {
	name: {
		validate: (_user: Existing<RawUserType> | null, entity: JSONValue) => assertStringProperty(entity, "name"),
	},
	password: {
		validate: (_user: Existing<RawUserType> | null, entity: JSONValue) => {
			const val = assertStringProperty(entity, "password");
			if (val === "") {
				throw new Error("empty password not allowed")
			}
			return val;
		},
	},
};
