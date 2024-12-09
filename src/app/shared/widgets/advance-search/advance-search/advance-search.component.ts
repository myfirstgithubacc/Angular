/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ActionCompletion, Actions, Store, ofActionCompleted } from '@ngxs/store';
import { PopupAnimation } from '@progress/kendo-angular-popup';
import { ApiResponse } from '@xrm-core/models/event-configuration.model';
import { SmartSearchSet } from '@xrm-core/store/actions/smart-search.action';
import { ManageAdvAppliedFilterData, ManageAdvFilter, ManageAdvFilterDropdownData } from '@xrm-core/store/advance-filter/actions/adv-filter.actions';
import { AdvFilterModel } from '@xrm-core/store/advance-filter/models/adv-filter.models';
import { AdvFilterState } from '@xrm-core/store/advance-filter/states/adv-filter.states';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { AdvanceSearchJson } from '@xrm-shared/models/add-more.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { controltype } from '@xrm-shared/services/common-constants/controltypes';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GlobalService } from '@xrm-shared/services/global.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Observable, Subject, Subscription, of, takeUntil } from 'rxjs';

@Component({
	selector: 'app-advance-search',
	templateUrl: './advance-search.component.html',
	styleUrls: ['./advance-search.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvanceSearchComponent {

	@Input() JsonData: AdvanceSearchJson[] = [];
	@Input() filterKey: any = null;

	// #region new code declaration area

	public sectorEntityId = XrmEntities.Sector;
	public candidatePool = XrmEntities.CandidatePool;
	public animation: PopupAnimation = {
		type: 'slide',
		direction: 'left',
		duration: magicNumber.zero
	};
	public margin = { horizontal: 400, vertical: -190 };

	@ViewChild('anchor', { read: ElementRef }) public anchor: ElementRef;
	@ViewChild('advToolTip', { read: ElementRef }) public advToolTip: ElementRef;
	@ViewChild('popup', { read: ElementRef }) public popup: ElementRef;
	@ViewChild('datepicker', { read: ElementRef }) public datepicker: ElementRef;
	@ViewChild('dateRange', { read: ElementRef })
	dateRange: ElementRef;
	@ViewChild('popupkendo') popupkendo: ElementRef;

	public isOpenDateTime: boolean = false;
	public controltype = controltype;
	public filterForm: FormGroup;
	private advFilterPersistData$: Observable<AdvFilterModel[]>;
	private storeData: AdvFilterModel | null | undefined = null;
	private ngUnsubscribe = new Subject<void>();

	@Input() EntityId: XrmEntities | null = null;
	@Input() entityType: string | null = null;
	@Input() menuId: number | null = null;
	@Input() contractorId: number | null = null;
	@Input() apiAddress: string | null = null;
	@Input() userValues: any = null;
	@Input() isApiGateway: boolean = false;
	@Input() isServerSidePagingEnable: boolean = false;
	@Input() searchText: string;

	@Input() list: any = [];

	isShowPopup: boolean = false;
	isClearBtnClicked: boolean = false;
	isCloseBtnClicked: boolean = false;
	isDisableApplyBtn: boolean = true;

	public isLoadOnDemand: boolean = true;

	numberZero = Number(magicNumber.zero);
	numberOne = Number(magicNumber.one);
	numberMinusOne = Number(magicNumber.minusOne);
	numberFiveHundred = Number(magicNumber.fiveHundred);

	dateRangeCount = Number(magicNumber.zero);
	timeRangeCount = Number(magicNumber.zero);

	controlInfo: any[] = [];
	dropdownData: any[] = [];

	formData: any = null;
	serverSidePagingObj: any = null;
	appliedFilters: any[] = [];
	finalList: any[] = [];

	dateFormat: string = 'MM/dd/yyyy';
	dateTimeFormat: string = 'MM/dd/yyyy hh:mm aa';
	public advFilterSubscription: Subscription;
	yesText: string = 'Yes';
	noText: string = 'No';
	private clickListener: () => void;
	private timeoutId: any;
	@Output() selectedFilter: EventEmitter<any>;
	resetAdvSearch: any;
	// #endregion new code declaration area

	// eslint-disable-next-line max-params
	constructor(
		private store: Store,
		private actions$: Actions,
		private formBuilder: FormBuilder,
		private localizationService: LocalizationService,
		private renderer: Renderer2,
		private toasterService: ToasterService,
		private elRef: ElementRef,
		private globalService: GlobalService,
		private datePipe: DatePipe,
		private gridViewSrv: GridViewService,
		private cdref: ChangeDetectorRef
	) {
		this.filterForm = this.formBuilder.group({});
		this.selectedFilter = new EventEmitter<any>();

		this.advFilterPersistData$ = store.select(AdvFilterState.GetAdvFilterData);

		this.clickListener = this.renderer.listen('window', 'click', (e: Event) => {
			if (!this.popupkendo.nativeElement.contains(e.target) && !this.isOpenDateTime) {
				this.isShowPopup = false;
				this.manageCss();

				this.dateRangeCount = Number(magicNumber.zero);
				this.timeRangeCount = Number(magicNumber.zero);
			}
			if (this.popupkendo.nativeElement.contains(e.target)) {
				this.isShowPopup = true;
				this.manageCss();
			}
			if (!this.popupkendo.nativeElement.contains(e.target) && this.anchor.nativeElement.contains(e.target)
				|| this.advToolTip.nativeElement?.contains(e.target)) {
				this.isShowPopup = true;
				this.manageCss();
				this.isClearBtnClicked = false;
				this.dateRangeCount = Number(magicNumber.zero);
				this.timeRangeCount = Number(magicNumber.zero);
			}
			if (this.isShowPopup && this.dateRangeCount > Number(magicNumber.zero)) {
				this.isShowPopup = true;
				this.manageCss();
				if (this.dateRangeCount == Number(magicNumber.one))
					this.dateRangeCount--;
			}
			if (this.isShowPopup && this.timeRangeCount > Number(magicNumber.zero)) {
				this.isShowPopup = true;
				this.manageCss();
				if (this.timeRangeCount == Number(magicNumber.two))
					this.timeRangeCount = Number(magicNumber.zero);
			}
		});
	}

	ngOnInit() {
		this.subscribeUnsubscribeStoreAction();

		this.yesText = this.localizationService.GetLocalizeMessage('Yes');
		this.noText = this.localizationService.GetLocalizeMessage('No');

		this.filterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
			this.isFormValueChanged();
		});

	}

	ngOnChanges() {
		if (this.isShowPopup)
			return;

		if (this.isServerSidePagingEnable && !this.apiAddress)
			return;

		this.loadDataFromStore(true);

		if (!this.storeData) {
			this.formData = null;
			this.finalList = this.appliedFilters = [];
			this.selectedFilter.emit(this.list);

			return;
		}

		this.appliedFilters = [];
		this.updateSupportiveData();
		const obj = this.getAppliedFilters();

		this.appliedFilters = obj.appliedFilters;
		this.serverSidePagingObj = obj.sspObj;

		if (this.formData && Object.keys(this.formData).length != Number(magicNumber.zero)) {
			const data = Object.keys(this.storeData.advFilterAppliedData).length == this.numberZero
				? this.list
				: this.storeData.advFilterList;

			if (this.isServerSidePagingEnable)
				this.selectedFilter.emit(this.serverSidePagingObj);
			else
				this.selectedFilter.emit(data);
		}

		this.generateFormControls();

	}

	ngAfterViewInit() {
		this.globalService.gridreset.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
			if (data) {
				this.appliedFilters = [];
				this.globalService.gridreset.next(false);
				this.cdref.markForCheck();
				return;

			}
		});
	}

	public openPopup = () => {
		this.isShowPopup = true;
		this.isCloseBtnClicked = false;

		this.loadDataFromStore();

		this.manageCss();
	};

	public closePopup = () => {
		this.isShowPopup = false;
		this.isCloseBtnClicked = true;

		this.manageCss();
	};

	public onApplyBtnClick() {
		this.filterForm.markAllAsTouched();

		if (!this.filterForm.valid)
			return;

		if (!this.isClearBtnClicked) {
			this.generateFinalResult(true);
			this.disPatchDataInStore();
			this.isClearBtnClicked = this.isShowPopup = false;
			this.manageCss();
			this.cdref.markForCheck();
			return;
		}

		this.formData = null;
		this.serverSidePagingObj = null;
		this.finalList = this.appliedFilters = [];

		this.disPatchDataInStore();
		this.isClearBtnClicked = this.isShowPopup = false;
		this.cdref.markForCheck();
		this.selectedFilter.emit(this.list);
		this.gridViewSrv.triggerClearCheckbox();
		this.manageCss();
	}

	public onClearBtnClick() {
		this.filterForm.reset();
		this.isClearBtnClicked = true;
	}

	public isFormValueChanged() {
		if (!this.filterForm.value) {
			this.isDisableApplyBtn = true;
			return;
		}

		this.isDisableApplyBtn = false;
		const formValue = this.filterForm.value,
			aKeys = formValue
				? Object.keys(formValue)
				: [],
			bKeys = this.formData
				? Object.keys(this.formData)
				: [];

		this.isDisableApplyBtn = aKeys.every((key: any) =>
			(formValue[key] == null || formValue[key] === "")) && bKeys.length == Number(magicNumber.zero);

		if (this.isDisableApplyBtn)
			return this.isDisableApplyBtn;

		if (bKeys.length == Number(magicNumber.zero)) {
			this.isDisableApplyBtn = aKeys.every((key: any) =>
				(!formValue[key] && (formValue[key] != 0)) || (Array.isArray(formValue[key]) && formValue[key].length == Number(magicNumber.zero)));

			if (!this.isDisableApplyBtn) {
				this.isClearBtnClicked = false;
			}
			return;
		}

		this.isDisableApplyBtn = true;
		for (const key of aKeys) {
			const val1 = formValue[key],
				val2 = this.formData[key];

			if ((!val1 && val1 !== 0) && (!val2 && val2 !== 0))
				continue;

			if ((val1 === val2) || (val1 === '' && val2 === null)) {
				continue;
			}
			if ((Array.isArray(val1) && val1.length === magicNumber.zero) && (Array.isArray(val2) && val2.length === magicNumber.zero))
				continue;

			if (JSON.stringify(val1) === JSON.stringify(val2)) {
				continue;
			}
			if (val1 === null && Array.isArray(val2) && val2.length === magicNumber.zero) {
				continue;
			} else if ((val2 === null && Array.isArray(val1) && val1.length === magicNumber.zero)) {
				continue;
			}

			this.isDisableApplyBtn = false;
			break;
		}

		this.isClearBtnClicked = false;
		return;
	}

	public transformLocalizedKey(item: any): string {
		if (!item.DynamicParam)
			return this.localizationService.GetLocalizeMessage(item.ColumnHeader);

		const hardcoded: DynamicParam[] = [];
		item.DynamicParam.split(',').map((key: string) => {
			hardcoded.push({ Value: key, IsLocalizeKey: true });
		});

		return this.localizationService.GetLocalizeMessage(item.ColumnHeader, hardcoded);
	}

	// #region common code

	private generateFormControls() {
		let index = 0;

		for (const item of this.controlInfo) {
			if (!item.ApplicableForAdvancedSearch)
				continue;

			const firstControlName = `${item.FieldName}-${this.EntityId}${index}`,
				secondControlName = `${firstControlName}S`,
				controlValidators: any[] = [],
				secondControlValidators: any[] = [];

			let isSecondControl = false;

			item.data = [];
			item.controlName = firstControlName;

			if (item.ControlType === controltype.integerrange) {
				isSecondControl = true;
				controlValidators.push(this.numberRangeValidator(firstControlName, secondControlName));
				secondControlValidators.push(this.numberRangeValidator(firstControlName, secondControlName, false));
			}
			else if (item.ControlType === controltype.daterange) {
				isSecondControl = true;
				controlValidators.push(this.dateRangeValidator(firstControlName, secondControlName));
				controlValidators.push(this.checkValidDateValidator(firstControlName, secondControlName, true));
				secondControlValidators.push(this.dateRangeValidator(firstControlName, secondControlName, false));
				secondControlValidators.push(this.checkValidDateValidator(firstControlName, secondControlName, false));
			}
			else if (item.ControlType === controltype.timerange) {
				isSecondControl = true;
			}

			this.filterForm.addControl(firstControlName, new FormControl(null, controlValidators));
			if (isSecondControl) {
				this.filterForm.addControl(secondControlName, new FormControl(null, secondControlValidators));
			}

			index++;
		}

		Object.keys(this.filterForm.value).forEach((key: any) => {
			const val = this.getFormControlDefaultValue(key);
			this.filterForm.get(key)?.setValue(val);
		});

		for (const item of this.controlInfo) {
			if (!item.ApplicableForAdvancedSearch)
				continue;

			item.data = this.isServerSidePagingEnable
				? this.getDropdownDataSSP(item)
				: this.getDropdownDataCSP(item);
		}

		this.isFormValueChanged();

	}

	private getFormControlDefaultValue(controlName: string) {
		if (!this.formData)
			return null;
		if (this.formData[controlName] == null || this.formData[controlName] === "")
			return null;
		return this.formData[controlName];
	}

	private updateSupportiveData() {
		this.formData = this.storeData?.advFilterAppliedData;

		this.controlInfo = this.storeData
			? this.storeData.advFilterData
			: [];

		this.dropdownData = this.storeData
			? this.storeData.dropdownData
			: [];
	}

	private getFormValue(isApplyBtnClicked: boolean) {
		return isApplyBtnClicked
			? this.filterForm.value
			: this.formData;
	}

	private getFormProperties(isApplyBtnClicked: boolean) {
		return isApplyBtnClicked
			? Object.keys(this.filterForm.value)
			: Object.keys(this.formData);
	}

	private getAppliedFilters(isApplyBtnClicked: boolean = false): any {
		const advValue: any = {},
			result: any = {},
			tempAppliedFilters: any[] = [],
			formValues = this.getFormValue(isApplyBtnClicked),
			columnInfo = this.getFormProperties(isApplyBtnClicked);

		for (let index = 0; index < columnInfo.length; index++) {
			const controlName = columnInfo[index],
				fieldName = controlName.substring(this.numberZero, controlName.indexOf('-')),
				fieldData = this.controlInfo.find((x: any) =>
					x.FieldName == fieldName && x.ApplicableForAdvancedSearch),
				isColumnNameExists = tempAppliedFilters.some((x) =>
					x.columnName == fieldName),
				groupFields = this.controlInfo.filter((x: any) =>
					x.GroupName == fieldName);

			let value: any;
			if (!fieldData || isColumnNameExists)
				continue;

			if (groupFields.length == this.numberZero) {
				value = this.getFormControlValue(formValues, controlName, columnInfo, index, fieldData.ControlType);
				if (!value || value.length == this.numberZero)
					continue;

				advValue[fieldName] = value;
			}
			else {
				value = this.getGroupFormControlValue(formValues, controlName, groupFields);
				if (value.length == this.numberZero)
					continue;

				for (const item of value) {
					advValue[item.ColumnName] = item.Value;
				}
				value = value.map((x: any) =>
					x.Text.toString());
			}

			tempAppliedFilters.push({
				columnName: fieldName,
				columnHeader: fieldData.ColumnHeader,
				controlType: fieldData.ControlType,
				value: value,
				dynamicParam: fieldData.DynamicParam,
				isGroup: groupFields.length != this.numberZero,
				groupData: formValues[controlName]
			});

			// end for loop
		}

		result.controlType = '';
		result.value = advValue;

		return { appliedFilters: tempAppliedFilters, sspObj: result };
	}

	private generateFinalResult(isApplyBtnClicked: boolean = false, isFromOnChange: boolean = false) {
		this.updateSupportiveData();
		this.appliedFilters = [];
		const obj = this.getAppliedFilters(true);

		this.appliedFilters = obj.appliedFilters;

		if (this.isServerSidePagingEnable) {
			this.serverSidePagingObj = obj.sspObj;
			this.selectedFilter.emit(this.serverSidePagingObj);
			return;
		}

		this.finalList = this.filterDataFromGridData(isApplyBtnClicked, isFromOnChange);
		this.selectedFilter.emit(this.finalList);
	}

	private transformStaticDropdownData(data: any) {
		if (!data)
			return [];

		data = JSON.parse(data);
		const result: any[] = [];

		data.map((item: any) => {
			item.Value = item.Value.toString();
			item.Text = this.localizationService.GetLocalizeMessage(item.Text);

			result.push(item);
		});

		return result;
	}

	private sortDropdownData(data: any[], sortOrder: 'asc' | 'desc' = 'asc'): any[] {
		return data;
	}

	// eslint-disable-next-line max-params
	private getFormControlValue(formValues: any, controlName: string, columnInfo: any[], currentIndex: number, selectControlType: string) {
		const rangeControls: any[] = [controltype.daterange, controltype.timerange, controltype.integerrange];

		if (formValues[controlName] == null || formValues[controlName] === "")
			return null;

		if (Array.isArray(formValues[controlName])) {
			return formValues[controlName].map((x: any) =>
				x.Value.toString());
		}

		let result = null,
			firstControlName: any = controlName,
			secondControlName: any = null;

		if (rangeControls.includes(selectControlType)) {
			if (controlName.endsWith('S')) {
				firstControlName = controlName.slice(this.numberOne, this.numberMinusOne);
				secondControlName = controlName;
			}
			else {
				firstControlName = controlName;
				secondControlName = `${controlName}S`;
			}
		}

		switch (selectControlType) {
			case controltype.daterange:
				result = this.getDateAndTimeValue(formValues[firstControlName], formValues[secondControlName]);
				break;
			case controltype.timerange:
				result = this.getDateAndTimeValue(formValues[firstControlName], formValues[secondControlName]);
				break;
			case controltype.datePicker:
				result = this.getDateAndTimeValue(formValues[firstControlName], null);
				break;
			case controltype.timepicker:
				result = this.getDateAndTimeValue(formValues[firstControlName], null);
				break;
			default:
				formValues[secondControlName] =
					formValues[secondControlName] === ''
						?
						null
						: formValues[secondControlName];
				result = secondControlName
					? [formValues[firstControlName], formValues[secondControlName]]
					: formValues[firstControlName];
		}

		return Array.isArray(result)
			? result
			: [result];
	}

	private getGroupFormControlValue(formValues: any, key: string, groupFields: any[]) {
		const formData = formValues[key],
			result: any[] = [];

		if (!formData)
			return result;

		for (const item of groupFields) {
			const data = formData.find((x: any) =>
				x.Key == item.FieldName);

			if (!data)
				continue;

			result.push({ Text: data.Text, ColumnName: data.Key, Value: [data.SearchValue] });
		}

		return result;
	}

	private getDateAndTimeValue(val1: any, val2: any, isDate: boolean = true) {
		if (val1)
			val1 = this.datePipe.transform(val1, this.dateTimeFormat);

		if (val2)
			val2 = this.datePipe.transform(val2, this.dateTimeFormat);

		return [val1, val2];

	}

	// #endregion common code

	// #region server side pagination

	private getDropdownDataSSP(dataItem: any) {
		let result: { Value: string, Text: string }[] = [];

		if (dataItem.ValueType && dataItem.ValueType == 'Boolean') {
			result.push({ Value: 'Yes', Text: this.yesText });
			result.push({ Value: 'No', Text: this.noText });

			return this.sortDropdownData(result);
		}

		const ddData = dataItem.OptionalDropdownData
			? this.transformStaticDropdownData(dataItem.OptionalDropdownData)
			: (this.dropdownData.find((x: any) =>
				x.column == dataItem.FieldName)?.data);

		result = ddData
			? ddData
			: [];

		return this.sortDropdownData(result);
	}

	// #endregion server side pagination

	// #region client side pagination

	private getDropdownDataCSP(dataItem: any) {
		let result: any[] = [];
		if (dataItem.ControlType == controltype.dropdonwlist || dataItem.ControlType == controltype.multiselect) {

			result = dataItem.OptionalDropdownData
				? this.transformStaticDropdownData(dataItem.OptionalDropdownData)
				: this.getDataForDropdownFromGridData(dataItem.FieldName);


			return this.sortDropdownData(result);
		}

		return result;
	}

	private getDataForDropdownFromGridData(fieldName: any) {
		const result: any[] = [];

		for (const item of this.list) {
			const text = item[fieldName],
				isExists = result.some((x: any) =>
					x.Text === text);

			if (!text || isExists || text == '')
				continue;

			result.push({ Value: text, Text: text });
		}

		return result;
	}

	// eslint-disable-next-line max-lines-per-function
	private filterDataFromGridData(isApplyBtnClicked: boolean = false, isFromOnChange: boolean = false): any {
		if (!isApplyBtnClicked && !isFromOnChange)
			return this.list;

		if (this.appliedFilters.length == this.numberZero)
			return this.list;

		const temp: any[] = [],
			result: any[] = [];
		let columnValue: any;

		this.list.forEach((item: any) => {
			for (const element of this.appliedFilters) {
				columnValue = item[element.columnName];

				if (!columnValue && !element.isGroup)
					continue;

				if (element.controlType == controltype.multiselect
					|| element.controlType == controltype.dropdonwlist) {

					if (element.isGroup && this.isTextExistsInGroupDD(item, element.groupData))
						temp.push('');

					if (!element.isGroup && this.isTextExistsInDD(element.value, columnValue.toString()) > Number(magicNumber.zero))
						temp.push(columnValue);

					continue;
				}

				if (element.controlType == controltype.daterange) {
					if (this.isDateRangeExistsInData(columnValue, element.value) > Number(magicNumber.zero))
						temp.push(columnValue);
					continue;
				}

				if (element.controlType == controltype.integerrange) {
					if (this.isNumberRangeExistsInData(Number(columnValue), element.value) > Number(magicNumber.zero))
						temp.push(columnValue);
					continue;
				}

				if (element.controlType == controltype.timepicker) {
					if (this.isTimeExistsInData(columnValue, element.value))
						temp.push(columnValue);
					continue;
				}

				if (element.controlType == controltype.timerange) {
					if (this.isTimeRangeExistsInData(columnValue, element.value)) {
						temp.push(columnValue);
						continue;
					}
				}

				if (element.value == columnValue) {
					temp.push(columnValue);
					continue;
				};

			}

			if (temp.length == this.appliedFilters.length) {
				result.push(item);
			}

			temp.length = 0;
		});

		return result;
	}

	private isTextExistsInGroupDD(item: any, groupData: any): boolean {
		if (!item || !groupData)
			return false;

		let result = false;

		for (const colData of groupData) {
			const columnName = colData.Key;
			result = item[columnName] == colData.SearchValue;

			if (!result)
				break;
		}

		return result;
	}

	private isTextExistsInDD(values: any, text: string): number {
		return values.filter((x: any) =>
			x == text).length;
	}

	private isDateRangeExistsInData(itemDate: any, values: any): number {
		const date = new Date(itemDate),
			startDate = (values[0] == undefined || values[0] == null)
				? null
				: new Date(values[0]),
			endDate = (values[1] == undefined || values[1] == null)
				? null
				: new Date(values[1]);
		if (startDate != null && endDate == null && date >= startDate)
			return Number(magicNumber.one);
		else if (startDate == null && endDate != null && date <= endDate)
			return Number(magicNumber.one);
		else if (startDate != null && endDate != null && date >= startDate && date <= endDate)
			return Number(magicNumber.one);
		else
			return Number(magicNumber.zero);
	}

	private isNumberRangeExistsInData(itemNumber: number, values: any): number {
		const num: number = itemNumber;
		let startFrom: number = 0,
			endFrom: number = 0;
		if (!isNaN(values[0]))
			startFrom = parseFloat(values[0]);
		if (!isNaN(values[1]))
			endFrom = parseFloat(values[1]);

		if (!isNaN(values[0]) && !isNaN(values[1]) && num >= startFrom && num <= endFrom)
			return Number(magicNumber.one);

		if (isNaN(values[0]) && num <= endFrom)
			return Number(magicNumber.one);

		if (isNaN(values[1]) && num >= startFrom)
			return Number(magicNumber.one);

		return Number(magicNumber.zero);
	}

	private isTimeExistsInData(itemTime: any, value: any): boolean {
		const dateTime = new Date(value),
			hours = dateTime.getHours().toString().length == Number(magicNumber.one)
				? `0${dateTime.getHours()}`
				: dateTime.getHours(),
			minutes = dateTime.getMinutes().toString().length == Number(magicNumber.one)
				? `0${dateTime.getMinutes()}`
				: dateTime.getMinutes(),
			seconds = dateTime.getSeconds().toString().length == Number(magicNumber.one)
				? `0${dateTime.getSeconds()}`
				: dateTime.getSeconds(),
			time = `${hours}:${minutes}:${seconds}`;

		return this.localizationService.TransformData(time, CultureFormat.TimeFormat) == itemTime;
	}

	private isTimeRangeExistsInData(itemTime: string, value: Date[]): boolean {
		if (value[0] == null && value[1] == null)
			return false;

		if (value[0] != null && value[1] == null) {
			const itemValue = new Date(`${value[0].toDateString()} ${itemTime}`);
			return itemValue.toString() == value[0].toString();
		}

		if (value[0] == null && value[1] != null) {
			const itemValue = new Date(`${value[1].toDateString()} ${itemTime}`);
			return itemValue.toString() == value[1].toString();
		}

		const itemDate = new Date(`${value[0].toDateString()} ${itemTime}`),
			fromDate = new Date(value[0]),
			toDate = new Date(value[1]),
			tempTodate = new Date(value[1]),
			newTodate = new Date(tempTodate.setDate(tempTodate.getDate() + Number(magicNumber.one))),
			newItemDate = new Date(`${tempTodate.toDateString()} ${itemTime}`);

		if (fromDate < toDate) {
			return itemDate >= fromDate && itemDate <= toDate;
		}

		if (itemDate >= fromDate) {
			return true;
		}

		return newItemDate <= newTodate;
	}

	// #endregion client side pagination

	// #region validators

	numberRangeValidator(minControlName: string, maxControlName: string, isOnMinControl: boolean = true) {
		return (control: AbstractControl): ValidationErrors | null => {

			const minValue = this.filterForm.get(minControlName)?.value,
				maxValue = this.filterForm.get(maxControlName)?.value;

			if (minValue === null || maxValue === null || (typeof minValue === 'string' && minValue.trim() === '') || (typeof maxValue === 'string' && maxValue.trim() === '') || (minValue === 0 && maxValue === 0)) {
				this.filterForm.get(minControlName)?.setErrors(null);
				this.filterForm.get(maxControlName)?.setErrors(null);
				return null;
			}

			if (minValue > maxValue) {
				return isOnMinControl
					? { error: true, message: 'MinValueshouldnotbegreaterthanMaxValue' }
					: { error: true, message: 'MaxValueshouldnotbelessthanMinValue' };
			} else {
				this.filterForm.get(minControlName)?.setErrors(null);
				this.filterForm.get(maxControlName)?.setErrors(null);
			}
			return null;
		};
	}

	dateRangeValidator(minControlName: string, maxControlName: string, isOnMinControl: boolean = true) {
		return (control: AbstractControl): ValidationErrors | null => {
			const minDate = this.filterForm.get(minControlName)?.value,
				maxDate = this.filterForm.get(maxControlName)?.value;


			if (minDate == null || maxDate == null)
				return null;

			if (this.localizationService.TransformDate(minDate) === this.localizationService.TransformDate(maxDate))
				return null;

			if (this.localizationService.TransformDate(minDate) > this.localizationService.TransformDate(maxDate)) {
				return null;
			}

			return null;
		};
	}

	checkValidDateValidator(fromControlName: string, toControlName: string, appendError: boolean) {
		return (control: AbstractControl): ValidationErrors | null => {
			const fromDate = this.filterForm.get(fromControlName)?.value,
				toDate = this.filterForm.get(toControlName)?.value;

			if (fromDate == null || toDate == null)
				return null;

			if (!fromDate || !toDate)
				return null;
			if (new Date(fromDate) > new Date(toDate)) {
				if (!appendError)
					this.filterForm.get(fromControlName)?.setErrors({ error: true, message: 'FromDateshouldnotbegreaterthanToDate' });
				return appendError
					? { error: true, message: 'FromDateshouldnotbegreaterthanToDate' }
					: null;
			} else {
				this.filterForm.get(fromControlName)?.setErrors(null);
				return null;
			}
		};
	}
	// #endregion validators

	// #region manage advance search popup

	onDateRangeOpen(e: any) {
		if (e != undefined) {
			this.isOpenDateTime = true;
			this.isShowPopup = true;
			this.dateRangeCount++;
		} else {
			// this.isOpenDateTime = false;
		}
	}

	onDateRangeClose(e: any) {
		if (e != null) {
			this.isOpenDateTime = false;
		} else {
			this.isOpenDateTime = true;
		}
		this.timeoutId = setTimeout(() => {
			this.isOpenDateTime = false;
		}, this.numberZero);
		this.isShowPopup = true;
		this.dateRangeCount--;
	}

	onDateRangeBlur() {

	}

	onTimeRangeOpen() {
		this.isOpenDateTime = true;
		this.isShowPopup = true;
		this.timeRangeCount++;
	}

	onTimeRangeClose(e: any | null) {
		if (!e?.prevented) {
			this.isOpenDateTime = true;
		} else {
			this.isOpenDateTime = false;
		}
		this.isShowPopup = true;
		this.timeRangeCount--;
		if (this.timeRangeCount == Number(magicNumber.zero))
			this.timeRangeCount = Number(magicNumber.two);
	}

	timeBlur(e: any) {
		this.isOpenDateTime = false;
	}

	blurTimePicker() {
		this.isOpenDateTime = true;
	}

	// #endregion manage advance search popup

	// #region Manage Store

	private loadDataFromStore(isFromOnChange: boolean = false) {
		this.advFilterPersistData$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: AdvFilterModel[]) => {
			this.storeData = null;
			if (isFromOnChange) {
				if (!res || res.length == magicNumber.zero)
					return;

				this.storeData = res.find((x: AdvFilterModel) =>
					x.entityId == this.EntityId && x.entityType == this.entityType && x.menuId == this.menuId);

				if (!this.storeData)
					return;

				this.updateSupportiveData();

				return;
			}

			if (!res || res.length == magicNumber.zero) {
				this.loadColumnCaptionDataFromBE(true);
				this.cdref.detectChanges();
				return;
			}

			this.storeData = res.find((x: AdvFilterModel) =>
				x.entityId == this.EntityId && x.entityType == this.entityType && x.menuId == this.menuId);

			if (!this.storeData) {
				this.loadColumnCaptionDataFromBE(true);
				this.cdref.detectChanges();
				return;
			}

			this.updateSupportiveData();
			this.generateFormControls();
			this.cdref.detectChanges();

		});

	}

	private loadColumnCaptionDataFromBE(isDropdownDataLoad = false) {
		this.store.dispatch(new ManageAdvFilter(this.EntityId, this.entityType, this.menuId, this.isApiGateway)).pipe((err) => {
			return of('');
		});

		if (isDropdownDataLoad)
			this.loadDropdownDataFromBE();
	}

	private loadDropdownDataFromBE() {
		const inpupData = {
			apiAddress: this.apiAddress,
			entityId: this.EntityId,
			entityType: this.entityType,
			menuId: this.menuId,
			isApiGateway: this.isApiGateway,
			payload: {
				columnName: null,
				pageIndex: 0,
				pageSize: 0,
				searchText: this.searchText,
				entityType: this.entityType,
				userValues: this.userValues,
				entityId: this.EntityId,
				menuId: this.menuId
			}
		};

		if (!inpupData.entityId || !inpupData.apiAddress)
			return;

		this.store.dispatch(new ManageAdvFilterDropdownData(inpupData)).pipe((err) => {
			return of('');
		});
	}

	private disPatchDataInStore() {
		this.store.dispatch(new SmartSearchSet({ key: this.EntityId, entityType: this.entityType, menuId: this.menuId, search: '' }));
		// eslint-disable-next-line max-len
		this.store.dispatch(new ManageAdvAppliedFilterData(this.EntityId, this.entityType, this.menuId, this.isApiGateway, this.filterForm.value, this.finalList, this.serverSidePagingObj));
	}

	private subscribeUnsubscribeStoreAction(): void {
		this.actions$
			.pipe(
				ofActionCompleted(ManageAdvFilter),
				takeUntil(this.ngUnsubscribe)
			)
			.subscribe((data: ActionCompletion) => {
				if (data.result.successful) {
					if (data.action instanceof ManageAdvFilter) {

						this.updateSupportiveData();

						if (!this.storeData)
							this.loadColumnCaptionDataFromBE(true);

						return;
					}
					else if (data.action instanceof ManageAdvFilterDropdownData) {
						this.updateSupportiveData();
						if (this.dropdownData.length == this.numberZero)
							this.loadDropdownDataFromBE();
					}
				} else if (data.result.error) {
					if (data.action instanceof ManageAdvFilter) {
						this.toasterService.showToaster(ToastOptions.Error, 'Somethingwentwrong');
					}
				}
			});

	}

	// #endregion Manage Store

	// #region external user

	public applyFilter(evt: string) {
		this.onApplyBtnClick();
	}

	// #endregion external user

	// #region CSS

	private manageCss() {
		if (this.isShowPopup)
			this.renderer.addClass(document.body, 'scrolling__hidden');
		else
			this.renderer.removeClass(document.body, 'scrolling__hidden');
	}

	private addClickOutsideListener(): void {
		document.addEventListener('click', (event) => {
			const clickedInside = this.elRef.nativeElement.contains(event.target);
			if (!clickedInside) {
				this.renderer.removeClass(document.body, 'scrolling__hidden');
			}
		});
	}

	// #endregion

	public onFocus(controlIndex: number) {
		const controlInfo = this.controlInfo[controlIndex],
			index = controlInfo.scrollIndex ?? this.numberZero;

		if (index != this.numberZero)
			return;

		if (controlInfo.data && controlInfo.data.length != this.numberZero)
			return;

		this.loadDropdownData(controlIndex, controlInfo.FieldName, this.numberZero);
	}

	public scrollToBottom(controlIndex: number, controlName: string, index: string) {
		this.controlInfo[controlIndex].scrollIndex = index;
		const controlInfo = this.controlInfo[controlIndex];
		this.loadDropdownData(controlIndex, controlInfo.FieldName, controlInfo.scrollIndex);

	}

	private loadDropdownData(controlIndex: number, columnName: string, scrollIndex: number) {
		if (this.controlInfo[controlIndex].isLastIndex)
			return;

		const pagingData =
		{
			pageSize: 10,
			startIndex: scrollIndex,
			entityType: this.entityType
		};

		this.gridViewSrv.getAdvFilterDropdownData(this.apiAddress, pagingData).pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((res: ApiResponse) => {
				if (res.Succeeded) {
					const newData = res.Data[0].data;

					this.controlInfo[controlIndex].isLastIndex = newData.length == this.numberZero;
					if (this.controlInfo[controlIndex].isLastIndex)
						return;

					this.controlInfo[controlIndex].data = this.controlInfo[controlIndex].data
						? [...this.controlInfo[controlIndex].data, ...newData]
						: newData;
				}
			});

	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
		this.toasterService.resetToaster();
		if (this.clickListener) this.clickListener();
		if (this.timeoutId) clearTimeout(this.timeoutId);
	}

}