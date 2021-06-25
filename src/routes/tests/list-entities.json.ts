// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import { buildGet } from '$lib/list-entities';
import { fakeTT } from '$lib/tagged-templates';
import type { SerializableParameter } from 'postgres';

export type TestType = {
	id: number;
	a: string;
	b: string;
	c: string;
};

export type TestResponseBody = {
	entities: Array<TestType>;
	previousCursor: number | null;
	nextCursor: number | null;
};

export const get = buildGet(
	['a', 'b', 'c'],
	fakeTT<SerializableParameter>`SELECT ${sql(['id', 'a', 'b', 'c'])} FROM ${sql('test1')}`,
	(
		query // TODO FIXME validation
	) => fakeTT<SerializableParameter>``
);
