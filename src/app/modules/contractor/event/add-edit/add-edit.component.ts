import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { StateService } from 'src/app/services/masters/state.service';
import { ContractorService } from 'src/app/services/masters/contractor.service ';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { NavigationPaths } from '../constant/routes-constant';
import { ContractorEvent } from '../data.model';
import { HttpStatusCode } from '@angular/common/http';
import { LightIndustrialService } from 'src/app/modules/job-order/light-industrial/services/light-industrial.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DatePipe } from '@angular/common';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { AssignmentDetails, EventConfigData, ICheckedKeyData, IEventNameDropdown, IGetStaffingAgencies, IGetStaffingAgency, StaffingAgency, StaffingAgencyItems, StaffingCategoryList, StaffingChoice, TransformedAgency, TransformedData } from '../constant/event-interface';
import { IDropdownOption } from '@xrm-shared/models/common.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-add-editContractorEvent',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsAddEditComponent implements OnInit, OnDestroy {

	@Input() isTab: boolean = false;
	@Output() onCancel: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Input() contractorId: number;
	public magicNumber = magicNumber;
	public DateTypeId: number = magicNumber.twofiftyFour;
	public AddEditEventReasonForm: FormGroup;
	public eventConfigData: EventConfigData = {
		UKey: '',
		ID: magicNumber.zero,
		EventCode: '',
		SectorName: '',
		EventName: '',
		DateType: '',
		DateTypeId: magicNumber.zero,
		RequiresEventReason: false,
		RequiresComment: false,
		RequiresBackfill: false,
		BackfillDefaultValue: false,
		EffectOnDailySchedule: '',
		EffectOnDailyScheduleId: magicNumber.zero,
		ManagerSurveyToRequested: false,
		EventEnteredBy: '',
		NotifyTo: '',
		DelayNotificationBeforeEvent: false,
		DaysPriorToEventDate: null,
		ValidateEventDateWithTimesheet: false,
		IsProfessionalContractor: false,
		IsLightIndustrialContractor: false,
		Disabled: false,
		CreatedBy: '',
		CreatedOn: '',
		LastModifiedBy: null,
		LastModifiedOn: null
	};
	public entityID = XrmEntities.ContractorEvent;
	ContractorEvent: ContractorEvent = new ContractorEvent();
	public assignmentIdList: IDropdownOption[] = [];
	public sectorDropDownList: IDropdownOption[] = [];
	private assignmentDetailData: AssignmentDetails;
	public eventNameList: IEventNameDropdown[] = [];
	public eventReasonList: IDropdownOption[] = [];
	public staffingAgencyList: StaffingCategoryList[];
	public checkedKeys: string[];
	private filterStaffingAgencyList: number[];
	public isAdded:boolean = false;
	private staffingLabel: string;
	public choosestaffing: StaffingChoice[];
	public minFromDate: Date;
	private isMSPUser: boolean = false;
	private unsubscribe$: Subject<void> = new Subject<void>();

	public minStartDate = ((d: Date) => {
		d.setDate(d.getDate());
		return this.localizationService.GetDate(d);})(this.localizationService.GetDate());

	public minEndDate = ((d: Date) => {
		d.setDate(d.getDate());
		return this.localizationService.GetDate(d);})(this.localizationService.GetDate());

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		private route: Router,
		public sector: SectorService,
		public State: StateService,
		public commonHeaderIcon: CommonHeaderActionService,
		private toasterServc: ToasterService,
		public contractorService: ContractorService,
		public customValidator: CustomValidators,
		public LightIndustrialServices: LightIndustrialService,
		private localizationService: LocalizationService,
		private datePipe : DatePipe,
		private cdr: ChangeDetectorRef
	) {
		this.formInit();
	}

	public formInit() {
		this.AddEditEventReasonForm = this.fb.group({
			assignmentId: [null, this.customValidator.RequiredValidator("PleaseSelectAssignemntId")],
			incurredDate: [null],
			comment: [null],
			sectorId: [null, this.customValidator.RequiredValidator("PleaseSelectSector")],
			eventConfigId: [null, this.customValidator.RequiredValidator("PleaseSelectEventName")],
			eventReasonId: [null],
			broadcastType: [null],
			backfillRequired: [false],
			backfillStartDate: [null],
			backfillEndDate: [null],
			fromDate: [null],
			toDate: [null]
		});
	}


	populateChooseStaffing() {
		 const currentStaf = this.localizationService.GetLocalizeMessage('CurrentStaffingAgency');
		if(this.isMSPUser){
			this.choosestaffing = [
				{ Text: `${currentStaf} (${this.staffingLabel})`, Value: magicNumber.one },
				{ Text: 'AllPrefStaffAgencies', Value: magicNumber.two },
				{ Text: 'SelectedStaffAgencies', Value: magicNumber.three }
			];
		}else{
			this.choosestaffing = [
				{ Text: `${currentStaf}`, Value: magicNumber.one },
				{ Text: 'AllPrefStaffAgencies', Value: magicNumber.two }
			];
		}
	}

	addValidationStartEndDate(){
		const start = this.AddEditEventReasonForm.get('backfillStartDate')?.value;
		this.minEndDate = this.localizationService.GetDate(start);
		this.removeValidationStartEndDate(this.AddEditEventReasonForm.get('backfillStartDate')?.value);
	}

	removeValidationStartEndDate(date:Date){
		if(date!=null && date < this.AddEditEventReasonForm.get('backfillEndDate')?.value){
			this.AddEditEventReasonForm.get('backfillStartDate')?.clearValidators();
			this.AddEditEventReasonForm.get('backfillStartDate')?.updateValueAndValidity();
		}
		if(date!=null && date > this.AddEditEventReasonForm.get('backfillEndDate')?.value){
			this.AddEditEventReasonForm.controls['backfillStartDate'].setValidators([this.customValidator.RequiredValidator("PleaseSelectBackFillStartDate"), this.customValidator.DateGreaterThanValidator('backfillEndDate', 'BackfillStartDateCannotGreaterThanbackfillEndDate') as ValidatorFn]);
			this.AddEditEventReasonForm.controls['backfillStartDate'].updateValueAndValidity();
		}
	}

	onChangeFromDate(){
		const start = this.AddEditEventReasonForm.get('fromDate')?.value?.getTime();
		this.minFromDate = this.localizationService.GetDate(start);
	}

	onChangeThroughDate(){
		const end = this.AddEditEventReasonForm.controls['toDate'] as FormControl,
			start = this.AddEditEventReasonForm.controls['fromDate'] as FormControl;

		if(end.value >= start.value){
			start.clearValidators();
			start.addValidators([
				this.customValidator.RequiredValidator("PleaseSelectFromDate"),
				this.customValidator.DateGreaterThanValidator('toDate', 'FromDateCannotGreaterThanThroughDate') as ValidatorFn
			]);
			start.updateValueAndValidity();
		}
	}

	ngOnInit(): void {
		this.getSectorByContractorId(this.contractorId);
		this.getUserType();
	}


	private getUserType() {
		const userType = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
		if (userType == magicNumber.two) {
			this.isMSPUser = true;
		}
	}

	cancelForm() {
		if (this.isTab) {
			this.onCancel.emit(true);
		}else {
			this.route.navigateByUrl(NavigationPaths.list);
		}
	}

	submitForm() {
		this.AddEditEventReasonForm.markAllAsTouched();
		if (!this.AddEditEventReasonForm.valid) {
			return;
		}else {
			this.bindingValues();
			this.contractorService.saveContractorEvent(this.ContractorEvent).pipe(takeUntil(this.unsubscribe$))
				.subscribe((res: GenericResponseBase<number | null>) => {
					this.toasterServc.resetToaster();
					if (res.StatusCode == Number(HttpStatusCode.Ok)) {
						this.isAdded = true;
						this.toasterServc.showToaster(ToastOptions.Success, "ContractorEventAddedSuccessfully");
						this.cancelForm();
					}else if (res.StatusCode == Number(HttpStatusCode.Conflict)) {
						this.toasterServc.resetToaster();
						this.toasterServc.showToaster(ToastOptions.Error, res.Message);
					}else {
						this.toasterServc.showToaster(
							ToastOptions.Error,
							res.Message
						);
					}
				});
		}
	}


	bindingValues() {
		delete this.AddEditEventReasonForm.value.sectorId;
		this.ContractorEvent = this.AddEditEventReasonForm.value;
		if (this.eventConfigData.NotifyTo) {
			this.ContractorEvent.isEmailNotificationRequired = true;
		} else {
			this.ContractorEvent.isEmailNotificationRequired = false;
		}
		this.ContractorEvent.assignmentId = parseInt(this.AddEditEventReasonForm.controls['assignmentId'].value?.Value);
		this.ContractorEvent.eventConfigId = parseInt(this.AddEditEventReasonForm.controls['eventConfigId'].value?.Value);
		this.ContractorEvent.eventReasonId = parseInt(this.AddEditEventReasonForm.controls['eventReasonId'].value?.Value);
		this.ContractorEvent.isEmailNotificationToBeDelayed = this.eventConfigData.DelayNotificationBeforeEvent;
		this.ContractorEvent.staffingAgencyIds = this.filterStaffingAgencyList;
		if(this.AddEditEventReasonForm.controls['fromDate'].value){
			this.ContractorEvent.fromDate = this.datePipe.transform(this.AddEditEventReasonForm.controls['fromDate'].value, 'MM/dd/yyyy') ?? '';
		}
		if(this.AddEditEventReasonForm.controls['toDate'].value){
			this.ContractorEvent.toDate = this.datePipe.transform(this.AddEditEventReasonForm.controls['toDate'].value, 'MM/dd/yyyy');
		}
		if (this.AddEditEventReasonForm.controls['incurredDate'].value) {
			this.ContractorEvent.fromDate = this.datePipe.transform(this.AddEditEventReasonForm.controls['incurredDate'].value, 'MM/dd/yyyy') ?? '';
		}
		if(this.AddEditEventReasonForm.controls['backfillStartDate'].value && this.AddEditEventReasonForm.controls['backfillEndDate'].value){
			this.ContractorEvent.backfillStartDate = this.datePipe.transform(this.AddEditEventReasonForm.controls['backfillStartDate'].value, 'MM/dd/yyyy');
			this.ContractorEvent.backfillEndDate = this.datePipe.transform(this.AddEditEventReasonForm.controls['backfillEndDate'].value, 'MM/dd/yyyy');
		}
		if (this.ContractorEvent.isEmailNotificationToBeDelayed && this.eventConfigData.DaysPriorToEventDate !== null) {
			const eventDate = this.ContractorEvent.fromDate;
			this.ContractorEvent.eventNotificationToBeSentOn = this.getDateBeforeday(eventDate, this.eventConfigData.DaysPriorToEventDate);
		}else {
			this.ContractorEvent.eventNotificationToBeSentOn = null;
		}
	}


	getDateBeforeday(eventdate: string, day: number) {
		const date = this.localizationService.GetDate(eventdate);
		date.setDate(date.getDate() - day);
		return date;
	}

	getSectorByContractorId(contractorId: number) {
		this.contractorService.getSectorBasedOnContractorId(contractorId).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<IDropdownOption[]>) => {
				if (res.Succeeded && res.Data) {
					this.sectorDropDownList = res.Data;
					if (this.sectorDropDownList.length == Number(magicNumber.one)) {
						this.AddEditEventReasonForm.controls['sectorId'].setValue(this.sectorDropDownList[magicNumber.zero].Value);
						this.getAssignmentBasedOnSectorId(Number(this.sectorDropDownList[magicNumber.zero].Value));
					}
				}
			});
	}

	changeSectorName(data: IDropdownOption) {
		const clearValidators = ['incurredDate', 'comment', 'eventConfigId', 'assignmentId', 'eventReasonId', 'backfillStartDate', 'backfillEndDate', 'fromDate', 'toDate'];
		if (data.Value) {
			this.clearValidators(clearValidators);
			this.assignmentIdList = [];
			this.eventNameList = [];
			this.eventReasonList = [];
			this.setValidatorBasedOnEventConfig(this.eventConfigData);
			this.getAssignmentBasedOnSectorId(Number(data.Value));
		}
	}


	changeAssignement(data: IDropdownOption) {
		const clearValidators = ['incurredDate', 'comment', 'eventConfigId', 'eventReasonId', 'backfillStartDate', 'backfillEndDate', 'fromDate', 'toDate'];
		if (data.Value) {
			this.clearValidators(clearValidators);
			this.eventNameList = [];
			this.eventReasonList = [];
			this.getEventNameBasedOnAssignmentId(data.Value);
			this.getEventReasonBasedOnAssignmentId(data.Value);
			this.getAssignmentData(Number(data.Value));
		}
	}

	getAssignmentBasedOnSectorId(sectorId: number) {
		this.contractorService.getAssignmentBasedOnSectorId(sectorId, this.contractorId)
			.pipe(
				takeUntil(this.unsubscribe$),
				switchMap((res: GenericResponseBase<IDropdownOption[]>) => {
					if (res.Succeeded && res.Data) {
						this.assignmentIdList = res.Data;
						if (this.assignmentIdList.length === Number(magicNumber.one)) {
							const assignmentId = this.assignmentIdList[magicNumber.zero].Value;
							this.AddEditEventReasonForm.controls['assignmentId'].setValue(this.assignmentIdList[magicNumber.zero]);
							return of(assignmentId);
						}
					}
					return of(null);
				}),
				switchMap((assignmentId: number | null) => {
					if (assignmentId !== null) {
						this.getEventNameBasedOnAssignmentId(assignmentId);
						this.getEventReasonBasedOnAssignmentId(assignmentId);
						this.getAssignmentData(assignmentId);
					}
					return of(null);
				})
			).subscribe();
	}

	getAssignmentData(assignmentId: number) {
		this.contractorService.getAssignmentDetailsbasedOnAssignmentId(assignmentId).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<AssignmentDetails>) => {
				if (res.StatusCode == Number(magicNumber.twoHundred) && res.Data) {
					this.assignmentDetailData = res.Data;
					this.staffingLabel = this.assignmentDetailData.StaffingAgencyName;
					this.populateChooseStaffing();
				}
			});
	}

	getEventNameBasedOnAssignmentId(assignmentId: number) {
		this.contractorService.getContractorEventById(assignmentId).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<IEventNameDropdown[]>) => {
				if (res.StatusCode == Number(magicNumber.twoHundred) && res.Data) {
					this.eventNameList = res.Data;
					if (this.eventNameList.length == Number(magicNumber.one)) {
						this.AddEditEventReasonForm.controls['eventConfigId'].setValue(this.eventNameList[magicNumber.zero]);
						this.changeEventName(this.eventNameList[magicNumber.zero]);
					}
				}
			});
	}

	getEventReasonBasedOnAssignmentId(assignmentId: number) {
		this.contractorService.getContractorEventReasonBasedOnAssignmentId(assignmentId).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<IDropdownOption[]>) => {
				if (res.StatusCode == Number(magicNumber.twoHundred) && res.Data) {
					this.eventReasonList = res.Data;
					if (this.eventReasonList.length == Number(magicNumber.one)) {
						this.AddEditEventReasonForm.controls['eventReasonId'].setValue(this.eventReasonList[magicNumber.zero]);
					}
				}
			});
	}

	changeEventName(data: IEventNameDropdown) {
		const clearValidators = [
			'incurredDate', 'comment', 'backfillRequired', 'backfillStartDate',
			'backfillEndDate', 'fromDate', 'toDate'
		];
		if (data.Value) {
			this.clearValidators(clearValidators);
			this.fetchAndProcessEventConfig(data.Value);
		}
	}

	fetchAndProcessEventConfig(eventId: number) {
		this.contractorService.getEventConfigBasedOnEventId(eventId).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<EventConfigData>) => {
				if (res.StatusCode == Number(magicNumber.twoHundred) && res.Data) {
					this.eventConfigData = res.Data;
					this.cdr.markForCheck();
					if (this.eventConfigData.RequiresBackfill) {
						this.AddEditEventReasonForm.controls['backfillRequired'].setValue(this.eventConfigData.BackfillDefaultValue);
						if (this.AddEditEventReasonForm.controls['backfillRequired'].value) {
							this.AddEditEventReasonForm.controls['broadcastType'].setValue(magicNumber.one);
						}
					}
					this.setValidatorBasedOnEventConfig(this.eventConfigData);
				}
			});
	}


	clearValidators(controlsToReset: string[]) {
		controlsToReset.forEach((controlName: string) => {
			const control = this.AddEditEventReasonForm.controls[controlName];
			control.setValue(null);
		});
		this.cdr.markForCheck();
	}

	setValidatorBasedOnEventConfig(eventConfigData: EventConfigData) {
		const controlConfig = [
			{ controlName: 'eventReasonId', condition: eventConfigData.RequiresEventReason, validators: [this.customValidator.RequiredValidator("PleaseSelectEventReason")] },
			{ controlName: 'comment', condition: eventConfigData.RequiresComment, validators: [this.customValidator.RequiredValidator("PleaseEnterComment")] },
			{
				controlName: 'fromDate',
				condition: eventConfigData.DateTypeId === NavigationPaths.DateType.fromAndThroughDate,
				validators: [
					this.customValidator.RequiredValidator("PleaseSelectFromDate"),
					this.customValidator.DateGreaterThanValidator('toDate', 'FromDateCannotGreaterThanThroughDate') as ValidatorFn
				]
			},
			{
				controlName: 'toDate',
				condition: eventConfigData.DateTypeId === NavigationPaths.DateType.fromAndThroughDate,
				validators: [this.customValidator.RequiredValidator("PleaseSelectThroughDate"), this.customValidator.DateLessThanValidator('fromDate', 'ThroughDateCannotLessThanFromDate') as ValidatorFn]
			},
			{ controlName: 'incurredDate', condition: eventConfigData.DateTypeId === NavigationPaths.DateType.incuredDate, validators: [this.customValidator.RequiredValidator("PleaseSelectIncurredDate")] },
			{ controlName: 'backfillStartDate', condition: this.AddEditEventReasonForm.controls['backfillRequired'].value, validators: [this.customValidator.RequiredValidator("PleaseSelectBackFillStartDate"), this.customValidator.DateGreaterThanValidator('backfillEndDate', 'BackfillStartDateCannotGreaterThanbackfillEndDate') as ValidatorFn] },
			{ controlName: 'backfillEndDate', condition: this.AddEditEventReasonForm.controls['backfillRequired'].value, validators: [this.customValidator.RequiredValidator("PleaseSelectBackFillEndDate"), this.customValidator.DateLessThanValidator('backfillStartDate', 'BackfillEndDateCannotLessThanbackfillStartDate') as ValidatorFn] }
		];

		for (const config of controlConfig) {
			const control = this.AddEditEventReasonForm.controls[config.controlName];

			if (config.condition) {
				control.setValidators(config.validators);
				control.updateValueAndValidity();
			} else {
				control.clearValidators();
				control.updateValueAndValidity();
			}
		}
		this.cdr.markForCheck();
	}

	needBackFillChange(isNeedBackFill: boolean) {
		if (!isNeedBackFill) {
			this.AddEditEventReasonForm.controls['broadcastType'].setValue(null);
			const controlsToReset = ['backfillStartDate', 'backfillEndDate'];
			controlsToReset.forEach((controlName) => {
				const control = this.AddEditEventReasonForm.controls[controlName];
				control.setValue(null);
				control.clearValidators();
				control.updateValueAndValidity();
			});
		}else {
			this.AddEditEventReasonForm.controls['broadcastType'].setValue(magicNumber.one);
			this.AddEditEventReasonForm.controls['backfillStartDate'].setValidators([this.customValidator.RequiredValidator("PleaseSelectBackFillStartDate"), this.customValidator.DateGreaterThanValidator('backfillEndDate', 'BackfillStartDateCannotGreaterThanbackfillEndDate') as ValidatorFn]);
			this.AddEditEventReasonForm.controls['backfillEndDate'].setValidators([this.customValidator.RequiredValidator("PleaseSelectBackFillEndDate"), this.customValidator.DateLessThanValidator('backfillStartDate', 'BackfillEndDateCannotLessThanbackfillStartDate') as ValidatorFn]);
			this.AddEditEventReasonForm.controls['backfillStartDate'].updateValueAndValidity();
			this.AddEditEventReasonForm.controls['backfillEndDate'].updateValueAndValidity();
		}
		this.cdr.markForCheck();
	}

	broadCastChange(value: number) {
		if (value == Number(magicNumber.three)) {
			this.getAllStaffingAgencies();
		}
	}

	private getAllStaffingAgencies() {
		const reqData: IGetStaffingAgency = {
			"sectorId": this.assignmentDetailData.SectorId,
			"locationId": this.assignmentDetailData.WorkLocationId,
			"laborCategoryId": this.assignmentDetailData.LaborCategoryId,
			"assignmentId": this.assignmentDetailData.Id
		};
		this.contractorService.getStaffingAgency(reqData).pipe(takeUntil(this.unsubscribe$)).subscribe({
			next: (data: GenericResponseBase<IGetStaffingAgencies>) => {
				if (data.Succeeded && data.Data) {
					const staffingAgencyList = data.Data;
					this.cdr.markForCheck();
					this.transformDataForTreeView(staffingAgencyList);
				} else {
					this.staffingAgencyList = [];
				}
			}
		});
	}

	private transformDataForTreeView(originalData: IGetStaffingAgencies) {
		const transformedData: TransformedData[] = Object.entries(originalData).map(([key, agencies]: [string, StaffingAgency[]], index) => {
			if (agencies.length > Number(magicNumber.zero)) {
				return {
					text: this.localizationService.GetLocalizeMessage(key),
					Index: index.toString(),
					items: agencies.map((agency: StaffingAgency, innerIndex: number) =>
						({
							Index: `${index}_${innerIndex}`,
							text: agency.StaffingAgencyName,
							staffingAgencyId: agency.StaffingAgencyId,
							isSelected: agency.IsSelected,
							staffingAgencyTier: agency.StaffingAgencyTier
						}))
				};
			} else {
				return null as unknown as TransformedData;
			}
		}).filter((item) =>
			item !== null);
		this.staffingAgencyList = transformedData;
		this.checkedKeys = this.initializeCheckedKey(transformedData);
		this.getSelectedStaffingAgencies({ checkedKey: this.checkedKeys });
	}


	private initializeCheckedKey(data: TransformedData[]): string[] {
		const prePatchCheckedKeys: string[] = [];
		data.forEach((outerItem: TransformedData, outerIndex: number) => {
			outerItem.items.forEach((innerItem: TransformedAgency, innerIndex: number) => {
				if (innerItem.isSelected) {
					prePatchCheckedKeys.push(`${outerIndex}_${innerIndex}`);
				}
			});
			if (outerItem.items.some((item: TransformedAgency) =>
				item.isSelected)) {
				prePatchCheckedKeys.push(outerIndex.toString());
			}
		});
		return prePatchCheckedKeys;
	}


	private getSelectedStaffingAgencies(data: { checkedKey: string[] }) {
		const checkedKey = data.checkedKey,
			flattenedDataSet = this.staffingAgencyList.flatMap((outerItem: StaffingCategoryList, outerIndex: number) =>
				outerItem.items.map((innerItem: StaffingAgencyItems, innerIndex: number) =>
					({
						...innerItem,
						Index: `${outerIndex}_${innerIndex}`
					}))),
			 filteredDataSet = flattenedDataSet.filter((item: StaffingAgencyItems) =>
				checkedKey.includes(item.Index));
		this.filterStaffingAgencyList = this.mapDatainArray(filteredDataSet);

	}

	mapDatainArray(data: StaffingAgencyItems[]) {
		const array: number[] = [];
		data.forEach((element: StaffingAgencyItems) => {
			array.push(element.staffingAgencyId);
		});

		return array;
	}


	selectedStaffingAgency(event: ICheckedKeyData) {
		this.getSelectedStaffingAgencies(event);
	}


	disableDates = (date: Date): boolean => {
		const selectedDate1 = this.AddEditEventReasonForm.get('fromDate')?.value;
		return this.localizationService.GetDate(date) < this.localizationService.GetDate(selectedDate1);
	};


	disableBackfillDates = (date: Date): boolean => {
		const selectedDate1 = this.AddEditEventReasonForm.get('backfillStartDate')?.value;
		return this.localizationService.GetDate(date) < this.localizationService.GetDate(selectedDate1);
	};

	disableDateBefore = (date: Date): boolean => {
		const today = new Date();
		today.setHours(Number(magicNumber.zero), Number(magicNumber.zero), Number(magicNumber.zero), Number(magicNumber.zero));
		if (date < today) {
		  return true;
		}

		return false;
	};

	ngOnDestroy(){
		if(!this.isAdded){
			this.toasterServc.resetToaster();
		}
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}


