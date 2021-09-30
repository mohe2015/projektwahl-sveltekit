// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

export type UserVoterType = {
	id?: number; // TODO FIXME separate this into two types
	name: string;
	password: string;
	type: 'voter';
	group: string;
	age: number;
	away: boolean;
};

export type UserHelperAdminType = {
	id?: number;
	name: string;
	password: string;
	type: 'helper' | 'admin';
	group: never;
	age: never;
	away: boolean;
};

export type UserType = UserVoterType | UserHelperAdminType;

export type PartialUser = Partial<UserType>;

export type ProjectType = {
	id?: number;
	title: string;
	info: string;
	place: string;
	costs: number;
	min_age: number;
	max_age: number;
	min_participants: number;
	max_participants: number;
	presentation_type: string;
	requirements: string;
	random_assignments: boolean;
};
