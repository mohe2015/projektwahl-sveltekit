// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

export type BaseEntityType = {
	id: number;
	[x: string]: string | number | null;
};

export type FetchResponse<T> = {
	success?: T;
	error?: any;
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
