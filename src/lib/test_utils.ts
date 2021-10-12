// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import 'jest';
import { isErr, isOk, Result } from './result'
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
	const result = (await response.json()) as Result<T, { [key: string]: string; }>;
	if (!isOk(result)) {
		console.error(result)
		throw new Error("fetch failed but was expected to succeed")
	}
	return result.success;
};

export const failedFetch = async <E extends { [key: string]: string; }>(
	url: string,
	options: RequestInit | undefined
): Promise<E> => {
	const response = await fetch(url, options);
	if (!response.ok) {
		console.log(`fetching ${url} returned ${response.status} ${response.statusText}`);
		console.log(await response.text());
		throw new Error(`fetching ${url} returned ${response.status} ${response.statusText}`);
	}
	const result = (await response.json()) as Result<unknown, E>;
	if (!isErr(result)) {
		console.error(result)
		throw new Error("fetch succeeded but was expected to fail")
	}
	return result.failure;
};
