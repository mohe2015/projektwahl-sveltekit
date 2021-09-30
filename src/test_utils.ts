// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import fetch, { BodyInit } from 'node-fetch';

export const fetchPost = async (url: string, body: BodyInit) => {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body
	});
	if (!response.ok) {
		throw new Error(`fetching ${url} returned ${response.status} ${response.statusText}`);
	}
	return response;
};
