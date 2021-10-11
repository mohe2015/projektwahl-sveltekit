// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { ValidatorType } from '$lib/authorization';
import type { Existing, RawProjectType, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

export const permissions: ValidatorType<Existing<RawProjectType>> = {
	id: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	title: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	info: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	place: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	costs: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	min_age: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	max_age: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	min_participants: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	max_participants: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	presentation_type: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	requirements: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	},
	random_assignments: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'admin'
	}
};
