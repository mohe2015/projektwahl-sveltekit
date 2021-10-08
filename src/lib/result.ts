// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
export type Result<T> = SuccessResult<T> | FailureResult;

export type SuccessResult<T> = {
    result: "success";
    success: T;
}

export type FailureResult = {
    result: "failure";
	failure: { [key: string]: string };
}

export const isErr = <T>(result: Result<T>): result is FailureResult => {
	return result.result === "failure";
};

export const isOk = <T>(result: Result<T>): result is SuccessResult<T> => {
	return result.result === "success";
};

export const ok = <T>(value: T): SuccessResult<T> => {
    return {
        result: "success",
        success: value
    }
}

export const err = (error: { [key: string]: string }): FailureResult => {
    return {
        result: "failure",
        failure: error
    }
}

export function andThen<T, U>(result: Result<T>, op: ((v: T) => Result<U>)): Result<U> {
    if (!isOk(result)) {
        return result;
    }
    return op(result.success);
}

type Okayed<T> = T extends Result<infer U> ? U : T;

type OkayedArray<T> = { [P in keyof T]: Okayed<T[P]> };

export function mergeErrOr<A extends Result<unknown>[], T>(results: A, op: (v: OkayedArray<A>) => Result<T>) {
    let mergedResult: FailureResult | null = null;
    for (const result of results) {
        if (isErr(result)) {
            if (mergedResult == null) {
                mergedResult = {
                    result: "failure",
                    failure: {}
                };
            }
            mergedResult.failure = { ...mergedResult.failure, ...result.failure }
        }
    }
    if (mergedResult != null) {
        return mergedResult;
    }
    return op(results);
}