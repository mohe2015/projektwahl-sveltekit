// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import type { SerializableParameter } from 'postgres';
import type { MyLocals } from 'src/hooks';
import type { BaseEntityType, EntityResponseBody } from './entites';
import { concTT, fakeLiteralTT, fakeTT, toTT, TTToString } from './tagged-templates';

export type BaseQuery = {
	paginationDirection: 'forwards' | 'backwards' | null;
	paginationCursor: BaseEntityType | null;
	sorting: string[]; // TODO FIXME format
	paginationLimit: number;
	filters: any;
};

export const buildGet = (
	allowedFilters: string[],
	select: [TemplateStringsArray, SerializableParameter[]],
	params: (query: BaseQuery) => [TemplateStringsArray, SerializableParameter[]]
): RequestHandler<MyLocals, EntityResponseBody> => {
	const get: RequestHandler<MyLocals, EntityResponseBody> = async function ({ query }) {
		console.log(query.toString());
		// TODO FIXME probably use permissions system?
		const the_query: BaseQuery = JSON.parse(
			atob(decodeURIComponent(query.toString()))
		) as BaseQuery; // TODO FIXME validate
		console.log(the_query);

		// TODO FIXME better validation and null/undefined

		// AUDIT START

		// this is based on the assumption that two rows are never exactly equal (e.g. uuid is different) and therefore the cursor can always be maintained
		// this creates arbitrary results when elements are changed while holding a cursor

		const paginationDirection: string | null = the_query.paginationDirection;
		const paginationLimit: number = the_query.paginationLimit;
		if (isNaN(paginationLimit)) {
			throw new Error('invalid pagination_limit');
		}
		if (paginationLimit > 100) {
			throw new Error('pagination_limit too large');
		}
		const isForwardsPagination: boolean = paginationDirection === 'forwards';
		const isBackwardsPagination: boolean = paginationDirection === 'backwards';

		// TODO FIXME fix that this could return an array or so (not any and validate it)
		const paginationCursor: BaseEntityType | null = the_query.paginationCursor;

		const sortingQuery: [string, string][] = the_query.sorting
			.map((e) => e.split(':', 2))
			.map<[string, string]>((e) => [e[0], e[1]])
			.filter((e) => allowedFilters.includes(e[0]))
			.filter((e) => ['ASC', 'DESC'].includes(e[1]));
		// TODO FIXME remove dupes of sorting keys

		let allowedOrderBy = [
			...sortingQuery,
			...[['id', 'ASC']].filter((k) => !sortingQuery.find((e) => e[0] == k[0]))
		];

		// orderBy needs to be reversed for backwards pagination
		if (isBackwardsPagination) {
			allowedOrderBy = allowedOrderBy.map((e) => [e[0], e[1] === 'ASC' ? 'DESC' : 'ASC']);
		}

		const orderByQuery = allowedOrderBy.map((e) => `${e[0]} ${e[1]}`).join(',');
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
								// TODO FIXME this probably needs to be specifiable per field as you should be able to decide whether null comes before or after everything (also needs adjusting for order by)
								// for election we need 1, 2, 3, 4, 5, null, null, null as order
								// second page:
								// SELECT id,title,info,place,costs,min_age,max_age,min_participants,max_participants,presentation_type,requirements,random_assignments,choices.rank,choices.project_id,choices.user_id FROM projects LEFT OUTER JOIN choices ON (projects.id = choices.project_id AND choices.user_id = '0002d638-4bd6-4c3a-a86a-919a9eddaab1') WHERE
								// ((null < rank) OR (null IS NOT DISTINCT FROM rank AND '00d1edee-c84d-4810-834e-9a679088af80' < id) OR (NOT true AND NOT false)) AND title LIKE '%%' AND (true OR id = null) AND info LIKE '%%' AND place LIKE '%%' AND presentation_type LIKE '%%' AND requirements LIKE '%%' AND (true OR rank = null) ORDER BY rank ASC,id ASC LIMIT (50 + 1);

								// back
								// SELECT id,title,info,place,costs,min_age,max_age,min_participants,max_participants,presentation_type,requirements,random_assignments,choices.rank,choices.project_id,choices.user_id FROM projects LEFT OUTER JOIN choices ON (projects.id = choices.project_id AND choices.user_id = '0002d638-4bd6-4c3a-a86a-919a9eddaab1') WHERE
								// ((null > rank) OR (null IS NOT DISTINCT FROM rank AND '00d663d0-77c1-4c58-9205-6441b6022e6c' > id) OR (NOT false AND NOT true)) AND title LIKE '%%' AND (true OR id = null) AND info LIKE '%%' AND place LIKE '%%' AND presentation_type LIKE '%%' AND requirements LIKE '%%' AND (true OR rank = null) ORDER BY rank DESC,id DESC LIMIT (50 + 1);
								if (
									(paginationCursor != null ? paginationCursor[value[0]] ?? null : null) === null &&
									index == array.length - 1 &&
									value[1] == 'DESC'
								) {
									return fakeLiteralTT(`${value[0]} IS NOT NULL`);
								} else {
									return concTT(
										fakeTT<SerializableParameter>`${
											paginationCursor != null ? paginationCursor[value[0]] ?? null : null
										}`,
										fakeLiteralTT(
											` ${
												index == array.length - 1
													? value[1] == 'ASC'
														? '<' // TODO FIXME null is neither < nor > than any value so look at how order-by orders null and do this here accordingly
														: '>'
													: 'IS NOT DISTINCT FROM'
											} ${value[0]}`
										)
									);
								}
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
			concTT(fakeLiteralTT(' WHERE ('), pagination),
			fakeLiteralTT(
				` OR (NOT ${isForwardsPagination ? 'true' : 'false'} AND NOT ${
					isBackwardsPagination ? 'true' : 'false'
				})) `
			)
		);

		const queryStringPart2 = params(the_query);
		const queryStringPart3 = fakeLiteralTT(orderBy);
		const queryStringPart4 = fakeTT<SerializableParameter>` LIMIT (${paginationLimit} + 1);`;
		const queryStringParts12 = concTT(queryStringPart1, queryStringPart2);
		const queryStringParts34 = concTT(queryStringPart3, queryStringPart4);
		const queryStringParts1234 = concTT(queryStringParts12, queryStringParts34);
		const queryStringParts01234 = concTT(select, queryStringParts1234);
		const queryString = toTT(queryStringParts01234);

		console.log(TTToString(...queryString));

		let entities: Array<BaseEntityType> = await sql<Array<BaseEntityType>>(...queryString);

		let nextCursor: BaseEntityType | null = null;
		let previousCursor: BaseEntityType | null = null;
		// TODO FIXME also recalculate the other cursor because data could've been deleted in between / the filters have changed
		if (!isForwardsPagination && !isBackwardsPagination) {
			if (entities.length > paginationLimit) {
				entities.pop();
				nextCursor = entities[entities.length - 1] ?? null;
			}
		} else if (isForwardsPagination) {
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
