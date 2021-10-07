// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { allowUserType } from '$lib/authorization';
import { sql } from '$lib/database';
import { buildGet } from '$lib/list-entities';
import { fakeTT } from '$lib/tagged-templates';
import type { EntityResponseBody, Existing, RawProjectType } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import type { SerializableParameter } from 'postgres';
import type { MyLocals } from 'src/hooks';

export const get: RequestHandler<MyLocals, EntityResponseBody<Existing<RawProjectType>>> = async function (request) {
	allowUserType(request, ['admin', 'helper']);
	return await buildGet<Existing<RawProjectType>>(
		[
			'id',
			'title',
			'place',
			'costs',
			'min_age',
			'max_age',
			'min_participants',
			'max_participants',
			'random_assignments'
		],
		fakeTT<SerializableParameter>`SELECT ${sql([
			'id',
			'title',
			'info',
			'place',
			'costs',
			'min_age',
			'max_age',
			'min_participants',
			'max_participants',
			'presentation_type',
			'requirements',
			'random_assignments'
		])} FROM ${sql('projects')}`,
		(query) =>
			fakeTT<SerializableParameter>`AND title LIKE ${
				'%' + (query.filters.title ?? '') + '%'
			} AND (${!query.filters.id} OR id = ${query.filters.id ?? null}) AND info LIKE ${
				'%' + (query.filters.info ?? '') + '%'
			} AND place LIKE ${'%' + (query.filters.place ?? '') + '%'} AND presentation_type LIKE ${
				'%' + (query.filters.presentation_type ?? '') + '%'
			} AND requirements LIKE ${'%' + (query.filters.requirements ?? '') + '%'}`
	)(request);
};
