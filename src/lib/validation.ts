// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { ReadOnlyFormData } from '@mohe2015/kit/types/helper';

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
