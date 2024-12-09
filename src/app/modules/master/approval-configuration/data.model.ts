import { SafeResourceUrl } from "@angular/platform-browser";
import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export class DataModel extends ToJson{
	WorkFlowType: number;

	ApprovalProcessName: string;

	Comments: string;

	ApprovalRequiredId: number;

	IsAllSectorApplicable: boolean;

	IsAllLocationApplicable: boolean;

	IsAllLaborCategoryApplicable: boolean;

	IsAllOrgLevel1Applicable: boolean;

	IsAllReasonForRequestApplicable: boolean;

	Sectors: Sectors[];

	Location: Location[];

	LaborCategories: LaborCategories[];

	OrgLevel1: OrgLevel1[];

	ReasonForRequest: ReasonForRequest[];

	ApprovalConfigurationDetails: any;

	Workflow: any;

	AprrovalReq: any;

	approvalConfigUkey:any;

	UKey:string;

	approvalConfigId:string;

	ReasonForChange: string;

	constructor(init?: Partial<DataModel>) {
		super();
		Object.assign(this, init);
	}
}

class Sectors {
	id: magicNumber.zero;

	itemId: number;
}

class Location {
	id: magicNumber.zero;

	itemId: number;
}

class LaborCategories {
	id: magicNumber.zero;

	itemId: number;
}

class OrgLevel1 {
	id: magicNumber.zero;

	itemId: number;
}

class ReasonForRequest {
	id: magicNumber.zero;

	itemId: number;
}

class ApprovalConfiguration {
	ApprovedBy:any;

	ApproverTypeId: number;

	ApproverTypeName: string;

	ApproverLabel: string;

	Condition: string;
	ExceptionApprovalRequired: boolean;
	ExceptionPercentage: number;
	FundingBasedRequired: boolean;
	FundingMinLimit: number;
	MultipleApproverRequired: boolean;

	OrgLevel1BasedRequired: boolean;

	ConditionValue: number;

	ShowApproverScreenRequired: boolean;

	rolesDetail: any;
	// RoleId: number;
	UserTypId: number;
	Userid: number;
}
