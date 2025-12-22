import { ApiClient } from "./api/ApiClient";
import { SceneAssignment, OnTimeRundownService } from "./api/OnTimeService";

import { ASSIGN_ACTOR_TO_EVENT_QUERY, GET_ACTORS_QUERY, GET_EVENTS_QUERY, pool } from "./db";
import { Actors, Event } from "./models/DbModels";

async function main() {
    const api = new ApiClient("http://192.168.100.163:4001");
    const rundownService = new OnTimeRundownService(api);

    const currentRundown = await rundownService.getCurrentRundown();
    const events = currentRundown.getEventsInOrder();

    // grab event id that has title "Scene 1"
    const scene1 = events.find(e => e.title === "Scene 1");
    if (!scene1) {
        console.error("Scene 1 not found");
        return;
    }
    console.log(`Found Scene 1 with ID: ${scene1.id}`);

    // fetch actors from DB
    const conn = await pool.getConnection();
    let rows = await conn.query(GET_ACTORS_QUERY);
    const actors: Actors[] = rows.map((row: any) => new Actors(row.actor_id, row.actor_name, row.actor_role));

    // grab 3-5 random actors
    const exampleActors: Actors[] = [];
    const usedIndices = new Set<number>();
    const numActorsToAssign = Math.floor(Math.random() * 3) + 3; // between 3 and 5

    while (exampleActors.length < numActorsToAssign) {
        const randomIndex = Math.floor(Math.random() * actors.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            exampleActors.push(actors[randomIndex]);
        }
    }

    const usedMics = new Set<number>();
    const sceneAssignments: SceneAssignment[] = [];
    // assign actors to Scene 1
    for (let i = 0; i < exampleActors.length; i++) {
        const actor = exampleActors[i];
        console.log(`Assigning Actor: ${actor.toString()} to Scene 1`);

        // make mic random between 1 and 10 with collision check
        let mic: number;
        do {
            mic = Math.floor(Math.random() * 10) + 1;
        } while (usedMics.has(mic));
        usedMics.add(mic);

        await conn.query(
            ASSIGN_ACTOR_TO_EVENT_QUERY,
            [scene1.id, actor.getId(), mic]
        );

        sceneAssignments.push(new SceneAssignment(actor.getName(), actor.getRole(), mic));
    }
    await conn.end();

    // set scene assignments in OnTime
    const result = await rundownService.setSceneAssignmentsForEvent(scene1.id, sceneAssignments);
    console.log(`Set scene assignments result: ${result.toString()}`);
}
main();
