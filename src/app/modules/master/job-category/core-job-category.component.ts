import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { JobCategoryService } from 'src/app/services/masters/job-category.service';
import { NavigationPaths } from './route-constants/routes-constant';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { GenericResponseBase, hasValidationMessages } from '@xrm-core/models/responseTypes/generic-response.interface';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';

@Component({selector: 'app-core-job-category',
	templateUrl: './core-job-category.component.html',
	styleUrls: ['./core-job-category.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreJobCategoryComponent implements OnInit, OnDestroy{

	public statusForm:FormGroup;
	public show:boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'JobCategoryId',
				cssClass: ['basic-title']
			}
		]
	  };
	public recordId:string;
	public recordStatus:string;
	public Ukey:string;
	public entityId: number = XrmEntities.JobCategory;
	public showHeader: boolean = true;
	private jobCategoryLabelTextParams: DynamicParam[] = [{ Value: 'JobCategorySmall', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private global: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
		private jobCategoryService: JobCategoryService,
		public localizationService: LocalizationService,
		private eventLogService: EventLogService,
		private cdr: ChangeDetectorRef
	) {

		this.statusForm = this.formBuilder.group({
			'status': [null]
		});

	}

	ngOnInit(){
		this.getRouteObs();
		this.jobCategoryStatusDetails();
	}

	private getRouteObs(){
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			if (url == '/xrm/master/job-category/list' || url == '/xrm/master/job-category/add-edit') {
				this.showHeader = false;
			} else {
				this.showHeader = true;
				const ukey = url.split('/');
				this.Ukey = ukey[ukey.length - magicNumber.one];
				this.show = url.includes('view');
			}
			this.buttonSet[0].items = this.show
				? this.commonHeaderIcons.commonActionSetOnActive(
					this.onEdit,
					this.onActivate
				)
				: this.commonHeaderIcons.commonActionSetOnActiveEdit(this.onActivate);

			this.buttonSet[1].items = this.show
				? this.commonHeaderIcons.commonActionSetOnDeactiveView(
					this.onEdit,
					this.onActivate
				)
				: this.commonHeaderIcons.commonActionSetOnDeactive(this.onActivate);
			this.cdr.markForCheck();
		});
	}

	private jobCategoryStatusDetails(){
		this.jobCategoryService.jobCategoryObsevable.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: {'Disabled': boolean, 'RuleCode': string, 'Id': number} | null) => {
			if(res){
				this.recordId = res.RuleCode;
				this.recordStatus = res.Disabled
					? 'Inactive'
					: 'Active';
				this.statusCardData.items[0].item = this.recordId;
				this.statusCardData.items[1] = res.Disabled
					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLogService.entityId.next(XrmEntities.JobCategory);
				this.eventLogService.recordId.next(res.Id);
			}
			this.cdr.markForCheck();
		});
	}

	private onActivate = (action: string) => {
		if (action == 'Activate') {
			this.processDialogResponse(false);
		} else {
			this.processDialogResponse(true);
		}
	};

	private onEdit = () => {
		this.eventLogService.isUpdated.next(true);
		this.router.navigate([`${NavigationPaths.addEdit}/${this.Ukey}`]);
	};

	public buttonSet = [
		{
			status: 'Active',
			items: this.commonHeaderIcons.commonActionSetOnActive(
				this.onEdit,
				this.onActivate
			)
		},
		{
			status: 'Inactive',
			items: this.commonHeaderIcons.commonActionSetOnDeactiveView(this.onEdit, this.onActivate)
		}
	];

	private processDialogResponse(isDisable: boolean) {
		this.toasterService.resetToaster();
		if (isDisable) {
			this.jobCategoryService.setRecordStatus('Inactive');
		  } else {
			this.jobCategoryService.setRecordStatus('Active');
		  }
		this.ActivateDeactivateJobCategory([{ UKey: this.Ukey, ReasonForChange: '', Disabled: isDisable }]);
	}

	private ActivateDeactivateJobCategory(data: ActivateDeactivate[]) {
		const mappedData: RecordStatusChangeResponse[] = data.map((item) =>
			({
				ukey: item.UKey,
				disabled: item.Disabled
			}));
		this.jobCategoryService.deleteJobCategory(mappedData).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ActivateDeactivate>) => {
				if(res.Succeeded) {
					if (data[magicNumber.zero].Disabled) {
						this.recordStatus = 'Inactive';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully', this.jobCategoryLabelTextParams);
					} else {
						this.recordStatus = 'Active';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully', this.jobCategoryLabelTextParams);
					}
					this.eventLogService.isUpdated.next(true);
				}
				else if (hasValidationMessages(res)) {
					ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
				}
				else if (res.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'ThisJobCategoryAlreadyExists');
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, res.Message);
				}
	   });
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
