import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { EntityActionID } from "../cost-accounting-enum-constants/enum-constants";

export function getUsersWithFilter(val: number) {
	return {
		"roleGroupIds": [],
		"roleGroupDtos": [
			{
				"roleGroupId": magicNumber.four,
				"roleNos": []
			}
		],
		"xrmEntityActionIds": [EntityActionID.Approved, EntityActionID.Declined],
		"sectorIds": [val],
		"locationIds": [],
		"orgLevel1Ids": []
	};
}

export function getColumnOption() {
	return [
		{
			fieldName: 'ShiftName',
			columnHeader: 'IsAllowManualShift',
			visibleByDefault: true
		},
		{
			fieldName: 'ApproverName',
			columnHeader: 'PrimaryApprover',
			visibleByDefault: true
		},
		{
			fieldName: 'AltApproverName',
			columnHeader: 'AlternateApprover',
			visibleByDefault: true
		}
	];
}

export function getTabOptions() {
	return {
		bindingField: 'Disabled',
		tabList: [
			{
				tabName: 'ApproverDetails',
				favourableValue: 'All',
				selected: true
			}
		]
	};
}
