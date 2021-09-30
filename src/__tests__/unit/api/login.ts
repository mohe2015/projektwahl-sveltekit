// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import 'jest';
import { fetchPost } from '../../../test_utils';

test('invalid login returns error', async () => {
	// TODO FIXME replace fetch with internal sveltekit routing or so?
	const response = await fetchPost('http://localhost:3000/login.json', {
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
	const result = await response.json();
	expect(result).toMatchSnapshot();
});

test('successful login returns cookie', async () => {
	const response = await fetchPost('http://localhost:3000/login.json', {
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
	const result: any = await response.json();
	expect(result.errors).toEqual({});
	expect(result.session.session_id).toHaveLength(36);
});
