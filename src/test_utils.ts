// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

export const fetchPost = async (url: string, options: RequestInit | undefined) => {
	const response = await fetch(url, options);
	if (!response.ok) {
		throw new Error(`fetching ${url} returned ${response.status} ${response.statusText}`);
	}
	return response;
};
