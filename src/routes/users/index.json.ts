// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { buildGet } from '$lib/list-entities';
import type { MyRequestHandler } from '$lib/request_helpers';
import { concTT, fakeTT } from '$lib/tagged-templates';

export type UserType = { id: number; name: string; type: string }; // TODO FIXME is id really returned as number?

export type UsersResponseBody = {
	entities: Array<UserType>;
	previousCursor: number | null;
	nextCursor: number | null;
};

export const get = buildGet(
	['id', 'name', 'type'],
	['id', 'name', 'type'],
	'users',
	(query) =>
		fakeTT`name LIKE ${'%' + (query.get('filter_name') ?? '') + '%'} AND (${!query.has(
			'filter_id'
		)} OR id = ${query.get('filter_id')}) ` /*AND type in ($8::varchar[])'*/
	//query.getAll('filter_types[]').filter((t) => ['admin', 'helper', 'voter'].includes(t)) // $8
);

console.log(concTT(fakeTT`hi ${1}`, fakeTT`hi ${1}`));
