import { HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EventReason } from '@xrm-core/models/event-reason.model';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { SectorService } from 'src/app/services/masters/sector.service';
import { NavigationPaths } from '../routes/routeConstants';
import { EventReasonService } from 'src/app/services/masters/event-reason.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { dropdownWithExtras } from '@xrm-core/models/job-category.model';
import { CommonService } from '@xrm-shared/services/common.service';


@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, OnDestroy {

	public isEditMode: boolean = false;
	private destroyAllSubscribtion$ = new Subject<void>();
	public AddEditEventReasonForm:FormGroup;
	public sectorDropDownList: dropdownWithExtras[] = [];
	private UKey: string;
	public entityId: number = XrmEntities.EventReason;
	private conflictRes: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
    	private fb:FormBuilder,
		private activatedRoute: ActivatedRoute,
		private router : Router,
    	private customValidator: CustomValidators,
		private eventReasonService: EventReasonService,
		private eventLogService: EventLogService,
		private toasterService: ToasterService,
		private sectorService: SectorService,
		private commonService: CommonService,
		private cdr: ChangeDetectorRef
	) {
		this.AddEditEventReasonForm = this.fb.group({
			Sector: [null, [this.customValidator.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]],
			EventReasonName: [null, [this.customValidator.RequiredValidator('PleaseEnterData', [{ Value: 'EventReason', IsLocalizeKey: true }])]],
			ProfessionalContractor: [false],
			LIContractor: [false]
		});
	}

	ngOnInit(): void {

		this.sectorService.getSectorDropDownList()
			.pipe(
				 catchError((error) => {
					this.toasterService.showToaster(ToastOptions.Error, error.message);
				   return EMPTY;
				 }),
				 takeUntil(this.destroyAllSubscribtion$)
			   )
			   .subscribe((data: GenericResponseBase<dropdownWithExtras[]>) => {
				 this.sectorDropDownList = data.Data ?? [];
			});

		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getEventReasonById(param['id']);
					}
					return of(null);
				}),
				catchError(() => {
					return EMPTY;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();
	}

	private getEventReasonById(id:string)
	{
		this.isEditMode = true;
		this.eventReasonService.getEventReasonById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<EventReason>) => {
				if(isSuccessfulResponse(data)){
					this.eventLogService.recordId.next(data.Data.Id);
					this.UKey = data.Data.UKey;
					this.eventLogService.entityId.next(XrmEntities.EventReason);
					this.AddEditEventReasonForm.patchValue({
						EventReasonName: data.Data.EventReasonName,
						ProfessionalContractor: this.stringToBoolean(data.Data.ProfessionalContractor),
						LIContractor: this.stringToBoolean(data.Data.LIContractor)
					});
					this.AddEditEventReasonForm.controls['Sector'].
						setValue({
							Text: data.Data.SectorName,
							Value: data.Data.SectorName
						});
					this.eventReasonService.eventReasonData.next({'Disabled': data.Data.Disabled, 'RuleCode': data.Data.EventReasonCode, 'Id': data.Data.Id});
				}

			});
	}

	private stringToBoolean(value: string | boolean) {
		if (value === 'Yes') {
			return true;
		} else if (value === 'No') {
			return false;
		} else {
			return null;
		}
	}

	public save() : void {
		this.AddEditEventReasonForm.markAllAsTouched();
		if(this.AddEditEventReasonForm.valid){
			if(!this.AddEditEventReasonForm.controls['ProfessionalContractor'].value && !this.AddEditEventReasonForm.controls['LIContractor'].value){
				this.toasterService.showToaster(ToastOptions.Error, 'ApplicableInValidationMsg');
			}
			else if (this.isEditMode) {
				this.submitEditData();
			}
			else {
				this.AddEditEventReasonForm.markAsPristine();
				const EventReasonData = new EventReason(this.AddEditEventReasonForm.value);
				EventReasonData.SectorId = this.AddEditEventReasonForm.controls['Sector'].value.Value;
				this.eventReasonService.addEventReason(EventReasonData).pipe(takeUntil(this.destroyAllSubscribtion$))
					.subscribe((data: GenericResponseBase<EventReason>) => {
						if (data.Succeeded) {
							this.listNavigation();
							this.toasterService.showToaster(ToastOptions.Success, 'EventReasonHasBeenSavedSuccessfully');
							this.commonService.resetAdvDropdown(this.entityId);
						}
						else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
							this.conflictRes = true;
							this.toasterService.showToaster(ToastOptions.Error, 'EventReasonAlreadyExists');
						}
						else {
							this.toasterService.showToaster(ToastOptions.Error, data.Message);
						}
					});
			}
		}
	}

	private submitEditData(){
		const EventReasonData = new EventReason(this.AddEditEventReasonForm.value);
		EventReasonData.SectorId = this.AddEditEventReasonForm.controls['Sector'].value.Value;
		EventReasonData.UKey = this.UKey;
		this.eventReasonService.updateEventReason(EventReasonData).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
			next: (data: GenericResponseBase<EventReason>) => {
				if (data.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, 'EventReasonHasBeenSavedSuccessfully');
					this.commonService.resetAdvDropdown(this.entityId);
					this.AddEditEventReasonForm.markAsPristine();
					this.eventLogService.isUpdated.next(true);
					this.cdr.markForCheck();
				}
				else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.conflictRes = true;
					this.toasterService.showToaster(ToastOptions.Error, 'EventReasonAlreadyExists');
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, data.Message);
				}
			}
		});
	}

	public listNavigation(){
		return this.router.navigate([`${NavigationPaths.list}`]);
	}

	ngOnDestroy(): void {
		if (this.isEditMode || this.conflictRes) {
			this.toasterService.resetToaster();
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
