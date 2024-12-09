import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { SectorService } from 'src/app/services/masters/sector.service';
import { TerminationReasonService } from 'src/app/services/masters/termination-reason.service';
import { NavigationPaths } from '../route-constants/routes-constants';
import { HttpStatusCode } from '@angular/common/http';
import { ReasonType, TerminationReason } from '@xrm-core/models/termination-reason';
import { CommonService } from '@xrm-shared/services/common.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDropdownOption, ISectorDetailById } from '@xrm-shared/models/common.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { dropdownWithExtras } from '@xrm-core/models/job-category.model';


@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, OnDestroy{

	private entityId = XrmEntities.TerminationReason;
	public recordId :string= "";
	private destroyAllSubscribtion$ = new Subject<void>();
	public isEditMode: boolean = false;
	public AddEditTerminationReasonForm:FormGroup;
	public sectorDropDownList: dropdownWithExtras[] = [];
	public SOWswitchconfig: boolean;
	private terminationDetails:TerminationReason;
	private UKey:string;
	private conflictRes: boolean = false;

	public reasonType: ReasonType[] = [
		{
			Text: "Positive",
			Value: magicNumber.twoHundredTwentySix
		},
		{
			Text: "Negative",
			Value: magicNumber.twohundredTwentySeven
		},
		{
			Text: "Neutral",
			Value: magicNumber.twoHundredTwentyEight
		}
	];

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private terminationReasonServ: TerminationReasonService,
		private customValidator: CustomValidators,
		private commonService: CommonService,
		private eventLogService: EventLogService,
		private fb:FormBuilder,
    	private route: Router,
    	private sector: SectorService,
    	private toasterServc: ToasterService,
		private cdr: ChangeDetectorRef
	) {
		this.AddEditTerminationReasonForm = this.fb.group({
			Sector: [null, [this.customValidator.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]],
			TerminationReasonName: [null, [this.customValidator.RequiredValidator('PleaseEnterData', [{ Value: 'TerminationReason', IsLocalizeKey: true }])]],
			ProfessionalContractor: [false],
			ReasonTypeId: [null, [this.customValidator.RequiredValidator('PleaseSelectData', [{ Value: 'ReasonType', IsLocalizeKey: true }])]],
			LIContractor: [false],
			SOWResources: [false],
			BackfillNeeded: [false],
			ManagerSurveyRequested: [false],
			DoNotReturn: [false]
		});
	}

	ngOnInit(): void {
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getTerminationReasonById(param['id']);
					}
					return of(null);
				}),
				catchError(() => {
					return EMPTY;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();

		this.sector.getSectorDropDownList()
			.pipe(
				 catchError((error) => {
					this.toasterServc.showToaster(ToastOptions.Error, error.message);
				   return EMPTY;
				 }),
				 takeUntil(this.destroyAllSubscribtion$)
			   )
			   .subscribe((data: GenericResponseBase<dropdownWithExtras[]>) => {
				 this.sectorDropDownList = data.Data ?? [];
			});
	}

	private getTerminationReasonById(id:string){
		this.isEditMode = true;

		this.terminationReasonServ.getTerminationReasonById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data : GenericResponseBase<TerminationReason>) => {
				if(isSuccessfulResponse(data)){
					this.terminationDetails=data.Data;
					this.UKey = data.Data.UKey ?? '';
					this.eventLogService.recordId.next(data.Data.Id);
					this.eventLogService.entityId.next(XrmEntities.TerminationReason);
					this.getSOWData(data.Data.SectorId ?? magicNumber.zero);
					this.patchValue(this.terminationDetails);
					this.terminationReasonServ.terminationReasonData.next({'Disabled': data.Data.Disabled, 'RuleCode': data.Data.TerminationReasonCode, 'Id': data.Data.Id});
				}
			});
	}

	private patchValue(data: TerminationReason){
		const { ProfessionalContractor, LIContractor, SOWResources, BackfillNeeded, ManagerSurveyRequested, DoNotReturn } = data;
		this.AddEditTerminationReasonForm.patchValue({
			TerminationReasonName: data.TerminationReasonName,
			ProfessionalContractor: this.getBooleanValue(ProfessionalContractor),
			LIContractor: this.getBooleanValue(LIContractor),
			SOWResources: this.getBooleanValue(SOWResources ?? false),
			BackfillNeeded: this.getBooleanValue(BackfillNeeded),
			ManagerSurveyRequested: this.getBooleanValue(ManagerSurveyRequested),
			DoNotReturn: this.getBooleanValue(DoNotReturn)
		});
		this.AddEditTerminationReasonForm.controls['ReasonTypeId'].
			setValue(data.ReasonTypeId);
		this.AddEditTerminationReasonForm.controls['Sector'].
			setValue({
				Text: data.SectorName,
				Value: data.SectorName
			});
	}

	private getBooleanValue(value: string | boolean) {
		if (value === 'Yes') {
			return true;
		} else if (value === 'No') {
			return false;
		} else {
			return value;
		}
	};

	private getSOWData(sectorId: number) {
		this.terminationReasonServ.getSOWDataFromSector(sectorId).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<ISectorDetailById>) => {
				this.SOWswitchconfig = data.Data?.IsRfxSowRequired ?? false;
				this.cdr.markForCheck();
			});
	}

	public onChangeSectorDropdown(val: IDropdownOption) {
		if (val.Value) {
			this.getSOWData(val.Value);
		}
		this.SOWswitchconfig = false;
	}

	public save(): void {
		this.AddEditTerminationReasonForm.markAllAsTouched();

		const isFormValid = this.AddEditTerminationReasonForm.valid,
		 isApplicableInSelected =
			this.AddEditTerminationReasonForm.controls['ProfessionalContractor'].value ||
			this.AddEditTerminationReasonForm.controls['LIContractor'].value ||
			this.AddEditTerminationReasonForm.controls['SOWResources'].value;

		if (isFormValid) {
			if (!isApplicableInSelected) {
				this.toasterServc.showToaster(ToastOptions.Error, 'ApplicableInValidationMsg');
			} else if (this.isEditMode) {
				this.submitEditData();
			} else {
				this.AddEditTerminationReasonForm.markAsPristine();
				const TerminationReasonData = new TerminationReason(this.AddEditTerminationReasonForm.value);
				TerminationReasonData.SectorId = this.AddEditTerminationReasonForm.controls['Sector'].value.Value;

				this.terminationReasonServ.addEventReason(TerminationReasonData)
					.pipe(takeUntil(this.destroyAllSubscribtion$))
					.subscribe((data: GenericResponseBase<TerminationReason>) => {
						if (data.Succeeded) {
							this.toasterServc.showToaster(ToastOptions.Success, 'TerminationReasonSavedSuccessfully');
							this.commonService.resetAdvDropdown(this.entityId);
							this.terminationReasonServ.saveTerminationReason.next(true);
							this.navigateToList();
						}
						else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
							this.conflictRes = true;
							this.toasterServc.showToaster(ToastOptions.Error, 'TerminationReasonAlreadyExists');
						} else {
							this.toasterServc.showToaster(ToastOptions.Error, data.Message);
						}
					});
			}
		}
	}

	private submitEditData(){
		const TerminationReasonData = new TerminationReason(this.AddEditTerminationReasonForm.value);
		if (TerminationReasonData.SOWResources && !this.SOWswitchconfig) {
			TerminationReasonData.SOWResources = false;
		}
		TerminationReasonData.SectorId = this.AddEditTerminationReasonForm.controls['Sector'].value.Value;
		TerminationReasonData.UKey = this.UKey;
		this.terminationReasonServ.updateEventReason(TerminationReasonData).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
			next: (data: GenericResponseBase<TerminationReason>) => {
				if (data.Succeeded) {
					this.toasterServc.showToaster(ToastOptions.Success, 'TerminationReasonSavedSuccessfully');
					this.commonService.resetAdvDropdown(this.entityId);
					this.AddEditTerminationReasonForm.markAsPristine();
					this.eventLogService.isUpdated.next(true);
					this.cdr.markForCheck();
				}
				else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.conflictRes = true;
					this.commonService.resetAdvDropdown(this.entityId);
					this.toasterServc.showToaster(ToastOptions.Error, 'ThisTerminationReasonAlreadyExists');
				}
				else {
					this.toasterServc.showToaster(ToastOptions.Error, data.Message);
				}
			}
		});
	}

	public navigateToList(){
		this.route.navigate([NavigationPaths.list]);
	}

	ngOnDestroy(): void {
		if (this.isEditMode || this.conflictRes) {
			this.toasterServc.resetToaster();
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
