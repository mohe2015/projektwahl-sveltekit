// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { setup } from '$lib/database';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get() {
	const result = await setup();

	return {
		body: result
	};
}
