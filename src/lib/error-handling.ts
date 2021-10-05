import type { Result } from "./types";

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
                    failure: {
                        network: `Failed to request ${url}: ${response.status} ${response.statusText}\nAdditional information: ${additionalInfo}`
                    }
                }
            } catch (error: unknown) {
                return {
                    failure: {
                        network: `Failed to request ${url}: ${response.status} ${response.statusText}`
                    }
                }
            }
        }
        const result = (await response.json()) as Result<T>;
        return result;
    } catch (error) {
        console.error(error);
        if (error instanceof TypeError) {
            return {
                failure: {
                    network: `Failed to request ${url}: ${error.message}\nAdditional information: ${error.stack ?? 'none'}`
                }
            }
        } else {
            return {
                failure: {
                    network: `Failed to request ${url}: Unknown error see console.`
                }
            }
        }
    }
};

export const hasErrors = (result: Result<unknown>): boolean => {
    return Object.keys(result.failure).length !== 0
}