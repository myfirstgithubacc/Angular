import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { Subject, takeUntil } from 'rxjs';
import { NavigationPaths } from './route-constants/routes-constants';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { TerminationReasonService } from 'src/app/services/masters/termination-reason.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { GenericResponseBase, hasValidationMessages } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';

@Component({selector: 'app-termination-reason',
	templateUrl: './core-termination-reason.component.html',
	styleUrls: ['./core-termination-reason.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreTerminationReasonComponent {
	public statusForm:FormGroup;
	public show:boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'TerminationReasonId',
				cssClass: ['basic-title']
			}
		]
	  };
	public recordId:string;
	public recordStatus:string;
	public Ukey:string;
	public entityId: number = XrmEntities.TerminationReason;
	public showHeader: boolean = true;
	private trmrLabelTextParams: DynamicParam[] = [{ Value: 'TerminationReasonSmall', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private formBuilder: FormBuilder,
		private global: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
		private terminationReasonServ: TerminationReasonService,
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
		this.terminationReasonStatusData();
	}

	private handleRouteDetails(){
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			if (url == '/xrm/master/termination-reason/list' || url == '/xrm/master/termination-reason/add-edit') {
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

	private terminationReasonStatusData(){
		this.terminationReasonServ.terminationReasonObservable.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: {'Disabled': boolean, 'RuleCode': string, 'Id': number} | null) => {
			if(res){
				this.recordId = res.RuleCode;
				this.recordStatus = res.Disabled
					? 'Inactive'
					: 'Active';
				this.statusCardData.items[0].item = this.recordId;
				this.statusCardData.items[1] = res.Disabled
					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLogService.entityId.next(XrmEntities.TerminationReason);
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
		this.terminationReasonServ.UpdateBulkStatus(mappedData).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((result: GenericResponseBase<ActivateDeactivate>) => {
				if(result.Succeeded) {
					if (res[magicNumber.zero].Disabled) {
						this.recordStatus = 'Inactive';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully', this.trmrLabelTextParams);
					} else {
						this.recordStatus = 'Active';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully', this.trmrLabelTextParams);
					}
					this.eventLogService.isUpdated.next(true);
				}
				else if (hasValidationMessages(result)) {
					ShowApiResponseMessage.showMessage(result, this.toasterService, this.localizationService);
				}
				else if (result.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'TerminationReasonAlreadyExists');
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
