// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

export type UserVoterType = {
	id: number;
	name: string;
	password: string;
	type: 'voter';
	group: string;
	age: number;
	away: boolean;
};

export type UserHelperAdminType = {
	id: number;
	name: string;
	password: string;
	type: 'helper' | 'admin';
	group: undefined;
	age: undefined;
	away: boolean;
};

export type UserType = UserVoterType | UserHelperAdminType;

export type PartialUser = Partial<UserType>;
