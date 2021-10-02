// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { PermissionsType } from '$lib/authorization';
import type { BaseEntityType } from '$lib/entites';
import type { UserType } from '$lib/types';
import type { JSONValue } from '@sveltejs/kit/types/helper';

export const permissions: PermissionsType = new Map(
	Object.entries({
		title: {
			view: (user: UserType | null, entity: JSONValue) => false,
			edit: (user: UserType | null, entity: JSONValue) => false
		}
	})
);
