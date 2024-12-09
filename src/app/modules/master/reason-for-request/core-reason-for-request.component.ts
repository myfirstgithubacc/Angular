import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { NavigationPaths } from './constant/routes-constant';
import { ReasonForRequestService } from './services/reason-for-request.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { ICommonComponentData } from '@xrm-core/models/reason-for-request/reason-for-request.interface';
import { IRecordButton, IRecordButtonItem, IRecordStatusChangePayload, IStatusCardData, IStatusCardItem } from '@xrm-shared/models/common.model';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';

@Component({
	selector: 'app-core-reason-for-request',
	templateUrl: './core-reason-for-request.component.html',
	styleUrls: ['./core-reason-for-request.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreReasonForRequestComponent implements OnInit, OnDestroy {
	public statusForm: FormGroup;
	public showEditOnStatus: boolean = false;
	public statusCardData: IStatusCardData = {
		items: [
			{
				item: '',
				title: 'ReasonForRequestID',
				cssClass: ['basic-title']
			}
		]
	};

	public recordCode: string = '';
	public recordStatus: string = '';
	private uKey: string = '';
	public entityId: number = XrmEntities.ReasonForRequest;
	public renderCommonSection: boolean = true;
	private unsubscribeAll$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private pageTitleService: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
		private reasonForRequestService: ReasonForRequestService,
		private eventLogService: EventLogService,
		private cdr: ChangeDetectorRef
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
		this.pageTitleService.getRouteObs.pipe(takeUntil(this.unsubscribeAll$)).subscribe((url) => {
			const isPathWithoutCommonSection = (url === NavigationPaths.list || url === NavigationPaths.addEdit);
			this.renderCommonSection = !isPathWithoutCommonSection;
			if (this.renderCommonSection) {
				const ukey = url.split('/');
				this.uKey = ukey[ukey.length - magicNumber.one];
				this.showEditOnStatus = url.includes('view');
			}
			this.updateButtonSet();
			this.eventLogService.isUpdated.next(true);
		});
	}

	private setStatusAndEventLogData(): void {
		this.reasonForRequestService.sharedDataObservable
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((res: ICommonComponentData) => {
				this.recordCode = res.ReasonForRequestCode;
				this.recordStatus = res.Disabled
					? dropdown.Inactive
					: dropdown.Active;

				this.statusCardData.items[magicNumber.zero].item = this.recordCode;
				this.statusCardData.items[magicNumber.one] = this.getStatusCardItem(res.Disabled);

				this.setEventLogData(res.ReasonForRequestId);
			});
	}

	private getStatusCardItem(isDisabled: boolean): IStatusCardItem {
		return isDisabled
			? { item: dropdown.Inactive, cssClass: ['red-color'], title: dropdown.Disabled }
			: { item: dropdown.Active, cssClass: ['green-color'], title: dropdown.Active };
	}

	private updateButtonSet(): void {
		this.buttonSet[magicNumber.zero].items = this.getActiveButtonSet();
		this.buttonSet[magicNumber.one].items = this.getInactiveButtonSet();
	}

	private getActiveButtonSet(): IRecordButtonItem[] {
		return this.showEditOnStatus
			? this.commonHeaderIcons.commonActionSetOnActive(this.onEdit, this.activateDeactivateReasonForRequest)
			: this.commonHeaderIcons.commonActionSetOnActiveEdit(this.activateDeactivateReasonForRequest);
	}

	private getInactiveButtonSet(): IRecordButtonItem[] {
		return this.showEditOnStatus
			? this.commonHeaderIcons.commonActionSetOnDeactiveView(this.onEdit, this.activateDeactivateReasonForRequest)
			: this.commonHeaderIcons.commonActionSetOnDeactive(this.activateDeactivateReasonForRequest);
	}

	private setEventLogData(recordId: number): void {
		this.eventLogService.recordId.next(recordId);
		this.eventLogService.entityId.next(this.entityId);
	}

	private activateDeactivateReasonForRequest = (actions: string): void => {
		this.processDialogResponse(actions !== dropdown.Activate);
	};

	private processDialogResponse(disable: boolean): void {
		this.toasterService.resetToaster();
		this.updateRecordStatus([{ UKey: this.uKey, Disabled: disable }]);
	}

	private updateRecordStatus(requestData: IRecordStatusChangePayload[]): void {
		this.reasonForRequestService.updateReasonForRequestStatus(requestData)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe(() => {
				this.handleStatusUpdateResponse(requestData);
				this.eventLogService.isUpdated.next(true);
				this.cdr.markForCheck();
			});
	}

	private handleStatusUpdateResponse(requestData: IRecordStatusChangePayload[]): void {
		const { Disabled: isDisabled } = requestData[magicNumber.zero],
			status = this.getStatus(isDisabled),
			successMessage = this.getSuccessMessage(isDisabled),
			cssClass = this.getCssClass(isDisabled);

		this.updateStatusCard(status, cssClass);
		this.updateStatusForm();
		this.toasterService.showToaster(ToastOptions.Success, successMessage);
	}

	private getStatus(isDisabled: boolean): string {
		return isDisabled
			? dropdown.Inactive
			: dropdown.Active;
	}

	private getSuccessMessage(isDisabled: boolean): string {
		return isDisabled
			? 'ReasonForRequestDeactivatedSuccessfulConfirmation'
			: 'ReasonForRequestActivatedSuccessfulConfirmation';
	}

	private getCssClass(isDisabled: boolean): string[] {
		return isDisabled
			? ['red-color']
			: ['green-color'];
	}

	private updateStatusCard(status: string, cssClass: string[]): void {
		this.recordStatus = status;
		this.statusCardData.items[magicNumber.one] = {
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
		this.eventLogService.isUpdated.next(true);
		this.router.navigate([`${NavigationPaths.addEdit}/${this.uKey}`]);
	};


	public buttonSet: IRecordButton[] = [
		{
			status: dropdown.Active,
			items: this.commonHeaderIcons.commonActionSetOnActive(this.onEdit, this.activateDeactivateReasonForRequest)
		},
		{
			status: dropdown.Inactive,
			items: this.commonHeaderIcons.commonActionSetOnDeactiveView(this.onEdit, this.activateDeactivateReasonForRequest)
		}
	];

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
	}
}
