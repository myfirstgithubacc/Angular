import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { IRecordButton, IRecordStatusChangePayload, IStatusCardData } from '@xrm-shared/models/common.model';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { UserDefinedFieldsService } from './services/user-defined-fields.service';
import { NavigationPaths } from './constant/route-constant';
import { ICommonComponentData } from '@xrm-core/models/user-defined-field-config/udf-config-common.model';

@Component({selector: 'app-core-user-defined-fields',
	templateUrl: './core-user-defined-fields.component.html',
	styleUrls: ['./core-user-defined-fields.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreUserDefinedFieldsComponent implements OnInit, OnDestroy {
	public statusForm: FormGroup;
	public statusCardData: IStatusCardData = {
		items: [
			{
				item: '',
				title: 'UserDefinedFieldId',
				cssClass: ['basic-title']
			}
		]
	};

	public recordCode: string = '';
	public recordStatus: string = '';
	private uKey: string = '';
	private fieldTypeId: string;
	public entityId: number = XrmEntities.UserDefinedField;
	public isCommonSectionVisible: boolean = true;
	private unsubscribeAll$ = new Subject<void>();
	private isViewMode: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private pageTitleService: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
		private userDefinedFieldsService: UserDefinedFieldsService,
		private eventLogService: EventLogService,
		private changeDetect: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.initializeStatusForm();
		this.updateUIOnRouteChange();
		this.setStatusAndEventLogData();
	}

	private initializeStatusForm(): void {
		this.statusForm = this.formBuilder.group({
			'status': [null]
		});
	}

	private updateUIOnRouteChange(): void {
		this.pageTitleService.getRouteObs
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((url) => {
				this.isCommonSectionVisible = !(url === NavigationPaths.listOnly || url === NavigationPaths.addEdit);
				if (this.isCommonSectionVisible) {
					const urlSegments = url.split('/');
					this.uKey = urlSegments[urlSegments.length - magicNumber.two];
					this.fieldTypeId = urlSegments[urlSegments.length - magicNumber.one];
					this.isViewMode = url.includes('view');
				}
				this.updateButtonSet();
				this.eventLogService.isUpdated.next(true);
			});
	}

	private setStatusAndEventLogData(): void {
		this.userDefinedFieldsService.sharedDataObservable.pipe(takeUntil(this.unsubscribeAll$)).subscribe((res: ICommonComponentData) => {
			this.recordCode = res.UdfConfigCode;
			this.recordStatus = res.Disabled
				? dropdown.Inactive
				: dropdown.Active;
			this.statusCardData.items[magicNumber.zero].item = this.recordCode;
			this.statusCardData.items[magicNumber.one] = this.getStatusCardItem(res.Disabled);
			this.setEventLogData(res.UdfConfigId);
		});
	}

	private getStatusCardItem(isDisabled: boolean): { item: string, cssClass: string[], title: string } {
		return isDisabled
			? { item: dropdown.Inactive, cssClass: ['red-color'], title: dropdown.Disabled }
			: { item: dropdown.Active, cssClass: ['green-color'], title: dropdown.Active };
	}

	private setEventLogData(recordId: number): void {
		this.eventLogService.recordId.next(recordId);
		this.eventLogService.entityId.next(this.entityId);
	}

	private updateButtonSet(): void {
		this.buttonSet[magicNumber.zero].items = this.getActiveButtonSet();
		this.buttonSet[magicNumber.one].items = this.getInactiveButtonSet();
	}

	private getActiveButtonSet() {
		return this.isViewMode
			? this.commonHeaderIcons.commonActionSetOnActive(this.onEdit, this.activateDeactivate)
			: this.commonHeaderIcons.commonActionSetOnActiveEdit(this.activateDeactivate);
	}

	private getInactiveButtonSet() {
		return this.isViewMode
			? this.commonHeaderIcons.commonActionSetOnDeactiveView(this.onEdit, this.activateDeactivate)
			: this.commonHeaderIcons.commonActionSetOnDeactive(this.activateDeactivate);
	}

	private activateDeactivate = (actions: string): void => {
		this.processDialogResponse(actions !== dropdown.Activate);
		this.eventLogService.isUpdated.next(true);
	};

	private processDialogResponse(disable: boolean): void {
		this.toasterService.resetToaster();
		this.updateRecordStatus([{ UKey: this.uKey, Disabled: disable }]);
	}

	private updateRecordStatus(requestData: IRecordStatusChangePayload[]): void {
		this.userDefinedFieldsService.UpdateStatus(requestData)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe(() => {
				this.handleStatusUpdateResponse(requestData);
				this.changeDetect.markForCheck();
			});
	}

	private handleStatusUpdateResponse(requestData: IRecordStatusChangePayload[]): void {
		const { Disabled: isDisabled } = requestData[magicNumber.zero],
		 status = this.getRecordStatus(isDisabled),
		 successMessage = this.getSuccessMessage(isDisabled),
		 cssClass = this.getCssClass(isDisabled);
		this.updateStatusCard(status, cssClass);
		this.updateStatusForm();
		this.toasterService.showToaster(ToastOptions.Success, successMessage);
	}

	private getRecordStatus(isDisabled: boolean): string {
		return isDisabled
			? dropdown.Inactive
			: dropdown.Active;
	}

	private getSuccessMessage(isDisabled: boolean): string {
		return isDisabled
			? 'UserDefinedFieldDeactivatedSuccessfulConfirmation'
			: 'UserDefinedFieldActivatedSuccessfulConfirmation';
	}

	private getCssClass(isDisabled: boolean): string[] {
		return isDisabled
			? ['red-color']
			: ['green-color'];
	}


	private updateStatusCard(status: string, cssClass: string[]): void {
		this.recordStatus = status;
		this.statusCardData.items[1] = {
			item: this.recordStatus,
			cssClass: cssClass,
			title: dropdown.Disabled
		};
	}

	private updateStatusForm(): void {
		this.statusForm.controls['status'].setValue({
			Text: this.recordStatus,
			Value: this.recordStatus
		});
	}

	public onEdit = (): void => {
		this.router.navigate([`${NavigationPaths.addEdit}/${this.uKey}/${this.fieldTypeId}`]);
	};


	public buttonSet: IRecordButton[] = [
		{
			status: dropdown.Active,
			items: this.commonHeaderIcons.commonActionSetOnActive(this.onEdit, this.activateDeactivate)
		},
		{
			status: dropdown.Inactive,
			items: this.commonHeaderIcons.commonActionSetOnDeactiveView(this.onEdit, this.activateDeactivate)
		}
	];

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
	}
}
