import { ToJson } from "./responseTypes/to-json.model";


export class EventConfiguration extends ToJson {


	UKey:string;
	SectorId: number;
	EventName: string;
	DateTypeId: number;
	RequiresEventReason: boolean;
	RequiresComment: boolean;
	RequiresBackfill: boolean;
	BackfillDefaultValue: boolean;
	EffectOnDailyScheduleId: number;
	ManagerSurveyToRequested: boolean;
	EventEnteredBy: string;
	NotifyTo: string;
	DelayNotificationBeforeEvent: boolean;
	DaysPriorToEventDate: number;
	ValidateEventDateWithTimesheet: boolean;
	IsProfessionalContractor: boolean;
	IsLightIndustrialContractor: boolean;
	Disabled: boolean;
	LastModifiedBy: string;
	LastModifiedOn: Date;
	ReasonForChange: string;
	onDelayNotificationEventChange?:boolean;
	Ukey?: string;


	constructor(init?: Partial<EventConfiguration>) {
		super();
		Object.assign(this, init);
	}
}
export class ApiResponseBase {
	StatusCode?: number;
	Message?:string;
	Succeeded?:boolean;
	ValidationMessages?:string[];
}
export class ApiResponse extends ApiResponseBase{
	Data?:any;
	candidateDeclineReason?: {
        message: string;
    };
}
