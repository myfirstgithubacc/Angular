/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
import { GridConfiguration } from "@xrm-shared/services/common-constants/gridSetting";
import { TabManager } from "../expense/enum-constants/enum-constants";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { XrmEntities } from "@xrm-shared/services/common-constants/XrmEntities.enum";
import { ITab, ITabOption } from "@xrm-shared/models/tab-option.model";
import { IActionModel, IActionSetModel } from "@xrm-shared/models/grid-actionset.mode";
import { Permission } from "@xrm-shared/enums/permission.enum";

export function getTabsAndActions<T>(
	role: number, listNavigator: (dataItem: T, action: string) => void,
	recordType?: number
) {
	const tabManager = new TabManager(),
		listOfTabs = tabManager.selectTab(),
		// using actionItems for only showing view action rest we can get from gridConfiguration method...
		actionItems = [
			{ icon: 'eye', color: 'dark-blue-color', title: 'View', fn: listNavigator,
				actionId: [
					Permission.CREATE_EDIT__VIEW,
					Permission.CREATE_EDIT_MSP_USER__VIEW,
					Permission.CREATE_EDIT_CLIENT_USER__VIEW,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__VIEW,
					Permission.VIEW_ONLY,
					Permission.VIEW_MSP_USER,
					Permission.VIEW_CLIENT_USER,
					Permission.VIEW_STAFFING_AGENCY_USER
				]
		 }
		],

		gridConfig = new GridConfiguration();

	let userPrefferedtabs: ITabOption = { bindingField: 'Status', tabList: [] },
		userPrefferedActions: IActionSetModel[] = [],
		 setRole: number | undefined = magicNumber.zero;

	switch (role) {
		// Admin, Msp, Client
		case magicNumber.one:
		case magicNumber.two:
		case magicNumber.four:
			 setRole = (role === magicNumber.two)
			 ?
			  recordType
				: magicNumber.zero;
			tabsForMspClient(userPrefferedtabs, listOfTabs);
			userPrefferedActions = TabManager.actionSets.map((action) =>
				({
					...action,
					'Items': actionForMspClient<T>(action, listNavigator, actionItems, setRole)
				}));

			// Admin, MSP we need to show View and Edit on Declined
			if (role === magicNumber.one || role === magicNumber.two) {
				// Draft Status only show view and edit...
				userPrefferedActions[0].Items = gridConfig.showViewEditIcon(listNavigator, listNavigator);
				// Declined Status only show view and edit...
				userPrefferedActions[1].Items = gridConfig.showViewEditIcon(listNavigator, listNavigator);
			} else {
				userPrefferedActions[0].Items = actionItems;
			}
			break;

		// Staffing, Contractor
		case magicNumber.three:
		case magicNumber.five:
			setRole = (role === magicNumber.three)
				? recordType
				: magicNumber.zero;
			userPrefferedtabs = listOfTabs;
			userPrefferedActions = TabManager.actionSets.map((action) =>
				({
					...action,
					'Items': getUserPreferredActions<T>(action, listNavigator, actionItems, setRole)
				}));
			break;
	}

	return { userPrefferedtabs, userPrefferedActions };
}

function tabsForMspClient(userPrefferedtabs: ITabOption, originaltabs: ITabOption) {
	let holdTab: ITab = { 'tabName': '', 'selected': false, 'favourableValue': ''};

	// Removing Draft and generating new array
	userPrefferedtabs.tabList = originaltabs.tabList.filter((tab) =>
		tab.tabName !== 'Draft').map((item) =>
		({ ...item }));

	/* changing the index of tabList
	Declined*/
	holdTab = userPrefferedtabs.tabList[0];

	// 'Declined' Tab override by 'Pending for Review'
	userPrefferedtabs.tabList[0] = userPrefferedtabs.tabList[1];
	userPrefferedtabs.tabList[1] = holdTab;

	// For Msp, Clinet and Admin it tab name would be 'Pending my Approvals'
	userPrefferedtabs.tabList[0].tabName = 'PendingMyApprovals';

	// Selecting Pending for Review
	userPrefferedtabs.tabList[0].selected = true;
}

function getUserPreferredActions<T>(
	actions: { 'Status': string; },
	listNavigator: (dataItem: T, action: string) => void,
	actionItem: IActionModel[],
	recordTypeIs?: number
) {
	const gridConfig = new GridConfiguration();
	if (actions.Status === 'Draft' || actions.Status === 'Declined') {
		return gridConfig.showViewEditIcon(listNavigator, listNavigator);
	} else if(actions.Status != 'ReviewPending' && actions.Status != 'Declined' && recordTypeIs === XrmEntities.Time) {
		return gridConfig.showViewAdjustIcon(listNavigator, listNavigator);
	}
	else {
		return actionItem;
	}
}

function actionForMspClient<T>(
	actions: { 'Status': string; },
	listNavigator: (dataItem: T, action: string) => void,
	actionItem: IActionModel[],
	recordTypeIs?: number
) {
	const gridConfig = new GridConfiguration();
	if (actions.Status === 'ReviewPending') {
		return gridConfig.showViewReviewIcon(listNavigator, listNavigator);
	} else if(actions.Status != 'ReviewPending' && actions.Status != 'Declined' && recordTypeIs === XrmEntities.Time) {
		return gridConfig.showViewAdjustIcon(listNavigator, listNavigator);
	} else
	{
		return actionItem;
	}
}

export function hasPermissions(permissions: {EntityTypeId: number, EntityType: string, ActionId: number, ActionName: string}[], data: number){
	return permissions.some((obj) =>
		obj.ActionId == data);
}
