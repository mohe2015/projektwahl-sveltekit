// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { ServerRequest, StrictBody } from '@mohe2015/kit/types/hooks';
import type { JSONValue } from '@mohe2015/kit/types/endpoint';
import type { ParameterizedBody, ReadOnlyFormData } from '@mohe2015/kit/types/helper';

export type MyEndpointOutput<Body extends string | Uint8Array | JSONValue> = {
	status?: number;
	headers?: Partial<Headers>;
	body?: Body;
};

type MyBaseBody = string | Buffer | ReadOnlyFormData;

export type MyServerRequest<Locals = Record<string, any>, Body = unknown> = Location & {
	method: string;
	headers: Headers;
	rawBody: StrictBody;
	body: MyBaseBody & Body;
	locals: Locals;
};

export type MyRequestHandler<
	OutputBody extends string | Uint8Array | JSONValue,
	Locals = unknown,
	Body = unknown
> = (request: MyServerRequest<Locals, Body>) => Promise<MyEndpointOutput<OutputBody>>;
