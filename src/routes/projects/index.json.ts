// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { buildGet } from '$lib/list-entities';
import { fakeTT } from '$lib/tagged-templates';

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
		'random_assignments'
	],
	[
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
	],
	'projects',
	(query) =>
		fakeTT`title LIKE ${'%' + (query.get('filter_title') ?? '') + '%'} AND (${!query.has(
			'filter_id'
		)} OR id = ${query.get('filter_id')}) AND info LIKE ${
			'%' + (query.get('filter_info') ?? '') + '%'
		} AND place LIKE ${'%' + (query.get('filter_place') ?? '') + '%'} AND presentation_type LIKE ${
			'%' + (query.get('filter_presentation_type') ?? '') + '%'
		} AND requirements LIKE ${'%' + (query.get('filter_requirements') ?? '') + '%'}`
);
