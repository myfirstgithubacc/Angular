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
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { MinimumClearanceToStartService } from './services/minimum-clearance-to-start.service';
import { ICommonComponentData } from '@xrm-core/models/minimum-clearance/minimum-clearance-to-start.interface';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { IRecordButton, IRecordButtonItem, IRecordStatusChangePayload, IStatusCardData, IStatusCardItem } from '@xrm-shared/models/common.model';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';

@Component({
	selector: 'app-core-minimum-clearance-to-start',
	templateUrl: './core-minimum-clearance-to-start.component.html',
	styleUrls: ['./core-minimum-clearance-to-start.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreMinimumClearanceToStartComponent implements OnInit, OnDestroy {
	public statusForm: FormGroup;
	public statusCardData: IStatusCardData = {
		items: [
			{
				item: '',
				title: 'MinimumClearancetoStartID',
				cssClass: ['basic-title']
			}
		]
	};

	public recordCode: string = '';
	public recordStatus: string = '';
	private uKey: string = '';
	public entityId: number = XrmEntities.MinimumClearancetoStart;
	public renderCommonSection: boolean = true;
	private unsubscribeAll$ = new Subject<void>();
	private showEditOnStatus: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private pageTitleService: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private router: Router,
		private toasterService: ToasterService,
		private minimumClearanceService: MinimumClearanceToStartService,
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
		this.minimumClearanceService.sharedDataObservable
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((res: ICommonComponentData) => {
				this.recordCode = res.MinClearanceCode;
				this.recordStatus = res.Disabled
					? dropdown.Inactive
					: dropdown.Active;

				this.statusCardData.items[magicNumber.zero].item = this.recordCode;
				this.statusCardData.items[magicNumber.one] = this.getStatusCardItem(res.Disabled);

				this.setEventLogData(res.MinClearanceId);
			});
	}

	private getStatusCardItem(isDisabled: boolean): IStatusCardItem {
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

	private getActiveButtonSet(): IRecordButtonItem[] {
		return this.showEditOnStatus
			? this.commonHeaderIcons.commonActionSetOnActive(this.onEdit, this.activateDeactivateMinClearance)
			: this.commonHeaderIcons.commonActionSetOnActiveEdit(this.activateDeactivateMinClearance);
	}

	private getInactiveButtonSet(): IRecordButtonItem[] {
		return this.showEditOnStatus
			? this.commonHeaderIcons.commonActionSetOnDeactiveView(this.onEdit, this.activateDeactivateMinClearance)
			: this.commonHeaderIcons.commonActionSetOnDeactive(this.activateDeactivateMinClearance);
	}

	private activateDeactivateMinClearance = (actions: string): void => {
		this.processDialogResponse(actions !== dropdown.Activate);
	};

	private processDialogResponse(disable: boolean): void {
		this.toasterService.resetToaster();
		this.updateRecordStatus([{ UKey: this.uKey, Disabled: disable }]);
	}

	private updateRecordStatus(requestData: IRecordStatusChangePayload[]): void {
		this.minimumClearanceService.updateMinimumClearanceToStartStatus(requestData)
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
			? 'MinimumClearanceDectivatedSuccessfulConfirmation'
			: 'MinimumClearanceActivatedSuccessfulConfirmation';
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
			items: this.commonHeaderIcons.commonActionSetOnActive(this.onEdit, this.activateDeactivateMinClearance)
		},
		{
			status: dropdown.Inactive,
			items: this.commonHeaderIcons.commonActionSetOnDeactiveView(this.onEdit, this.activateDeactivateMinClearance)
		}
	];

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
	}
}
