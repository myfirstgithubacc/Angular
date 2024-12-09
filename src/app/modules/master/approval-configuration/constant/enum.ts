import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { IDropdown, IDropdownItem, IDropdownOption } from "@xrm-shared/models/common.model";

export interface SectorWiseObj {
    labourObj: Obj;
    locationObj: Obj;
    reasonForReqObj: Obj;
    orgLevelObj: Obj;
}

interface Obj{
    data: AccessToAllItems [];
    checkedKey: string[];
}
export interface AccessToAllItems{
    Value: string;
    Text: string;
    Index: string;
    IsSelected: boolean;
    parentId?: string;
}

export interface AccessToAllData {
    AccessToAllItems: null;
    Index: string;
    IsSelected: boolean;
    Text: string;
    Value: string;
  }
export interface ModifiedSectorData {
    Value: string;
    Text: string;
    Index: string;
    IsSelected: boolean;
    AccessToAllItems:null;
}

export type LaborData = ApplicableInEntity;
export type LocationData = ApplicableInEntity;
export type ReasonForReqData = ApplicableInEntity;
export type OrgLevelData = ApplicableInEntity;
export type SectorData = ApplicableInEntity;

export interface StoreKey {
        keyname: string,
        indexvalue: string | number,
        id: number
    }
export const StatusOptions: { Text: string; Value: string }[] = [
	{ Text: 'Active', Value: 'Active' },
	{ Text: 'Inactive', Value: 'Inactive' }
];

// eslint-disable-next-line one-var
export const AccessAllApplicableIn: { Text: string; Value: boolean }[] = [
	{ Text: 'All', Value: true },
	{ Text: 'Selected', Value: false }
];

// eslint-disable-next-line one-var
export const RadioGroup: { Text: string; Value: string }[] = [
	{ Text: 'AND', Value: 'AND' },
	{ Text: 'OR', Value: 'OR' }
];

export interface AccessToAll {
    itemId: number;
    id:number;
}


export interface ApplicableInEntity {
    Value: string;
    Text: string;
    IsSelected: boolean;
    Index: string;
    AccessToAllItems: AccessToAllItems[] | null;
    items?: AccessToAllItems[];
  }

export interface ApplicableIn {
    AccessToAllType: string;
    IsAccessToAll: boolean;
    ApplicableInEntities: ApplicableInEntity[];
    Sequence: number;
  }

export interface ApprovalRequired {
    ApprovalRequiredId: number;
    ApprovalRequiredName: string;
  }

export interface UserType {
    Text: string;
    Value: number;
    TextLocalizedKey: string | null;
    IsSelected: boolean;
  }

export interface ApproverType {
    IsVisibleExceptionApprover: boolean;
    IsVisibleExceptionPercentage: boolean;
    IsVisibleFundingBased: boolean;
    IsVisibleFundingMinLimit: boolean;
    IsVisibleOrgLevel1Based: boolean;
    IsVisibleRole: boolean;
    IsVisibleUserType: boolean;
    IsVisibleUser: boolean;
    UserTypes: UserType[];
    ApprovalConfigDetailId: number;
    ApproverTypeId: number;
    ApproverTypeName: string;
    ApproverLabel: string | null;
    Condition: string;
    ExceptionApprovalRequired: boolean;
    ExceptionPercentage: number;
    FundingBasedRequired: boolean;
    FundingMinLimit: number;
    OrgLevel1BasedRequired: boolean;
    ShowApproverScreenRequired: boolean;
    RolesDetail: UserType[];
    UserTypId: string;
    UserTypeName: string;
    Userid: string;
    UserName: string;
  }

export interface LevelApprover {
    Level: number;
    SubLevel: number;
    ApproverLevel: string;
    ApproverType: ApproverType;
  }

export interface ApprovalConfigurtion {
    LevelApprovers: LevelApprover[];
  }

export interface WholeDatabasedOnWorkFlow {
    WorkFlowType: number;
    WorkFlowTypeName: string;
    ApprovalConfigId: number;
    ApprovalConfigCode: string;
    ApprovalProcessName: string;
    Comment: string;
    Disabled: boolean;
    ApprovalRequired: ApprovalRequired[];
    ApplicableIn: ApplicableIn[];
    ApproverTypes: ApproverType[];
    ApprovalConfigurtion: ApprovalConfigurtion;
  }


export interface TempObjOfApplicableInData {
    location: ApplicableInEntity[];
    orgLevel: ApplicableInEntity[];
    reasonForRequest: ApplicableInEntity[];
    labourCategories: ApplicableInEntity[];
    sector: ApplicableInEntity[];
  }


export interface ApprovalEditData {
    IsCanceled: boolean;
    IsCompleted: boolean;
    IsCompletedSuccessfully: boolean;
    IsFaulted: boolean;
    Result:WholeDatabasedOnWorkFlow;
    }

interface ApproverRequired{
      ApprovalRequiredId: number,
      ApprovalRequiredName: string
    }

export interface ApprovalDataResponse {
          UKey: string;
          ApprovalProcessName: string;
          PriorityId: number;
          exists: boolean;
  }
  interface DataItem {
    Value: string;
    Text: string;
    IsSelected: boolean;
    Index: string;
    AccessToAllItems: any | null;
  }

interface Item {
    dataItem: DataItem;
    index: string;
}

export interface Structure {
    children: Structure[];
    item: Item;
    parent: Structure | null;
    checked: boolean;
}

export interface SelectionStructure {
  selected: any[];
  checkedKey: string[];}

export interface ICommonComponentData {
    ApprovalConfigId: number;
    Disabled: boolean;
    ApprovalConfigCode: string;
  }


export const enum DropDown {
    Inactive = 'Inactive',
    Active= 'Active',
    Activate = 'Activate',
    Deactivate = 'Deactivate',
    Disabled = 'Disabled',
    All = 'All'
  }

export interface Sublevel {
    level: number;
    sublevel: number | Sublevel[];
    approverType: ApproverType;
  }

export interface Level {
    level: number;
    sublevel: Sublevel[];
  }

export interface IDataItem{
    UKey: string;
    ApprovalConfigId: number;
    ApprovalConfigCode: string;
    ApprovalProcessName: string;
    WorkFlowId: number;
    WorkFlow: string;
    ApprovalRequiredId: number;
    ActionLocalizedKey: string;
    ApproverLevelsCount: number;
    CreatedOn: string;
    LastModifiedOn: string;
    CreatedBy: string;
    LastModifiedBy: string;
    Disabled: boolean;
}
export interface IDataItemResponse{
  Ukey: string;
  ApprovalConfigId: number;
  ApprovalConfigCode: string;
  ApprovalProcessName: string;
  WorkFlowId: number;
  WorkFlow: string;
  ApprovalRequiredId: number;
  ActionLocalizedKey: string;
  ApproverLevelsCount: number;
  CreatedOn: string;
  LastModifiedOn: string;
  CreatedBy: string;
  LastModifiedBy: string;
  Disabled: boolean;
  UKey:string
}
export interface LevelArray {
  Text: string;
  items: IDropdown[];
}

export interface ApprovalReq {
approvalForm: FormGroup;
data:TransactionDataModel[];
}

export interface TransactionDataModel {
  TransactionId: number;
  TransactionDetailId: number;
  ApprovalConfigId: number;
  ApprovalConfigDetailId: number;
  ApproverTypeId: number;
  ApproverLabel: string;
  ApproverLevel: number;
  SubApproverLevel: number;
  EstimatedCost: string;
  Items: IDropdownItem[];
  IsDraft:boolean;
}

export interface BaseTransactionDataModel extends TransactionDataModel {
  controlName: string;
}

export interface ApprovalInfoDetails{
  recordId?: number;
  actionId: number;
  entityId: number;
  sectorId?: number;
  locationId?: number;
  orgLevel1Id?: number;
  laborCategoryId?: number;
  reasonsForRequestId?: number;
  estimatedcost?: number;
  nextLevelManagerId?: number;
  ApprovalTypeId?: number;
  EntityId?: number;
  SectorId?: number;
  LocationId?: number;
  LaborCategoryId?: number;
  OrganizationLevel1Id?: number;
  orgLevel2Id?: number | null;
  orgLevel3Id?: number | null;
  orgLevel4Id?: number | null;
  jobCategoryId?: number;
  BillRate?:number;
  ExceptionalBillRate?:number;
}

export interface StatusCard{
  key: string,
   value: string,
   cssClass?: string[]
}


interface SubApproval {
  ApproverTypeId: number;
  ApproverLabel: string | null;
  ExceptionApprovalRequired: boolean;
  ExceptionPercentage: number | null;
  FundingBasedRequired: boolean;
  OrgLevel1BasedRequired: boolean;
  FundingMinLimit: number | null;
  ApprovalConfigDetailId: number;
  RolesDetail: UserType[];
  UserTypId: number | null;
  UserId: number | null;
  IsVisibleExceptionApprover: boolean;
  IsVisibleExceptionPercentage: boolean;
  IsVisibleFundingBased: boolean;
  IsVisibleFundingMinLimit: boolean;
  IsVisibleOrgLevel1Based: boolean;
  IsVisibleRole: boolean;
  IsVisibleUser: boolean;
  IsVisibleUserType: boolean;
  Condition: string | null;
}

interface ApprovalForm {
  subApproval: SubApproval[];
}

export interface SetupApprovalformValue {
  approvalFormArray: ApprovalForm[];
}

export interface EntityRecord {
  RecordId: number;
  EntityId: number;
  SectorId: string | number;
  orgLevel1Id: string | number;
  IsDraft:boolean;
}

export type FormVal = Record<string, FormControl>;

export interface ApprovalConfigUser {
  roles: IDropdownOption[];
  userType: IDropdownOption[];
  user: IDropdownOption[];
}

export interface DataStatus {
  data: [];
  status: boolean;
}
export interface ValidationConfig {
  controlName: string;
  validationFn: (message: string) => ValidatorFn;
  message: string;
}

export interface IndexObj {
approvalIndex: number;
subIndex: number
}
export interface ControlsData {
  IsVisibleExceptionApprover: boolean;
  IsVisibleExceptionPercentage: boolean;
  IsVisibleFundingBased: boolean;
  IsVisibleFundingMinLimit: boolean;
  IsVisibleOrgLevel1Based: boolean;
  IsVisibleRole: boolean;
  IsVisibleUser: boolean;
  IsVisibleUserType: boolean;
}
export type ControlNames = keyof ControlsData;

export interface ExceptionApprovalFormGroup {
  ExceptionApprovalRequired: FormControl<boolean>;
  ExceptionPercentage: FormControl<number | null>;
}
