import { Tooltip } from "@xrm-shared/widgets/tooltip/tooltip.interface";
import { ColumnName, ControlType } from "./enums";
export class ConfigureClientDeclarations {

	public static Steps = [
		{ label: 'BasicDetails', icon: 'check', id: 'BasicDetails' },
		{ label: 'SystemMessages', icon: 'check', id: 'SystemMessages' },
		{ label: 'SecurityClearanceList', icon: 'check', id: 'SecurityClearanceList'},
		{ label: 'StaffingAgencyTiers', icon: 'check', id: 'StaffingAgencyTiers' },
		{ label: 'LocationOfficers', icon: 'check', id: 'LocationOfficers' },
		{ label: 'LoginMethod', icon: 'check', id: 'LoginMethod' },
		{ label: 'PasswordPolicy', icon: 'check', id: 'PasswordPolicy' }
	];

	public static ResourceTooltop : Tooltip = {
  	label: '',
  	value: '',
  	tooltipTitle: 'ClpSowResourceToolTip',
  	content: true,
  	tooltip: true,
  	tooltipPosition: 'top'
	};

	public static LoginCredentialTooltip : Tooltip = {
  	label: '',
  	value: '',
  	tooltipTitle: 'LoginCredentialToolTip',
  	content: true,
  	tooltip: true,
  	tooltipPosition: 'top'
	};

	public static ColumnSecurityClearance = [
  	{
  		colSpan: 6,
  		columnName: ColumnName.SecurityClearance,
  		controls: [
  			{
  				controlType: ControlType.ListLabel,
  				controlId: 'text1',
  				isNotTranslated: true
  			}
  		]
  	},
  	{
  		colSpan: 2,
  		columnName: ColumnName.Visible,
  		controls: [
  			{
  				controlType: ControlType.Switch,
  				controlId: 'switch1',
  				defaultValue: false,
  				onLabel: 'Yes',
  				offLabel: 'No',
  				requiredMsg: 'ReqFieldValidationMessage'
  			}
  		]
  	}
	];

	public static ColumnStaffingAgency = [
  	{
  		colSpan: 2,
  		columnName: 'Std. Name',
  		controls: [
  			{
  				controlType: 'label',
  				controlId: 'TierType',
					isNotTranslated: true
  			}
  		]
  	},
  	{
  		colSpan: 5,
  		columnName: 'TierTypeName',
  		controls: [
  			{
  				controlType: ControlType.Text,
  				controlId: 'TierTypeName',
  				isSpecialCharacterAllowed: true,
  				specialCharactersAllowed: [],
  				specialCharactersNotAllowed: [],
  				defaultValue: '',
  				maxlength: 200,
  				isEditMode: true,
  				isDisable: false,
  				placeholder: '',
  				requiredMsg: 'ReqFieldValidationMessage'
  			}
  		]
  	}
	];

	public static ColumnConfigurationStaffingAgency = {
  	isShowfirstColumn: true,
  	changeStatus: true,
  	itemSr: true,
  	uKey: false,
  	Id: true,
  	firstColumnName: 'Tier',
  	noOfRows: 0,
  	itemLabelName: '',
  	firstColumnColSpan: 1,
  	isEditMode: false,
  	isAddMoreValidation: true
	};

	public static ColumnConfigurationLocationOfficers = {
  	isShowfirstColumn: true,
  	isShowLastColumn: true,
  	firstColumnName: 'LocationOfficers',
  	changeStatus: true,
  	itemSr: true,
  	uKey: true,
  	Id: true,
  	secondColumnName: 'AddMore',
  	deleteButtonName: 'Delete',
  	noOfRows: 0,
  	itemLabelName: 'LocationOfficers',
  	firstColumnColSpan: 1,
  	lastColumnColSpan: 1,
  	isAddMoreValidation: true
	};

	public static ColumnConfigurationSecurityClearance = {
  	isShowfirstColumn: true,
  	isShowLastColumn: false,
  	changeStatus: true,
  	itemSr: true,
  	uKey: true,
  	Id: true,
  	firstColumnName: 'List #',
  	noOfRows: 0,
  	itemLabelName: '',
  	firstColumnColSpan: 1,
  	isEditMode: false,
  	isAddMoreValidation: false
	};
}


export interface Control {
	controlType: string;
	controlId: string;
	maxlength: number;
	isEditMode: boolean;
	isDisable: boolean;
	isSpecialCharacterAllowed: boolean;
	specialCharactersAllowed: string[];
	specialCharactersNotAllowed: string[];
	defaultValue: string;
	placeholder?: string;
	requiredMsg: string;
	validators: any[];
  }

export interface Column {
	colSpan: number;
	asterik?: boolean;
	columnName: string;
	controls: Control[];
	text1?: string;
  }

export interface SaveAction {
	reasonValue: string;
	text: string;
	themeColor: string;
	value: number;
}

