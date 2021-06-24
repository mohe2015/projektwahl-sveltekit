// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import 'jest';
import { fetchPost } from '../../../test_utils';

test('check that all rows are returned with pagination', async () => {
	// TODO FIXME replace fetch with internal sveltekit routing or so?
	const response = await fetchPost(
		'http://localhost:3000/users.json',
		JSON.stringify({
			name: 'test',
			password: 'test'
		})
	);
	const result = await response.json();
	console.log(result);
});
