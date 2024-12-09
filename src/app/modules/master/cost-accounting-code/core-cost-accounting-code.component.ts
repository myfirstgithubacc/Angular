import { HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CostAccountingCodeService } from 'src/app/services/masters/cost-accounting-code.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { NavigationPaths } from './route-constants/route-constants';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RouterModule, Router } from '@angular/router';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { hasValidationMessages } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SharedModule } from '@xrm-shared/shared.module';
import { CommonModule } from '@angular/common';

type nullableString = string | undefined | null;
@Component({selector: 'app-core-cost-accounting-code',
	templateUrl: './core-cost-accounting-code.component.html',
	styleUrls: ['./core-cost-accounting-code.component.scss'],
	encapsulation: ViewEncapsulation.None,
	standalone: true,
	imports: [SharedModule, CommonModule, RouterModule],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreCostAccountingCodeComponent implements OnInit, OnDestroy {
	public statusForm: FormGroup;
	public isEditMode: boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'CostCode',
				cssClass: ['basic-title']
			}
		]
	};
	public recordId: nullableString;
	public recordStatus: nullableString;
	public showHeader: boolean = false;
	public entityId: number = XrmEntities.CostAccountingCode;

	private ukey: nullableString;
	private destroyAllSubscribtion$ = new Subject<void>();
	private costAccountCodeLabelTextParams: DynamicParam[] = [{ Value: 'CostAccountingCode', IsLocalizeKey: true }];

	// eslint-disable-next-line max-params
	constructor(
		private commonHeaderIcons: CommonHeaderActionService,
		private toasterService: ToasterService,
		private localizationService: LocalizationService,
		private costService: CostAccountingCodeService,
		private pageTitle: PageTitleService,
		private router: Router,
		private eventLog: EventLogService,
		private formBuilder: FormBuilder,
		private cdr: ChangeDetectorRef
	) {
		this.statusForm = this.formBuilder.group({
			'status': [null]
		});
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
		});

		this.commonHeaderIcons.getData.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: {'Disabled': boolean, 'RuleCode': string, 'Id': number} | null) => {
			if(res) {
				this.recordId = res.RuleCode;
				this.recordStatus = res.Disabled
					? 'Inactive'
					: 'Active';
				this.statusCardData.items[0].item = this.recordId;
				this.statusCardData.items[1] = res.Disabled
					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLog.entityId.next(XrmEntities.CostAccountingCode);
				this.eventLog.recordId.next(res.Id);
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
		if (actions == 'Activate') {
			this.processDialogResponse(false);
		} else {
			this.processDialogResponse(true);
		}
	};

	public buttonSet= [
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
		this.ActivateDeactivateCostCode([{ 'UKey': this.ukey ?? '', 'ReasonForChange': '', 'Disabled': disable }]);
	}

	private ActivateDeactivateCostCode(dataItem: ActivateDeactivate[]) {
		this.toasterService.resetToaster();
		this.costService.updateStatus(dataItem).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
			const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.costAccountCodeLabelTextParams);
			if(response.Succeeded) {
				if (dataItem[0].Disabled) {
					this.recordStatus = 'Inactive';
					this.statusCardData.items[1]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
					this.toasterService.displayToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully', localizeTextParams);
				} else {
					this.recordStatus = 'Active';
					this.statusCardData.items[1]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
					this.toasterService.displayToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully', localizeTextParams);
				}
				this.statusForm.controls['status'].setValue({ Text: this.recordStatus, Value: this.recordStatus });
				this.eventLog.isUpdated.next(true);
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
			this.eventLog.isUpdated.next(true);
		});
	}

	ngOnDestroy(): void {
		this.commonHeaderIcons.holdData.next(null);
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
