// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

export type BaseEntityType = {
	id: number;
	[x: string]: string | number | null;
};

export type FetchResponse<T, E> = {
	success?: T;
	error?: E;
};

export type EntityResponseBody<T> = {
	entities: Array<T>;
	previousCursor: T | null;
	nextCursor: T | null;
};

export type BaseQueryType = {
	'sorting[]': string[];
	pagination_limit: string;
	[x: string]: string | string[];
};
