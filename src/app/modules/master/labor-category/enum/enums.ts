// eslint-disable-next-line no-shadow
export enum buttonType {
    one = "1",
    two = "2",
    three = "3",
    four = "4",
    five = "5"
}

export const magicNumLab = {
	FourNine: 9999
};

export interface LabCategory {
        BillRateValidation: number | null;
        BillRateValidationLocalizedKey: string | null;
        CandidateHiredBy: string | null;
        CostEstimationType: number | null;
        CostEstimationTypeLocalizedKey: string | null;
        CreatedBy: string;
        CreatedOn: string;
        Disabled: boolean;
        Id: number;
        IsAlternatePricingModel: boolean;
        IsExpressLaborCategory: boolean;
        IsLiCreated: boolean;
        IsReqLibCreated: boolean;
        IsRfxSowRequired: boolean;
        LaborCatType: number;
        LaborCategoryCode: string;
        LaborCategoryName: string;
        LaborCategoryTypeLocalizedKey: string;
        LastModifiedBy: string;
        LastModifiedOn: string;
        MarkUpFlag: boolean | null;
        MarkUpLocalizedKey: string | null;
        MaxProfileTotal: number | null;
        MaxProfilesPerStaffing: number | null;
        MspProgramManagerId: number;
        MspUserName: string;
        OtRateType: number | null;
        OtRateTypeLocalizedKey: string | null;
        PayrollMarkUp: number | null | string;
        PricingModel: number | null;
        PricingModelLocalizedKey: string | null;
        SectorId: number;
        SectorName: string;
        UKey: string;
      }

export interface DetailItem {
  key: string;
  value: string;
  cssClass?: string[];
}

export interface IUkeyDataItem{
    Id: number,
    UKey: string,
    SectorId: number,
    SectorName: string,
    LaborCategoryName: string,
    LaborCategoryCode: string,
    MspUserName: string,
    MspProgramManagerId: number,
    LaborCategoryTypeLocalizedKey: string,
    PayrollMarkUp: number,
    IsAlternatePricingModel: string,
    IsExpressLaborCategory: string,
    Disabled: boolean,
    CreatedOn: string,
    CreatedBy: string,
    LastModifiedOn: string,
    LastModifiedBy: string

}

export interface InewPricingModel {
  BillRateValidation: string;
  BillRateValidationName: string;
  CostEstimationType: string | null;
  CostEstimationTypeName: string;
  PricingModel: string;
  PricingModelName: string;
  MarkUpType: string;
  MarkUpTypeName: string;
  IsRfxSowRequired: boolean;
  OtRateType: string;
  OtRateTypeName: string;
  ShiftdifferentialMethod: number;
  IsXrmTimeClockRequired: boolean;
  CountryId: number;
}

export interface ICommonComponentData {
  LaborCategoryID: number;
  Disabled: boolean;
  LaborCategoryCode: string;
}
