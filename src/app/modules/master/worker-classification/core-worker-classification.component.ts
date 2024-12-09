import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { WorkerClassificationService } from 'src/app/services/masters/worker-classification.service';
import { NavigationPaths } from './route-constants/routes-constants';
import { HttpStatusCode } from '@angular/common/http';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { GenericResponseBase, hasValidationMessages } from '@xrm-core/models/responseTypes/generic-response.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';

@Component({
	selector: 'app-core-worker-classification',
	templateUrl: './core-worker-classification.component.html',
	styleUrl: './core-worker-classification.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorkerClassificationComponent implements OnInit, OnDestroy {
	public statusForm:FormGroup;
	public show:boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'WorkerClassificationId',
				cssClass: ['basic-title']
			}
		]
	  };
	public recordId:string;
	public recordStatus:string;
	public Ukey:string;
	public entityId: number = XrmEntities.WorkerClassification;
	public showHeader: boolean = false;
	private LabelTextParams: DynamicParam[] = [{ Value: 'WorkerClassificationSmall', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private formBuilder: FormBuilder,
		private global: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
		private workerClassificationService: WorkerClassificationService,
		public localizationService: LocalizationService,
		private eventLogService: EventLogService,
		private cdr: ChangeDetectorRef
	) {

		this.statusForm = this.formBuilder.group({
			'status': [null]
		});

	}

	ngOnInit(){
		this.handleRouteDetails();
		this.workerClassificationStatusData();
	}

	private handleRouteDetails(){
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			if (url == '/xrm/master/worker-classification/list' || url == '/xrm/master/worker-classification/add-edit') {
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

	private workerClassificationStatusData(){
		this.workerClassificationService.workerClassificationObservable.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: {'Disabled': boolean, 'RuleCode': string, 'Id': number} | null) => {
			if(res){
				this.recordId = res.RuleCode;
				this.recordStatus = res.Disabled
					? 'Inactive'
					: 'Active';
				this.statusCardData.items[0].item = this.recordId;
				this.statusCardData.items[1] = res.Disabled
					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLogService.entityId.next(XrmEntities.WorkerClassification);
				this.eventLogService.recordId.next(res.Id);
			}
			this.cdr.markForCheck();
		});
	}

	private onActivate = (actionRes: string) => {
		if (actionRes == 'Activate') {
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

	private processDialogResponse(enable: boolean) {
		this.toasterService.resetToaster();
		this.ActivateDeactivateTerminationReason([{ UKey: this.Ukey, ReasonForChange: '', Disabled: enable }]);
	}

	private ActivateDeactivateTerminationReason(res: ActivateDeactivate[]) {
		const mappedData: RecordStatusChangeResponse[] = res.map((item) =>
			({
				ukey: item.UKey,
				disabled: item.Disabled
			}));
		this.workerClassificationService.UpdateBulkStatus(mappedData).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((result: GenericResponseBase<ActivateDeactivate>) => {
				if(result.Succeeded) {
					if (res[magicNumber.zero].Disabled) {
						this.recordStatus = 'Inactive';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully', this.LabelTextParams);
					} else {
						this.recordStatus = 'Active';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully', this.LabelTextParams);
					}
					this.eventLogService.isUpdated.next(true);
				}
				else if (hasValidationMessages(result)) {
					ShowApiResponseMessage.showMessage(result, this.toasterService, this.localizationService);
				}
				else if (result.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'TerminationReasonAlreadyExist');
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, result.Message);
				}
	   });
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
