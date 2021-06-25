// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import type { SerializableParameter } from 'postgres';
import type { MyLocals } from 'src/hooks';
import { concTT, fakeLiteralTT, fakeTT, toTT, TTToString } from './tagged-templates';

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
		console.log(query);

		// TODO pagination

		// TODO FIXME better validation and null/undefined

		// AUDIT START

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

		// TODO FIXME fix that this could return an array or so
		const paginationCursor =
			paginationCursorQueryValue !== null ? JSON.parse(paginationCursorQueryValue) : {}; // WARNING JSON.parse can throw SyntaxError

		const sortingQuery = query.getAll('sorting[]');

		let allowedOrderBy = sortingQuery
			.map((e) => e.split(':')) // TODO FIXME could return more elements / or less
			.filter((e) => allowedFilters.includes(e[0])) // CHANGED
			.filter((e) => ['up', 'down'].includes(e[1]));

		// TODO FIXME use all fields here which are not secret and not only the ones we are allowed to order by
		// so it also works when the requested ordered fields are all equal
		allowedOrderBy = allowedFilters.map((k) => allowedOrderBy.find((e) => e[0] == k) ?? [k, 'up']);

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

		const paginationCursorComparison = allowedOrderBy.map((value, index, array) => {
			return array.slice(0, index + 1);
		});

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
												` ${index == array.length - 1 ? (value[1] == 'up' ? '<=' : '>') : '='} ${
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
			fakeLiteralTT(` OR (NOT ${isForwardsPagination} AND NOT ${isBackwardsPagination})) `)
		);

		//console.log(queryStringPart1);

		const queryStringPart2 = params(query); // this should be a safe part
		const queryStringPart3 = fakeLiteralTT(orderBy);
		const queryStringPart4 = fakeTT<SerializableParameter>` LIMIT (${paginationLimit} + 1);`;
		const queryStringParts12 = concTT(queryStringPart1, queryStringPart2);
		const queryStringParts34 = concTT(queryStringPart3, queryStringPart4);
		const queryStringParts1234 = concTT(queryStringParts12, queryStringParts34);
		const queryStringParts01234 = concTT(queryStringPart0, queryStringParts1234);
		const queryString = toTT(queryStringParts01234);

		//console.log(queryString);
		console.log(TTToString(...queryString));
		// TODO FIXME change

		let entities: Array<BaseEntityType> = await sql<Array<BaseEntityType>>(...queryString);

		//console.log(entities);

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

		//console.log(previousCursor);

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
