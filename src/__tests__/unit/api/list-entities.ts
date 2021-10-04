// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { BaseQuery } from '$lib/list-entities';
import 'jest';
import fetch, { Response } from 'node-fetch';
import type { LoginResponse } from 'src/routes/login/index.json';
import type { TestResponseBody } from 'src/routes/tests/list-entities.json';
import { fetchPost } from '../../../test_utils';

test('check that all rows are returned with pagination', async () => {
	const loginResponse = await fetchPost('http://localhost:3000/login.json', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-csrf-protection': 'projektwahl'
		},
		body: JSON.stringify({
			name: 'admin',
			password: 'changeme'
		})
	});
	const loginResult = (await loginResponse.json()) as LoginResponse;
	console.log(loginResult);

	await fetchPost('http://localhost:3000/tests/setup.json', {
		method: 'POST',
		headers: {
			'x-csrf-protection': 'projektwahl',
			cookie: `strict_id=${loginResult.session.session_id}; lax_id=${loginResult.session.session_id}`
		}
	});
	// TODO FIXME replace fetch with internal sveltekit routing or so?
	let result: TestResponseBody | null = null;
	const foundIds = new Set(Array.from(new Array(100), (x, i) => i + 1));
	do {
		const query: BaseQuery = {
			filters: {},
			paginationLimit: 10,
			sorting: ['a:ASC', 'b:down-up', 'c:down-up'],
			...(result?.nextCursor != null
				? {
						paginationDirection: 'forwards',
						paginationCursor: result.nextCursor
				  }
				: {
						paginationDirection: null,
						paginationCursor: null
				  })
		};
		const url =
			'http://localhost:3000/tests/list-entities.json?' +
			Buffer.from(JSON.stringify(query)).toString('base64');
		const response: Response = await fetch(url, {
			headers: {
				'x-csrf-protection': 'projektwahl',
				cookie: `strict_id=${loginResult.session.session_id}; lax_id=${loginResult.session.session_id}`
			}
		});
		if (!response.ok) {
			console.log(`fetching ${url} returned ${response.status} ${response.statusText}`);
			console.log(await response.text());
			throw new Error(`fetching ${url} returned ${response.status} ${response.statusText}`);
		}
		result = (await response.json()) as TestResponseBody;
		console.log(result);
		result?.entities.forEach((e) => {
			expect(foundIds).toContain(e.id);
			foundIds.delete(e.id);
		});
	} while (result?.nextCursor != null);
	expect(foundIds.size).toBe(0);
});
