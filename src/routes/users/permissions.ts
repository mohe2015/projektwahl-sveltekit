// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { ValidatorType } from '$lib/authorization';
import type { Existing, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';
// maybe this could be generic of keyof Existing<RawUserType> and then this could also return Partial<Existing<RawUserType>>

// TODO FIXME all important checks need to be at the database to prevent race conditions
export const permissions: ValidatorType<Existing<RawUserType>> = {
	id: {
		// by doing this smartly we could e.g. allow a user to change their own password
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	name: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	password: {
		view: (_user: Existing<RawUserType> | null, _entity: JSONValue) => false,
		edit: (_user: Existing<RawUserType> | null, _entity: JSONValue) => false
	},
	type: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	group: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	age: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	away: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	// TODO FIXME check in database query: if this is null we can update it.
	project_leader_id: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	force_in_project_id: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	}
};
