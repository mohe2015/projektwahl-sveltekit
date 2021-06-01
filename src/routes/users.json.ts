// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { JSONValue, ServerRequest } from '@mohe2015/kit/types/endpoint';

export type MyEndpointOutput<Body extends string | Uint8Array | JSONValue> = {
	status?: number;
	headers?: Partial<Headers>;
	body?: Body;
};

export type MyRequestHandler<
	OutputBody extends string | Uint8Array | JSONValue,
	Locals = Record<string, any>,
	Body = unknown
> = (request: ServerRequest<Locals, Body>) => Promise<MyEndpointOutput<OutputBody>>;

export type UserType = { id: number; name: string; type: string }; // TODO FIXME is id really returned as number?

export type UsersResponseBody = {
	users: Array<UserType>;
	previousCursor: number | null;
	nextCursor: number | null;
};

export const get: MyRequestHandler<UsersResponseBody> = async function ({ query }) {
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
		.filter((e) => ['id', 'name', 'type'].includes(e[0]))
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

	const filterType = query
		.getAll('filter_type[]')
		.filter((t) => ['admin', 'helper', 'voter'].includes(t))
		.map((t) => `type='${t}'`);
	let filterTypeQuery = '';
	if (filterType.length > 0) {
		filterTypeQuery = ' AND (' + filterType.join(' OR ') + ')';
	}

	const queryString = `SELECT id,name,type FROM users WHERE (($5 AND id >= $4) OR ($6 AND id < $4) OR ((NOT $5) AND (NOT $6))) AND name LIKE $1 AND ($2 OR id = $3) ${filterTypeQuery} ${orderBy} LIMIT ($7 + 1);`;

	console.log(queryString);
	const sqlParams = [
		'%' + (query.get('filter_name') ?? '') + '%', // $1
		!query.has('filter_id'), // $2
		query.get('filter_id'), // $3 // TODO FIXME if this is "" we 500
		paginationCursor, // $4
		isForwardsPagination, // $5
		isBackwardsPagination, // $6
		paginationLimit // $7
	];
	console.log(sqlParams);
	let users: Array<UserType> = await sql.unsafe<Array<UserType>>(queryString, sqlParams);

	// e.g http://localhost:3000/users.json?pagination_direction=forwards
	let nextCursor: number | null = null;
	let previousCursor: number | null = null;
	if (isForwardsPagination) {
		previousCursor = paginationCursor;
		if (users.length > paginationLimit) {
			const lastElement = users.pop();
			nextCursor = lastElement?.id ?? null;
		}
	} else if (isBackwardsPagination) {
		users = users.reverse(); // fixup as we needed to switch up orders above
		if (users.length > paginationLimit) {
			users.shift();
			previousCursor = users[0].id ?? null;
		}
		nextCursor = paginationCursor;
	}

	// AUDIT END

	return {
		body: {
			users,
			nextCursor,
			previousCursor
		}
	};
};
