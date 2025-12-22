import { EndAction, TimerType, TimeStrategy, OnTimeCustomFields } from "./SuportingModels.js";

export class OnTimeEvent {
  readonly id: string;
  readonly type = "event";

  flag: boolean;
  title: string;

  timeStart: number;
  timeEnd: number;
  duration: number;

  timeStrategy: TimeStrategy;
  linkStart: boolean;

  endAction: EndAction;
  timerType: TimerType;
  countToEnd: boolean;

  skip: boolean;
  note: string;
  colour: string;

  delay: number;
  dayOffset: number;
  gap: number;

  cue: string;
  parent: string;

  revision: number;

  timeWarning: number;
  timeDanger: number;

  custom: OnTimeCustomFields;
  triggers: unknown[];

  constructor(data: Partial<OnTimeEvent> & { id: string }) {
    this.id = data.id;

    this.flag = data.flag ?? false;
    this.title = data.title ?? "";

    this.timeStart = data.timeStart ?? 0;
    this.timeEnd = data.timeEnd ?? 0;
    this.duration = data.duration ?? 0;

    this.timeStrategy = data.timeStrategy ?? "lock-duration";
    this.linkStart = data.linkStart ?? true;

    this.endAction = data.endAction ?? "none";
    this.timerType = data.timerType ?? "count-down";
    this.countToEnd = data.countToEnd ?? false;

    this.skip = data.skip ?? false;
    this.note = data.note ?? "";
    this.colour = data.colour ?? "";

    this.delay = data.delay ?? 0;
    this.dayOffset = data.dayOffset ?? 0;
    this.gap = data.gap ?? 0;

    this.cue = data.cue ?? "";
    this.parent = data.parent ?? "";

    this.revision = data.revision ?? 0;

    this.timeWarning = data.timeWarning ?? 0;
    this.timeDanger = data.timeDanger ?? 0;

    this.custom = data.custom ?? {};
    this.triggers = data.triggers ?? [];
  }

  /** Derived helpers */

  get isCountDown(): boolean {
    return this.timerType === "count-down";
  }

  get totalDuration(): number {
    return this.duration || this.timeEnd - this.timeStart;
  }

  get hasWarnings(): boolean {
    return this.timeWarning > 0 || this.timeDanger > 0;
  }
}
