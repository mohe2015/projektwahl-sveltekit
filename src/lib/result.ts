// TODO FIXME use Either and disallow the other field but this currently doesn't work with JSONValue. Also empty object is probably also fine
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

export function andThen<T, U>(result: Result<T>, op: ((v: T) => Result<U>)): Result<U> {
    if (!isOk(result)) {
        return result;
    }
    return op(result.success);
}