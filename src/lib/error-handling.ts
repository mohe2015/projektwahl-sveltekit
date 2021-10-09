// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import type { Result } from "./result";

export const myFetch = async <T>(
	url: string,
	options: RequestInit | undefined
): Promise<Result<T>> => {
	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			try {
				const additionalInfo = await response.text();
				return {
					result: "failure",
					failure: {
						network: `Failed to request ${url}: ${response.status} ${response.statusText}\nAdditional information: ${additionalInfo}`
					}
				};
			} catch (error: unknown) {
				return {
					result: "failure",
					failure: {
						network: `Failed to request ${url}: ${response.status} ${response.statusText}`
					}
				};
			}
		}
		const result = (await response.json()) as Result<T>;
		return result;
	} catch (error) {
		console.error(error);
		if (error instanceof TypeError) {
			return {
				result: "failure",
				failure: {
					network: `Failed to request ${url}: ${error.message}\nAdditional information: ${
						error.stack ?? 'none'
					}`
				}
			};
		} else {
			return {
				result: "failure",
				failure: {
					network: `Failed to request ${url}: Unknown error see console.`
				}
			};
		}
	}
};