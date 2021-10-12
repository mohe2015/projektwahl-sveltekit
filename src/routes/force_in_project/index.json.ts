// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { buildGet } from '$lib/list-entities';
import type { Result } from '$lib/result';
import { fakeTT } from '$lib/tagged-templates';
import type { EntityResponseBody, Existing, RawUserType } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import type { SerializableParameter } from 'postgres';
import type { MyLocals } from 'src/hooks';

// TODO FIXME duplication with project_leaders/

export const get: RequestHandler<
	MyLocals,
	Result<EntityResponseBody<Existing<RawUserType>>, { [key: string]: string }>
> = async function (request) {
	return await buildGet<Existing<RawUserType>>(
		['id', 'name', 'type'],
		fakeTT<SerializableParameter>`SELECT ${sql([
			'id',
			'name',
			'type',
			'force_in_project_id'
		])} FROM ${sql('users')}`,
		(
			query // TODO FIXME validation
		) =>
			fakeTT<SerializableParameter>`AND name LIKE ${
				'%' + (query.filters.name ?? '') + '%'
			} AND (${!query.filters.id} OR id = ${query.filters.id ?? null}) AND (${!query.filters
				.is_force_in_project} OR force_in_project_id = ${
				// @ts-expect-error need to ues generics
				query.force_in_project_id ?? null
			}) AND type in (${query.filters.type.filter((t: string) =>
				['admin', 'helper', 'voter'].includes(t)
			)})`
	)(request);
};
