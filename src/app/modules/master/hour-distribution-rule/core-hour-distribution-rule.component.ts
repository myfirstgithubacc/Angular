import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { HourDistributionRuleService } from 'src/app/services/masters/hour-distribution-rule.service';
import { NavigationPaths } from './route-constants/route-constants';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { HttpStatusCode } from '@angular/common/http';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { hasValidationMessages } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-core-hour-distribution-rule',
	templateUrl: './core-hour-distribution-rule.component.html',
	styleUrls: ['./core-hour-distribution-rule.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreHourDistributionRuleModuleComponent implements OnInit, OnDestroy{
	public statusForm: FormGroup;
	public isEditMode: boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'RuleCode',
				cssClass: ['basic-title']
			}
		]
	};
	public recordId: string | undefined | null;
	public recordStatus: string | undefined | null;

	public showHeader: boolean = true;
	public entityId: number = XrmEntities.HourDistributionRule;

	private ukey: string;
	private destroyAllSubscribtion$ = new Subject<void>();
	private hdrLabelTextParams: DynamicParam[] = [{ Value: 'HourDistributionRule', IsLocalizeKey: true }];

	// eslint-disable-next-line max-params
	constructor(
		private commonHeaderIcons: CommonHeaderActionService,
		private toasterService: ToasterService,
		private localizationService: LocalizationService,
		private hdrService: HourDistributionRuleService,
		private pageTitle: PageTitleService,
		private formBuilder: FormBuilder,
		private router: Router,
		private eventLog: EventLogService,
		private cdr: ChangeDetectorRef
	) {
		this.statusForm = this.formBuilder.group({
			'status': [null]
		});
		this.createButtonSets();
	}

	ngOnInit(): void {
		this.pageTitle.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			if (url == NavigationPaths.list || url == NavigationPaths.addEdit) {
				this.showHeader = false;
			} else {
				this.showHeader = true;
				const ukey = url.split('/');
				this.ukey = ukey[ukey.length - magicNumber.one];
				this.updateButtonSets(url.includes('view'));
			}
			this.cdr.markForCheck();
		});

		this.commonHeaderIcons.getData.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if(res) {
				const {RuleCode, Disabled, Id} = res;
				this.recordId = RuleCode;
				this.recordStatus = Disabled
					? 'Inactive'
					: 'Active';
				this.statusCardData.items[0].item = RuleCode ?? '';
				this.statusCardData.items[1] = Disabled
					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLog.entityId.next(this.entityId);
				this.eventLog.recordId.next(Id);
				this.cdr.markForCheck();
			}
		});
	}

	private updateButtonSets(isView: boolean) {
		this.buttonSet[0].items = isView
			? this.commonHeaderIcons.commonActionSetOnActive(
				this.onEdit,
				this.onActivate
			)
			: this.commonHeaderIcons.commonActionSetOnActiveEdit(this.onActivate);

		this.buttonSet[1].items = isView
			? this.commonHeaderIcons.commonActionSetOnDeactiveView(
				this.onEdit,
				this.onActivate
			)
			: this.commonHeaderIcons.commonActionSetOnDeactive(this.onActivate);
	}

	private onEdit = () => {
		this.toasterService.resetToaster();
		this.eventLog.isUpdated.next(true);
		this.router.navigate([`${NavigationPaths.addEdit}/${this.ukey}`]);
	};

	private onActivate = (actions: string) => {
		this.processDialogResponse(!(actions == 'Activate'));
	};

	public buttonSet = [
		{
			status: 'Active',
			items: this.commonHeaderIcons.commonActionSetOnActiveEdit(this.onActivate)
		},
		{
			status: 'Inactive',
			items: this.commonHeaderIcons.commonActionSetOnDeactive(this.onActivate)
		}
	];

	private processDialogResponse(disable: boolean) {
		this.toasterService.resetToaster();
		this.ActivateDeactivateHourDistributionRule([{ 'UKey': this.ukey, 'ReasonForChange': '', 'Disabled': disable }]);
	}

	private createButtonSets() {
		this.buttonSet = [
			{
				status: 'Active',
				items: this.commonHeaderIcons.commonActionSetOnActiveEdit(this.onActivate)
			},
			{
				status: 'Inactive',
				items: this.commonHeaderIcons.commonActionSetOnDeactive(this.onActivate)
			}
		];
	}

	private ActivateDeactivateHourDistributionRule(dataItem: ActivateDeactivate[]) {
		this.hdrService.updateHourDistributionRuleStatus(dataItem).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response) => {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.hdrLabelTextParams);
				if(response.Succeeded){
					if (dataItem[0].Disabled) {
						this.recordStatus = 'Inactive';
						this.statusCardData.items[1]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully', localizeTextParams);
					} else {
						this.recordStatus = 'Active';
						this.statusCardData.items[1]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully', localizeTextParams);
					}
					this.statusForm.controls['status'].setValue({ Text: this.recordStatus, Value: this.recordStatus });
					this.cdr.detectChanges();
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
				this.cdr.markForCheck();
			});
		this.eventLog.isUpdated.next(true);
	}

	ngOnDestroy(): void {
		this.commonHeaderIcons.holdData.next(null);
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
