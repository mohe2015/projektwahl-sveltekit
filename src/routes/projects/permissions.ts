// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { PermissionsType } from '$lib/authorization';
import type { UserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

export const permissions: PermissionsType = new Map(
	Object.entries({
		id: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		title: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		info: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		place: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		costs: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		min_age: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		max_age: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		min_participants: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		max_participants: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		presentation_type: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		requirements: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		},
		random_assignments: {
			view: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin',
			edit: (user: UserType | null, _entity: JSONValue) => user?.type === 'admin'
		}
	})
);
