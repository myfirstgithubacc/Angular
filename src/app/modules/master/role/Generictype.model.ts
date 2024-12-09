import { FormGroup } from "@angular/forms";

export interface PageSizeResponse {
    Data: {
      PageSize: number;
    };
    StatusCode: number;
    Succeeded: boolean;
    Message: string;
  }

export interface ActionItem {
    icon: string;
    title: string;
    color: string;
    actionId: number[];
  }

export interface gridActionSet {
    Status: boolean|number|string;
    Items: ActionItem[];
  }
export interface headerActionSet {
    status: string;
    items: ActionItem[];
  }
export interface CommonComponentData {
    RoleID: string;
    Disabled: boolean;
}
export class Role {
	UKey: string;
	Id: number;
	RoleNo: number;
	RoleName: string | undefined | null;
	RoleGroupId: number;
	RoleCode: string;
	RoleGroupName: string;
	Disabled: boolean;
	CreatedBy: number;
	CreatedOn: string|Date;
	LastModifiedBy: number;
	LastModifiedOn: string|Date;
	CreatedByUserName: string | null;
	LastModifiedByUserName: string;
}

export class Option {
	Text: string;
	Value: string;
	TextLocalizedKey: string | null;
	IsSelected: boolean;
}
export interface EntityAction {
  XrmEntityActionId: number;
  ActionGroupId: number;
  text: string;
  Index: string;
}

export interface XrmEntityAction {
  XrmEntityActionId: number;
  ActionGroupId: number;
  XrmEntityId: number;
  checkedKey?: string[];
  selected?: XrmEntityAction[];
}

export interface GroupActionDetails {
  actionName: string;
  rowIds: string[];
  clickedTabName: string;
}


export interface FormData1 {
  roleId?: string;
  roleGroupId: number;
  roleName: string;
  disabled: boolean;
  ReasonForChange: string;
  actionDetails: XrmEntityActionPer[];
}
export interface UpdateFormdata {
  roleId: string;
  roleGroupId: number;
  roleName: string;
  disabled: boolean;
  ReasonForChange: string;
  actionDetails: XrmEntityActionPer[];
}
export interface SelectionItem {
  checkedKey: string[];
  selected: XrmEntityAction[];
}
export class Status {
	uKey: string;
	disabled: boolean;
	reasonForChange?:string;
}
export interface activateDeactivateResponse {
  StatusCode: number;
  Succeeded: boolean;
  Message: string;
}
interface DetailItem {
  title: string|number;
  titleDynamicParam: [];
  item: number|string;
  itemDynamicParam: [];
  cssClass: string[];
  isLinkable: boolean;
  link: string;
  linkParams: string;
}

export interface StatusData {
  items: DetailItem[];
}

export interface RoleGroup {
  Text: string|undefined|null;
  Value: string|undefined|null;
  TextLocalizedKey: string | null;
  IsSelected: boolean;
}

export interface RoleFormData {
  roleGroup: RoleGroup;
  roleName: string;
  disabled: boolean|undefined|null;
}
// export interface XrmEntityActionPer {
//   XrmEntityActionId: number;
//   ActionGroupId: number;
//   text: string;
//   Index: string;
// }

export interface SelectedActions {
  selected?: XrmEntityActionPer[];
  checkedKey: string[];
}
export interface XrmEntityActionResponse {
  Data: XrmEntityAction[];
  StatusCode: number;
  Succeeded: boolean;
  Message: string;
}

export interface XrmEntityActionData {
  ActionGroupId: number;
  XrmEntityActionId: number;
  XrmEntityId?: number;
  Index?: string;
}
export interface XrmEntityActionPer {
  XrmEntityActionId: number;
  ActionGroupId: number;
  text: string;
  Index: string;
  XrmEntityId?: number;
}
export interface Item {
  Index: string|number;
  items?: (Item | XrmEntityActionPer)[];
  text: string;
}

export interface RootObject {
  Index: string;
  items: Item[];
  text: string;
}
export interface RecordButton {
  status: string | boolean
  items: Item1[];
}
interface Item1 {
  icon: string;
  title: string;
  color: string;
  actionId: number[];
}

export interface AssignmentDetails {
  AssignmentMinValidDate: string;
  AssignmentMaxValidDate: string;
  IsExpenseEntry: boolean;
  TimeMaxWeekendingDate: string | null;
}

export interface NavigationEx {
	queryParams: {
	  assignmentID: number|string|null;
	};
}

export class actDeactResponse {
	StatusCode?: number;
	Message?:string|undefined;
	Succeeded?:boolean;
}


export interface AssignmentRevision {
  AssignmentRevisionId: number;
  UKey: string;
  RevisionCode: string;
  AssignmentCode: string;
  StatusId: number;
  StatusName: string;
  CreatedOn: string;
  CreatedByUserName: string;
  CreatedByUserNo: number;
  ProcessedOn: string | null;
  ProcessedByUserNo: number | null;
  ProcessedByUserName: string | null;
  ContractorName: string;
  SectorName: string;
  LocationName: string;
  JobCategoryName: string;
  IsOwnedRecord: boolean;
  IsApprover: boolean;
  CanProcess: boolean;
}

export interface RevisionDetails {
  LoggedInUserRoleID: number;
  Id: number;
  RevisionId: string;
  AssignmentId: string;
  AssignmentCode: string;
  SectorId: number;
  OrgLevel1Id: number;
  ContractorName: string;
  StatusName: string;
  WorkLocationId: number;
  LaborCategoryId: number;
  RequestingManagerId: number;
  POAdjustmentType: string;
  RevisedRateEffentiveDate: string|Date;
  UnitType: string;
  Comments: string;
}

export interface RevisionChangeDto {
  Section: string;
  FieldLabel: string;
  CurrentValue: string;
  NewValue: string;
  EmailLabel: string;
}

export interface CurrentPODetails {
  EstimatedCostChange: number;
  AdditionalFundRequested: number;
  TotalAmountRequested: number;
}

export interface NewPODetails {
  NewPORequest: string|null;
  FundRequested: number|null;
  EffectiveFrom: Date|null;
  NewTotalAmountRequested: number|null;
}

export interface RevisionPODetails {
  AssignmentPONumberId: number;
  PoNumber: string;
  PoEffectiveFrom: string|Date|null;
  PoEffectiveTo: string|Date|null;
  SeparateTandEPoAmount: boolean;
  TotalPoAmount: number;
  TotalPoIncurredAmount: number;
  PoTimeAmount: number;
  PoTimeIncurredAmount: number;
  PoExpenseAmount: number;
  PoExpenseIncurredAmount: number;
  Comment: string|null;
  Disabled: boolean;
  PoRemainingAmount: number;
  PoTimeRemainingAmount: number;
  PoExpenseRemainingAmount: number;
}

export class RevisionData {
	RevisionDetails: RevisionDetails;
	RevisionChangesDtos: RevisionChangeDto[];
	CurrentPODetails: CurrentPODetails;
	NewPODetails: NewPODetails;
	RevisionPODetails: RevisionPODetails;
	CommentHistory: CommentHistoryItem[];
}

export interface CommentHistoryItem {
  Date: string;
  Comment: string;
}

export interface Timeresponse {
  AssignmentMaxValidDate: null|Date;
  AssignmentMinValidDate: null|Date;
  IsExpenseEntry: boolean;
  TimeMaxWeekendingDate: null|Date;
}
export interface FetchRevisionDetailsResponse {
  revisionObject: RevisionData;
  timeExpense: Timeresponse | null;
  statusData: StatusData;
}

export interface RevisionActionPay {
  uKey: string;
  revisedDate: string | null | Date;
  revisionAction: number;
  comment: string;
}
export interface PORevisionDetail {
  Key: string;
  Value: Date|string|number|null;
}
export interface getPORevisionDetails {
  Key: string;
  Value: number;
}
export interface RevisionSharedDetail {
  Section: string;
  FieldLabel: string;
  CurrentValue: string;
  NewValue: string;
  EmailLabel: string;
}
export interface ApprovalFormEvent {
  approvalForm: FormGroup;
  data:DataItem[]
}
export interface DataItem {
  TransactionId: number;
  TransactionDetailId: number;
  ApprovalConfigId: number;
  ApprovalConfigDetailId: number;
  ApproverTypeId: number;
  ApproverLabel: string;
  ApproverLevel: number;
  SubApproverLevel: number;
  Items: Option[];
}
export interface ActionRequest {
  actionId: number;
  entityId: number;
  sectorId: number;
  locationId: number;
  orgLevel1Id: number;
  laborCategoryId: number;
  reasonsForRequestId: number;
  estimatedcost: number;
  nextLevelManagerId: number;

}
export interface RequestDetails {
  RequestUkey: string;
  RequestCode: string;
  SectorName: string;
  WorkLocationName: string;
  JobCategoryName: string;
  MySubmittal: number;
  TotalSubmittal: number;
  LowestBidRate: number | null;
  CurrencyCode: string;
  LaborCategoryName: string;
  PositionTitle: string | null;
  ShiftName: string;
  CutOffDate: string;
  MyBroadcastRound: number;
  BroadcastRound: number;
  Status: string;
  BroadcastedOn: string;
}


