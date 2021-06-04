// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { MyRequestHandler } from '$lib/request_helpers';

// CHANGED
export type ProjectType = { id: number; title: string }; // TODO FIXME is id really returned as number?

// CHANGED
export type ProjectResponseBody = {
	projects: Array<ProjectType>;
	previousCursor: number | null;
	nextCursor: number | null;
};

// CHANGED
export const get: MyRequestHandler<ProjectResponseBody> = async function ({ query }) {
	// TODO pagination
	// TODO sorting and filtering

	// TODO FIXME better validation and null/undefined

	// AUDIT START

	const paginationCursor = parseInt(query.get('pagination_cursor') ?? '0');
	const paginationDirection = query.get('pagination_direction');
	const paginationLimit: number = parseInt(query.get('pagination_limit') ?? '10');
	const isForwardsPagination: boolean = paginationDirection === 'forwards';
	const isBackwardsPagination: boolean = paginationDirection === 'backwards';

	const sortingQuery = query.getAll('sorting[]');

	let allowedOrderBy = sortingQuery
		.map((e) => e.split(':'))
		.filter((e) =>
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
			].includes(e[0])
		) // CHANGED
		.filter((e) => ['up', 'down'].includes(e[1]));

	// https://www.postgresql.org/docs/current/queries-limit.html order by is more or less required for limit
	if (allowedOrderBy.length == 0) {
		allowedOrderBy = [['id', 'up']];
	}

	// orderBy needs to be reversed for backwards pagination
	if (isBackwardsPagination) {
		allowedOrderBy = allowedOrderBy.map((e) => [e[0], e[1] === 'up' ? 'down' : 'up']);
	}

	const orderByQuery = allowedOrderBy
		.map((e) => (e[1] === 'up' ? `${e[0]} ASC` : `${e[0]} DESC`))
		.join(',');
	const orderBy = ' ORDER BY ' + orderByQuery;

	// CHANGED (removed lines)

	// obv changed
	const queryString =
		`SELECT id,title,info,place,costs,min_age,max_age,min_participants,max_participants,presentation_type,requirements,random_assignments` +
		` FROM projects WHERE (($2 AND id >= $1) OR ($3 AND id < $1) OR ((NOT $2) AND (NOT $3)))` +
		` AND title LIKE $5 AND ($6 OR id = $7) AND info LIKE $8 AND place LIKE $9 AND presentation_type LIKE $10 AND requirements LIKE $11 ${orderBy} LIMIT ($4 + 1);`;

	console.log(queryString);
	// TODO FIXME change
	// implement min_age as < and max_age as >
	// TODO FIXME implement filter: costs, min_age, max_age, min_participants, max_participants, random_assignments
	const sqlParams = [
		paginationCursor, // $1
		isForwardsPagination, // $2
		isBackwardsPagination, // $3
		paginationLimit, // $4
		'%' + (query.get('filter_title') ?? '') + '%', // $5
		!query.has('filter_id'), // $6
		query.get('filter_id'), // $7 // TODO FIXME if this is "" we 500
		'%' + (query.get('filter_info') ?? '') + '%', // $8
		'%' + (query.get('filter_place') ?? '') + '%', // $9
		'%' + (query.get('filter_presentation_type') ?? '') + '%', // $10
		'%' + (query.get('filter_requirements') ?? '') + '%' // $11
	];
	console.log(sqlParams);
	let projects: Array<ProjectType> = await sql.unsafe<Array<ProjectType>>(queryString, sqlParams);

	// e.g http://localhost:3000/users.json?pagination_direction=forwards
	let nextCursor: number | null = null;
	let previousCursor: number | null = null;
	if (isForwardsPagination) {
		previousCursor = paginationCursor;
		if (projects.length > paginationLimit) {
			const lastElement = projects.pop();
			nextCursor = lastElement?.id ?? null;
		}
	} else if (isBackwardsPagination) {
		projects = projects.reverse(); // fixup as we needed to switch up orders above
		if (projects.length > paginationLimit) {
			projects.shift();
			previousCursor = projects[0].id ?? null;
		}
		nextCursor = paginationCursor;
	}

	// AUDIT END

	return {
		body: {
			projects, // TODO rename to entities
			nextCursor,
			previousCursor
		}
	};
};
