// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
export const fakeTT = <T>(
	strings: TemplateStringsArray,
	...keys: T[]
): [TemplateStringsArray, T[]] => {
	return [strings, keys];
};

export const fakeLiteralTT = (string: string): [TemplateStringsArray, []] => {
	// @ts-expect-error raw property not set yet
	const templateStrings: TemplateStringsArray = [string];
	// @ts-expect-error raw property readonly
	templateStrings.raw = [string];
	return [templateStrings, []];
};

export const concTT = <T>(
	tt1: [TemplateStringsArray, T[]],
	tt2: [TemplateStringsArray, T[]]
): [TemplateStringsArray, T[]] => {
	// @ts-expect-error raw property not set yet
	const templateStrings: TemplateStringsArray = [
		...tt1[0].slice(0, -1),
		tt1[0].slice(-1)[0] + tt2[0][0],
		...tt2[0].slice(1)
	];
	// @ts-expect-error raw property readonly
	templateStrings.raw = [
		...tt1[0].raw.slice(0, -1),
		tt1[0].raw.slice(-1)[0] + tt2[0].raw[0],
		...tt2[0].raw.slice(1)
	];
	return [templateStrings, [...tt1[1], ...tt2[1]]];
};

// TODO FIXME internalize this into the others
export const toTT = <T>(tt: [TemplateStringsArray, T[]]): [TemplateStringsArray, ...T[]] => {
	return [tt[0], ...tt[1]];
};

export const TTToString = (strings: TemplateStringsArray, ...keys: unknown[]): string => {
	let str = '';
	strings.forEach((string, i) => {
		str +=
			string +
			(strings.length - 1 == i
				? ''
				: keys[i] !== null && typeof keys[i] === 'object' && 'first' in (keys[i] as any)
				? (keys[i] as any).first
				: JSON.stringify(keys[i]).replaceAll('"', "'"));
	});
	return str;
};
