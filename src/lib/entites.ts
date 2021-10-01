// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { browser } from '$app/env';
import type { Load } from '@sveltejs/kit/types';
import { HTTPError } from './authorization';

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
