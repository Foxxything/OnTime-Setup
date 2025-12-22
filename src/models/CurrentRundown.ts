import { OnTimeEvent } from "./OnTimeEvent";

export type RundownEntry = OnTimeEvent | RundownGroup;

export interface RundownGroup {
  id: string;
  type: "group";
  title: string;
  note: string;
  entries: string[]; // IDs of entries
  targetDuration: number | null;
  colour: string;
  revision: number;
  timeStart: number;
  timeEnd: number;
  duration: number;
  isFirstLinked?: boolean;
  custom?: Record<string, unknown>;
}

// Raw types matching the API response
export interface RawRundownEntry {
  type: "event" | "group";
  id: string;
  [key: string]: any; // allow other fields
}

export interface RawCurrentRundown {
  id: string;
  title: string;
  order: string[];
  flatOrder: string[];
  revision: number;
  entries: Record<string, RawRundownEntry>;
}

export class CurrentRundown {
  id: string;
  title: string;
  order: string[];
  flatOrder: string[];
  entries: Map<string, RundownEntry>;
  revision: number;

  constructor(data: RawCurrentRundown) {
    this.id = data.id;
    this.title = data.title;
    this.order = data.order;
    this.flatOrder = data.flatOrder;
    this.revision = data.revision;

    this.entries = new Map();

    for (const [key, value] of Object.entries(data.entries) as [string, RawRundownEntry][]) {
      if (value.type === "event") {
        // Cast as any because OnTimeEvent constructor expects a stricter shape
        this.entries.set(key, new OnTimeEvent(value as any));
      } else if (value.type === "group") {
        this.entries.set(key, value as RundownGroup);
      }
    }
  }

  /** Get entry by ID */
  getEntry(id: string): RundownEntry | undefined {
    return this.entries.get(id);
  }

  /** Get all events in flat order */
  getEventsInOrder(): OnTimeEvent[] {
    return this.flatOrder
      .map(id => this.entries.get(id))
      .filter((e): e is OnTimeEvent => e !== undefined && e.type === "event");
  }

  /** Get all groups */
  getGroups(): RundownGroup[] {
    return Array.from(this.entries.values()).filter(
      (e): e is RundownGroup => e.type === "group"
    );
  }

  /** Get all events under a specific group */
  getEventsByParent(parentId: string): OnTimeEvent[] {
    return this.getEventsInOrder().filter(e => e.parent === parentId);
  }
}
