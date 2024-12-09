/* eslint-disable one-var */
import { LocalizationService } from "@xrm-shared/services/Localization/localization.service";
import { SessionStorageService } from "@xrm-shared/services/TokenManager/session-storage.service";
import { ScreenId } from "../../Time/enum-constants/enum-constants";
import { CostAccountingDetailsMap } from "@xrm-core/models/acrotrac/time-entry/common-interface/cost-accounting-details-map";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { AssignmentDetail } from "../../common/view-review/approve-decline.model";

export const getSubtractedDate = (endDate: string, subtract: number): Date => {
	try {
		const date = new Date(endDate);
		date.setDate(date.getDate() - subtract);
		return date;
	} catch (error) {
		return new Date();
	}
};

export const checkReadOnly = (
	dateValue: string, CostAccountingCodeId: string, timesheetConfigDetails: any,
	 assignmentCostData: CostAccountingDetailsMap
// eslint-disable-next-line max-params
) => {

	if(timesheetConfigDetails == undefined || timesheetConfigDetails == null ||
		 Object.keys(timesheetConfigDetails).length == Number(magicNumber.zero)) {
		return {'isDisabled': false, 'title': []};
	}
	if (!(dateInRange(
		new Date(timesheetConfigDetails.AssignmentStartDate),
	 new Date(timesheetConfigDetails.AssignmentEndDate), new Date(dateValue)
	))) {
		return {'isDisabled': true, 'title': []};
	}

	if (timesheetConfigDetails.NonScheduledDates?.length && compareDates(timesheetConfigDetails.NonScheduledDates, dateValue) ) {
		return {'isDisabled': true, 'title': []};
	}

	if (
	  !timesheetConfigDetails.IsHolidayTimeEntryAllowed &&
	  compareDates(timesheetConfigDetails.HolidayDates, dateValue)
	) {
		return {'isDisabled': true, 'title': []};
	}
	const dataObj = assignmentCostData[parseInt(CostAccountingCodeId)];
	if (dataObj?.HasChargeEffectiveDate) {
		return {'isDisabled': (!dateInRange(new Date(dataObj.EffectiveStartDate ?? ''), new Date(dataObj.EffectiveEndDate ?? ''), new Date(dateValue))), 'title': []};
	}
	return {'isDisabled': false, 'title': []};
};

export const compareDates = (dateArray: string[], singleDate: string) => {
	return dateArray.some((date) =>
		new Date(date).getTime() === new Date(singleDate).getTime());
};

export const dateInRange = (startDate: Date, endDate: Date, date: Date) => {
	startDate.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
	endDate.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
	return (date >= startDate && date <= endDate);
};


export const createToasterTable = (toasterTableData: AssignmentDetail[] | null | undefined, localizationService: LocalizationService):string => {
	if(toasterTableData){
		const tableHeader = Object.keys(toasterTableData[0]);
		return `<table class="toaster-table">
		<thead>
			<tr>
				${tableHeader.map((header) =>
		`<th>${localizationService.GetLocalizeMessage(header)}</th>`).join('')}
			</tr>
		</thead>
		<tbody>
			${toasterTableData.map((row) =>
		`<tr>
					${tableHeader.map((header) =>
		`<td>${isValidDateTime(row[header], localizationService)}</td>`).join('')}
		</tr>
			`).join('')}
		</tbody>
	 </table>`;
	}
	return '';
};

function isValidDateTime(row:string, localizationService: LocalizationService) {
	const dateTimeRegex = /^(0?\d|1[0-2])\/(0?\d|[12]\d|3[01])\/\d{4} (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/;
	if(dateTimeRegex.test(row))
		return localizationService.TransformDate(row);

	return row;
}

export function setStartPoint(sessionStrg: SessionStorageService, routeOrigin: string, actionName: string) {
	sessionStrg.set('StartPoint', JSON.stringify({
		'RouteOrigin': routeOrigin,
		'Action': actionName.toLowerCase(),
		'ScreenId': getSecreeId(actionName)
	}));
}

function getSecreeId(action: string) {

	const actionMapping: Record<string, string> = {
		'time-adjustment-review': 'timeAdjustmentReview',
		'time-adjustment-view': 'timeAdjustmentView'
	};

	action = actionMapping[action] || action;
	if (action in ScreenId) {
		return ScreenId[action as keyof typeof ScreenId];
	} else {
		return undefined;
	}
}

export default getSubtractedDate;
