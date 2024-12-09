import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
import { SectorClpSurveyPerformanceFactor } from './sector-clp-survey-performance-factors';
import { SectorRequisitionSurveyPerformanceFactor } from './sector-requisition-survey-performance-factors';
import { SectorRequisitionSurveyScale } from './sector-requisition-survey-scales';
import { SectorClpSurveyScale } from './sector-survey-scales.model';
import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { IPerformanceSurveyConfigFM } from '@xrm-master/sector/add-edit/performance-survey-configurations/utils/helper';

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
export class SectorPerformanceSurveyConfiguration extends CommonSection {
	Id: number;
	IsAvgSurveyScoreAllowForComment: boolean;
	AvgSurveyScore: nullableNumber;
	SurveyForClosedReq: boolean;
	SurveyAllowedForAssignment: boolean;
	AfterAssignmentEndDate: boolean;
	NoOfDaysAfterAssignmentStart: boolean;
	NoOfDaysAfterStartDateLevels: number[] | null|{'Days': number | null}[];
	ScheduleThroughoutLengthOfAssignment: boolean;
	LengthOfAssignment: nullableNumber;
	LengthOfAssignmentType: nullableString;
	LengthOfAssignmentTypeName: nullableString;
	CanSurveyAnyTime: boolean;
	QuestionLabel: nullableString;
	DisplayQuestion: boolean;
	DisplayNoThanks: boolean;
	SectorClpSurveyScales: SectorClpSurveyScale[];
	SectorRequisitionSurveyScales: SectorRequisitionSurveyScale[] | null;
	SectorRequisitionSurveyPerformanceFactors: SectorRequisitionSurveyPerformanceFactor[] | null;
	SectorClpSurveyPerformanceFactors: SectorClpSurveyPerformanceFactor[];

	constructor(init?: Partial<ɵTypedOrUntyped<IPerformanceSurveyConfigFM, ɵFormGroupRawValue<IPerformanceSurveyConfigFM>, any>>) {
		super();
		if(init?.SurveyAllowedForAssignment && init.ScheduleThroughoutLengthOfAssignment) {
			this.LengthOfAssignmentType = init.LengthOfAssignmentType?.Value ?? '';
			this.LengthOfAssignmentTypeName = init.LengthOfAssignmentType?.Text ?? '';
		}
		Object.assign(this, init);
	}
}
