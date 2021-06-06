// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
export type UserType = {
	id: number;
	name: string;
	password: string;
	type: string;
	group: string;
	age: number;
	away: boolean;
};

export type PartialUser = Partial<UserType>;
