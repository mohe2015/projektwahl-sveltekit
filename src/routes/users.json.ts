import { sql } from '$lib/database';
import type { ServerRequest } from '@sveltejs/kit/types/endpoint';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ query }: ServerRequest<unknown, any>) {
	// TODO pagination
	// TODO sorting and filtering

	// AUDIT START

	let sortingQuery = query.getAll('sorting[]');
	let orderBy = '';

	let allowedOrderBy = sortingQuery
		.map((e) => e.split(':'))
		.filter((e) => ['id', 'name', 'type'].includes(e[0]))
		.filter((e) => ['up', 'down'].includes(e[1]));

	if (allowedOrderBy.length > 0) {
		let orderByQuery = allowedOrderBy
			.map((e) => (e[1] === 'up' ? `${e[0]} ASC` : `${e[0]} DESC`))
			.join(' ');
		orderBy = ' ORDER BY ' + orderByQuery;
	}

	const queryString = 'SELECT id,name,type FROM users' + orderBy + ';';
	console.log(queryString);
	const users = await sql.unsafe(queryString);

	// AUDIT END

	return {
		body: users
	};
}
