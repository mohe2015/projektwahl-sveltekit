// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

export type OptionalPromiseResult<T, E extends { [key: string]: string }> =
	| PromiseResult<T, E>
	| NoneResult<T, E>;

export type PromiseResult<T, E extends { [key: string]: string }> =
	| Result<T, E>
	| LoadingResult<T, E>;

export type Result<T, E extends { [key: string]: string }> =
	| SuccessResult<T, E>
	| FailureResult<T, E>;

export type LoadingResult<T, E extends { [key: string]: string }> = {
	result: "loading"
	success?: T; // optionally a stale result
}

export type NoneResult<T, E extends { [key: string]: string }> = {
	result: "none"
}

export type SuccessResult<T, E extends { [key: string]: string }> = {
	result: 'success';
	success: T;
};

export type FailureResult<T, E extends { [key: string]: string }> = {
	result: 'failure';
	failure: E;
};

export const isErr = <T, E extends { [key: string]: string }>(
	result: OptionalPromiseResult<T, E>
): result is FailureResult<T, E> => {
	return result.result === 'failure';
};

export const isOk = <T, E extends { [key: string]: string }>(
	result: OptionalPromiseResult<T, E>
): result is SuccessResult<T, E> => {
	return result.result === 'success';
};

export const ok = <T, E extends { [key: string]: string }>(value: T): SuccessResult<T, E> => {
	return {
		result: 'success',
		success: value
	};
};

export const err = <T, E extends { [key: string]: string }>(error: E): FailureResult<T, E> => {
	return {
		result: 'failure',
		failure: error
	};
};

export function andThen<T, E extends { [key: string]: string }, U>(
	result: Result<T, E>,
	op: (v: T) => Result<U, E>
): Result<U, E> {
	if (!isOk(result)) {
		return result;
	}
	return op(result.success);
}

export function safeUnwrap<T, E extends { [key: string]: string }>(
	result: SuccessResult<T, E>
): T {
	return result.success;
}

export function unwrap<T, E extends { [key: string]: string }>(result: OptionalPromiseResult<T, E>): T {
	if (isOk(result)) {
		return result.success;
	}
	throw new Error("can't unwrap Err");
}

export function safeUnwrapErr<T, E extends { [key: string]: string }>(
	result: FailureResult<T, E>
): { [key: string]: string } {
	return result.failure;
}

export function orDefault<T, E extends { [key: string]: string }>(
	result: OptionalPromiseResult<T, E>,
	defaultResult: T
): T {
	if (isOk(result)) {
		return safeUnwrap(result);
	}
	return defaultResult;
}

export function mapOr<T, E extends { [key: string]: string }, Q>(
	result: OptionalPromiseResult<T, E>,
	fun: (val: T) => Q,
	defaultResult: Q
): Q {
	if (isOk(result)) {
		return fun(safeUnwrap(result));
	}
	return defaultResult;
}

export function errOrDefault<T, E extends { [key: string]: string }>(
	result: OptionalPromiseResult<T, E>,
	defaultError: { [key: string]: string }
): { [key: string]: string } {
	if (isErr(result)) {
		return safeUnwrapErr(result);
	}
	return defaultError;
}

// https://github.com/microsoft/TypeScript/pull/26063
type Awaited<T, E extends { [key: string]: string }> = T extends Result<infer U, E> ? U : T;
type Awaitified<T, E extends { [key: string]: string }> = { [P in keyof T]: Awaited<T[P], E> };

export function mergeErrOr<T1, A extends Result<T1, E>[], T, E extends { [key: string]: string }>(
	op: (v: Awaitified<A, E>) => Result<T, E>,
	...results: A
): Result<T, E> {
	let mergedResult: FailureResult<T, E> | null = null;
	for (const result of results) {
		if (isErr(result)) {
			if (mergedResult == null) {
				mergedResult = {
					result: 'failure',
					failure: result.failure
				};
			} else {
				mergedResult.failure = { ...mergedResult.failure, ...result.failure };
			}
		}
	}
	if (mergedResult != null) {
		return mergedResult;
	}
	//if (results.every(isOk)) {
	// @ts-expect-error TODO would be epic if this would work but don't think so
	return op(results.map(safeUnwrap));
	//}
}
