export class Actors {
    private readonly id: number;
    private readonly name: string;
    private readonly role: string;

    constructor(id: number, name: string, role: string) {
        this.id = id;
        this.name = name;
        this.role = role;
    }

    getId(): number {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    getRole(): string {
        return this.role;
    }

    toString(): string {
        return `Actor [ID: ${this.id}, Name: ${this.name}, Role: ${this.role}]`;
    }
}

export class Event{
    private readonly id: string;
    private readonly name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    getId(): string {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    toString(): string {
        return `Event [ID: ${this.id}, Name: ${this.name}]`;
    }
}

export class ActorsInEvents{
    private readonly eventId: string;
    private readonly actorId: number;
    private mic: number;

    constructor(eventId: string, actorId: number, mic: number) {
        this.eventId = eventId;
        this.actorId = actorId;
        this.mic = mic;
    }

    getEventId(): string {
        return this.eventId;
    }
    getActorId(): number {
        return this.actorId;
    }
    getMic(): number {
        return this.mic;
    }
    setMic(mic: number): void {
        this.mic = mic;
    }
}