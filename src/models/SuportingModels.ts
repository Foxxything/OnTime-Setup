export type TimeStrategy = "lock-duration" | "lock-start" | "lock-end";
export type TimerType = "count-down" | "count-up";
export type EndAction = "none" | "stop" | "next";

export interface OnTimeCustomFields {
    Character_And_Mics?: string;
    Characters?: string;
    Actors?: string;
    [key: string]: string | undefined;
}

export class SuccessOrError {
    payload?: string;

    constructor(data: any) {
        this.payload = data.payload;
    }

    isSuccess(): boolean {
        return this.payload === "success";
    }

    toString(): string {
        return this.isSuccess() ? "Success" : `Error: ${this.payload}`;
    }
}
