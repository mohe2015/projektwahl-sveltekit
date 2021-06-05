// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { MyRequestHandler } from '$lib/request_helpers';
import type { SerializableParameter } from 'postgres';
import { concTT, fakeLiteralTT, fakeTT, toTT, TTToString } from './tagged-templates';

export type EntityType = { id: number }; // TODO FIXME is id really returned as number?

export type EntityResponseBody = {
	entities: Array<EntityType>;
	previousCursor: number | null;
	nextCursor: number | null;
};

export const buildGet = (
	allowedFilters: string[],
	fieldsToSelect: string[],
	table: string,
	params: (query: URLSearchParams) => [TemplateStringsArray, SerializableParameter[]]
): MyRequestHandler<EntityResponseBody> => {
	const get: MyRequestHandler<EntityResponseBody> = async function ({ query }) {
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
		const queryStringPart1 = fakeTT<SerializableParameter>`SELECT ${sql(fieldsToSelect)} FROM ${sql(
			table
		)} WHERE ((${isForwardsPagination} AND id >= ${paginationCursor}) OR (${isBackwardsPagination} AND id < ${paginationCursor}) OR ((NOT ${isForwardsPagination}) AND (NOT ${isBackwardsPagination}))) AND `;
		const queryStringPart2 = params(query); // this should be a safe part
		const queryStringPart3 = fakeLiteralTT(orderBy);
		const queryStringPart4 = fakeTT<SerializableParameter>` LIMIT (${paginationLimit} + 1);`;
		const queryStringParts12 = concTT(queryStringPart1, queryStringPart2);
		const queryStringParts34 = concTT(queryStringPart3, queryStringPart4);
		const queryString = toTT(concTT(queryStringParts12, queryStringParts34));

		console.log(queryString);
		console.log(TTToString(...queryString));
		// TODO FIXME change
		// implement min_age as < and max_age as >
		// TODO FIXME implement filter: costs, min_age, max_age, min_participants, max_participants, random_assignments

		let entities: Array<EntityType> = await sql<Array<EntityType>>(...queryString);

		// e.g http://localhost:3000/users.json?pagination_direction=forwards
		let nextCursor: number | null = null;
		let previousCursor: number | null = null;
		if (isForwardsPagination) {
			previousCursor = paginationCursor;
			if (entities.length > paginationLimit) {
				const lastElement = entities.pop();
				nextCursor = lastElement?.id ?? null;
			}
		} else if (isBackwardsPagination) {
			entities = entities.reverse(); // fixup as we needed to switch up orders above
			if (entities.length > paginationLimit) {
				entities.shift();
				previousCursor = entities[0].id ?? null;
			}
			nextCursor = paginationCursor;
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
