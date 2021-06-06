// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { ReadOnlyFormData } from '@mohe2015/kit/types/helper';

// https://github.com/Microsoft/TypeScript/issues/21732
/*
function hasKeys<T, K extends string | number | symbol>(obj: T, keys: K[]): obj is T & { [P in K]: unknown } {
    return obj !== null && keys.every(k => k in obj);
}*/

export function hasPropertyType<T, K extends string, Y>(
	object: T,
	keys: K[],
	type: Y
): T &
	{
		[k in K]: Y;
	} {
	if (
		keys.filter((k) => k in object && typeof object[k as unknown as keyof T] === typeof type)
			.length > 0
	) {
		throw new Error('fail'); // TODO in the future return errors instead
	}
	return object as any;
}

export function hasEnumProperty<T, K extends string, Y extends string>(
	object: T,
	keys: K[],
	enums: Readonly<Y[]>
): T &
	{
		[k in K]: Y;
	} {
	if (
		keys.filter(
			(k) => k in object && enums.includes(object[k as unknown as keyof T] as unknown as Y)
		).length > 0
	) {
		throw new Error('fail'); // TODO in the future return errors instead
	}
	return object as any;
}

export function assertHas<T>(data: T, field: keyof T): { [index: string]: string } {
	if (!(field in data)) {
		return {
			[field]: `${field} fehlt!`
		};
	}
	return {};
}

export function assertNotEmpty<T, K extends keyof T>(
	data: T,
	field: K
): { [index: string]: string } {
	return {
		...assertHas(data, field),
		...(field in data && typeof data[field] === 'string' && data[field].trim().length == 0
			? {
					[field]: `${field} ist leer!`
			  }
			: {})
	};
}

export function assertOneOf(
	data: ReadOnlyFormData,
	field: string,
	oneOf: Array<string>
): { [index: string]: string } {
	return {
		...assertHas(data, field),
		...(!oneOf.includes(data.get(field))
			? {
					[field]: `${field} ist keines von ${oneOf}!`
			  }
			: {})
	};
}

export function assertBoolean(data: ReadOnlyFormData, field: string): { [index: string]: string } {
	return {
		...(data.has(field) && data.get(field) !== 'on'
			? {
					[field]: `${field} hat einen ungültigen Wert!`
			  }
			: {})
	};
}

function isInteger(value: string): boolean {
	return /^\d+$/.test(value);
}

export function assertNumber(data: ReadOnlyFormData, field: string): { [index: string]: string } {
	return {
		...(!data.has(field) || !isInteger(data.get(field))
			? {
					[field]: `${field} ist keine Ganzzahl!`
			  }
			: {})
	};
}

export function assertMoney(data: ReadOnlyFormData, field: string): { [index: string]: string } {
	return {
		...(!data.has(field) || /^\d+([.,]\d\d)?$/.test(data.get(field))
			? {
					[field]: `${field} ist kein Eurobetrag (mit Cent)!`
			  }
			: {})
	};
}
