// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { PermissionsType } from '$lib/authorization';
import type { BaseEntityType } from '$lib/entites';
import type { UserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

// TODO FIXME all important checks need to be at the database to prevent race conditions
export const permissions: PermissionsType = new Map(
	Object.entries({
		id: {
			// by doing this smartly we could e.g. allow a user to change their own password
			view: (user: UserType | null, entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, entity: JSONValue) => user?.type === 'admin'
		},
		name: {
			view: (user: UserType | null, entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, entity: JSONValue) => user?.type === 'admin'
		},
		/*password: {
			view: (user: UserType | null, entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, entity: JSONValue) => user?.type === 'admin'
		},*/
		type: {
			view: (user: UserType | null, entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, entity: JSONValue) => user?.type === 'admin'
		},
		class: {
			view: (user: UserType | null, entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, entity: JSONValue) => user?.type === 'admin'
		},
		age: {
			view: (user: UserType | null, entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, entity: JSONValue) => user?.type === 'admin'
		},
		away: {
			view: (user: UserType | null, entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, entity: JSONValue) => user?.type === 'admin'
		},
		// TODO FIXME check in database query: if this is null we can update it.
		project_leader_id: {
			view: (user: UserType | null, entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, entity: JSONValue) => user?.type === 'admin'
		}
	})
);
