import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit/types/endpoint';

export const get: RequestHandler = async function({ query }) {
	// TODO pagination
	// TODO sorting and filtering

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

	const queryString = `SELECT id,name,type FROM users${orderBy} WHERE type='admin';`;
	console.log(queryString);
	const users = await sql.unsafe(queryString);

	// AUDIT END

	return {
		body: users
	};
}
