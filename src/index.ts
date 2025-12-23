import { ApiClient } from "./api/ApiClient";
import { SceneAssignment, OnTimeRundownService } from "./api/OnTimeService";
import { env } from "./env";

import {
    ASSIGN_ACTOR_TO_EVENT_QUERY,
    GET_ACTORS_QUERY,
    pool
} from "./db";
import { Actors } from "./models/DbModels";

async function main() {
    const api = new ApiClient(`http://${env.ONTIME_HOST}:${env.ONTIME_PORT}`);
    const rundownService = new OnTimeRundownService(api);

    const currentRundown = await rundownService.getCurrentRundown();
    const events = currentRundown.getEventsInOrder();

    // fetch actors from DB once
    const conn = await pool.getConnection();
    const rows = await conn.query(GET_ACTORS_QUERY);
    const actors: Actors[] = rows.map(
        (row: any) => new Actors(row.actor_id, row.actor_name, row.actor_role)
    );

    for (let sceneNumber = 1; sceneNumber <= 12; sceneNumber++) {
        const sceneTitle = `Scene ${sceneNumber}`;
        const scene = events.find(e => e.title === sceneTitle);

        if (!scene) {
            console.warn(`${sceneTitle} not found, skipping`);
            continue;
        }

        console.log(`\nProcessing ${sceneTitle} (ID: ${scene.id})`);

        // pick 3–5 random actors
        const exampleActors: Actors[] = [];
        const usedIndices = new Set<number>();
        const numActorsToAssign = Math.floor(Math.random() * 3) + 3;

        while (exampleActors.length < numActorsToAssign) {
            const randomIndex = Math.floor(Math.random() * actors.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                exampleActors.push(actors[randomIndex]);
            }
        }

        const usedMics = new Set<number>();
        const sceneAssignments: SceneAssignment[] = [];

        for (const actor of exampleActors) {
            // assign mic 1–10 without collision
            let mic: number;
            do {
                mic = Math.floor(Math.random() * 10) + 1;
            } while (usedMics.has(mic));
            usedMics.add(mic);

            console.log(
                `Assigning Actor: ${actor.toString()} → ${sceneTitle} (Mic ${mic})`
            );

            await conn.query(
                ASSIGN_ACTOR_TO_EVENT_QUERY,
                [scene.id, actor.getId(), mic]
            );

            sceneAssignments.push(
                new SceneAssignment(actor.getName(), actor.getRole(), mic)
            );
        }

        // update OnTime for this scene
        const result = await rundownService.setSceneAssignmentsForEvent(
            scene.id,
            sceneAssignments
        );
        console.log(`Set assignments result for ${sceneTitle}: ${result.toString()}`);
    }

    await conn.end();
}

main().catch(err => {
    console.error("Fatal error:", err);
});
