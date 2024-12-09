import { Time } from "@angular/common";

export interface IDayInfo {
    isSelected: boolean;
    day: string;
  }

  export interface ISelectedTime {
    startTime: Date| Time | null | string;
     endTime: Date | Time | null | string;
  }
