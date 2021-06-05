// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
export const fakeTT = (
	strings: TemplateStringsArray,
	...keys: any[]
): [TemplateStringsArray, any[]] => {
	return [strings, keys];
};

export const fakeLiteralTT = (string: string): [TemplateStringsArray, any[]] => {
	// @ts-expect-error raw property not set yet
	const templateStrings: TemplateStringsArray = [string];
	// @ts-expect-error raw property readonly
	templateStrings.raw = [string];
	return [templateStrings, []];
};

export const concTT = (
	tt1: [TemplateStringsArray, any[]],
	tt2: [TemplateStringsArray, any[]]
): [TemplateStringsArray, any[]] => {
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
export const toTT = (tt: [TemplateStringsArray, any[]]): [TemplateStringsArray, ...any] => {
	return [tt[0], ...tt[1]];
};

export const TTToString = (strings: TemplateStringsArray, ...keys: any[]) => {
	let str = '';
	strings.forEach((string, i) => {
		str += string + keys[i];
	});
	return str;
};
