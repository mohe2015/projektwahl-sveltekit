// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { goto } from '$app/navigation';
import type { Subscriber, Unsubscriber, Updater, Writable } from 'svelte/store';
import { page } from '$app/stores';
import type { Location } from '@mohe2015/kit/types/helper';
import { get } from 'svelte/store';

declare type Invalidator<T> = (value?: T) => void;

const location2query = (value: Location): Record<string, string> => {
	console.log(value.query.toString());
	const currentQuery: Record<string, string> = {};
	value.query.forEach((_, key) => {
		console.log(key + ' -> ' + _);
		if (key.endsWith('[]')) {
			currentQuery[key] = value.query.getAll(key) as unknown as string; // TODO FIXME hack
		} else {
			currentQuery[key] = _;
		}
	});
	return currentQuery;
};

export const query = (defaultValue: Record<string, string>): Writable<Record<string, string>> => {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	const subscribe = (
		run: Subscriber<Record<string, string>>,
		invalidate?: Invalidator<Record<string, string>>
	): Unsubscriber => {
		return page.subscribe(
			(value) => {
				console.log('subscribe.run');
				if (value) {
					run({ ...defaultValue, ...location2query(value) });
				}
			},
			invalidate
				? (value) => {
						console.log('subscribe.invalidate');
						if (value) {
							invalidate({ ...defaultValue, ...location2query(value) });
						}
				  }
				: undefined
		);
	};
	/**
	 * Set value and inform subscribers.
	 * @param value to set
	 */
	const set = (value: Record<string, string>): void => {
		const actualValue: Record<string, string> = { ...defaultValue, ...value };
		console.log('set', actualValue);
		const urlSearchParams = new URLSearchParams();
		for (const k in actualValue) {
			if (actualValue[k] != null) {
				if (Array.isArray(actualValue[k])) {
					// TODO FIXME replace with k endswith []
					for (const e of actualValue[k]) {
						urlSearchParams.append(k, e);
					}
				} else {
					urlSearchParams.append(k, actualValue[k]);
				}
			}
		}

		// https://github.com/sveltejs/kit/blob/fc19b6313f6e457d8fe78b251ca95d9ba3a1dcc2/packages/kit/src/runtime/client/router.js#L256 bruh focus
		goto(`?${urlSearchParams.toString()}`, { replaceState: true, noscroll: true });
	};
	/**
	 * Update value using callback and inform subscribers.
	 * @param updater callback
	 */
	const update = (updater: Updater<Record<string, string>>): void => {
		console.log('update');
		set(updater({ ...defaultValue, ...location2query(get(page)) }));
	};
	return {
		subscribe,
		set,
		update
	};
};
