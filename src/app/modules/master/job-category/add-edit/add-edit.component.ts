import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { JobCategory, OvertimeHour, dropdownModel, dropdownWithExtras } from '@xrm-core/models/job-category.model';
import { JobCategoryService } from 'src/app/services/masters/job-category.service';
import { NavigationPaths } from '../route-constants/routes-constant';
import { SectorService } from 'src/app/services/masters/sector.service';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { CommonObjectModel } from '@xrm-core/models/Configure-client/staffing-agency-tier.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CommonService } from '@xrm-shared/services/common.service';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, OnDestroy{

	public isEditMode: boolean = false;
	public recordStatus: string;
	public sectorDropDownList: dropdownWithExtras[] = [];
	public laborCategoryDropDownList: dropdownModel[] = [];
	public jobCategoryDetails: JobCategory;
	public AddEditJobCategoryForm: FormGroup;
	private destroyAllSubscribtion$ = new Subject<void>();
	public entityId: number = XrmEntities.JobCategory;
	public sectorId: number = magicNumber.zero;
	private laborCategoryId: number = magicNumber.zero;
	public udfRecordId: number = magicNumber.zero;
	public recordUKey: string ='';
	public actionTypeId: number = ActionType.Add;
	private udfData: IPreparedUdfPayloadData[];
	private conflictRes: boolean = false;

	public OvertimeHours: OvertimeHour[] = [
		{
			Text: "StraightTimeExempt", Value: magicNumber.sixtyOne,
			tooltipVisible: true, tooltipTitle: 'StraightTimeToolTip'
		},
		{
			Text: "OvertimeNonExempt", Value: magicNumber.sixtyTwo,
			tooltipVisible: true, tooltipTitle: 'OvertimeToolTip'
		}
	];

	// eslint-disable-next-line max-params
	constructor(
    	private formBuilder: FormBuilder,
		private commonService: CommonService,
		private jobCategoryService: JobCategoryService,
    	private eventLogService: EventLogService,
    	private router: Router,
		private scrollToTop : WindowScrollTopService,
    	private sectorService: SectorService,
    	private activatedRoute: ActivatedRoute,
    	private validators: CustomValidators,
    	private toasterService: ToasterService,
    	private jobCategory: JobCategoryService,
    	public udfCommonMethods: UdfCommonMethods,
		private cdr: ChangeDetectorRef
	) {
		this.AddEditJobCategoryForm = this.formBuilder.group({
			sectorName: [null, [this.validators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]],
			LCName: [null, this.validators.RequiredValidator('PleaseSelectData', [{ Value: 'LaborCategory', IsLocalizeKey: true }])],
			JCName: [
				null, [
					this.validators.RequiredValidator('PleaseEnterData', [{ Value: 'JobCategory', IsLocalizeKey: true }]),
					this.validators.MaxLengthValidator(magicNumber.twoHundred)
				]
			],
			ClientJCCode: [null, [validators.MaxLengthValidator(magicNumber.eight)]],
			IsWageRateAdj: [false],
			OTHoursBilledAtId: [magicNumber.sixtyTwo],
			status: [null]
		});
	}

	ngOnInit(): void {

		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getJobCategoryById(param['id']);
					}
					return of(null);
				}),
				catchError(() => {
					return EMPTY;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();
		this.sectorService.getSectorDropDownList()
			.pipe(catchError((error) => {
				this.toasterService.showToaster(ToastOptions.Error, error.message);
				return EMPTY;
			}))
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<dropdownWithExtras[]>) => {
				this.sectorDropDownList = data.Data ?? [];
			});
		this.jobCategoryService.recordStatus$.subscribe((status) => {
			this.recordStatus = status;
			  });
	}

	public redirectToReq() : void{
		this.router.navigate([NavigationPaths.ReqLibrary + this.jobCategoryDetails.UKey]);
	}

	public navigateToList() : void {
		this.router.navigate([NavigationPaths.list]);
	}

	private getJobCategoryById(id: string) : void {
		this.isEditMode = true;
		this.jobCategoryService.getJobCategoryById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<JobCategory>) => {
				if(isSuccessfulResponse(data)){
					this.jobCategoryDetails = data.Data;
					this.jobCategoryDetails.Ukey = data.Data.UKey;
					this.recordStatus = data.Data.Disabled ?
						'Inactive' :
						'Active';
					this.actionTypeId = ActionType.Edit;
					this.sectorId = data.Data.SectorId;
					this.recordUKey = data.Data.UKey ?? '';
					this.udfRecordId = data.Data.Id ?? magicNumber.zero;
					this.jobCategory.jobCategoryData.next({'Disabled': this.jobCategoryDetails.Disabled, 'RuleCode': this.jobCategoryDetails.JCCode, 'Id': this.jobCategoryDetails.Id});
					this.AddEditJobCategoryForm.patchValue(this.jobCategoryDetails);
					this.AddEditJobCategoryForm.controls['sectorName'].
						setValue({
							Text: this.jobCategoryDetails.SectorName,
							Value: this.jobCategoryDetails.SectorName
						});

					this.AddEditJobCategoryForm.controls['LCName'].
						setValue({
							Text: this.jobCategoryDetails.LCName,
							Value: this.jobCategoryDetails.LCName
						});
					this.AddEditJobCategoryForm.controls['OTHoursBilledAtId'].
						setValue(this.jobCategoryDetails.OTHoursBilledAtId);
				}

			});
	}

	public onChange(val: CommonObjectModel, ddl: string) {

		if (ddl == "Sector") {
			this.sectorId = parseInt(val.Value);
			this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, this.sectorId);
		}
		else if (ddl == "LaborCategory") {
			this.laborCategoryId = parseInt(val.Value);
			this.udfCommonMethods
				.manageParentsInfo(XrmEntities.LaborCategory, this.laborCategoryId);
		}

		if (ddl == 'Sector') {
			this.laborCategoryDropDownList = [];
			this.AddEditJobCategoryForm.patchValue({
				LCName: null
			});
			this.jobCategory.getLaborDrp(val.Value).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
				next: (data: GenericResponseBase<dropdownModel[]>) => {
					this.laborCategoryDropDownList = data.Data ?? [];
				},
				error: (error) => {
					 this.toasterService.showToaster(ToastOptions.Error, error.message); }
			});
		}
	}

	public getUdfData(data: {data: IPreparedUdfPayloadData[], formGroup:FormGroup}) : void {
		this.udfData = data.data;
		this.AddEditJobCategoryForm.addControl('udf', data.formGroup);
	}

	private EditData(){
		const jobData = new JobCategory(this.AddEditJobCategoryForm.value);
		jobData.UKey = this.jobCategoryDetails.Ukey;
		jobData.UdfFieldRecords = this.udfData;
		this.jobCategoryService.updateJobCategory(jobData).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
			next: (data: GenericResponseBase<JobCategory>) => {
				if (data.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, 'JobCategoryHasBeenSavedSuccessfully');
					this.AddEditJobCategoryForm.markAsPristine();
					this.AddEditJobCategoryForm.updateValueAndValidity();
					this.eventLogService.isUpdated.next(true);
					this.commonService.resetAdvDropdown(this.entityId);
					this.scrollToTop.scrollTop();
					this.cdr.markForCheck();
				}
				else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.conflictRes = true;
					this.commonService.resetAdvDropdown(this.entityId);
					this.toasterService.showToaster(ToastOptions.Error, 'ThisJobCategoryAlreadyExists');
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, data.Message);
				}
			}
		});
	}

	public AddData(){
		this.AddEditJobCategoryForm.markAllAsTouched();
		if(!this.AddEditJobCategoryForm.valid){
			return;
		  }
		const jobData = new JobCategory(this.AddEditJobCategoryForm.value);
		jobData.LCId = parseInt(this.AddEditJobCategoryForm.controls['LCName'].value.Value ?? magicNumber.zero);
		jobData.UdfFieldRecords = this.udfData;
		this.jobCategoryService.addJobCategory(jobData).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<JobCategory>) => {
				if (this.isEditMode) {
					this.EditData();
				}
				else if (data.Succeeded) {
					this.commonService.resetAdvDropdown(this.entityId);
					this.router.navigate([NavigationPaths.list]);
					this.toasterService.showToaster(ToastOptions.Success, 'JobCategoryHasBeenSavedSuccessfully');
				}
				else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.conflictRes = true;
					this.toasterService.showToaster(ToastOptions.Error, 'ThisJobCategoryAlreadyExists');
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, data.Message);
				}
			});
	}

	ngOnDestroy(): void {
		if (this.isEditMode || this.conflictRes) {
			this.toasterService.resetToaster();
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}

