import { GetMealBreakResponse } from "../../time-adjustment/adjustment-interface";
import { TimeEntryAddEdit } from "../add-edit/time-entry-add-edit";

export interface TimeEntryDetail {
    ApproverName: string | null;
    CostAccountingCodeId: number;
    CostAccountingCodeName: string;
    Friday: number;
    HoursTypeId: number;
    HoursTypeName: string;
    Id: number;
    InlineViewDisabled: boolean;
    JobTitle: string;
    Monday: number;
    MondayDisable: boolean;
    PreFriday: number;
    Saturday: number;
    ShiftId: number;
    ShiftName: string;
    StatusId: number;
    StatusName: string;
    Sunday: number;
    SundayDisable: boolean;
    Thursday: number;
    TotalHour: number;
    Tuesday: number;
    Wednesday: number;
  }

export interface ITimeUkeyData {
    Data: TimeEntryAddEdit;
    StatusCode: number;
    Succeeded: boolean;
    Message: string;
  }

export interface TimeEntryUkeyResponse {
    getMealBreak: GetMealBreakResponse;
    getTimeByUkey: ITimeUkeyData;
  }
