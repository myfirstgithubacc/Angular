import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";

export interface LocationMarkup {
  StaffingAgencyMarkupAdderId: number;
  LocationId: number;
  LocationName: string;
  BroadCastAllowed: boolean;
  RecruitedMarkupAdder: number | string;
  PayrolledMarkupAdder: number | string;
  ActualRecruitedMarkupAdder: number | string;
  ActualRecruitedMarkup: number | string;
  ActualPayrolledMarkup: number | string;
  ActualPayrolledMarkupAdder: number | string;
  TierLevel: string | null;
  TierLevelName: string | null;
  LaborCategoryId: number | string;
  [key: string]: string | number | boolean | LocationMarkup[] | null | undefined;
}

export interface LaborCategoryMarkup {
  StaffingAgencyMarkupId?: number;
  LaborCategoryId: number;
  LaborCategoryName?: string | null | undefined;
  BroadCastAllowed?: boolean;
  RecruitedMarkup?: number | string;
  RecruitedMspFee?: number | string;
  PayrolledMarkup?: number | string;
  PayrolledMspFee?: number | string;
  OtMultiplier?: number | string;
  DtMultiplier?: number | string;
  TierLevel?: string | null;
  TierLevelName?: string | null;
  locationMarkups?: LocationMarkup[] | [] | null;
  broadcastVal?: boolean;
  [key: string]: string | number | boolean | LocationMarkup[] | null | undefined;
}

export interface LocationMarkupControl extends FormGroup {
  controls: {
    StaffingAgencyMarkupAdderId: FormControl;
  LocationId: FormControl;
  LocationName: FormControl;
  BroadCastAllowed: FormControl;
  RecruitedMarkupAdder: FormControl;
  PayrolledMarkupAdder:FormControl;
  ActualRecruitedMarkupAdder: FormControl;
  ActualPayrolledMarkupAdder: FormControl;
  TierLevel: FormControl;
  TierLevelName: FormControl;
  LaborCategoryId:FormControl;
  };
}

export interface LaborCategoryMarkupControl extends FormGroup {
  controls: {
    StaffingAgencyMarkupId: FormControl;
    LaborCategoryId: FormControl;
    LaborCategoryName: FormControl;
    BroadCastAllowed: FormControl;
    RecruitedMarkup: FormControl;
    RecruitedMspFee: FormControl;
    PayrolledMarkup: FormControl;
    PayrolledMspFee: FormControl;
    OtMultiplier: FormControl;
    DtMultiplier: FormControl;
    TierLevel: FormControl;
    TierLevelName: FormControl;
    locationMarkups: FormArray;
  };
}
export interface MarkupConfigForm extends FormGroup {
  baseMarkupConfigs: {
    controls: FormGroup[];
  };
}


export interface BaseMarkupConfig {
  SectorId: number;
  SectorName: string;
  RecruitedMspFee: number | string;
  PayrolledMspFee: number | string;
  laborCategoryMarkups: LaborCategoryMarkup[] | [] ;
  length: number;
}

export interface SectorMarkup {
  SectorId: number;
}
export interface SectorFilter {
  SectorName: string;
  laborCategoryMarkups: LaborCategoryMarkup[];
}

export interface LabourMarkup{
  LaborCategoryId: number;
}

export interface StaffingTier {
  Text: string;
  Value: number | string;
  TextLocalizedKey: string | null;
  IsSelected: boolean;
  length:number;
}

export interface StaffingResponse {
  Data: StaffingTier[],
  StatusCode: number,
  Message: string
}
export interface MarkupSearchData {
  StaffingAgencyUkey: string;
  StaffingAgencyId: number;
  StaffingAgencyName: string;
  StaffingTier: StaffingTier[];
  baseMarkupConfigs: BaseMarkupConfig[] ;
}
export const markupEnum = {
	PleaseSelectTierLevel: 'PleaseSelectTierLevel',
	MULTISELECT_CONTROL_TYPE: 'multiselect'
};

export interface updateSuccessResponse {
  isSuccess: boolean,
	message: string
}
export interface permissionData {
  permission : PermissionAction[]

}

export interface PermissionAction {
  ActionId: number,
  ActionName: string,
  EntityType: string,
  EntityTypeId: number
}

export interface FilterData {
  sec: [];
  labour: [];
  loc:[];
}


export interface baseMarkupConfigs {
  baseMarkupConfigs: BaseMarkupConfig[]
};

export interface markupParam{
  ukey: string,
  sectorIds: [],
  laborCategoryIds: [],
  locationIds: []
};

export interface markupUpdate {
  staffingAgencyUkey:string,
  baseMarkupConfigs: BaseMarkupConfig[],
  UKey: string
};

