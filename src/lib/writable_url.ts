// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { goto } from '$app/navigation';
import type { Subscriber, Unsubscriber, Updater, Writable } from 'svelte/store';
import { page } from '$app/stores';
import type { Location } from '@sveltejs/kit/types/helper';
import { get } from 'svelte/store';

declare type Invalidator<T> = (value?: T) => void;

export const location2query = <T extends Record<string, string | string[]>>(value: Location): T => {
	// the type casts here are needes as this can't be proven correctly.
	//console.log(value.query.toString());
	const currentQuery: T = {} as T;
	value.query.forEach((_, key) => {
		if (key.endsWith('[]')) {
			currentQuery[key as keyof T] = value.query.getAll(key) as T[keyof T];
		} else {
			currentQuery[key as keyof T] = _ as T[keyof T];
		}
	});
	return currentQuery;
};

export const query2location = <T extends Record<string, string | string[]>>(
	actualValue: T
): URLSearchParams => {
	const urlSearchParams = new URLSearchParams();
	for (const k in actualValue) {
		if (actualValue[k] != null) {
			if (k.endsWith('[]')) {
				for (const e of actualValue[k]) {
					urlSearchParams.append(k, e);
				}
			} else {
				urlSearchParams.append(k, actualValue[k] as string);
			}
		}
	}
	return urlSearchParams;
};

export const query = <T extends Record<string, string | string[]>>(
	defaultValue: T
): Writable<T> => {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	const subscribe = (run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber => {
		return page.subscribe(
			(value) => {
				//console.log('subscribe.run');
				if (value) {
					run({ ...defaultValue, ...location2query(value) });
				}
			},
			invalidate
				? (value) => {
						//console.log('subscribe.invalidate');
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
	const set = (value: T): void => {
		const actualValue: T = { ...defaultValue, ...value };
		//console.log('set', actualValue);
		// https://github.com/sveltejs/kit/blob/fc19b6313f6e457d8fe78b251ca95d9ba3a1dcc2/packages/kit/src/runtime/client/router.js#L256 bruh focus
		goto(`?${query2location(actualValue).toString()}`, {
			replaceState: true,
			noscroll: true,
			keepfocus: true
		});
	};
	/**
	 * Update value using callback and inform subscribers.
	 * @param updater callback
	 */
	const update = (updater: Updater<T>): void => {
		//console.log('update');
		set(updater({ ...defaultValue, ...location2query(get(page)) }));
	};
	return {
		subscribe,
		set,
		update
	};
};
