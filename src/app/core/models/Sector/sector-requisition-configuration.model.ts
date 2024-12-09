import { SectorCandidateEvaluationItem } from './sector-candidate-evaluation-items.model';
import { SectorAssignmentType } from './sector-assignment-types.model';
import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { IRequisitionConfigFM } from '@xrm-master/sector/add-edit/requisition-configurations/utils/helper';

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
export class SectorRequisitionConfiguration extends CommonSection {
	LiFillRateWeekAhead: nullableNumber;
	IsExtendedWorkLocationAddress: boolean;
	IsSecurityClearance: boolean;
	BroadCastInterval: nullableNumber;
	QuestionBankRequired: boolean;
	IsRateExceptionAllowed: boolean;
	QuestionToBeAnsweredBy: nullableString;
	QuestionToBeAnsweredByName: nullableString;
	QuestionBankLabel: nullableString;
	MaskSubmittedMarkUpAndWageRate: boolean;
	SatisfactionSurveyForClosedReq: boolean;
	DisplayCanSupplierContactQusInReq: boolean;
	RestrictReqToOnePos: boolean;
	IsPositionDetailsEditable: boolean;
	IsSystemRankingFunctionality: boolean;
	IsSystemCandidateRankingMandatory: boolean;
	EnableManagerScoring: boolean;
	IsManagerScoringMandatory: boolean;
	SectorCandidateEvaluationItems: SectorCandidateEvaluationItem[];
	SectorAssignmentTypes: SectorAssignmentType[];

	constructor(init?: Partial<ɵTypedOrUntyped<IRequisitionConfigFM, ɵFormGroupRawValue<IRequisitionConfigFM>, any>>) {
		super();
		if(init?.QuestionBankRequired){
			this.QuestionToBeAnsweredBy = init.QuestionToBeAnsweredBy?.Value;
			this.QuestionToBeAnsweredByName = init.QuestionToBeAnsweredBy?.Text;
		}
		Object.assign(this, init);
	}
}
