// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

export type New<T> = T & { id?: number };
export type Existing<T> = T & { id: number };

export type RawUserVoterType = {
	name: string;
	password: string;
	type: 'voter';
	group: string;
	age: number;
	away: boolean;
	project_leader_id?: number;
	force_in_project_id?: number;
};

export type RawUserHelperAdminType = {
	name: string;
	password: string;
	type: 'helper' | 'admin';
	group: never;
	age: never;
	away: boolean;
	project_leader_id?: number;
};

export type RawUserType =
	| RawUserVoterType
	| (RawUserHelperAdminType & {
			password: string;
	  });

export type RawProjectType = {
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

export type RawSessionType = {
	session_id: string;
	created_at: Date;
	updated_at: Date;
	user_id: number;
};

export type RawChoiceType = {
	user_id: number;
	project_id: number;
	rank: number;
};

export type ResettableChoiceType = {
	user_id: number;
	project_id: number;
	rank: number | null;
};

// TODO FIXME use Either and disallow the other field but this currently doesn't work with JSONValue. Also empty object is probably also fine
export type Result<T> = {
	success?: T;
	failure: { [key: string]: string };
};

export type EntityResponseBody<T> = {
	entities: Array<T>;
	previousCursor: T | null;
	nextCursor: T | null;
};