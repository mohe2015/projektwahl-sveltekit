// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { goto } from '$app/navigation';
import type { Subscriber, Unsubscriber, Updater, Writable } from 'svelte/store';
import { page } from '$app/stores';
import type { Location } from '@sveltejs/kit/types/helper';
import { get } from 'svelte/store';

declare type Invalidator<T> = (value?: T) => void;

const location2query = (value: Location): Record<string, string> => {
	console.log(value.query.toString());
	const currentQuery: Record<string, string> = {};
	value.query.forEach((value, key) => {
		currentQuery[key] = value; // TODO FIXME append
	});
	return currentQuery;
};

export const query: Writable<Record<string, string>> = {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	subscribe(
		run: Subscriber<Record<string, string>>,
		invalidate?: Invalidator<Record<string, string>>
	): Unsubscriber {
		return page.subscribe(
			(value) => {
				console.log('subscribe.run');
				if (value) {
					run(location2query(value));
				}
			},
			invalidate
				? (value) => {
						console.log('subscribe.invalidate');
						if (value) {
							invalidate(location2query(value));
						}
				  }
				: undefined
		);
	},
	/**
	 * Set value and inform subscribers.
	 * @param value to set
	 */
	set(value: Record<string, string>): void {
		console.log('set');
		const urlSearchParams = new URLSearchParams(value);
		goto(`?${urlSearchParams.toString()}`, { replaceState: true });
	},
	/**
	 * Update value using callback and inform subscribers.
	 * @param updater callback
	 */
	update(updater: Updater<Record<string, string>>): void {
		console.log('set');
		updater(location2query(get(page)));
	}
};
