import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { NavigationPaths } from '../route-constants/routes-constants';
import { dropdownWithExtras } from '@xrm-core/models/job-category.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { WorkerClassification } from '@xrm-core/models/worker-classification.model';
import { WorkerClassificationService } from 'src/app/services/masters/worker-classification.service';
import { CommonService } from '@xrm-shared/services/common.service';
import { HttpStatusCode } from '@angular/common/http';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrl: './add-edit.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, OnDestroy{
	public AddEditWorkerClassification: FormGroup;
	public isEditMode: boolean;
	public sectorDropDownList: dropdownWithExtras[] = [];
	private destroyAllSubscribtion$ = new Subject<void>();
	private conflictRes: boolean = false;
	private UKey:string;
	private entityId = XrmEntities.WorkerClassification;
	private workerClassificationDetails: WorkerClassification;
	public isAdditionalDetailsRequired: boolean | string = false;

	constructor(
		private activatedRoute: ActivatedRoute,
    	private fb: FormBuilder,
    	private customValidators: CustomValidators,
		private route: Router,
		private sectorServ: SectorService,
		private eventLogService: EventLogService,
		private toasterServc: ToasterService,
		private commonService: CommonService,
		private workerClassificationServ: WorkerClassificationService,
		private cdr: ChangeDetectorRef
	){
		this.AddEditWorkerClassification = this.fb.group({
			Sector: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]],
			WorkerClassificationName: [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'WorkerClassification', IsLocalizeKey: true }])]],
			IsAdditionalDetailsRequired: [false],
			AdditionalDetailsLabel: [null, this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'AdditionalDetailsLabel', IsLocalizeKey: true }])]
		});
	}

	ngOnInit(){
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getWorkerClassificationById(param['id']);
					}
					return of(null);
				}),
				catchError((error: Error) => {
					return EMPTY;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();

		this.sectorServ.getSectorDropDownList()
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

	private getWorkerClassificationById(id:string){
		this.isEditMode = true;

		this.workerClassificationServ.getWorkerClassificationById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data : GenericResponseBase<WorkerClassification>) => {
				if(isSuccessfulResponse(data)){
					this.workerClassificationDetails=data.Data;
					this.isAdditionalDetailsRequired = this.getBooleanValue(this.workerClassificationDetails.IsAdditionalDetailsRequired);
					this.UKey = data.Data.UKey ?? '';
					this.patchValue(this.workerClassificationDetails);
					this.workerClassificationServ.workerClassificationData.next({'Disabled': data.Data.Disabled, 'RuleCode': data.Data.Code, 'Id': data.Data.Id});
				}
			});
	}

	private patchValue(data: WorkerClassification){
		const { IsAdditionalDetailsRequired } = data;
		this.AddEditWorkerClassification.patchValue({
			WorkerClassificationName: data.WorkerClassificationName,
			IsAdditionalDetailsRequired: this.getBooleanValue(IsAdditionalDetailsRequired),
			AdditionalDetailsLabel: data.AdditionalDetailsLabel
		});
		this.AddEditWorkerClassification.controls['Sector'].
			setValue({
				Text: data.SectorName,
				Value: data.SectorId
			});
	}

	public changeSwitch(e: boolean){
		this.isAdditionalDetailsRequired = this.getBooleanValue(e);
		if(e){
			this.AddEditWorkerClassification.controls['AdditionalDetailsLabel'].
				addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'AdditionalDetailsLabel', IsLocalizeKey: true }]));
		}
		else{
			this.AddEditWorkerClassification.controls['AdditionalDetailsLabel'].clearValidators();
		}
		this.AddEditWorkerClassification.controls['AdditionalDetailsLabel'].updateValueAndValidity();
	}

	private getBooleanValue(value: string | boolean): boolean | string {
		if (value === 'Yes') {
			return true;
		} else if (value === 'No') {
			return false;
		} else {
			return value;
		}
	};


	private submitEditData(){
		const WorkerClassificationData = new WorkerClassification(this.AddEditWorkerClassification.value);
		WorkerClassificationData.SectorId = this.AddEditWorkerClassification.controls['Sector'].value.Value;
		WorkerClassificationData.UKey = this.UKey;
		this.workerClassificationServ.updateWorkerClassification(WorkerClassificationData).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
			next: (data: GenericResponseBase<WorkerClassification>) => {
				if (data.Succeeded) {
					const isSubCategoryRequired = this.getBooleanValue(data.Data?.IsAdditionalDetailsRequired ?? false);
					if(isSubCategoryRequired == false){
						this.AddEditWorkerClassification.controls['AdditionalDetailsLabel'].setValue('');
					}
					this.toasterServc.showToaster(ToastOptions.Success, 'WorkerClassificationSavedSuccessfully');
					this.commonService.resetAdvDropdown(this.entityId);
					this.AddEditWorkerClassification.markAsPristine();
					this.eventLogService.isUpdated.next(true);
					this.AddEditWorkerClassification.controls['AdditionalDetailsLabel'].markAsUntouched();
					this.cdr.markForCheck();
				}
				else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.conflictRes = true;
					this.commonService.resetAdvDropdown(this.entityId);
					this.toasterServc.showToaster(ToastOptions.Error, 'DuplicateWorkerClassificationMsg');
				}
				else {
					this.toasterServc.showToaster(ToastOptions.Error, data.Message);
				}
			}
		});
	}


	public save(): void {
		this.AddEditWorkerClassification.markAllAsTouched();
		if(!this.isAdditionalDetailsRequired) this.AddEditWorkerClassification.controls['AdditionalDetailsLabel'].setErrors(null);
		const isFormValid = this.AddEditWorkerClassification.valid;

		if (isFormValid) {
			if (this.isEditMode) {
				this.submitEditData();
			} else {
				this.AddEditWorkerClassification.markAsPristine();
				const WorkerClassificationData = new WorkerClassification(this.AddEditWorkerClassification.value);
				 WorkerClassificationData.SectorId = this.AddEditWorkerClassification.controls['Sector'].value.Value;
				this.workerClassificationServ.addWorkerClassification(WorkerClassificationData)
					.pipe(takeUntil(this.destroyAllSubscribtion$))
					.subscribe((data: GenericResponseBase<WorkerClassification>) => {
						if (data.Succeeded) {
							this.toasterServc.showToaster(ToastOptions.Success, 'WorkerClassificationSavedSuccessfully');
							this.commonService.resetAdvDropdown(this.entityId);
							this.workerClassificationServ.saveWorkerClassification.next(true);
							this.navigateToList();
						}
						else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
							this.conflictRes = true;
							this.toasterServc.showToaster(ToastOptions.Error, 'DuplicateWorkerClassificationMsg');
						} else {
							this.toasterServc.showToaster(ToastOptions.Error, data.Message);
						}
					});
			}
		}
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

