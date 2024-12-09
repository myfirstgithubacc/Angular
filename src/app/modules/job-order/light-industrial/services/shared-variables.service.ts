import { Injectable } from '@angular/core';
import { OrgTypeData, TimeRange } from '../interface/li-request.interface';
import { ILoadMoreColumnOptions } from '@xrm-shared/models/load-more.interface';

@Injectable({
	providedIn: 'root'
})
export class SharedVariablesService {

	public timeRange: TimeRange = {
		labelLocalizeParam1: [],
		labelLocalizeParam2: [],
		label1: 'Start Time',
		label2: 'End Time',
		DefaultInterval: 0,
		AllowAI: false,
		startisRequired: true,
		endisRequired: true,
		starttooltipVisible: true,
		starttooltipTitle: 'string',
		starttooltipPosition: 'string',
		starttooltipTitleLocalizeParam: [],
		startlabelLocalizeParam: [],
		startisHtmlContent: true,
		endtooltipVisible: true,
		endtooltipTitle: 'string',
		endtooltipPosition: 'string',
		endtooltipTitleLocalizeParam: [],
		endlabelLocalizeParam: [],
		endisHtmlContent: true
	};

	public orgType1Data: OrgTypeData = {
		OrgName: '',
		IsMandatory: true,
		IsVisible: true
	};

	public orgType2Data: OrgTypeData = {
		OrgName: '',
		IsMandatory: false,
		IsVisible: false
	};

	public orgType3Data: OrgTypeData = {
		OrgName: '',
		IsMandatory: false,
		IsVisible: false
	};

	public orgType4Data: OrgTypeData = {
		OrgName: '',
		IsMandatory: false,
		IsVisible: false
	};

	public loadMoreColumnOptions: ILoadMoreColumnOptions[] = [
		{ columnHeader: 'Sector', fieldName: 'SectorName' },
		{ columnHeader: 'Location', fieldName: 'LocationName' },
		{ columnHeader: 'LaborCategory', fieldName: 'LaborCategory' },
		{ columnHeader: 'JobCategory', fieldName: 'JobCategory' },
		{ columnHeader: 'Shift', fieldName: 'RequestShiftDetailGetAllDto.ShiftName' },
		{ columnHeader: 'CostAccountingCode', fieldName: 'CostAccountingCode' },
		{ columnHeader: 'PositionDescription', fieldName: 'PositionDescription' }
	];
}
