import { FormGroup } from "@angular/forms";
import { GenericResponseBase } from "@xrm-core/models/responseTypes/generic-response.interface";
import { IPreparedUdfPayloadData } from "@xrm-shared/common-components/udf-implementation/Interface/udf-common.model";
import { IDropdownItem, IDropdownOption } from "@xrm-shared/models/common.model";

// eslint-disable-next-line no-shadow
export enum RateUnit {
  Hour = 'Hour',
  Day = 'Day',
  Week = 'Week',
  Month = 'Month'
}

// eslint-disable-next-line no-shadow
export enum RateType {
  BillRate = 'BillRate',
  WageRate = 'WageRate',
  BillRateNteTarget = 'BillRateNteTarget',
  BillRateTarget = 'BillRateTarget',
  BillRateNte = 'BillRateNte'
}

// eslint-disable-next-line no-shadow
export enum RateUnitValue {
  Hour = 9,
  Day = 10,
  Week = 262,
  Month = 263
}

// eslint-disable-next-line no-shadow
export enum RateTypeValue {
  WageRate = 11,
  BillRate = 12

}

export enum dropdownLaborCatType{
  Professional = 85,
	LightIndustrial= 84,
	Icsow= 86,
}

export interface RequisitionDataAddEdit {
  Id: number;
  UKey: string;
  RequisitionLibraryCode: string;
  SectorId: number;
  SectorName: string;
  CreatedBy: string;
  CreatedOn: string;
  CurrencySymbol: string;
  Disabled: boolean;
  EducationDesc: string;
  ExperienceDesc: string;
  JobCategoryId: number;
  JobCategoryName: string;
  LaborCategoryId: number;
  LaborCategoryName: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
  LocationId: number;
  LocationName: string;
  PositionDesc: string;
  PreLaunchRate: number;
  RateTypeCode: number;
  RateTypeLocalizedKey: string;
  RateUnitCode: number;
  RateUnitLocalizedKey: string;
  ReqLibraryAdditionalDetailId: number;
  ReqLibraryBenefitAdders: ReqLibraryBenefitAdder[];
  SkillDesc: string;
  TargetRate: number;
  WageRate: number;
}

export interface ReqLibraryBenefitAdder {
  ReqLibraryBenefitAdderId: number;
  LocalizedLabelKey: string;
  Value: number;
}

export interface BenefitAdderForView {
  LabelLocalizedKey: string;
  ReqLibraryBenefitAdderId: number;
  Value: number | null;
  Id: number;
  UKey: string;
  SectorId: number;
  LocationId: number | null;
  Label: string;
}

export interface BenefitAddersToPost{
  LocalizedLabelKey: string,
  Value: number | null | undefined
}

export interface CostEstimationDetail {
  BillRateValidation: number;
  BillRateValidationName: string;
  CostEstimationType: number;
  CostEstimationTypeName: string;
  CountryId: number;
  IsRfxSowRequired: boolean;
  IsXrmTimeClockRequired: boolean;
  MarkUpType: number;
  MarkUpTypeName: string;
  OtRateType: number;
  OtRateTypeName: string;
  PricingModel: number;
  PricingModelName: string;
  ShiftdifferentialMethod: number;
}

export interface CopyData {
  destinationLocationId: string;
  sourceLocationId: string;
  sourceSectorId: string;
}


export interface UdfData {
  data: IPreparedUdfPayloadData[];
  formGroup:FormGroup
}

export interface IReqLibraryCommonData {
  ReqLibraryID: number;
  Disabled: boolean;
  ReqLibraryCode: string;
}

export interface JobDetails {
  SectorId: string;
  LaborCategoryId: string;
  JobCategoryId: string;
  IsWageRate: string;
}

export interface DropdownAggregateResponse {
  ddlLcat: GenericResponseBase<IDropdownItem[]>;
  ddlLocation: GenericResponseBase<IDropdownOption[]>;
  ddlsectconfig: GenericResponseBase<SectConfigData>;
}

interface SectConfigData {
  BillRateValidation: number;
  BillRateValidationName: string;
  CostEstimationType: number;
  CostEstimationTypeName: string;
  PricingModel: number;
  PricingModelName: string;
  MarkUpType: number;
  MarkUpTypeName: string;
  IsRfxSowRequired: boolean;
  OtRateType: number;
  OtRateTypeName: string;
  ShiftdifferentialMethod: number;
  IsXrmTimeClockRequired: boolean;
  CountryId: number;
}

interface ReqLibraryAdditionalDetail {
  reqLibraryAdditionalDetailId?: number;
  positionDesc: string;
  skillDesc: string;
  educationDesc: string;
  experienceDesc: string;
}

export interface RequisitionLibraryAddPayload {
  sectorId: number;
  laborCategoryId: number;
  jobCategoryId: number;
  locationId: number;
  targetRate: string | null;
  preLaunchRate: string | null;
  wageRate: string | null;
  rateUnitCode: number;
  rateTypeCode: string;
  reqLibraryAdditionalDetail: ReqLibraryAdditionalDetail;
  reqLibraryBenefitAdders: BenefitAddersToPost[];
  UdfFieldRecords: IPreparedUdfPayloadData[];
}

export interface RequisitionLibraryUpdatePayload {
  uKey: string;
  targetRate: string | null;
  preLaunchRate: string | null;
  wageRate: string | null;
  rateUnitCode: number;
  rateTypeCode: string;
  reqLibraryBenefitAdders: ReqLibraryBenefitAdder[];
  reqLibraryAdditionalDetail: ReqLibraryAdditionalDetail;
  UdfFieldRecords: IPreparedUdfPayloadData[],
  reasonForChange?: string | null;
}

export interface LocationMapping {
  sourceSectorId: string;
  sourceLocationId: string;
  destinationLocationId: string;
}
