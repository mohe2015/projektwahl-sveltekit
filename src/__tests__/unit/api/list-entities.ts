// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import 'jest';
import fetch, { BodyInit } from 'node-fetch';

test('check that all rows are returned with pagination', async () => {
	// TODO FIXME replace fetch with internal sveltekit routing or so?
	const response = await fetch(
		'http://localhost:3000/users.json?' +
			new URLSearchParams([
				['filter_types[]', 'admin'],
				['filter_types[]', 'helper'],
				['filter_types[]', 'voter'],
				['pagination_limit', '10'],
				['sorting[]', 'id:down-up,name:down-up,type:down-up']
			])
	);
	const result = await response.json();
	console.log(result);
});
