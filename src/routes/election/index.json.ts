// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { buildGet } from '$lib/list-entities';
import { fakeTT } from '$lib/tagged-templates';
import type { SerializableParameter } from 'postgres';

// INSERT INTO choices (user_id, project_id, rank) VALUES (1, 55, 1);

export const get = buildGet(
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
	fakeTT<SerializableParameter>`SELECT * FROM projects LEFT OUTER JOIN choices ON (projects.id = choices.project_id)`,
	(query) =>
		fakeTT<SerializableParameter>`title LIKE ${
			'%' + (query.get('filter_title') ?? '') + '%'
		} AND (${!query.has('filter_id')} OR id = ${query.get('filter_id')}) AND info LIKE ${
			'%' + (query.get('filter_info') ?? '') + '%'
		} AND place LIKE ${'%' + (query.get('filter_place') ?? '') + '%'} AND presentation_type LIKE ${
			'%' + (query.get('filter_presentation_type') ?? '') + '%'
		} AND requirements LIKE ${'%' + (query.get('filter_requirements') ?? '') + '%'}`
);
