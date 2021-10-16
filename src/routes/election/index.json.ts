// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { buildGet } from '$lib/list-entities';
import type { Result } from '$lib/result';
import { fakeTT } from '$lib/tagged-templates';
import type {
	EntityResponseBody,
	Existing,
	RawProjectType,
	ResettableChoiceType
} from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import type { SerializableParameter } from 'postgres';
import type { MyLocals } from 'src/hooks';

export const get: RequestHandler<
	MyLocals,
	Result<
		EntityResponseBody<Existing<RawProjectType> & ResettableChoiceType>,
		{ [key: string]: string }
	>
> = async function (request) {
	return await buildGet<Existing<RawProjectType> & ResettableChoiceType>(
		[
			'id',
			'title',
			'place',
			'costs',
			'min_age',
			'max_age',
			'min_participants',
			'max_participants',
			'random_assignments',
			'rank'
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
			'random_assignments',
			'choices.rank',
			'choices.project_id',
			'choices.user_id'
		])} FROM projects LEFT OUTER JOIN choices ON (projects.id = choices.project_id AND choices.user_id = ${
			request.locals.user?.id ?? null
		})`,
		(query) =>
			fakeTT<SerializableParameter>`AND title LIKE ${`%${query.filters.title ?? ''}%`} AND (${!(
				'id' in query.filters
			)} OR id = ${query.filters.id ?? null}) AND info LIKE ${
				'%' + (query.filters.info ?? '') + '%'
			} AND place LIKE ${'%' + (query.filters.place ?? '') + '%'} AND presentation_type LIKE ${
				'%' + (query.filters.presentation_type ?? '') + '%'
			} AND requirements LIKE ${'%' + (query.filters.requirements ?? '') + '%'} AND (${!(
				'rank' in query.filters
			)} OR rank = ${query.filters.rank ?? null})`
	)(request);
};
