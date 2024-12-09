export class SectorSubmit {
	BasicDetail:
		{
			sectorName: string;
			addressLine1: string;
			addressLine2: string;
			countryId: number;
			city: string;
			StateCode: string;
			postalCode: number;
			HomeLanguageCode: string;
			passwordExpiryPeriod: number;
			initialGoLiveDate: Date;
			weekEndingDayId: number;
			timeZoneId: number;
			isLimitAvailableWeekendingInTimeCapture: boolean;
			noOfPastWeekeding: number;
		};

	ShiftConfiguration:
		{
			shiftTimeMandatoryForProfessional: boolean;
			shiftTimeMandatoryForLi: boolean;
			shiftdifferentialMethod: string;
		};

	submittalConfiguration:
		{
			labelName: string;
			toolTip: string;
			maxLength: number;
			isNumeric: boolean;
			isPartialEntry: boolean;
			rightmostChars: number;
			nonW2ClpAccepted: boolean;
			isSubmittalReminderToManager: boolean;
			submittalReminderInterval: number;
			submittalReminderToStaffingForNotOfferAccepting: boolean;
			submittalReminderIntervalToStaffing: number;
			allowSupplierToSubmitExistingClps: boolean;
		};

	BenefitAdderConfiguration:
		{
			isBenefitAdder: boolean;
			sectorBenefitAdders: [
				{
					label: string;
				}
			]
		};

	PricingModelConfiguration:
		{
			costEstimationType: string;
			mspFeeType: string;
			pricingModel: string;
			markUpType: string;
			billRateValidation: string;
			clientPaysStaffingAgencyDirectly: boolean;
			isOtEligibilityVisible: boolean;
		};

	RatesAndFeesConfiguration:
		{
			otRateType: string;
			stBillOrStWage: number;
			otWageMultiplier: number;
			dtWageMultiplier: number;
			otBillMultiplier: number;
			dtBillMultiplier: number;
			recruitedLiMspFee: number;
			payrolledMspFee: number;
			vendorFeeMultiplier: number;
			recruitedAdminFee: number;
			payrolledAdminFee: number;
			standardRecruitedMarkup: number;
			maskOtFieldsInSystem: boolean;
		};

	TimeAndExpenseConfiguration:
		{
			isClpJobRotationAllowed: boolean;
			isAllowedClpToAddCharge: boolean;
			timeUploadAsApprovedHours: boolean;
			isAutoApprovedAdjustment: boolean;
			isAllTimeAdjustmentApprovalRequired: boolean;
			allowTimeUploadWithStOtDt: boolean;
			regularStHours: number;
			validateApprovedAmountWithTimeRecords: boolean;
			allowStaffingAgencyInTandEApproval: boolean;
			isPoSentToPm: boolean;
			isPoSentToPoOwner: boolean;
			poType: string;
			defaultPoForRecruitment: string;
			defaultPoForPayroll: string;
			noConsecutiveWeekMissingEntry: number;
			defaultPoDepletionForNewLocations: number;
		};

	AssignmentExtensionAndOtherConfiguration:
		{
			allowProcessExtensionAdjustment: boolean;
			extRateIncreaseAllowed: boolean;
			extUserGroupId: string;
			allowSelectionPayRateFillLiRequest: boolean;
			changeRateWithoutEffectiveDate: boolean;
			isResumeUploadMandatoryInPSR: boolean;
			isTrainingRequired: boolean;
			offBoardInterval: number;
			offBoardIntervalLi: number;
			allowMspAdjustSupplierMarkupInPsr: boolean;
		};

	TenureConfiguration:
		{
			tenurePolicyApplicable: boolean;
			isTenureAllowRenewedAfterResetPeriod: boolean;
			tenureLimitType: number;
			reqTenureLimit: number;
			extTenureLimit: number;
			clpTenureLimit: number;
			tenureResetPeriod: number;
		};

	RequisitionConfiguration:
		{
			liFillRateWeekAhead: number;
			isExtendedWorkLocationAddress: boolean;
			isSecurityClearance: boolean;
			broadCastInterval: number;
			questionBankRequired: boolean;
			isRateExceptionAllowed: boolean;
			questionToBeAnsweredBy: string;
			questionBankLabel: string;
			maskSubmittedMarkUpAndWageRate: boolean;
			isDrugScreenItemEditable: boolean;
			isBackGroundItemEditable: boolean;
			satisfactionSurveyForClosedReq: boolean;
			displayCanSupplierContactQusInReq: boolean;
			restrictReqToOnePos: boolean;
			isPositionDetailsEditable: boolean;
			isSystemRankingFunctionality: boolean;
			isSystemCandidateRankingMandatory: boolean;
			enableManagerScoring: boolean;
			isManagerScoringMandatory: boolean;
			sectorCandidateEvaluationItems:
			[
				{
					evaluationRequirementId: number;
					description: string;
					displayOrder: number;
				}
			]

			sectorAssignmentTypes:
			[
				{
					assignmentName: string;
					displayOrder: number;
				}
			]
		};

	ConfigureMspProcessActivity:
		{
			isSkipProcessReqByMsp: boolean;
			isSkipProcessSubByMsp: boolean;
			isSkipLIRequestProcessByMsp: boolean;
			isAutoBroadcastForLiRequest: boolean;
			hideNteRatefromCopyReqLib: boolean;
		};

	RfxConfiguration:
		{
			isProcessSowbyMsp: boolean;
			icMspFeePercentage: number;
			defaultPoForSowIc: string;
			poTypeSowIc: string;
			sowMspFeePercentage: number;
			sowAdminFee: number;
			isReqLibraryUsedforTmSow: boolean;
			isSkipProcessRfxSubmittal: boolean;
			isSowAmountLimitRequired: boolean;
			sowAmountLimit: number;
			sectorRfxStandardFields:
			[
				{
					rfxLabelId: number;
					displayName: string;
				}
			]

			sectorSowCommodityTypes:
			[
				{
					sowCommodityConfigId: number;
					commodityTypeName: string;
					currentCommodityTypeName: string;
				}
			]
		};

	ChargeNumberConfiguration:
		{
			isChargeEnteredManually: boolean;
			isMultipleTimeApprovalNeeded: boolean;
			hasChargeEffectiveDate: boolean;
			isChargeInReqPsr: boolean;
			sectorCostCenterConfigs:
			[
				{
					segmentName: string;
					segmentMaxLength: number;
					segmentMinLength: number;
				}
			]
		};

	XrmTimeClock:
		{
			isXrmTimeClockRequired: boolean;
			isDailyPunchApprovalNeeded: boolean;
			isAutoLunchDeduction: boolean;
			isAllowManagerAdjustPunchInOut: boolean;
			minimumHourWorkedBeforeLunchDeduction: number;
			lunchTimeDeducted: number;
			isPunchRoundingNeeded: boolean;
			accrueHoursFromActualPunchIn: boolean;
			punchInTimeRounding: string;
			punchOutTimeRounding: string;
			punchInTimeIncrementRounding: number;
			punchOutTimeIncrementRounding: number;
			xrmUseEmployeeIdTimeClockId: string;
			clockBufferForReportingDate: Date;
			clockBufferForShiftStart: Date;
			effectiveDateForLunchConfiguration: Date;
		};

	EmailApprovalConfiguration:
		{
			isQuickLinkToApprovalEmails: boolean;
		};

	OrgLevelConfigs:
		[
			{
				orgName: string;
				orgType: number;
			}
		];

	BackgroundCheck:
		{
			Id: number,
			allowToFillCandidateWithPendingCompliance: boolean;
			allowAttachPreEmploymentDocToClientEmail: boolean;
			isDrugResultVisible: boolean;
			defaultDrugResultValue: boolean;
			isBackGroundCheckVisible: boolean;
			defaultBackGroundCheckValue: boolean;
			sectorBackgrounds:
			[
				{
					type: string;
					complianceFieldName: string;
					complianceItemLabel: string;
					isActiveClearance: boolean;
					isVisibleToClient: boolean;
					isApplicableForProfRequest: boolean;
					isApplicableForPsr: boolean;
					isApplicableForLi: boolean;
					isApplicableForSow: boolean;
					displayOrder: number;
				}
			]

			sectorOnboardings:
			[
				{
					type: string;
					complianceFieldName: string;
					complianceItemLabel: string;
					isActiveClearance: boolean;
					isVisibleToClient: boolean;
					isApplicableForProfRequest: boolean;
					isApplicableForPsr: boolean;
					isApplicableForLi: boolean;
					isApplicableForSow: boolean;
					displayOrder: number;
				}
			]
		};

	PerformanceSurveyConfiguration:
		{
			isAvgSurveyScoreAllowForComment: boolean;
			avgSurveyScore: number;
			surveyForClosedReq: boolean;
			surveyAllowedForAssignment: boolean;
			afterAssignmentEndDate: boolean;
			noOfDaysAfterAssignmentStart: boolean;
			noOfDaysAfterStartDateLevels: number[];
			scheduleThroughoutLengthOfAssignment: boolean;
			lengthOfAssignment: number;
			lengthOfAssignmentType: string;
			canSurveyAnyTime: boolean;
			questionLabel: string;
			displayQuestion: boolean;
			displayNoThanks: boolean;
			sectorClpSurveyScales:
			[
				{
					xrmEntityId: number;
					scale: number;
					definition: string;
					applicableFor: string;
				}
			]

			sectorRequisitionSurveyScales:
			[
				{
					xrmEntityId: number;
					scale: number;
					definition: string;
					applicableFor: string;
				}
			]

			sectorClpSurveyPerformanceFactors: [
				{
					xrmEntityId: number;
					factor: string;
					applicableFor: string;
				}
			]

			sectorRequisitionSurveyPerformanceFactors:
			[
				{
					xrmEntityId: number;
					factor: string;
					applicableFor: string;
				}
			]
		};
	UKey: string;
	sectorId: number;
	SectorUKey: string;
	reasonForChange: string;
	statusCode: string;
	IsCopySector: boolean;
	CopyFromSectorId: number;
	UdfFieldRecords: any;
}
