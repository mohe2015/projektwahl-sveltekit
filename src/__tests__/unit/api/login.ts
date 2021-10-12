// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import 'jest';
import type { Login } from 'src/routes/login/index.json';
import { failedFetch, successfulFetch } from '../../../lib/test_utils';

test('invalid login returns error', async () => {
	const result = await failedFetch<{ [key: string]: string }>('http://localhost:3000/login.json', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-csrf-protection': 'projektwahl'
		},
		body: JSON.stringify({
			name: 'test',
			password: 'test'
		})
	});
	expect(result).toMatchSnapshot();
});

test('successful login returns cookie', async () => {
	const result = await successfulFetch<Login>('http://localhost:3000/login.json', {
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
	expect(result.session.session_id).toHaveLength(36);
});
