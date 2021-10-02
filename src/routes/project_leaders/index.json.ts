// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import type { EntityResponseBody } from '$lib/entites';
import { buildGet } from '$lib/list-entities';
import { fakeTT } from '$lib/tagged-templates';
import type { UserType } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import type { SerializableParameter } from 'postgres';
import type { MyLocals } from 'src/hooks';

export type UsersResponseBody = {
	entities: Array<UserType>;
	previousCursor: number | null;
	nextCursor: number | null;
};

export const get: RequestHandler<MyLocals, EntityResponseBody> = async function (request) {
	allowUserType(request, ['admin', 'helper']);
	return await buildGet(
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
