// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { query2location } from './writable_url';

export type BaseEntityType = {
	id: number;
	[x: string]: string | number | null;
};

export type EntityResponseBody = {
	entities: Array<BaseEntityType>;
	previousCursor: BaseEntityType | null;
	nextCursor: BaseEntityType | null;
};

export type BaseQueryType = {
	'sorting[]': string[];
	pagination_limit: string;
	[x: string]: string | string[];
};

export function createReloadEntites(fetch: (url: string) => any, url: string) {
	return async function (
		query: BaseQueryType,
		paginationDirection: 'forwards' | 'backwards' | null,
		paginationCursor: BaseEntityType | null
	) {
		const urlSearchParams = new URLSearchParams(query2location(query));
		if (paginationDirection !== null) {
			urlSearchParams.set('pagination_direction', paginationDirection);
		}
		if (paginationCursor !== null) {
			urlSearchParams.set('pagination_cursor', JSON.stringify(paginationCursor));
		}
		const fullUrl = `${import.meta.env.VITE_BASE_URL}${url}?${urlSearchParams}`;
		const res = await fetch(fullUrl);
		return await res.json();
	};
}
