import { ToJson } from "../responseTypes/to-json.model";

export class StaffingAgencyModel extends ToJson{
	Data: DataModelStaffingAgency;
	constructor(public init : DataModelStaffingAgency){
		super();
		this.Data = init;
	}

}

export interface DataStaffingAgencyList {
  Id: number;
  TierType: string;
  TierTypeName: string;
  controlName?: string;
	StaffingAgencyLabel?: string,
}

export interface DataModelStaffingAgency{
  StaffingAgencyTypeList : DataStaffingAgencyList[];
  ReasonForChange? : string;
}

export class ClearanceList {
	public Id = '';
	public SecurityName = '';
	public IsVisible: boolean;
}

export class SampleData {
	public Id = 0;
	public TierType = '';
	public TierTypeName = '';
	public controlName = '';
}

export class SingleSign {
	UserType: string;
	LoginCredential?: string[];
	IsDefault?: boolean;
	data: dataItemSingleSignOn[];
}

export interface TransformedData {
	UserType: string;
	data: dataItemSingleSignOn[];
	LoginCredential?: string[];
	IsDefault?: boolean;
}

export interface dataItemSingleSignOn{
	LoginCredential?: string[];
	IsDefault?: boolean;
}

export class CommonObjectModel {
	Text: string;
	Value: string;
}
