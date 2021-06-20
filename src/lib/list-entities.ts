// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import type { SerializableParameter } from 'postgres';
import type { MyLocals } from 'src/hooks';
import { concTT, fakeLiteralTT, fakeTT, toTT } from './tagged-templates';

export type BaseEntityType = {
	id: number;
	[x: string]: string | number | null;
};

export type EntityResponseBody = {
	entities: Array<BaseEntityType>;
	previousCursor: BaseEntityType | null;
	nextCursor: BaseEntityType | null;
};

export const buildGet = (
	allowedFilters: string[],
	select: [TemplateStringsArray, SerializableParameter[]],
	params: (query: URLSearchParams) => [TemplateStringsArray, SerializableParameter[]]
): RequestHandler<MyLocals, EntityResponseBody> => {
	const get: RequestHandler<MyLocals, EntityResponseBody> = async function ({ query }) {
		// TODO pagination

		// TODO FIXME better validation and null/undefined

		// AUDIT START

		const paginationDirection = query.get('pagination_direction');
		const paginationLimit: number = parseInt(query.get('pagination_limit') ?? '10');
		const isForwardsPagination: boolean = paginationDirection === 'forwards';
		const isBackwardsPagination: boolean = paginationDirection === 'backwards';
		const paginationCursor =
			query.get('pagination_cursor') !== null ? JSON.parse(query.get('pagination_cursor')!) : {}; // TODO FIXME validate
		console.log('paginationCursor: ', paginationCursor);

		const sortingQuery = query.getAll('sorting[]');

		let allowedOrderBy = sortingQuery
			.map((e) => e.split(':'))
			.filter((e) => allowedFilters.includes(e[0])) // CHANGED
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

		// obv changed
		const queryStringPart0 = select;

		// for cursor we need https://www.postgresql.org/docs/current/functions-comparisons.html
		// mixed up and down pagination?:
		/*
Prior to PostgreSQL 8.2, the <, <=, > and >= cases were not handled per SQL specification. A comparison like ROW(a,b) < ROW(c,d) was implemented as a < c AND b < d whereas the correct behavior is equivalent to a < c OR (a = c AND b < d).

ROW(a, b)
(up, down)
ROW(c, d)

a < c OR (a = c AND b > d)

ROW(a, b)
(down, up)
ROW(c, d)

a > c OR (a = c AND b < d)

three column - this is getting funny

ROW(a, b, c)
(up, up, up)
ROW(d, e, f)

a < d OR (a = d AND b < e) OR (a = d AND b = e AND c < f)

# If this works it doesnt seem that bad. step by step add equals and for the last compare use < and probably >= (because that's what we wanted)

ROW(a, b, c)
(up, up, down)
ROW(d, e, f)

ROW(a, b, c)
(up, down, up)
ROW(d, e, f)

ROW(a, b, c)
(up, down, down)
ROW(d, e, f)

ROW(a, b, c)
(down, up, up)
ROW(d, e, f)

ROW(a, b, c)
(down, up, down)
ROW(d, e, f)

ROW(a, b, c)
(down, down, up)
ROW(d, e, f)

ROW(a, b, c)
(down, down, down)
ROW(d, e, f)

*/
		const paginationCursorComparison = allowedOrderBy.map((value, index, array) => {
			return array.slice(0, index + 1);
		});

		console.log(paginationCursorComparison);

		const queryStringPart1 = concTT(
			concTT(
				fakeLiteralTT(' WHERE ('),
				paginationCursorComparison
					.map((value) => {
						return concTT(
							concTT(
								fakeLiteralTT('('),
								value
									.map((value, index, array) => {
										return concTT(
											fakeTT<SerializableParameter>`${paginationCursor[value[0]] ?? null}`,
											fakeLiteralTT(
												` ${index == array.length - 1 ? (value[1] == 'up' ? '<' : '>=') : '='} ${
													value[0]
												}`
											)
										);
									})
									.reduce((prev, curr) => {
										return concTT(concTT(prev, fakeLiteralTT(' AND ')), curr);
									})
							),
							fakeLiteralTT(')')
						);
					})
					.reduce((prev, curr) => {
						return concTT(concTT(prev, fakeLiteralTT(' OR ')), curr);
					})
			),
			fakeLiteralTT(` OR (NOT ${isForwardsPagination} AND NOT ${isBackwardsPagination})) AND `)
		);

		console.log(queryStringPart1);

		const queryStringPart2 = params(query); // this should be a safe part
		const queryStringPart3 = fakeLiteralTT(orderBy);
		const queryStringPart4 = fakeTT<SerializableParameter>` LIMIT (${paginationLimit} + 1);`;
		const queryStringParts12 = concTT(queryStringPart1, queryStringPart2);
		const queryStringParts34 = concTT(queryStringPart3, queryStringPart4);
		const queryStringParts1234 = concTT(queryStringParts12, queryStringParts34);
		const queryStringParts01234 = concTT(queryStringPart0, queryStringParts1234);
		const queryString = toTT(queryStringParts01234);

		//console.log(queryString);
		//console.log(TTToString(...queryString));
		// TODO FIXME change
		// implement min_age as < and max_age as >
		// TODO FIXME implement filter: costs, min_age, max_age, min_participants, max_participants, random_assignments

		let entities: Array<BaseEntityType> = await sql<Array<BaseEntityType>>(...queryString);

		console.log(entities);

		// e.g http://localhost:3000/users.json?pagination_direction=forwards
		let nextCursor: BaseEntityType | null = null;
		let previousCursor: BaseEntityType | null = null;
		// TODO FIXME also recalculate the other cursor because data could've been deleted in between / the filters have changed
		if (isForwardsPagination || (!isForwardsPagination && !isBackwardsPagination)) {
			previousCursor = paginationCursor;
			if (entities.length > paginationLimit) {
				const lastElement = entities.pop();
				nextCursor = lastElement ?? null;
			}
		} else if (isBackwardsPagination) {
			entities = entities.reverse(); // fixup as we needed to switch up orders above
			if (entities.length > paginationLimit) {
				entities.shift();
				previousCursor = entities[0] ?? null;
			}
			nextCursor = paginationCursor;
		}

		console.log(previousCursor);

		// AUDIT END

		return {
			body: {
				entities,
				nextCursor,
				previousCursor
			}
		};
	};
	return get;
};
