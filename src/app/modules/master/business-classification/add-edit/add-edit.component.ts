import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NavigationPaths } from '../constants/routes-constants';
import { BusinessClassificationService } from 'src/app/services/masters/business-classification.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { HttpStatusCode } from '@angular/common/http';
import { BusinessClassification } from '@xrm-core/models/business-classification';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CommonService } from '@xrm-shared/services/common.service';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, OnDestroy {

	private businessClassification: BusinessClassification;
	public Name: string;
	public isEditMode: boolean = false;
	public AddEditEventReasonForm:FormGroup;
	private destroyAllSubscribtion$ = new Subject<void>();
	public entityId: number =XrmEntities.BusinessClassification;
	private conflictRes: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
    	private fb:FormBuilder,
		private eventLogService : EventLogService,
   		private activatedRoute: ActivatedRoute,
    	private router: Router,
		private commonService: CommonService,
		private toasterService: ToasterService,
    	private validators: CustomValidators,
    	private businessClassificationService :BusinessClassificationService,
		private cdr: ChangeDetectorRef
	) {
		this.AddEditEventReasonForm = this.fb.group({
			Name: [null, [this.validators.RequiredValidator('PleaseEnterData', [{ Value: 'BusinessClassification', IsLocalizeKey: true }])]]
		});
	}

	ngOnInit(): void {
		this.activatedRoute.params
			.pipe(
				switchMap((param: 	Params) => {
					if (param['id']) {
						this.getBusinessClassificationyId(param['id']);
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

	private getBusinessClassificationyId(id: string) {
		this.isEditMode = true;
		this.businessClassificationService.getBusinessClassificationById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<BusinessClassification>) => {
				if(isSuccessfulResponse(data)){
					this.businessClassification = data.Data;
					this.businessClassificationService.businessClassificationData.next({'Disabled': this.businessClassification.Disabled, 'RuleCode': this.businessClassification.Code, 'Id': this.businessClassification.Id});
					this.eventLogService.entityId.next(XrmEntities.BusinessClassification);
					this.eventLogService.recordId.next(data.Data.Id);
					this.AddEditEventReasonForm.controls['Name'].
						patchValue(data.Data.Name);
				}
			});
	}

	public submitForm(){
		this.AddEditEventReasonForm.markAllAsTouched();
		if (this.AddEditEventReasonForm.valid) {
			this.save();
		}
	}

	private save() {
		if (this.isEditMode) {
			this.EditData();
		}else{
			this.AddEditEventReasonForm.markAsPristine();
			const businessClassificationData = new BusinessClassification(this.AddEditEventReasonForm.value);
			this.businessClassificationService.addBusinessClassification(businessClassificationData).pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((data: GenericResponseBase<BusinessClassification>) => {
					if (data.Succeeded) {
						this.commonService.resetAdvDropdown(this.entityId);
						this.listNavigation();
						this.toasterService.showToaster(ToastOptions.Success, 'BusinessClassificationHasBeenSavedSuccessfully');
					}
					else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
						this.conflictRes = true;
						this.toasterService.showToaster(ToastOptions.Error, 'BusinessClassificationDuplicateMsg');
					}
					else {
						this.toasterService.showToaster(ToastOptions.Error, data.Message);
					}
				});
		}
	}

	private EditData() {
		const businessClassificationData = new BusinessClassification(this.AddEditEventReasonForm.value);
		businessClassificationData.UKey = this.businessClassification.UKey;
		this.businessClassificationService.updateBusinessClassification(businessClassificationData).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<BusinessClassification>) => {
				if (data.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, 'BusinessClassificationHasBeenSavedSuccessfully');
					this.commonService.resetAdvDropdown(this.entityId);
					this.AddEditEventReasonForm.markAsPristine();
					this.eventLogService.isUpdated.next(true);
					this.cdr.markForCheck();
				}
				else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.conflictRes = true;
					this.commonService.resetAdvDropdown(this.entityId);
					this.toasterService.showToaster(ToastOptions.Error, 'BusinessClassificationDuplicateMsg');
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, data.Message);
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
