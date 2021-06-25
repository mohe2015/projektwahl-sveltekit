// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import 'jest';
import fetch, { BodyInit, Response } from 'node-fetch';
import type { TestResponseBody } from 'src/routes/tests/list-entities.json';
import { fetchPost } from '../../../test_utils';

test('check that all rows are returned with pagination', async () => {
	await fetchPost('http://localhost:3000/tests/setup.json', JSON.stringify(null));
	// TODO FIXME replace fetch with internal sveltekit routing or so?
	let result: TestResponseBody | null = null;
	const foundIds = new Set(Array.from(new Array(100), (x, i) => i + 1));
	do {
		const response: Response = await fetch(
			'http://localhost:3000/tests/list-entities.json?' +
				new URLSearchParams([
					['pagination_limit', '10'],
					['sorting[]', 'a:up'],
					['sorting[]', 'b:down-up'],
					['sorting[]', 'c:down-up'],
					...(result?.nextCursor != null
						? [
								['pagination_direction', 'forwards'],
								['pagination_cursor', JSON.stringify(result.nextCursor)]
						  ]
						: [])
				])
		);
		result = await response.json();
		console.log(result);
		result?.entities.forEach((e) => {
			expect(foundIds).toContain(e.id);
			foundIds.delete(e.id);
		});
	} while (result?.nextCursor != null);
	expect(foundIds.size).toBe(0);
});
