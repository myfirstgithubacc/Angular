
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormGroup} from '@angular/forms';
import { AssignmentDetailsDataService } from '../../service/assingmentDetailsData.service';
import { AssingmentDetailsService } from '../../service/assingmentDetails.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { DatePipe } from '@angular/common';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { Subject, takeUntil } from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { IAssignmentDetails, IBooleanOptionField, IDropdownItems, IDynamicLabel, INumberOptionField, RequestDetail, timeLabelConfig, WorkAttributes } from '../../interfaces/interface';
import { DayInfo } from '../../service/dayInfo';
import { IControlDates, ISchedule, ITerminationReason, IValidationMessages } from '../../interfaces/editAssignmentInterface';
import { AssignmentEnum } from '../../enum/assignment-enum.enum';
import { WeekDayPicker } from '@xrm-shared/models/list-view.model';

@Component({selector: 'app-position-details',
	templateUrl: './position-details.component.html',
	styleUrls: ['./position-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionDetailsComponent implements OnInit, OnDestroy{
@Input() inputProperties : {
  editAssingmentForm:FormGroup;
  assignmentDetails:IAssignmentDetails;
  orgLevel1List:IDropdownItems[];
  orgLevel2List:IDropdownItems[];
  orgLevel3List:IDropdownItems[];
  orgLevel4List:IDropdownItems[];
  workLocationList:IDropdownItems[];
  locationAdress:string;
  hireCodeList:IDropdownItems[];
  laborCategoryList:IDropdownItems[];
  jobCategoryList:IDropdownItems[];
  securityClearanceList:IDropdownItems[];
  shiftList:IDropdownItems[];
  daysInfo:DayInfo[]|undefined;
  timeRange:timeLabelConfig;
  requestingManagerList:IDropdownItems[];
  modifyPO:IBooleanOptionField[];
  terminationAssignment:IBooleanOptionField[];
  choosestaffing:INumberOptionField[];
  choosestaffingClient:INumberOptionField[];
  dynamicLabelName:IDynamicLabel[];
  terminationReasonList:IDropdownItems[];
	endDateChanged:boolean;
	assignmentRevisionFields:IDropdownItems[];
	isControlRevision:WorkAttributes;
	estimatedCostChange:number;
	currencyCode:string|null;
	terminationVisibleField:ITerminationReason;
	levelDNR:INumberOptionField[];
	IsRevisionPending: boolean;
	revisionFields:string[];
  isAssignmentTerminated: boolean;
	showBackfill:boolean;
};
@Output() onShiftChangeDropdown: EventEmitter<IDropdownItems>;
@Output() onWeekChange: EventEmitter<ISchedule>;
@Output() getStatuss: EventEmitter<DayInfo[]>;
@Output() openRightSidePanell: EventEmitter<string>;
@Output() startDateChange: EventEmitter<{date:Date, control:IControlDates, key:IValidationMessages}>;
@Output() endDateChange: EventEmitter<{e:Date, control:IControlDates, key:IValidationMessages}>;
@Output() revisionFieldUpdate: EventEmitter<string>;
@Output() onChangePO:EventEmitter<boolean>;
@Output() onChangeterminationAssignment = new EventEmitter<IDropdownItems>();
@Output() onChangeTerminationRadio: EventEmitter<boolean>;
@Output() onChangeDnrSwitch = new EventEmitter<boolean>();
@Output() onChangeBackfillSwitch = new EventEmitter<boolean>();
@Output() backFillEndDateChange = new EventEmitter<{ e: Date, control: IControlDates, key: IValidationMessages }>();
@Output() backfillStartDateChange = new EventEmitter<{ e: Date, control: IControlDates, key: IValidationMessages }>();
@Output() changeNotifyStaffing = new EventEmitter<any>();
@Output() requestingManagerChange = new EventEmitter<any>();


public checkedKeys: any[] = [];
public expandedKeys: any = [""];

public isAppendModeForDropdown:boolean = true;
public staffingAgency:any = [];
private requestStaffingAgency: any;
public isControlRevision: WorkAttributes = {
	WorkLocationId: false,
	LaborCategoryId: false,
	JobCategoryId: false,
	AssignmentStartDate: false,
	AssignmentEndDate: false,
	ShiftId: false,
	ModifyPOEndDate: false,
	BaseWageRate: false,
	ActualSTWageRate: false,
	OTWageRate: false,
	DTWageRate: false,
	StaffingAgencyMarkup: false,
	OTRateTypeId: false,
	STBillRate: false,
	OTBillRate: false,
	StaffingAgencySTBillRate: false,
	StaffingAgencyOTBillRate: false,
	StaffingAgencyDTBillRate: false,
	ModifyPObasedOnRevisedRates: false,
	TerminateAssignment: false,
	AddedToDNR: false,
	BackFillRequested: false,
	BackFillStartDate: false,
	BackFillEndDate: false,
	NotifyToStaffingAgency: false,
	DTBillRate: false,
	NewPOFundAmount: false,
	NewPONumber: false,
	PoEffectiveFromDate: false,
	TerminateReasonId: false,
	restMealBreak: false,
	poFundAmount: '',
	shiftWorkingDays: false
};
public destroyAllSubscription$ = new Subject<void>();
public disabledDates:any = [];


// eslint-disable-next-line max-params
constructor(
    private assignmentDataService:AssignmentDetailsDataService,
            private assignmentDetailsService: AssingmentDetailsService,
            private localizationService: LocalizationService,
						private customValidators: CustomValidators,
						private datePipe:DatePipe,
						private dialogPopupService: DialogPopupService,
						private cd: ChangeDetectorRef,
						private toasterService: ToasterService
){
	this.onShiftChangeDropdown = new EventEmitter<IDropdownItems>();
	this.onWeekChange = new EventEmitter<ISchedule>();
	this.getStatuss = new EventEmitter<DayInfo[]>();
	this.openRightSidePanell = new EventEmitter<string>();
	this.startDateChange = new EventEmitter<{date:Date, control:IControlDates, key:IValidationMessages}>();
	this.endDateChange = new EventEmitter<{e:Date, control:IControlDates, key:IValidationMessages}>();
	this.revisionFieldUpdate = new EventEmitter<string>();
	this.onChangeTerminationRadio = new EventEmitter<boolean>();
	this.onChangePO = new EventEmitter<boolean>();

}

ngOnInit(): void {
	this.detectEndDateValuechange();
}

detectEndDateValuechange(){
	this.inputProperties.editAssingmentForm.get('revisedFundByEndDateChange')?.valueChanges.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((data) => {
		this.cd.markForCheck();
	});
}

public getRevisionFieldsUpdate(control:string){
	this.revisionFieldUpdate.emit(control);
}
public onChangeNotifyStaffing(e:number){
	if(e == Number(magicNumber.twoHundredEightyFour)){
		const payload = {
			laborCategoryId: this.inputProperties.editAssingmentForm.controls['LaborCategoryId'].value?.Value,
			locationId: this.inputProperties.editAssingmentForm.controls['WorkLocationId'].value?.Value,
			sectorId: this.inputProperties.assignmentDetails?.SectorId,
			xrmEntityId: XrmEntities.LightIndustrialRequest
		};
		this.assignmentDetailsService.getCustomStaffinfgAgency(payload).pipe(takeUntil(this.destroyAllSubscription$)).subscribe((res:any) => {
			if (res.Succeeded) {
				const staffingAgencyList = res.Data;
				this.transformDataForTreeView(staffingAgencyList);
			} else {
				this.staffingAgency = [];
			}
		});
	}
	else
	{
		this.changeNotifyStaffing.emit([]);
	}
	this.inputProperties.isControlRevision.NotifyToStaffingAgency = true;
}


public onChangePOEndDate(e: boolean){
	this.onChangePO.emit(e);
}

public isRevisionFieldExist(control: string): boolean {
	return this.inputProperties.revisionFields.some((ctrl: string) =>
		control === ctrl);
}

public onChangeBackfill(e:boolean){
	this.onChangeBackfillSwitch.emit(e);
	this.getDefaultBackfillStartDateEndDate();
	const backFillStartDate = this.inputProperties.editAssingmentForm.controls['BackFillStartDate'],
		backFillEndDate = this.inputProperties.editAssingmentForm.controls['BackFillEndDate'];
	if(e){
		backFillStartDate.markAsPristine();
		backFillEndDate.markAsPristine();
		backFillStartDate.setValidators(this.customValidators.RequiredValidator('PleaseSelectBackFillStartDate'));
		backFillEndDate.setValidators(this.customValidators.RequiredValidator('PleaseSelectBackFillEndDate'));
		this.inputProperties.editAssingmentForm.controls['NotifyToStaffingAgency'].setValue(magicNumber.twoHundredEightyTwo);
		this.inputProperties.editAssingmentForm.controls['NotifyToStaffingAgency'].updateValueAndValidity();
	}else{
		this.inputProperties.editAssingmentForm.controls['BackFillStartDate'].setValue(null);
		this.inputProperties.editAssingmentForm.controls['BackFillEndDate'].setValue(null);
		this.inputProperties.editAssingmentForm.controls['NotifyToStaffingAgency'].setValue(null);
		this.inputProperties.editAssingmentForm.controls['BackFillStartDate'].updateValueAndValidity();
		this.inputProperties.editAssingmentForm.controls['BackFillEndDate'].updateValueAndValidity();
		this.inputProperties.editAssingmentForm.controls['NotifyToStaffingAgency'].updateValueAndValidity();
		backFillStartDate.clearValidators();
		backFillEndDate.clearValidators();
	}
	backFillStartDate.markAsPristine();
	backFillStartDate.markAsUntouched();
	backFillEndDate.markAsPristine();
	backFillEndDate.markAsUntouched();
	backFillStartDate.updateValueAndValidity();
	backFillEndDate.updateValueAndValidity();
}

public onChangetermination(e:IDropdownItems){
	this.onChangeterminationAssignment.emit(e);
}

public onChangeTerminationAssignmentRadio(e:boolean){
	this.onChangeTerminationRadio.emit(e);
}

public onChangeDNR(e:boolean){
	this.onChangeDnrSwitch.emit(e);
}
private transformDataForTreeView(originalData: any) {
	const transformedData: any = Object.entries(originalData).
		map(([key, agencies]: any, index) => {
			if (agencies && agencies.length > magicNumber.zero) {
				return {
					text: this.localizationService.GetLocalizeMessage(key),
					Index: index.toString(),
					items: agencies.map((agency: any, innerIndex: any) =>
						({
							Index: `${index}_${innerIndex}`,
							text: agency.StaffingAgencyName,
							staffingAgencyId: agency.StaffingAgencyId,
							isSelected: agency.IsSelected,
							staffingAgencyTier: agency.StaffingAgencyTier
						}))
				};
			} else {
				return null;
			}
		}).filter((item) =>
			item !== null);
	  this.staffingAgency = transformedData;
	  this.checkedKeys = this.initializeCheckedKey(transformedData);
	   this.getSelectedStaffingAgencies({ checkedKey: this.checkedKeys });
}

public selectedStaffingAgency(event: any) {
	this.getSelectedStaffingAgencies(event);
}
private initializeCheckedKey(data: any): string[] {
	const prePatchCheckedKeys: string[] = [];
	data.forEach((outerItem: any, outerIndex: any) => {
		outerItem.items.forEach((innerItem: any, innerIndex: any) => {
			if (innerItem.isSelected) {
				prePatchCheckedKeys.push(`${outerIndex}_${innerIndex}`);
			}
		});
		if (outerItem.items.some((item: any) =>
			item.isSelected)) {
			prePatchCheckedKeys.push(outerIndex.toString());
		}
	});
	return prePatchCheckedKeys;
}
getSelectedStaffingAgencies(data: any) {
	const checkedKey = data.checkedKey,
		flattenedDataSet = this.staffingAgency.flatMap((outerItem:any, outerIndex:any) =>
			outerItem.items.map((innerItem: any, innerIndex: any) =>
				({
					...innerItem,
					Index: `${outerIndex}_${innerIndex}`
				}))),
		filteredDataSet = flattenedDataSet.filter((item: any) =>
			checkedKey.includes(item.Index));
	this.staffingAgencyDetailRequest(filteredDataSet);
}

staffingAgencyDetailRequest(filteredSelectedItems: any) {
	const requestStaffingAgency = filteredSelectedItems.map((item: any) => {
		return item.staffingAgencyId;
	});
	this.requestStaffingAgency = requestStaffingAgency;
	if(this.requestStaffingAgency){
		this.changeNotifyStaffing.emit(this.requestStaffingAgency);
	}
}


public getDynamicLabelName(key:string){
	return this.inputProperties.dynamicLabelName.find((x: IDynamicLabel) =>
		x.Text==key);
}

public onShiftChange(data:IDropdownItems){
	this.onShiftChangeDropdown.emit(data);
}

public getWeekData(data: WeekDayPicker){
	const parsedData: ISchedule = data;

	this.onWeekChange.emit(parsedData);
}

public getStatus(data:DayInfo[]){

	this.getStatuss.emit(data);
}

public openRightSidePanel(data:string){
	this.openRightSidePanell.emit(data);
}

public onChangePositionTitle(e:Event){
	const positionTitleText:AbstractControl<string> = this.inputProperties.editAssingmentForm.controls['positionTittle'];
	if(positionTitleText.value.length > Number(magicNumber.twoHundred)){
		positionTitleText.setValidators(this.customValidators.MaxLengthValidator(magicNumber.twoHundred, 'Position Title should not be more than 200 characters.'));
		positionTitleText.updateValueAndValidity();
	}

}

public getStartDateControl(){
	return {
		control1: 'AssignmentStartDate',
		control2: 'AssignmentEndDate'
	};
}

public onPrimaryManagerChange(data:IDropdownItems){
	const alternateManagerId = this.inputProperties.editAssingmentForm.get('alternateManager')?.value?.Value;

	if(data && alternateManagerId && data?.Value == alternateManagerId){
		this.inputProperties.editAssingmentForm.controls['primaryManager'].setErrors({
			message: 'PrimaryManagerAndAlternateManagerCannotBeSame'
		});
	}else{
		this.inputProperties.editAssingmentForm.controls['alternateManager'].clearValidators();
		this.inputProperties.editAssingmentForm.controls['primaryManager'].clearValidators();
		this.inputProperties.editAssingmentForm.controls['alternateManager'].updateValueAndValidity();
		this.inputProperties.editAssingmentForm.controls['primaryManager'].addValidators([this.customValidators.RequiredValidator('PleaseSelectPrimaryManager')]);
		this.inputProperties.editAssingmentForm.controls['primaryManager'].updateValueAndValidity();
	}

}

public onRequestingManagerOrgLvl1Change(data:IDropdownItems){
	this.requestingManagerChange.emit(data);
}

public onAlternateManagerChange(data:IDropdownItems){
	const primaryManagerId = this.inputProperties.editAssingmentForm.get('primaryManager')?.value?.Value;
	if(data && primaryManagerId && data?.Value == primaryManagerId){
		this.inputProperties.editAssingmentForm.controls['alternateManager'].setErrors({
			message: 'PrimaryManagerAndAlternateManagerCannotBeSame'
		});
	}else{
		this.inputProperties.editAssingmentForm.controls['alternateManager'].clearValidators();
		this.inputProperties.editAssingmentForm.controls['primaryManager'].clearValidators();
		this.inputProperties.editAssingmentForm.controls['primaryManager'].addValidators([this.customValidators.RequiredValidator('PleaseSelectPrimaryManager')]);
		this.inputProperties.editAssingmentForm.controls['alternateManager'].updateValueAndValidity();
		this.inputProperties.editAssingmentForm.controls['primaryManager'].updateValueAndValidity();
	}

}

public getStartDateKey(){
	return {
		key1: 'PleaseEnterStartDate',
		key2: 'StartDateCannotBeGreaterThanEndDate'
	};
}

public getEndDateControl(){
	return {
		control1: 'AssignmentEndDate',
		control2: 'AssignmentStartDate'
	};
}

public getEndDateKey(){
	return {
		key1: 'PleaseEnterEndDate',
		key2: 'EndDateCannotBeLessThanStartDate'
	};
}

public getBackFillStartDate(){
	return {
		control1: 'BackFillStartDate',
		control2: 'BackFillEndDate'
	};
}

public getBackFillEndDate(){
	return {
		control1: 'BackFillEndDate',
		control2: 'BackFillStartDate'
	};
}

public getBackFillStartDateKey(){
	return {
		key1: 'PleaseEnterStartDateBackfillPosition',
		key2: 'BackfillStartDateCannotGreaterThanbackfillEndDate'
	};
}

public getBackFillEndDateKey(){
	return {
		key1: 'PleaseEnterEndDateBackfillPosition',
		key2: 'BackfillEndDateCannotLessThanbackfillStartDate'
	};
}

public onStartDateChange(date: Date, control:IControlDates, key:IValidationMessages){
	date = new Date(this.inputProperties.editAssingmentForm.controls['AssignmentStartDate'].value);
	this.startDateChange.emit({date, control, key});
}

public onEndDateChange(e: Date, control:IControlDates, key:IValidationMessages){
	const date = new Date(this.inputProperties.editAssingmentForm.controls['AssignmentEndDate'].value);
	if(control.control1 == AssignmentEnum.AssignmentEndDate){
		this.inputProperties.editAssingmentForm.controls['AssignmentEndDate'].setValue(date);
		const endDate = new Date(this.inputProperties.editAssingmentForm.controls['AssignmentEndDate'].value);
		if(this.inputProperties.editAssingmentForm.get('BackFillRequested')?.value){
			endDate.setDate(endDate.getDate() + magicNumber.one);
			this.inputProperties.editAssingmentForm.controls['BackFillStartDate']?.setValue(endDate);
			this.inputProperties.editAssingmentForm.controls['BackFillEndDate']?.setValue(new Date(this.inputProperties.assignmentDetails.AssignmentEndDate));
		}
	}else{
		this.inputProperties.isControlRevision.BackFillEndDate = true;
	}

	e = new Date(e);
	this.endDateChange.emit({e, control, key});
}

public onBackFillEndDateChange(e:Date, control:IControlDates, key:IValidationMessages){

	e = new Date(e);
	this.inputProperties.isControlRevision.BackFillEndDate = true;
	this.backFillEndDateChange.emit({e, control, key});
}

public onBackfillStartDateChange(e:Date, control:IControlDates, key:IValidationMessages){

	e = new Date(e);
	this.backfillStartDateChange.emit({e, control, key});
	this.inputProperties.isControlRevision.BackFillStartDate = true;
}

private getDefaultBackfillStartDateEndDate(){
	const startDate = this.inputProperties.editAssingmentForm.controls['AssignmentStartDate'].value,
		endDate = this.inputProperties.editAssingmentForm.controls['AssignmentEndDate'].value,
		currentDate = new Date(endDate),
		nextDate = new Date(endDate),
		mainEndDate = new Date(this.inputProperties.assignmentDetails.AssignmentEndDate);

	nextDate.setDate(currentDate.getDate() + magicNumber.one);
	this.inputProperties.editAssingmentForm.controls['BackFillStartDate'].setValue(nextDate);
	this.inputProperties.editAssingmentForm.controls['BackFillEndDate'].setValue(new Date(mainEndDate));
}

public isReadOnly(controlName: string) {
	return this.assignmentDataService.isReadOnly(controlName, this.inputProperties.assignmentDetails.LoggedInUserRoleGroupID);
}

public isFieldVisible(controlName: string){
	return this.assignmentDataService.isFieldVisible(controlName, this.inputProperties.assignmentDetails.LoggedInUserRoleGroupID);
}

public getEstimatedCostChangeText(amount:number, currency:string|null){
  	if(amount)
		return'';
	const dynamicParam: DynamicParam[] =
  [{Value: this.localizationService.TransformNumber(amount, Number(magicNumber.two), null, Number(magicNumber.two))?? '0', IsLocalizeKey: true }, { Value: String(currency), IsLocalizeKey: true }];
	amount = amount > Number(magicNumber.zero)
		? amount
		: magicNumber.zero;
	return this.localizationService.GetLocalizeMessage('EstimatedCostChange', dynamicParam);
}


ngOnDestroy(): void {
	this.destroyAllSubscription$.next();
	this.destroyAllSubscription$.complete();
}

}
