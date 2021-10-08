// TODO FIXME use Either and disallow the other field but this currently doesn't work with JSONValue. Also empty object is probably also fine
export type Result<T> = {
	success?: T;
	failure: { [key: string]: string };
};

export type SuccessResult<T> = {
    success: T;
	failure: Record<string, never>;
}

export type FailureResult = {
    success: undefined;
	failure: { [key: string]: string };
}

export const isErr = <T>(result: Result<T>): result is FailureResult => {
	return Object.keys(result.failure).length !== 0;
};


export const isOk = <T>(result: Result<T>): result is SuccessResult<T> => {
	return Object.keys(result.failure).length === 0;
};

export function andThen<T>(result: Result<T>, op: ((v: T) => Result<T>)): Result<T> {
    if (!isOk(result)) {
        return result;
    }
    return op(result.success);
}