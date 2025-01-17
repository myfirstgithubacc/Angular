import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { ManageCountryService } from 'src/app/services/masters/manage-country.service';
import { NavigationPaths } from './navigation-paths/NavigationPaths';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { GenericResponseBase, hasValidationMessages } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';

@Component({selector: 'app-core-manage-country',
	templateUrl: './core-manage-country.component.html',
	styleUrls: ['./core-manage-country.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreManageCountryComponent {

	public statusForm:FormGroup;
	public show:boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'AutoGeneratedCountryId',
				cssClass: ['basic-title']
			}
		]
	  };
	public recordId:string;
	public recordStatus:string;
	public Ukey:string;
	public entityId: number = XrmEntities.ManageCountry;
	public showHeader: boolean = true;
	public manageCountryParams: DynamicParam[] = [{ Value: 'Country', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private formBuilder: FormBuilder,
		private global: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
    	private manageCountryServ: ManageCountryService,
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
		this.manageCountryStatusDetails();
	}

	private getRouteObs(){
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			if (url == '/xrm/master/manage-country/list' || url == '/xrm/master/manage-country/add-edit') {
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

	private manageCountryStatusDetails(){
		this.manageCountryServ.manageCountryObservable.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: {'Disabled': boolean, 'RuleCode': string, 'Id': number} | null) => {
			if(res){
				this.recordId = res.RuleCode;
				this.recordStatus = res.Disabled
					? 'Inactive'
					: 'Active';
				this.statusCardData.items[0].item = this.recordId;
				this.statusCardData.items[1] = res.Disabled
					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLogService.entityId.next(XrmEntities.ManageCountry);
				this.eventLogService.recordId.next(res.Id);
			}
			this.cdr.markForCheck();
		});
	}

	private onActivate = (actionSet: string) => {
		if (actionSet == 'Activate') {
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

	private processDialogResponse(enabled: boolean) {
		this.toasterService.resetToaster();
		this.ActivateDeactivateManageCountry([{ UKey: this.Ukey, ReasonForChange: '', Disabled: enabled }]);
	}

	private ActivateDeactivateManageCountry(dataSet: ActivateDeactivate[]) {
		const mappedData: RecordStatusChangeResponse[] = dataSet.map((item) =>
			({
				ukey: item.UKey,
				disabled: item.Disabled
			}));
		this.manageCountryServ.deleteManageCountry(mappedData).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<ActivateDeactivate>) => {
				if(data.Succeeded) {
					if (dataSet[magicNumber.zero].Disabled) {
						this.recordStatus = 'Inactive';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully', this.manageCountryParams);
					} else {
						this.recordStatus = 'Active';
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully', this.manageCountryParams);
					}
					this.eventLogService.isUpdated.next(true);
				}
				else if (hasValidationMessages(data)) {
					ShowApiResponseMessage.showMessage(data, this.toasterService, this.localizationService);
				}
				else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'CountryHasBeenSavedSuccessfully');
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, data.Message);
				}
	   });
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
