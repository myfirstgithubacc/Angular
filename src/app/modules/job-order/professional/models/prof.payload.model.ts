import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export function mapFormToApiPayload(formValue: any) {
	return {
		UKey: formValue.UKey,
		StatusId: formValue.StatusId,
		RequestDetail: mapRequestDetail(formValue.requestDetails),
		PositionDetail: mapPositionDetail(formValue.positionDetails),
		ProfPsrCandidateDetails: mapCandidateDetails(formValue.candidateDetails),
		AssignmentRequirement: mapAssignmentRequirement(formValue.assignmentRequirement),
		...(formValue.assignmentRequirement.ShiftId !== null && {
			ShiftRequirement: mapShiftRequirement(formValue.assignmentRequirement)
		}),
		RateDetail: mapRateDetail(formValue.rateDetails),
		RequestComment: mapRequestComment(formValue.requestComments),
		dmsFieldRecords: formValue.dmsFieldRecords,
		udfFieldRecords: formValue.udfFieldRecords,
		approvalDetails: formValue.approvalDetails,
		BenefitAddDto: formValue.BenefitAddDto
	};
}

function mapRequestDetail(requestDetails: any) {
	return {
		IsPreIdentifiedRequest: requestDetails.IsPreIdentifiedRequest,
		SectorId: extractNumericValueOrNull(requestDetails.SectorId),
		WorkLocationId: extractNumericValueOrNull(requestDetails.WorkLocationId),
		RequestingManagerId: extractNumericValueOrNull(requestDetails.RequestingManagerId),
		OrgLevel1Id: extractNumericValueOrNull(requestDetails.OrgLevel1Id),
		OrgLevel2Id: extractNumericValueOrNull(requestDetails.OrgLevel2Id),
		OrgLevel3Id: extractNumericValueOrNull(requestDetails.OrgLevel3Id),
		OrgLevel4Id: extractNumericValueOrNull(requestDetails.OrgLevel4Id),
		CostAccountingId: extractNumericValueOrNull(requestDetails.CostAccountingId),
		ReasonForRequestId: extractNumericValueOrNull(requestDetails.ReasonForRequestId),
		SubmittalAllowedPerStaffing: toNumberOrNull(requestDetails.SubmittalAllowedPerStaffing),
		SubmittalAllowedForThisRequest: toNumberOrNull(requestDetails.SubmittalAllowedForThisRequest),
		isAllowStaffingToContact: requestDetails.IsAllowStaffingToContact
	};
}

function mapPositionDetail(positionDetails: any) {
	return {
		PositionTitle: positionDetails.PositionTitle,
		jobCategoryId: extractNumericValueOrNull(positionDetails.JobCategoryId),
		laborCategoryId: extractNumericValueOrNull(positionDetails.LaborCategoryId),
		ReqLibraryId: positionDetails.ReqLibraryId,
		AssignmentTypeId: extractNumericValueOrNull(positionDetails.AssignmentTypeId),
		SecurityClearanceId: extractNumericValueOrNull(positionDetails.SecurityClearanceId),
		MinimumClearanceToStartId: extractNumericValueOrNull(positionDetails.MinimumClearanceToStartId)
	};
}

function mapCandidateDetails(candidateDetails: any) {
	return {
		FirstName: candidateDetails.FirstName,
		MiddleName: candidateDetails.MiddleName,
		LastName: candidateDetails.LastName,
		Email: candidateDetails.Email,
		PhoneNumber: candidateDetails.PhoneNumber,
		PhoneExt: candidateDetails.PhoneExt
	};
}

function mapAssignmentRequirement(assignmentRequirement: any) {
	return {
		TargetStartDate: assignmentRequirement.TargetStartDate,
		TargetEndDate: assignmentRequirement.TargetEndDate,
		PositionNeeded: toNumberOrNull(assignmentRequirement.PositionNeeded),
		IsDrugTestRequired: assignmentRequirement.IsDrugTestRequired,
		IsBackgrounCheckRequired: assignmentRequirement.IsBackgrounCheckRequired,
		PositionDescription: assignmentRequirement.PositionDescription,
		SkillsRequired: assignmentRequirement.SkillsRequired,
		SkillsPreferred: assignmentRequirement.SkillsPreferred,
		ExperienceRequired: assignmentRequirement.ExperienceRequired,
		ExperiencePreferred: assignmentRequirement.ExperiencePreferred,
		EducationRequired: assignmentRequirement.EducationRequired,
		EducationPreferred: assignmentRequirement.EducationPreferred,
		AdditionalInformation: assignmentRequirement.AdditionalInformation
	};
}

function mapShiftRequirement(assignmentRequirement: any) {
	return {
		ShiftId: extractNumericValueOrNull(assignmentRequirement.ShiftId),
		sun: assignmentRequirement.Sun,
		mon: assignmentRequirement.Mon,
		tue: assignmentRequirement.Tue,
		wed: assignmentRequirement.Wed,
		thu: assignmentRequirement.Thu,
		fri: assignmentRequirement.Fri,
		sat: assignmentRequirement.Sat,
		StartTime: assignmentRequirement.StartTime,
		EndTime: assignmentRequirement.EndTime
	};
}

function mapRateDetail(rateDetails: any) {
	return {
		BaseWageRate: rateDetails.BaseWageRate || magicNumber.zero,
		rateUnitId: rateDetails.RateUnitId,
		NteBillRate: toNumberOrNull(rateDetails.NteBillRate),
		NewNteBillRate: toNumberOrNull(rateDetails.NewNteBillRate),
		DeltaCost: rateDetails.DeltaCost,
		ReasonForException: rateDetails.ReasonForException,
		hourDistributionRuleId: extractNumericValueOrNull(rateDetails.HourDistributionRuleId),
		EstimatedRegularHoursPerWeek: rateDetails.EstimatedRegularHoursPerWeek || magicNumber.zero,
		IsOtExpected: rateDetails.IsOtExpected,
		OthoursBilledAt: rateDetails.OthoursBilledAt,
		EstimatedOtHoursPerWeek: toNumberOrNull(rateDetails.EstimatedOtHoursPerWeek),
		BudgetedHours: toNumberOrNull(rateDetails.BudgetedHours),
		EstimatedCost: rateDetails.EstimatedCost
	};
}

function mapRequestComment(requestComments: any) {
	return {
		ClientComments: requestComments.ClientComments,
		ClientCommentsToStaffingAgency: requestComments.ClientCommentsToStaffingAgency
	};
}

function extractNumericValueOrNull(field: any): number | null {
	return field?.Value
		? Number(field.Value)
		: null;
}


function toNumberOrNull(field: any): number | null {
	return field
		? Number(field)
		: null;
}
