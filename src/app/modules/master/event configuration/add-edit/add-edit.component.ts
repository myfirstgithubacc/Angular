import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormBuilder } from "@angular/forms";
import { SectorService } from 'src/app/services/masters/sector.service';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { EventConfigurationService } from 'src/app/services/masters/event-configuration.service';
import { ApiResponse, EventConfiguration } from '@xrm-core/models/event-configuration.model';
import { HttpStatusCode } from '@angular/common/http';
import { NavigationPaths } from '../constant/routes-constant';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { EditEventConfigData, EventAndNotifyValue, EventEnteredAndNotify, EventEnteredBy, NavPathsType } from '../constant/event-configuration.enum';
import { forkJoin, Subject, switchMap, takeUntil } from 'rxjs';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public isEditMode: boolean = false;
	public addEditEventConfigForm: FormGroup;
	public sectorDropDownList: [];
	public dateType: string = 'DateType';
	public effectDailySchedule: string ='EffectOnDailySchedule';
	public DateTypeValue: [];
	public DailySchedule: [];
	public navigationPaths: NavPathsType = NavigationPaths;
	private ngUnsubscribe$ = new Subject<void>();
	public appSwitchOn:boolean = false;
	public ukey: string;
	public recordName:boolean = false;
	public editEventConfigData: EditEventConfigData;
	public statusCardREcord: string;
	public removeToaster:boolean = false;

	EventEntered: { Text: EventEnteredAndNotify; Value: EventAndNotifyValue }[] = [
		{ Text: EventEnteredAndNotify.ClientUser, Value: EventAndNotifyValue.ClientUser },
		{ Text: EventEnteredAndNotify.StaffingAgencyUser, Value: EventAndNotifyValue.StaffingAgencyUser }
	];

	// eslint-disable-next-line max-params
	constructor(
    private fb: FormBuilder,
    private route: Router,
    public sector: SectorService,
    public commonHeaderIcon: CommonHeaderActionService,
    private toasterServc: ToasterService,
	private eventConfigServc:EventConfigurationService,
	private customValidators: CustomValidators,
	private activatedRoute: ActivatedRoute,
	private eventLog: EventLogService,
	private cd: ChangeDetectorRef,
	private localizationService: LocalizationService
	) {
		this.addEditEventConfigForm = this.fb.group({
			SectorId: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]],
			EventName: [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'EventName', IsLocalizeKey: true }])]],
			DateTypeId: [],
			RequiresEventReason: [false],
			RequiresComment: [false],
			RequiresBackfill: [false],
			BackfillDefaultValue: [false],
			EffectOnDailyScheduleId: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'EffectOnDailySchedule', IsLocalizeKey: true }])]],
			ManagerSurveyToRequested: [false],
			EventEnteredBy: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'EventEnteredBy', IsLocalizeKey: true }])]],
			NotifyTo: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'NotifyTo', IsLocalizeKey: true }])]],
			DelayNotificationBeforeEvent: [false],
			DaysPriorToEventDate: [null],
			ValidateEventDateWithTimesheet: [false],
			IsProfessionalContractor: [false],
			IsLightIndustrialContractor: [false]
		});
	}

	ngOnInit(): void {
		if (this.route.url == this.navigationPaths.addEdit) {
			this.isEditMode = false;
		} else {
			this.isEditMode = true;
			this.loadData();
		}
		forkJoin([
			this.getSectorDdl(),
			this.getStaticDataType(),
			this.getStaticEffectSchedule()
		]).subscribe((results: [ApiResponse, ApiResponse, ApiResponse]) => {
			const [sectorResponse, dateTypeResponse, effectScheduleResponse] = results;
			if (sectorResponse.Succeeded) {
				this.sectorDropDownList = sectorResponse.Data;
			}
			if (dateTypeResponse.Succeeded) {
				this.DateTypeValue = dateTypeResponse.Data;
				this.cd.markForCheck();
				if (!this.isEditMode) {
					this.cd.markForCheck();
					this.addEditEventConfigForm.controls['DateTypeId'].setValue('253');
				}
			}
			if (effectScheduleResponse.Succeeded) {
				this.DailySchedule = effectScheduleResponse.Data;
			}
		});

	}

	private isAtleastOneSwitchIsOn() {
		const isLi = this.addEditEventConfigForm.controls['IsLightIndustrialContractor'].value,
			isPro = this.addEditEventConfigForm.controls['IsProfessionalContractor'].value;
		if(isLi|| isPro){
			this.appSwitchOn = true;
		}else{
			this.appSwitchOn = false;
		}

	}

	private loadData() {
		this.activatedRoute.params.pipe(
			takeUntil(this.ngUnsubscribe$),
			switchMap((param) => {
				if (param['id']) {
					this.isEditMode = true;
					this.ukey = param['id'];
				}
				return this.eventConfigServc.getEventConfigById(param['id']).pipe(takeUntil(this.ngUnsubscribe$));
			})
		).subscribe({
			next: (res: ApiResponse) => {
				if (res.Succeeded) {
					this.editEventConfigData = res.Data;
					this.getEventConfigDataById();
				}
			}
		});
	}

	getEventConfigDataById(){
		this.isEditMode = true;
		this.patchvalue();
		this.eventConfigServc.eventConfigSubject.next({
			"EventConfigrationID": this.editEventConfigData.ID,
			"Disabled": this.editEventConfigData.Disabled,
			"EventConfigrationCode": this.editEventConfigData.EventCode
		});
	}

	patchvalue(){
		const eventEnteredByArray = this.editEventConfigData.EventEnteredBy.split(',').map((value: string) =>
				Number(value.trim())),
			notifyToArray = this.editEventConfigData.NotifyTo.split(',').map((value: string) =>
				Number(value.trim())),
		 findTextValue = (value: number) => {
				const match = this.eventAndNotifyToData().find((item) =>
					item.Value === value);
				return match
					? { Text: this.localizationService.GetLocalizeMessage( match.Text), Value: match.Value }
					: { Text: '', Value: '' };
			},
			eventEnteredByPairs = eventEnteredByArray.map(findTextValue),
			notifyToPairs = notifyToArray.map(findTextValue);

		  this.addEditEventConfigForm.controls['DateTypeId'].setValue(this.editEventConfigData.DateTypeId.toString());
		  this.addEditEventConfigForm.patchValue({
			SectorId: this.editEventConfigData.SectorName,
			EventName: this.editEventConfigData.EventName,
			RequiresEventReason: this.editEventConfigData.RequiresEventReason,
			RequiresComment: this.editEventConfigData.RequiresComment,
			RequiresBackfill: this.editEventConfigData.RequiresBackfill,
			BackfillDefaultValue: this.editEventConfigData.BackfillDefaultValue,
			EffectOnDailyScheduleId: { Value: this.editEventConfigData.EffectOnDailyScheduleId.toString() },
			ManagerSurveyToRequested: this.editEventConfigData.ManagerSurveyToRequested,
			EventEnteredBy: eventEnteredByPairs,
			NotifyTo: notifyToPairs,
			DelayNotificationBeforeEvent: false,
			DaysPriorToEventDate: null,
			ValidateEventDateWithTimesheet: this.editEventConfigData.ValidateEventDateWithTimesheet,
			IsProfessionalContractor: this.editEventConfigData.IsProfessionalContractor,
			IsLightIndustrialContractor: this.editEventConfigData.IsLightIndustrialContractor
		});
	}

	public submitForm() {
		this.addEditEventConfigForm.markAllAsTouched();
		this.isAtleastOneSwitchIsOn();
		if (this.addEditEventConfigForm.valid) {
			if(this.appSwitchOn){
				this.save();
			}else{
				this.toasterServc.resetToaster();
				this.toasterServc.showToaster(ToastOptions.Error, 'ApplicableInValidationMessage');
				this.removeToaster = true;
			}
		}
	}

	public save(){
		this.addEditEventConfigForm.markAllAsTouched();
		const eventConfigData:EventConfiguration = new EventConfiguration(this.addEditEventConfigForm.value);
		eventConfigData.SectorId = parseInt(this.addEditEventConfigForm.controls['SectorId'].value?.Value);
		eventConfigData.EffectOnDailyScheduleId = parseInt(this.addEditEventConfigForm.controls['EffectOnDailyScheduleId'].value?.Value);
		eventConfigData.DateTypeId = parseInt(this.addEditEventConfigForm.controls['DateTypeId'].value);
		if (this.isEditMode) {
			this.saveEditMode(eventConfigData);
		} else {
			this.saveAddMode(eventConfigData);
		}
	}

	saveAddMode(eventConfigData:EventConfiguration){
		const eventEnteredBy = this.addEditEventConfigForm.controls['EventEnteredBy'].value,
		  notifyTo = this.addEditEventConfigForm.controls['NotifyTo'].value,
			 eventEnteredData = eventEnteredBy.map((entry: EventEnteredBy) =>
				entry.Value.toString()).sort((a: string, b: string) =>
				a.localeCompare(b)).join(','),
			 notifyData = notifyTo.map((entry: EventEnteredBy) =>
				entry.Value.toString()).sort((a: string, b: string) =>
				a.localeCompare(b)).join(',');
		 eventConfigData.EventEnteredBy = eventEnteredData;
		 eventConfigData.NotifyTo = notifyData;
		 eventConfigData.onDelayNotificationEventChange = false;
		this.eventConfigServc.addEventConfig(eventConfigData).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: ApiResponse) => {
				if (data.StatusCode === HttpStatusCode.Ok) {
					this.toasterServc.resetToaster();
					this.route.navigate([NavigationPaths.list]);
					setTimeout(() => {
						this.toasterServc.showToaster(ToastOptions.Success, 'EventConfigSavedSuccessfully');
					});
					this.addEditEventConfigForm.reset();
				}
				else {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(
						ToastOptions.Error,
						data.Message ?? ''
					);
					this.removeToaster = true;
				}
			}
		});

	}

	public saveEditMode(eventConfigData:EventConfiguration){
		const eventEnteredBy = this.addEditEventConfigForm.controls['EventEnteredBy'].value,
		  notifyTo = this.addEditEventConfigForm.controls['NotifyTo'].value,
			 eventEnteredData = eventEnteredBy.map((entry: EventEnteredBy) =>
				entry.Value.toString()).sort((a: string, b: string) =>
				a.localeCompare(b)).join(','),
			 notifyData = notifyTo.map((entry: EventEnteredBy) =>
				entry.Value.toString()).sort((a: string, b: string) =>
				a.localeCompare(b)).join(',');
		 eventConfigData.EventEnteredBy = eventEnteredData;
		 eventConfigData.NotifyTo = notifyData;
		eventConfigData.Ukey = this.editEventConfigData.UKey;
		eventConfigData.DaysPriorToEventDate=this.addEditEventConfigForm.controls['DaysPriorToEventDate'].value||null;
		this.eventConfigServc.updateEventConfig(eventConfigData).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: ApiResponse) => {
				this.toasterServc.resetToaster();
				if (data.StatusCode == HttpStatusCode.Conflict)
				{
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'EventConfigAlreadyExists');
					this.recordName= false;
				}
				else if (data.StatusCode === HttpStatusCode.Ok) {
					setTimeout(() => {
						this.toasterServc.showToaster(ToastOptions.Success, "EventConfigSavedSuccessfully");
					});
					this.addEditEventConfigForm.markAsPristine();
					this.cd.markForCheck();
					this.recordName = true;
					this.statusCardREcord = data.Data?.EventName;
				} else {
					this.toasterServc.showToaster(
						ToastOptions.Error,
						data.candidateDeclineReason?.message ?? ''
					);
					this.recordName= false;
					this.removeToaster = true;
				}
				this.eventLog.isUpdated.next(true);
			}
		});

	}
	public getSectorDdl() {
		return this.eventConfigServc.getSector().pipe(takeUntil(this.ngUnsubscribe$));
	}

	public navigate() {
		this.route.navigate([NavigationPaths.list]);
		this.toasterServc.resetToaster();
	}
	private getStaticDataType() {
		return this.eventConfigServc.GetStaticDataTypeListforDropdownAsync(this.dateType).pipe(takeUntil(this.ngUnsubscribe$));
	}
	private getStaticEffectSchedule() {
		return this.eventConfigServc.GetStaticDataTypeListforDropdownAsync(this.effectDailySchedule).pipe(takeUntil(this.ngUnsubscribe$));
	}

	public onChangeNeedBackfill(){
		const needBackFill = this.addEditEventConfigForm.get('RequiresBackfill')?.value;
		if(!needBackFill){
			this.addEditEventConfigForm.controls['BackfillDefaultValue'].setValue(false);
		}

	}

	ngOnDestroy(): void {
		if (this.addEditEventConfigForm.valid) {
			if (this.isEditMode || this.removeToaster) {
				this.toasterServc.resetToaster();
				this.removeToaster = false;
			}
		}
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}

	eventAndNotifyToData() {
		const eventNotifyData = [
			{ Text: 'ClientUser', Value: Number(magicNumber.four) },
			{ Text: 'StaffingAgencyUser', Value: Number(magicNumber.three) }
		];
		return eventNotifyData;
	}

}


