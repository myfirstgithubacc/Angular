import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { AutoprocessConfigurationService } from 'src/app/services/masters/autoprocess-configuration.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { NavigationPaths } from './constants/routes-constants';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';
import { GenericResponseBase, hasValidationMessages } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';

@Component({
	selector: 'app-autoprocess-configuration',
	templateUrl: './autoprocess-configuration.component.html',
	styleUrl: './autoprocess-configuration.component.scss',
	encapsulation: ViewEncapsulation.None
})
export class AutoprocessConfigurationComponent {
	public statusForm:FormGroup;
	public show:boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'JobId',
				cssClass: ['basic-title']
			}
		]
	  };
	public recordId:string;
	public recordStatus:string;
	public Ukey:string;
	public entityId: number = XrmEntities.AutoProcess;
	public showHeader: boolean = true;
	private jobLabelTextParams: DynamicParam[] = [{ Value: 'JobSmall', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private formBuilder: FormBuilder,
		private global: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
		private autoProcessServ: AutoprocessConfigurationService,
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
		this.autoProcessStatusData();
	}

	private handleRouteDetails(){
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			if (url == '/xrm/master/auto-process/list' || url == '/xrm/master/auto-process/add-edit') {
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

	private autoProcessStatusData(){
		this.autoProcessServ.jobsObsevable.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: {'Disabled': boolean, 'RuleCode': string, 'Id': number} | null) => {
			if(res){
				this.recordId = res.RuleCode;
				this.recordStatus = res.Disabled
					? 'Inactive'
					: 'Active';
				this.statusCardData.items[0].item = this.recordId;
				this.statusCardData.items[1] = res.Disabled
					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLogService.entityId.next(XrmEntities.AutoProcess);
				this.eventLogService.recordId.next(res.Id);
			}
			this.cdr.markForCheck();
		});
	}
	private onActivate = (actionData: string) => {
		if (actionData == 'Activate') {
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

	private processDialogResponse(disabled: boolean) {
		this.toasterService.resetToaster();
		this.ActivateDeactivateJob([{ UKey: this.Ukey, ReasonForChange: '', Disabled: disabled }]);
	}

	private ActivateDeactivateJob(responseData: ActivateDeactivate[]) {
		const mappedData: RecordStatusChangeResponse[] = responseData.map((item) =>
			({
				ukey: item.UKey,
				disabled: item.Disabled
			}));
		this.autoProcessServ.enableAutoProcess(mappedData).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<ActivateDeactivate>) => {
				if(response.Succeeded) {
					if (responseData[magicNumber.zero].Disabled) {
						this.recordStatus = 'Inactive';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully', this.jobLabelTextParams);
					} else {
						this.recordStatus = 'Active';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully', this.jobLabelTextParams);
					}
					this.eventLogService.isUpdated.next(true);
				}
				else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationService);
				}
				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'This job already exists.');
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, response.Message);
				}
	   });
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
