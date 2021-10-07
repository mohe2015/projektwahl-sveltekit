// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { BaseQuery } from '$lib/list-entities';
import 'jest';
import type { Login } from 'src/routes/login/index.json';
import type { TestResponseBody } from 'src/routes/tests/list-entities.json';
import { successfulFetch } from '../../test_utils'

test('check that all rows are returned with pagination', async () => {
	const loginResult = await successfulFetch<Login>('http://localhost:3000/login.json', {
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

	await successfulFetch('http://localhost:3000/tests/setup.json', {
		method: 'POST',
		headers: {
			'x-csrf-protection': 'projektwahl',
			cookie: `strict_id=${loginResult.session.session_id}; lax_id=${loginResult.session.session_id}`
		}
	});
	let result: TestResponseBody | null = null;
	const foundIds = new Set(Array.from(new Array(100), (x, i) => i + 1));
	do {
		const query: BaseQuery<unknown> = {
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
		result = await successfulFetch(url, {
			headers: {
				'x-csrf-protection': 'projektwahl',
				cookie: `strict_id=${loginResult.session.session_id}; lax_id=${loginResult.session.session_id}`
			}
		});
		result?.entities.forEach((e) => {
			expect(foundIds).toContain(e.id);
			foundIds.delete(e.id);
		});
	} while (result?.nextCursor != null);
	expect(foundIds.size).toBe(0);
});
