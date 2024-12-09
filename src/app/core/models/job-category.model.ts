import { ToJson } from './responseTypes/to-json.model';
type nullableString = string | undefined | null;
type nullableNumber = number | undefined | null;

export class JobCategory extends ToJson {

	Id: nullableNumber;
	UKey: nullableString;
	Ukey: nullableString;
	SectorName: nullableString;
	SectorId: number;
	LCId: nullableNumber;
	LCName: nullableString;
	IsLCDisabled : boolean;
	IsWageRateAdj: boolean | undefined | null | nullableString;
	JCName: nullableString;
	JCCode: nullableString;
	ClientJCCode: nullableString;
	OTHoursBilledAt: nullableString;
	OTHoursBilledAtId: nullableString | nullableNumber;
	recordUKey: nullableString;
	Disabled: boolean | undefined | null;
	CreatedBy: nullableNumber;
	CreatedOn: Date | undefined | null;
	LastModifiedBy : undefined | null;
	LastModifiedOn: Date | undefined | null;
	ReasonForChange: nullableString;
	UdfFieldRecords: any;

	constructor(init?: Partial<JobCategory>) {
		super();
		Object.assign(this, init);
	}
}

export interface GridColumn {
    XrmGridPersistentMasterId: number;
    ColumnName: string;
    ColumnHeader: string;
    SelectedByDefault: boolean;
    IsReadOnly: boolean;
    DefaultColumnSequence: number;
    Dir: string;
    ValueType: string;
    EntityType: string | null;
    MapFromProperty: string | null;
    IsLocalizedKey: boolean;
    ColumnWidth: number | null;
    DecimalPlaces: number;
    Viewable: boolean;
    MaskingAllowed: boolean;
    TypeOfMasking: string | null;
    MaskingCount: number | null;
    ControlType: string;
    IsValueCommaSeparated: boolean;
    GroupName: string | null;
    MenuId: number | null;
    DynamicParam: string | null;
    fieldName: string;
    columnHeader: string;
    visibleByDefault: boolean;
}
export interface OvertimeHour {
    Text: string;
    Value: number;
    tooltipVisible: boolean;
    tooltipTitle: string;
}

export interface RecordStatusChangeResponse {
    ukey?: string;
    disabled: boolean;
    reasonForChange?: string;
    JobClientMappingUkey? : string;
}

export interface dropdownWithExtras extends Idropdown {
    TextLocalizedKey?: string;
    IsSelected?: boolean;
    [key: string]: any;
  }


export interface Idropdown {
    Text: string;
    Value: string;
  }


export interface dropdownModel extends Idropdown{
    disabled?: false;
    group?: string;
    selected?: boolean;
    items?: dropdownModel[];
  }

export type DynamicObject = Record<string, unknown>;
