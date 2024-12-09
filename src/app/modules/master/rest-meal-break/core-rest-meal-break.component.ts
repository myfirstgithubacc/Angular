import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { RouterModule, Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { RestMealBreakService } from 'src/app/services/masters/rest-meal-break.service';
import { NavigationPaths } from './route-constants/route-constants';
import { HttpStatusCode } from '@angular/common/http';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { hasValidationMessages } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';

@Component({selector: 'app-core-rest-meal-break',
	templateUrl: './core-rest-meal-break.component.html',
	styleUrls: ['./core-rest-meal-break.component.scss'],
	standalone: true,
	imports: [CommonModule, SharedModule, RouterModule],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreRestMealBreakComponent implements OnInit, OnDestroy {
	public statusForm: FormGroup;
	private show: boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'RuleCode',
				cssClass: ['basic-title']
			}
		]
	};
	public recordId: string;
	public recordStatus: string;
	private Ukey: string;
	public entityId: number = XrmEntities.RestOrMealBreakConfiguration;
	public showHeader: boolean = true;
	private restMealBreakLabelTextParams: DynamicParam[] = [{ Value: 'RestOrMealBreakConfiguration', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();
	constructor(
		private formBuilder: FormBuilder,
		private global: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
		private restMealBreakService: RestMealBreakService,
		private cdr: ChangeDetectorRef,
		private localizationService: LocalizationService,
		private eventLog: EventLogService
	) {
		this.statusForm = this.formBuilder.group({
			'status': [null]
		});

	}

	ngOnInit() {
		// forkJoin...
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			if (url == '/xrm/master/rest-meal-break-configuration/list' || url == '/xrm/master/rest-meal-break-configuration/add-edit') {
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
		});

		this.restMealBreakService.getData.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: {'Disabled': boolean, 'RuleCode': string, 'Id': number} | null) => {
			if(res){
				this.recordId = res.RuleCode;
				this.recordStatus = res.Disabled
					? 'Inactive'
					: 'Active';
				this.statusCardData.items[0].item = this.recordId;
				this.statusCardData.items[1] = res.Disabled
					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLog.entityId.next(XrmEntities.RestOrMealBreakConfiguration);
				this.eventLog.recordId.next(res.Id);
			}
		});
	}

	private onActivate = (actions: string) => {
		if (actions == 'Activate') {
			this.processDialogResponse(false);
		} else {
			this.processDialogResponse(true);
		}
	};

	private onEdit = () => {
		this.eventLog.isUpdated.next(true);
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

	private processDialogResponse(disable: boolean) {
		this.toasterService.resetToaster();
		this.ActivateDeactivateRestMealBreakConfiguration([{ UKey: this.Ukey, ReasonForChange: '', Disabled: disable }]);
	}

	private ActivateDeactivateRestMealBreakConfiguration(dataItem: ActivateDeactivate[]) {
		this.restMealBreakService.updateRestMealBreakConfigurationStatus(dataItem).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response) => {
				if (response.Succeeded) {
					const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.restMealBreakLabelTextParams);
					if (dataItem[0].Disabled) {
						this.recordStatus = 'Inactive';
						this.statusCardData.items[1] = { item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled' };
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully', localizeTextParams);
					} else {
						this.recordStatus = 'Active';
						this.statusCardData.items[1] = { item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled' };
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully', localizeTextParams);
					}
					this.cdr.detectChanges();
					this.eventLog.isUpdated.next(true);
				}

				else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationService);
				}
				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists');
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, response.Message);
				}
				this.eventLog.isUpdated.next(true);
			});
	}

	ngOnDestroy(): void {
		if(this.toasterService.isRemovableToaster)
			this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
