// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { buildGet } from '$lib/list-entities';
import { fakeTT } from '$lib/tagged-templates';
import type { UserType } from '$lib/types';
import type { SerializableParameter } from 'postgres';

export type UsersResponseBody = {
	entities: Array<UserType>;
	previousCursor: number | null;
	nextCursor: number | null;
};

export const get = buildGet(
	['id', 'name', 'type'],
	fakeTT<SerializableParameter>`SELECT ${sql(['id', 'name', 'type'])} FROM ${sql('users')}`,
	(
		query // TODO FIXME validation
	) =>
		fakeTT<SerializableParameter>`name LIKE ${
			'%' + (query.get('filter_name') ?? '') + '%'
		} AND (${!query.has('filter_id')} OR id = ${query.get('filter_id')}) AND type in (${query
			.getAll('filter_types[]')
			.filter((t) => ['admin', 'helper', 'voter'].includes(t))})`
);
