import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { ExpenseTypeService } from 'src/app/services/masters/expense-type.service';
import { NavigationPaths } from './route-constants/route-constants';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HttpStatusCode } from '@angular/common/http';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-core-expense-type',
	templateUrl: './core-expense-type.component.html',
	styleUrls: ['./core-expense-type.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreExpenseTypeComponent implements OnInit, OnDestroy {
	public statusForm: FormGroup;
	private show: boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'ExpenseTypeId',
				cssClass: ['basic-title']
			}
		]
	};
	public recordId: string;
	public recordStatus: string;
	private ukey: string;
	public entityId: number = XrmEntities.ExpenseType;
	public showHeader: boolean = true;
	private expenseTypeLabelTextParams: DynamicParam[] = [{ Value: 'ExpenseType', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private global: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
		private expenseTypeService: ExpenseTypeService,
		private cdr: ChangeDetectorRef,
		public localizationService: LocalizationService,
		private eventLog: EventLogService
	) {
		this.statusForm = this.formBuilder.group({
			'status': [null]
		});

	}

	ngOnInit() {
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			if (url == '/xrm/master/expense-type/list' || url == '/xrm/master/expense-type/add-edit') {
				this.showHeader = false;
			} else {
				this.showHeader = true;
				const ukey = url.split('/');
				this.ukey = ukey[ukey.length - magicNumber.one];
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

		this.expenseTypeService.getData.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: {'Disabled': boolean, 'RuleCode': string, 'Id': number} | null) => {
			if(res){
				this.recordId = res.RuleCode;
				this.recordStatus = res.Disabled
					? 'Inactive'
					: 'Active';
				this.statusCardData.items[0].item = this.recordId;
				this.statusCardData.items[1] = res.Disabled
					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLog.entityId.next(XrmEntities.ExpenseType);
				this.eventLog.recordId.next(res.Id);
			}
			this.cdr.markForCheck();
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
		this.router.navigate([`${NavigationPaths.addEdit}/${this.ukey}`]);
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
		this.ActivateDeactivateExpenseType([{ UKey: this.ukey, ReasonForChange: '', Disabled: disable }]);
	}

	private ActivateDeactivateExpenseType(dataItem: ActivateDeactivate[]) {
		this.expenseTypeService.updateExpenseTypeStatus(dataItem).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<ActivateDeactivate>) => {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.expenseTypeLabelTextParams);
				if(isSuccessfulResponse(response)){
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
					this.cdr.markForCheck();
					this.eventLog.isUpdated.next(true);
				}
				else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationService);
				}
				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, response.Message);
				}
				this.cdr.markForCheck();
			});
	}

	ngOnDestroy(): void {
		if(this.toasterService.isRemovableToaster)
			this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
