// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { buildGet } from '$lib/list-entities';
import type { MyRequestHandler } from '$lib/request_helpers';

export type UserType = { id: number; name: string; type: string }; // TODO FIXME is id really returned as number?

export type UsersResponseBody = {
	entities: Array<UserType>;
	previousCursor: number | null;
	nextCursor: number | null;
};

export const get = buildGet(
	['id', 'name', 'type'],
	'id,name,type',
	'users',
	'name LIKE $5 AND ($6 OR id = $7) ' /*AND type in ($8::varchar[])'*/,
	(query) => [
		'%' + (query.get('filter_name') ?? '') + '%', // $5
		!query.has('filter_id'), // $6
		query.get('filter_id') // $7 // TODO FIXME if this is "" we 500]);
		//query.getAll('filter_types[]').filter((t) => ['admin', 'helper', 'voter'].includes(t)) // $8
	]
);
