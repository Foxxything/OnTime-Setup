import { ApiClient } from "./ApiClient";
import { CurrentRundown, RawCurrentRundown } from "../models/CurrentRundown";
import { SuccessOrError } from "../models/SuportingModels";

export enum CustomFields {
    Actors,
    Characters,
    Character_And_Mics
}

export class SceneAssignment {
    actorName: string
    actorRole: string
    micNumber: number

    constructor(actorName: string, actorRole: string, micNumber: number) {
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.micNumber = micNumber;
    }

    toString(): string {
        return `SceneAssignment [Actor: ${this.actorName}, Role: ${this.actorRole}, Mic: ${this.micNumber}]`;
    }
}

export class OnTimeRundownService {
    constructor(private api: ApiClient) { }

    async getCurrentRundown(): Promise<CurrentRundown> {
        // Type the API response so TypeScript knows the structure
        const data = await this.api.get<RawCurrentRundown>("/data/rundowns/current");
        return new CurrentRundown(data);
    }

    async resetCustomFields(field: CustomFields, eventID: string): Promise<SuccessOrError> {
        const data = await this.api.get(`/api/change/${eventID}?custom:${CustomFields[field]}=-`);
        return new SuccessOrError(data);
    }

    async setCustomField(field: CustomFields, eventID: string, value: string): Promise<SuccessOrError> {
        const fieldName = CustomFields[field];
        const data = await this.api.get(`/api/change/${eventID}?custom:${fieldName}=${encodeURIComponent(value)}`);
        return new SuccessOrError(data);
    }

    async setSceneAssignmentsForEvent(eventID: string, assignments: SceneAssignment[]): Promise<SuccessOrError> {
        const CharacterAndMics: string[] = [];
        const Actors: string[] = [];
        const Characters: string[] = [];

        assignments.forEach(assignment => {
            CharacterAndMics.push(`${assignment.actorName} (Mic ${assignment.micNumber})`);
            Actors.push(assignment.actorName);
            Characters.push(assignment.actorRole);
        });

        const charAndMicsJson = JSON.stringify(CharacterAndMics);

        const actorsList = Actors.join(", ");
        const charactersList = Characters.join(", ");

        const results: SuccessOrError[] = [];
        results.push(await this.setCustomField(CustomFields.Character_And_Mics, eventID, charAndMicsJson));
        results.push(await this.setCustomField(CustomFields.Actors, eventID, actorsList));
        results.push(await this.setCustomField(CustomFields.Characters, eventID, charactersList));

        // Check if all were successful
        const allSuccess = results.every(result => result.isSuccess());
        if (allSuccess) {
            return new SuccessOrError({ payload: "success" });
        } else {
            return new SuccessOrError({ payload: "one or more updates failed" });
        }
    }
}
