-- SPDX-License-Identifier: AGPL-3.0-or-later
-- SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
SELECT t.user_id, t.project_id, t.rank FROM users, LATERAL
    (WITH c AS (SELECT * FROM choices WHERE choices.user_id = users.id)
        SELECT user_id, project_id, rank FROM c WHERE (SELECT COUNT(*) FROM c) = 5
        UNION ALL
        SELECT users.id as user_id, projects.id AS project_id, -1 as rank FROM projects WHERE (SELECT COUNT(*) FROM c) != 5 AND users.age >= projects.min_age AND users.age <= projects.max_age AND users.project_leader_id IS DISTINCT FROM projects.id
    )
    t;