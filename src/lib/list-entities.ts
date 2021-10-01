// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import type { SerializableParameter } from 'postgres';
import type { MyLocals } from 'src/hooks';
import type { BaseEntityType, EntityResponseBody } from './entites';
import { concTT, fakeLiteralTT, fakeTT, toTT, TTToString } from './tagged-templates';
import { query2location } from './writable_url';

export const buildGet = (
	allowedFilters: string[],
	select: [TemplateStringsArray, SerializableParameter[]],
	params: (query: URLSearchParams) => [TemplateStringsArray, SerializableParameter[]]
): RequestHandler<MyLocals, EntityResponseBody> => {
	const get: RequestHandler<MyLocals, EntityResponseBody> = async function ({ query }) {
		console.log(query);

		// TODO FIXME better validation and null/undefined

		// AUDIT START

		// this is based on the assumption that two rows are never exactly equal (e.g. uuid is different) and therefore the cursor can always be maintained
		// this creates arbitrary results when elements are changed while holding a cursor

		const paginationDirection: string | null = query.get('pagination_direction');
		const paginationLimit: number = parseInt(query.get('pagination_limit') ?? '10');
		if (isNaN(paginationLimit)) {
			throw new Error('invalid pagination_limit');
		}
		if (paginationLimit > 100) {
			throw new Error('pagination_limit too large');
		}
		const isForwardsPagination: boolean = paginationDirection === 'forwards';
		const isBackwardsPagination: boolean = paginationDirection === 'backwards';
		const paginationCursorQueryValue = query.get('pagination_cursor');

		// TODO FIXME fix that this could return an array or so (not any and validate it)
		const paginationCursor: any | null =
			paginationCursorQueryValue !== null ? JSON.parse(paginationCursorQueryValue) : null; // WARNING JSON.parse can throw SyntaxError

		const sortingQuery: [string, string][] = query.getAll('sorting[]').map((e) => e.split(':', 2))
			.map<[string, string]>(e => [e[0], e[1]])
			.filter((e) => allowedFilters.includes(e[0]))
			.filter((e) => ['up', 'down'].includes(e[1]));
		// TODO FIXME remove dupes of sorting keys

		let allowedOrderBy = [
			...sortingQuery,
			...[['id', 'up']].filter(k => !sortingQuery.find((e) => e[0] == k[0]))
		];

		// orderBy needs to be reversed for backwards pagination
		if (isBackwardsPagination) {
			allowedOrderBy = allowedOrderBy.map((e) => [e[0], e[1] === 'up' ? 'down' : 'up']);
		}

		// TODO FIXME replace up and down with ASC and DESC everywhere
		const orderByQuery = allowedOrderBy
			.map((e) => (e[1] === 'up' ? `${e[0]} ASC` : `${e[0]} DESC`))
			.join(',');
		const orderBy = ' ORDER BY ' + orderByQuery;

		const paginationCursorComparison = allowedOrderBy.map((value, index, array) => {
			return array.slice(0, index + 1);
		});

		const pagination = paginationCursorComparison
		.map((value) => {
			return concTT(
				concTT(
					fakeLiteralTT('('),
					value
						.map((value, index, array) => {
							return concTT(
								fakeTT<SerializableParameter>`${
									paginationCursor != null ? paginationCursor[value[0]] ?? null : null
								}`,
								fakeLiteralTT(
									` ${index == array.length - 1 ? (value[1] == 'up' ? '<' : '>') : '='} ${
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
		});

		// TODO FIXME use UNION technique like in README
		// probably can't use https://www.postgresql.org/docs/current/functions-comparisons.html#ROW-WISE-COMPARISON because up and down can be mixed here (also it's inefficient)
		const queryStringPart1 = concTT(
			concTT(
				fakeLiteralTT(' WHERE ('),
				pagination
			),
			fakeLiteralTT(` OR (NOT ${isForwardsPagination} AND NOT ${isBackwardsPagination})) `)
		);

		const queryStringPart2 = params(query);
		const queryStringPart3 = fakeLiteralTT(orderBy);
		const queryStringPart4 = fakeTT<SerializableParameter>` LIMIT (${paginationLimit} + 1);`;
		const queryStringParts12 = concTT(queryStringPart1, queryStringPart2);
		const queryStringParts34 = concTT(queryStringPart3, queryStringPart4);
		const queryStringParts1234 = concTT(queryStringParts12, queryStringParts34);
		const queryStringParts01234 = concTT(select, queryStringParts1234);
		const queryString = toTT(queryStringParts01234);

		//console.log(queryString);
		console.log(TTToString(...queryString));

		let entities: Array<BaseEntityType> = await sql<Array<BaseEntityType>>(...queryString);

		let nextCursor: BaseEntityType | null = null;
		let previousCursor: BaseEntityType | null = null;
		// TODO FIXME also recalculate the other cursor because data could've been deleted in between / the filters have changed
		if (isForwardsPagination || (!isForwardsPagination && !isBackwardsPagination)) {
			previousCursor = entities[0];
			if (entities.length > paginationLimit) {
				entities.pop();
				nextCursor = entities[entities.length - 1] ?? null;
			}
		} else if (isBackwardsPagination) {
			entities = entities.reverse(); // fixup as we needed to switch up orders above
			if (entities.length > paginationLimit) {
				entities.shift();
				previousCursor = entities[0] ?? null;
			}
			nextCursor = entities[entities.length - 1];
		}

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
