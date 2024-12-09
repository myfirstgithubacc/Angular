
export enum WeekDays {
        Mon = 1,
        Tue = 2,
        Wed = 3,
        Thu = 4,
        Fri = 5,
        Sat = 6,
        Sun = 7
    }

export interface SelectedEvent {
        UKey: string;
        Id: number;
        AssignmentId: string;
        EventConfigId: number;
        EventReasonId: number;
        EventCode: string;
        EventName: string;
        EventReasonName: string;
        FromDate: string;
        ToDate: string;
        BackfillRequired: string;
        BackfillStartDate: string | null;
        BackfillEndDate: string | null;
        BroadcastFrom: string | null;
        Comment: string;
        RequestId: string | null;
        HasEmailNotificationRequired: boolean;
        EventNotificationToBeSentOn: string | null;
        HasEventNotificationSent: boolean;
        Disabled: boolean;
        Status: string | null;
        CreatedBy: string;
        CreatedOn: string;
        SectorName: string;
        IsBackFillRequired: boolean;
        staffingAgencies: string | null;
      }
export interface ShiftDetailsGetDto {
            AssignmentStartDate: Date;
            AssignmentEndDate: Date;
            ShiftId: number;
            ShiftName: string;
            StartTime: string;
            EndTime: string;
            Sun: boolean;
            Mon: boolean;
            Tue: boolean;
            Wed: boolean;
            Thu: boolean;
            Fri: boolean;
            Sat: boolean;
            CLPWorkingDays: string | null;
          }

export interface ScheduleDate {
            TypeName: string;
            TypeId: number;
            RecordId: number;
            Name: string;
            ColorCode: string;
            ScheduleDate: Date;
            ScheduleStatus: string;
            ScheduleReason: string | null;
            start? : Date;
            end? :Date;
            title? : string;
            id? : number;
            roomId? :number;
          }


export interface ScheduleData {
            AssignmentId: number;
            AssignmentStartDate: string;
            AssignmentEndDate: string;
            WeekendingDayId: number;
            WeeklyOffDaysId: string[];
            ShiftDetailsGetDto: ShiftDetailsGetDto;
            ScheduleDates: ScheduleDate[];
          }
export interface DataItem {
            TypeName: string;
            TypeId: number;
            RecordId: number;
            Name: string;
            ColorCode: string;
            ScheduleDate: string;
            ScheduleStatus: string;
            ScheduleReason: string | null;
            start: string;
            end: string;
            title: string;
            id: number;
            roomId: number;
          }

export interface SelectedData {
            id: number;
            start: Date;
            end: Date;
            title: string;
            dataItem: DataItem;
            roomId: number;
           }
export type EventInput = SelectedData | number;

export interface PreventEvent {
  start: Date;
  preventDefault?: () => void;
}

export interface INavigation {
  prevent?:boolean;
  action:{type:string};
  sender:any;
  preventDefault?: () => void;
}

export interface IEventResponse {
  dateRange: { start: Date; end: Date; shortText: string; text: string };
  selectedDate: Date;
  sender:any;
  }
export interface SlotClassArgs {
    start?: Date;
    end?: Date;
}
export interface ResourceItem {
    data: { value: number, color: string }[];
    field: string;
    valueField: string;
    textField: string;
    colorField: string;
}
