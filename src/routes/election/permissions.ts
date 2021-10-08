// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { ValidatorType } from '$lib/authorization';
import type { Existing, RawChoiceType, RawUserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

export const permissions: ValidatorType<RawChoiceType> = {
	project_id: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'voter',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'voter'
	},
	user_id: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'voter',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'voter'
	},
	rank: {
		view: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'voter',
		edit: (user: Existing<RawUserType> | null, _entity: JSONValue) => user?.type === 'voter'
	}
};
