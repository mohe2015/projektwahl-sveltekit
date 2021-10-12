// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { Result } from '$lib/types';
import fetch, { RequestInit } from 'node-fetch';

export const successfulFetch = async <T>(
	url: string,
	options: RequestInit | undefined
): Promise<T> => {
	const response = await fetch(url, options);
	if (!response.ok) {
		console.log(`fetching ${url} returned ${response.status} ${response.statusText}`);
		console.log(await response.text());
		throw new Error(`fetching ${url} returned ${response.status} ${response.statusText}`);
	}
	const result = (await response.json()) as Result<T>;
	expect(result.failure).toMatchObject({});
	if (!result.success) {
		fail('result does not exist');
	}
	return result.success;
};

export const failedFetch = async (
	url: string,
	options: RequestInit | undefined
): Promise<{
	[key: string]: string;
}> => {
	const response = await fetch(url, options);
	if (!response.ok) {
		console.log(`fetching ${url} returned ${response.status} ${response.statusText}`);
		console.log(await response.text());
		throw new Error(`fetching ${url} returned ${response.status} ${response.statusText}`);
	}
	const result = (await response.json()) as Result<unknown>;
	if (result.success) {
		fail('result should not exist');
	}
	expect(Object.entries(result.failure)).toBeGreaterThan(0);
	return result.failure;
};
