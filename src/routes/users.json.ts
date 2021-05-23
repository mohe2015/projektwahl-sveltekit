import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit/types/endpoint';

export const get: RequestHandler = async function ({ query }) {
	// TODO pagination
	// TODO sorting and filtering

	// TODO FIXME validation length and null/undefined

	// AUDIT START

	const sortingQuery = query.getAll('sorting[]');

	let allowedOrderBy = sortingQuery
		.map((e) => e.split(':'))
		.filter((e) => ['id', 'name', 'type'].includes(e[0]))
		.filter((e) => ['up', 'down'].includes(e[1]));

	// https://www.postgresql.org/docs/current/queries-limit.html order by is more or less required for limit
	if (allowedOrderBy.length == 0) {
		allowedOrderBy = [['id', 'up']];
	}

	const orderByQuery = allowedOrderBy
		.map((e) => (e[1] === 'up' ? `${e[0]} ASC` : `${e[0]} DESC`))
		.join(',');
	const orderBy = ' ORDER BY ' + orderByQuery;

	const filterType = query
		.getAll('filter_type[]')
		.filter((t) => ['admin', 'helper', 'voter'].includes(t))
		.map((t) => `type='${t}'`);
	let filterTypeQuery = '';
	if (filterType.length > 0) {
		filterTypeQuery = ' AND (' + filterType.join(' OR ') + ')';
	}

	const paginationCursor = query.get('pagination_cursor') ?? '0';
	const paginationDirection = query.get('pagination_direction');
	const paginationLimit = query.get('pagination_limit');
	const queryString = `SELECT id,name,type FROM users WHERE (($5 AND id >= $4) OR ($6 AND id < $4) OR ((NOT $5) AND (NOT $6))) AND name LIKE $1 AND ($2 OR id = $3) ${filterTypeQuery} ${orderBy} LIMIT $7;`;
	console.log(queryString);
	const users = await sql.unsafe(queryString, [
		'%' + (query.get('filter_name') ?? '') + '%', // $1
		!query.has('filter_id'), // $2
		query.get('filter_id'), // $3 // TODO FIXME if this is "" we 500
		paginationCursor, // $4
		paginationDirection === 'forwards', // $5
		paginationDirection === 'backwards', // $6
		paginationLimit ?? 10 // $7
	]);

	// AUDIT END

	return {
		body: users
	};
};
