import { ToJson } from './responseTypes/to-json.model';


type nullableDate = Date | null;

export class Job extends ToJson{
	Code: string;
	Disabled: boolean;
	GatewayUrl: string;
	JobClientMappingId: number;
	JobClientMappingUkey: string;
	JobDetails: string;
	JobId: number;
	JobName: string;
	JobUkey: string;
	Status: string;
	Triggers: string;
	JobScheduleUkey: string;
	JobStartDate: nullableDate;
	JobEndDate: nullableDate;
	JobStartTime: string;
	JobIntervalType: string;
	DaysInterval: string;
	LastJobRunDate: nullableDate;
	LastJobRunTime: string | null;
	NextJobRunDate: nullableDate;
	NextJobRunTime: string | null;
	Disable: boolean;
	CreatedBy: string;
	CreatedOn: Date;
	LastModifiedBy: string | null;
	LastModifiedOn: nullableDate;
	JobInterval: string;
	Ukey: string;
	Id: number;
	ClientScheduleUkey: string;
	IsEmailRequired: boolean;
	SuccessEmail: string;
	ExceptionEmail: string;
	Schedules: any;
	ClientMappingUkey: string;

	constructor(init?: Partial<Job>) {
		super();
		Object.assign(this, init);
	}
}

export interface JobScheduleMapping {
  clientMappingUkey: string;
  successEmailIds: string;
  exceptionEmailIds: string;
  isEmailRequired: boolean;
  jobId: number;
  jobMappingAndSchedule: JobScheduleDetails[];
}

interface JobScheduleDetails {
  daysInterval: number;
  jobStartDate: Date;
  jobEndDate: Date;
  jobIntervalType: string;
  jobStartTime: string;
  jobInterval: string | null;
  jobScheduleUkey: string | null;
}

export interface JobStatus {
	NotScheduledActive : "Not Scheduled Active",
	NotScheduledInactive : "Not Scheduled InActive",
	SingleTriggerDefinedActive : "Single Trigger Defined Active",
	SingleTriggerDefinedInactive : "Single Trigger Defined InActive",
	MultipleTriggersDefinedActive : "Multiple Triggers Defined Active",
	MultipleTriggersDefinedInactive : "Multiple Triggers Defined InActive"
  }

export interface ExecutionDetails {
	ExecutedOn: string;
	ExecutedTime: string;
	Status: string;
  }
export interface ScheduleDisbaled {
	disabled: boolean;
	reasonForChange: string;
	uKey: string;
  }

export interface Schedule {
	JobInterval?: string;
  JobStartDate?: Date;
  JobEndDate?: Date;
	exceptionEmailIds?: string;
	successEmailIds?: string;
	_ClientScheduleUkey?: any;
	ClientScheduleUkey?: string;
	Disabled?: string;
	SchedulingType?: string;
	StartDate?: string;
	EndDate?: string;
	ScheduledTime?: string;
	IntervalDay?: any;
	DayInterval?: number;
	ScheduledOn?: any;
	Status?: string;
	_Disabled?: boolean | string;

  }

export interface DropdownModel {
    Text: string | number,
    Value: string | number,
    IsLocalizedKey?: boolean
}

export interface TriggerDetailsColumnOption {
    XrmGridPersistentMasterId: number;
    ColumnName: string;
    ColumnHeader: string;
    SelectedByDefault: boolean;
    fieldName: string;
    columnHeader: string;
    visibleByDefault: boolean;
    IsReadOnly: boolean;
    DefaultColumnSequence: number;
    Dir: string | undefined;
    ValueType: string | null;
    EntityType: string | null;
    MapFromProperty: string | null;
    IsLocalizedKey: boolean;
    ColumnWidth: number | null;
    DecimalPlaces: number;
    Viewable: boolean;
    MaskingAllowed: boolean;
    TypeOfMasking: string | null;
    MaskingCount: number | null;
    ControlType: string | null;
    IsValueCommaSeparated: boolean;
    GroupName: string | null;
    MenuId: number | null;
    DynamicParam: string | null;
    ApplicableForAdvanceSearch?: boolean;
}

interface JobIntervalInfo {
  Day1: boolean;
  Day2: boolean;
  Day3: boolean;
  Day4: boolean;
  Day5: boolean;
  Day6: boolean;
  Day7: boolean;
  Day8: boolean;
  Day9: boolean;
  Day10: boolean;
  Day11: boolean;
  Day12: boolean;
  Day13: boolean;
  Day14: boolean;
  Day15: boolean;
  Day16: boolean;
  Day17: boolean;
  Day18: boolean;
  Day19: boolean;
  Day20: boolean;
  Day21: boolean;
  Day22: boolean;
  Day23: boolean;
  Day24: boolean;
  Day25: boolean;
  Day26: boolean;
  Day27: boolean;
  Day28: boolean;
  Day29: boolean;
  Day30: boolean;
  Day31: boolean;
  Fri: boolean;
  LastDayOfMonth: boolean;
  Mon: boolean;
  Sat: boolean;
  Sun: boolean;
  Thu: boolean;
  Tue: boolean;
  Wed: boolean;
  Ukey: string;
}

export interface JobData {
  isEmailReq: boolean;
  DaysInterval: number;
  ExceptionEmailIds?: string;
  IsEmailRequired: boolean;
  JobClientMappingId: number;
  JobClientScheduledUkey: string;
  JobEndDate: string | Date;
  JobIntervalInfo: JobIntervalInfo[];
  JobIntervalType: string;
  JobStartDate: string | Date;
  JobStartTime: string | Date;
  SuccessEmailIds?: string;
}

export interface JobSchedule {
    daysInterval: number | null;
    exceptionEmail: string;
    jobEndDate: Date;
    jobInterval: Record<string, boolean>;
    jobIntervalType: string;
    value: number;
    jobStartDate: Date | string;
    jobStartTime: Date;
    scheduledOn: Date | null;
    scheduledTime: Date | null;
    successEmail: string;
    isEmailReq: boolean;
}
