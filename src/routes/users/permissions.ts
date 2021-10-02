// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { BaseEntityType } from '$lib/entites';
import type { UserType } from '$lib/types';

export {};

let permissions: {
	name: {
		view: (user: UserType, entity: BaseEntityType, value: any) => true;
		edit: (user: UserType, entity: BaseEntityType, value: any) => true;
	};
};
