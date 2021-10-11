// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { buildGet } from '$lib/list-entities';
import { fakeTT } from '$lib/tagged-templates';
import type { EntityResponseBody, Existing, RawUserType } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import type { SerializableParameter } from 'postgres';
import type { MyLocals } from 'src/hooks';

export type UsersResponseBody = {
	entities: Array<RawUserType>;
	previousCursor: number | null;
	nextCursor: number | null;
};

export const get: RequestHandler<MyLocals, EntityResponseBody<Existing<RawUserType>>> = async function (request) {
	return await buildGet<Existing<RawUserType>>(
		['id', 'name', 'type'],
		fakeTT<SerializableParameter>`SELECT ${sql([
			'id',
			'name',
			'type',
			'project_leader_id'
		])} FROM ${sql('users')}`,
		(
			query // TODO FIXME validation
		) =>
			fakeTT<SerializableParameter>`AND name LIKE ${
				'%' + (query.filters.name ?? '') + '%'
			} AND (${!query.filters.id} OR id = ${query.filters.id ?? null}) AND (${!query.filters
				.is_project_leader} OR project_leader_id = ${
				// @ts-expect-error need to ues generics
				query.project_leader_id ?? null
			}) AND type in (${query.filters.types.filter((t: string) =>
				['admin', 'helper', 'voter'].includes(t)
			)})`
	)(request);
};
