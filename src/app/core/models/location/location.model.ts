type NullableString = string | null;
type NullableNumber = number | null;

export interface LocationModel {
    locationName?: string;
    addressLine1: string;
    addressLine2?: NullableString;
    cityName: string;
    stateId?: NullableNumber;
    postalCode: string;
    timeZoneId?: NullableNumber;
    phoneNo?: NullableString;
    phoneExtension?: NullableString;
    billingAddressOne?: NullableString;
    billingAddressTwo?: NullableString;
    billingCityName?: NullableString;
    BillingStateId?: NullableNumber;
    billingPostalCode?: NullableString;
    billingAttention?: NullableString;
    billingEmail?: NullableString;
    mileageRate?: NullableNumber;
    poDepletionPercentage?: NullableNumber;
    mspProgramMgrId?: NullableNumber;
    salesTaxRequired: boolean;
    stateSalesTaxRate?: number;
    taxablePercentOfBillRate?: number;
	nineEightyWeekOne: NullableString;
	allowToAddHolidayHours?: boolean;
	restMealBreakConfigId?: number;
	allowExpenseEntry: boolean;
	alternateTAndEConfigurations: boolean;
	isClpJobRotationAllowed: boolean;
	isTimeAdjustApprovalRequired: boolean;
	allowTimeUploadWithStOtDt: boolean;
	validateApprovedAmtTimeRecords: boolean;
	displayStaffingInTandEApproval: boolean;
	sendPODeplNoticeToPrimaryMgr: boolean;
	sendPODeplNoticeToPOOwner: boolean;
	timeUploadAsApprovedHours: boolean;
	autoApproveHrsAdjAllowed: boolean;
	altTimeClockConfigurations: boolean;
	enableXRMTimeClock: boolean;
	dailyPunchApprovalNeeded: boolean;
	allowManagerAdjustPunchInOut: boolean;
	accrueHoursFromActualPunchIn: boolean;
	isAllowManualCharge: boolean;
	isAllowManualShift: boolean;
	isAllowManualJobCategory: boolean;
	xrmEmpIDTimeClockID: number;
	clockBufferToSetReportingDate: NullableString;
	clockBufferForEarlyShiftStart: NullableString;
	autoLunchDeductionAllowed: boolean;
	lunchTimeDeducted: NullableNumber;
	minHourWrkBeforeLunchDeduction: NullableNumber;
	effectiveDateForLunchConfig: NullableString;
	punchRoundingNeeded: boolean;
	punchInTimeIncrRoundingId: NullableNumber;
	punchOutTimeIncrRoundingId: NullableNumber;
	punchInTimeRoundingId: NullableNumber;
	punchOutTimeRoundingId: NullableNumber;
	isShowExtendedWorkLocAddress: boolean;
	positionDetailsEditable: boolean;
	altRequisitionConfigurations: boolean;
	altBenefitAdderConfigurations: boolean;
	requireBenefitAdders: boolean;
	altMSPProcessActivityConfigs: boolean;
	skipProcessSubmittalByMsp: boolean;
	hideNTERateFromReqLib: boolean;
	skipLIRequestProcessbyMSP: boolean;
	autoBroadcastForLIRequest: boolean;
	altDandBChecksConfigurations?: boolean;
	locationOfficers: LocationOfficers[];
	locHourDistributionRule: { hourDistributionRuleId: number }[];
	sectBenefitAdderConfig: { label: string }[];
	assignmentTypes: AssignmentTypes[];
	sectorBackgroundCheck: {
	  fillWithPendingCompliance: boolean;
	  attachPreEmpDocToClientEmail: boolean;
	  isActiveClearance: boolean;
	  isDrugResultVisible: boolean;
	  isDrugScreenItemEditable: boolean;
	  defaultDrugResultValue: boolean;
	  isBackGroundCheckVisible: boolean;
	  isBackGroundItemEditable: boolean;
	  defaultBackGroundCheckValue: boolean;
	  sectorBackgrounds: SectorBackgrounds[];
	};
	sectorId: number;
	UdfFieldRecords: [
	  {
		udfId: number;
		xrmEntityId: number;
		recordId: number;
		recordUKey: string;
		udfConfigId: number;
		udfTextValue: NullableString;
		udfIntegerValue: NullableNumber;
		udfNumericValue: NullableNumber;
		udfDateValue: string| null;
	  }
	]
	UKey?: string;
	Disabled?: boolean;
	ReasonForChange?: string
  }

 interface LocationOfficers {
	locationOfficerTypeId: number;
	firstName: string;
	lastName: string;
	middleName: string;
	email: string;
  }

  interface AssignmentTypes {
	assignmentName: string;
	displayOrder: number;
  }

  interface SectorBackgrounds {
	complianceType: string;
	complianceFieldName: string;
	complianceItemLabel: string;
	isVisibleToClient: boolean;
	isApplicableForProfessional: boolean;
	isApplicableForLi: boolean;
	isApplicableForSow: boolean;
	displayOrder: number;
  }

// View Interface
export interface InavigationPaths {
	addEdit: string;
	view: string;
	list: string;
}

export interface LocationOfficerData {
    Id: number;
    LocationOfficerTypeId: number;
    FirstName: string;
    LastName: string;
    MiddleName: string;
    LocationOfficerDesignation: string;
    Email: string;
    FullName?: string;
}

export interface BenefitAdderData {
    Id: number;
    Label: string;
}

export interface AssignmentData {
    Id: number;
    AssignmentName: string;
}

export interface ComplianceItemData {
    Id: number;
    ComplianceType: string;
    ComplianceFieldName: string;
    ComplianceItemLabel: string;
    IsVisibleToClient: string;
    IsApplicableForProfessional: string;
    IsApplicableForLi: string;
    IsApplicableForSow: string;
    DisplayOrder: number;
    [key: string]: string | number | boolean;
}

export interface CommonComponentData {
    LocationConfigId: number;
    Disabled: boolean;
    LocationConfigCode: string;
}

export interface LocHourDistributionRule {
    RuleName: string;
    Id: number;
    HourDistributionRuleId: number;
}

interface SectorBackgroundCheck {
    Id: number;
    FillWithPendingCompliance: boolean;
    AttachPreEmpDocToClientEmail: boolean;
    IsActiveClearance: boolean;
    IsDrugResultVisible: boolean;
    IsDrugScreenItemEditable: boolean;
    DefaultDrugResultValue: boolean;
    IsBackGroundCheckVisible: boolean;
    IsBackGroundItemEditable: boolean;
    DefaultBackGroundCheckValue: boolean;
    SectorBackgrounds: ComplianceItemData[];
}

export interface AssignmentType {
  Id: number;
  AssignmentName: string;
  DisplayOrder: number;
}

export interface LocationDataByUkey {
    UKey: string;
    LocationId: number;
    LocationCode: string;
    SectorId: number;
    SectorName: string;
    CountryId: number;
    CountryName: string;
    LocationName: string;
    AddressLine1: string;
    AddressLine2: string;
    StateId: number;
    StateName: string;
    City: string;
    PostalCode: string;
    TimeZoneId: number;
    TimezoneName: string;
    PhoneNo: string;
    PhoneExtension: null | string;
    BillingAddressOne: string;
    BillingAddressTwo: string;
    BillingCityName: string;
    BillingStateId: number;
    BillingStateName: string;
    BillingPostalCode: string;
    BillingAttention: string;
    BillingEmail: string;
    MileageRate: number;
    PODepletionPercentage: number;
    MSPProgramMgrId: number;
    MSPProgramMgr: string;
    SalesTaxRequired: boolean;
    StateSalesTaxRate: number;
    TaxablePercentOfBillRate: number;
    NineEightyWeekOne: Date | string;
    AllowToAddHolidayHours: boolean;
    RestMealBreakConfigId: number;
    RestMealBreakConfig: string;
    AllowExpenseEntry: boolean;
    AlternateTAndEConfigurations: boolean;
    IsClpJobRotationAllowed: boolean;
    IsTimeAdjustApprovalRequired: boolean;
    AllowTimeUploadWithStOtDt: boolean;
    ValidateApprovedAmtTimeRecords: boolean;
    DisplayStaffingInTandEApproval: boolean;
    SendPODeplNoticeToPrimaryMgr: boolean;
    SendPODeplNoticeToPOOwner: boolean;
    TimeUploadAsApprovedHours: boolean;
    AutoApproveHrsAdjAllowed: boolean;
    AltTimeClockConfigurations: boolean;
    EnableXRMTimeClock: boolean;
    DailyPunchApprovalNeeded: boolean;
    AllowManagerAdjustPunchInOut: boolean;
    AccrueHoursFromActualPunchIn: boolean;
    IsAllowManualCharge: boolean;
    IsAllowManualShift: boolean;
    IsAllowManualJobCategory: boolean;
    XrmEmpIDTimeClockID: number;
    XrmUseEmployeeOrTimeClock: string;
    ClockBufferToSetReportingDate: string;
    ClockBufferForEarlyShiftStart: string;
    AutoLunchDeductionAllowed: boolean;
    LunchTimeDeducted: number;
    MinHourWrkBeforeLunchDeduction: number;
    EffectiveDateForLunchConfig: string;
    PunchRoundingNeeded: boolean;
    PunchInTimeIncrRoundingId: number;
    PunchInTimeIncrRounding: string;
    PunchOutTimeIncrRoundingId: number;
    PunchOutTimeIncrRounding: string;
    PunchInTimeRoundingId: number;
    PunchInTimeRounding: string;
    PunchOutTimeRoundingId: number;
    PunchOutTimeRounding: string;
    IsShowExtendedWorkLocAddress: boolean;
    PositionDetailsEditable: boolean;
    AltRequisitionConfigurations: boolean;
    AltBenefitAdderConfigurations: boolean;
    RequireBenefitAdders: boolean;
    AltMSPProcessActivityConfigs: boolean;
    SkipProcessRequisitionByMsp: boolean;
    SkipProcessSubmittalByMsp: boolean;
    HideNTERateFromReqLib: boolean;
    SkipLIRequestProcessbyMSP: boolean;
    AutoBroadcastForLIRequest: boolean;
    AltDandBChecksConfigurations: boolean;
    IsRfxSowRequired: boolean;
    Disabled: boolean;
    LocationOfficers: LocationOfficerData[];
    LocHourDistributionRule: LocHourDistributionRule[];
    SectorAssignmentTypes: AssignmentType[];
    SectorBenefitAdders: BenefitAdderData[];
    SectorBackgroundCheck: SectorBackgroundCheck;
    CreatedBy: string;
    CreatedOn: string;
    LastModifiedBy: string;
    LastModifiedOn: string;
}

export interface LocationRowData {
  UKey: string;
  LocationId: string;
  LocationCode: string;
  Sector: string;
  LocationName: string;
  City: string;
  State: string;
  AddressLine1: string;
  AddressLine2: string;
  Zip: string;
  Disabled: boolean;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
}

