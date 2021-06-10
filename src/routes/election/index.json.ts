// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { buildGet } from '$lib/list-entities';
import { fakeTT } from '$lib/tagged-templates';
import type { SerializableParameter } from 'postgres';

// SELECT * FROM projects LEFT OUTER JOIN choices ON (projects.id = choices.project_id);
// INSERT INTO choices (user_id, project_id, rank) VALUES (1, 55, 1);
export const get = null;
