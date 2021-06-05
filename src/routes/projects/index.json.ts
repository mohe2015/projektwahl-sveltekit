// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { buildGet } from '$lib/list-entities';

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
	'id,title,info,place,costs,min_age,max_age,min_participants,max_participants,presentation_type,requirements,random_assignments',
	'projects',
	'title LIKE $5 AND ($6 OR id = $7) AND info LIKE $8 AND place LIKE $9 AND presentation_type LIKE $10 AND requirements LIKE $11',
	(query) => [
		'%' + (query.get('filter_title') ?? '') + '%', // $5
		!query.has('filter_id'), // $6
		query.get('filter_id'), // $7 // TODO FIXME if this is "" we 500
		'%' + (query.get('filter_info') ?? '') + '%', // $8
		'%' + (query.get('filter_place') ?? '') + '%', // $9
		'%' + (query.get('filter_presentation_type') ?? '') + '%', // $10
		'%' + (query.get('filter_requirements') ?? '') + '%' // $11
	]
);
