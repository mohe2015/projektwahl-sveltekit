import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit/types/endpoint';

export const get: RequestHandler = async function ({ query }) {
	// TODO pagination
	// TODO sorting and filtering

	// TODO FIXME validation length and null/undefined

	// AUDIT START

	const sortingQuery = query.getAll('sorting[]');
	let orderBy = '';

	const allowedOrderBy = sortingQuery
		.map((e) => e.split(':'))
		.filter((e) => ['id', 'name', 'type'].includes(e[0]))
		.filter((e) => ['up', 'down'].includes(e[1]));

	if (allowedOrderBy.length > 0) {
		const orderByQuery = allowedOrderBy
			.map((e) => (e[1] === 'up' ? `${e[0]} ASC` : `${e[0]} DESC`))
			.join(',');
		orderBy = ' ORDER BY ' + orderByQuery;
	}

	const filterType = query
		.getAll('filter_type[]')
		.filter((t) => ['admin', 'helper', 'voter'].includes(t))
		.map((t) => `type='${t}'`);
	let filterTypeQuery = '';
	if (filterType.length > 0) {
		filterTypeQuery = ' AND (' + filterType.join(' OR ') + ')';
	}

	const queryString = `SELECT id,name,type FROM users WHERE name LIKE $1;`; // ${filterTypeQuery} ${orderBy};`;
	console.log(queryString);
	const users = await sql.unsafe(queryString, [query.get('filter_name') ?? '%']);

	// AUDIT END

	return {
		body: users
	};
};
