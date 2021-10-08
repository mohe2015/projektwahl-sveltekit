// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
export type Result<T> = SuccessResult<T> | FailureResult<T>;

export type SuccessResult<T> = {
	result: 'success';
	success: T;
};

export type FailureResult<T> = {
	result: 'failure';
	failure: { [key: string]: string };
};

export const isErr = <T>(result: Result<T>): result is FailureResult<T> => {
	return result.result === 'failure';
};

export const isOk = <T>(result: Result<T>): result is SuccessResult<T> => {
	return result.result === 'success';
};

export const ok = <T>(value: T): SuccessResult<T> => {
	return {
		result: 'success',
		success: value
	};
};

export const err = <T>(error: { [key: string]: string }): FailureResult<T> => {
	return {
		result: 'failure',
		failure: error
	};
};

export function andThen<T, U>(result: Result<T>, op: (v: T) => Result<U>): Result<U> {
	if (!isOk(result)) {
		return result;
	}
	return op(result.success);
}

export function safe_unwrap<T>(result: SuccessResult<T>): T {
    return result.success;
}

export function unwrap<T>(result: Result<T>): T {
	if (isOk(result)) {
		return result.success;
	}
	throw new Error("can't unwrap Err");
}

// https://github.com/microsoft/TypeScript/pull/26063
type Awaited<T> = T extends Result<infer U> ? U : T;
type Awaitified<T> = { [P in keyof T]: Awaited<T[P]> };

export function mergeErrOr<A extends any[], T>(
	op: (v: Awaitified<A>) => Result<T>,
	...results: A
): Result<T> {
	let mergedResult: FailureResult<T> | null = null;
	for (const result of results) {
		if (isErr(result)) {
			if (mergedResult == null) {
				mergedResult = {
					result: 'failure',
					failure: {}
				};
			}
			mergedResult.failure = { ...mergedResult.failure, ...result.failure };
		}
	}
	if (mergedResult != null) {
		return mergedResult;
	}
    //if (results.every(isOk)) {
        // @ts-expect-error TODO would be epic if this would work but don't think so
        return op(results.map(safe_unwrap));
    //}
}
