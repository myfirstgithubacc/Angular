import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { ApprovalDetail } from '@xrm-core/models/acrotrac/expense-entry/add-edit/approver-details';
import { AssignmentDetailsData } from '@xrm-core/models/acrotrac/expense-entry/add-edit/assignment-details';
import { isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';
import { ApprovalConfigurationGatewayService } from 'src/app/services/masters/approval-configuration-gateway.service';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';

@Component({
	selector: 'app-assignment-more-details',
	templateUrl: './assignment-more-details.component.html',
	styleUrls: ['./assignment-more-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignmentMoreDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
	@Input() recordId: number;
	@Input() assignmentId: string;
	@Input() POIncurredAmount: boolean = false;
	@Input() isAssignDetailsNeedFromApi: boolean = true;
	@Input() isTimeSheet: boolean = false;
	@Input() isTimeAdjustment: boolean = false;
	@Input() hourDistributionRuleName: string;
	@Input() OtEligibility:boolean;
	@Input() entityId: number;
	@Input() weekendingDate:string;
	@Input() assignmentDetails: AssignmentDetailsData;
	@Output() currencyCode: EventEmitter<string> = new EventEmitter<string>();
	@Output() assignmentCode: EventEmitter<string> = new EventEmitter<string>();
	@Output() assignmentMoreDataEmitter: EventEmitter<AssignmentDetailsData> = new EventEmitter<AssignmentDetailsData>();
	@ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
	public showTooltip(e: MouseEvent): void {
		const element = e.target as HTMLElement;
		if (
			(element.nodeName === "TD" || element.className === "k-column-title") &&
      element.offsetWidth < element.scrollWidth
		) {
			this.tooltipDir.toggle(element);
		} else {
			this.tooltipDir.hide();
		}
	}
	public assignmentMoreData: AssignmentDetailsData;
	public approvalDetails: ApprovalDetail[];
	public displayStaffingAgencyName: boolean = true;
	public dateFormat: string;
	public entityType: string;
	public roleGroupId: number;
	public staffingAgency: number = magicNumber.three;
	public labelName: string;
	public magicNumber = magicNumber;

	private CurrencyCode: string;
	private destroyAllSubscribtion$ = new Subject<void>();
	private clientUser: number = magicNumber.four;

	// eslint-disable-next-line max-params
	constructor(
		private sessionStore: SessionStorageService,
		private localizationService: LocalizationService,
		private expenseEntryService: ExpenseEntryService,
		private approvalConfigurationService: ApprovalConfigurationGatewayService,
		private cdr: ChangeDetectorRef
	) { }

	//don't remove ? mark from ngOnChanges
	ngOnChanges(changes: SimpleChanges) {
		if (changes['assignmentId']?.currentValue || changes['recordId']?.currentValue)
			this.getAssignmentDetails();
	}

	ngOnInit(): void {
		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
		this.entityType = this.sessionStore.get('roleGroupId') ?? '';
		this.roleGroupId = parseInt(this.entityType);
		if (this.assignmentId)
			this.getAssignmentDetails();
	}

	private getAssignmentDetails() {
		if (this.isAssignDetailsNeedFromApi) {
			const payload = {assignmentId: this.assignmentId, entityId: this.entityId, weekendingDate: this.weekendingDate};
			this.expenseEntryService.getAssignmentDetailsForTandE(payload)
				.pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((res) => {
					if(isSuccessfulResponse(res)) {
						const { Result } = res.Data;
						if (this.roleGroupId === this.clientUser) {
							this.displayStaffingAgencyName = Result.DisplayStaffingAgency;
						}
						this.assignmentMoreData = Result;
						this.CurrencyCode = this.assignmentMoreData.CurrencyCode;
						this.assignmentCode.emit(this.assignmentMoreData.AssignmentCode);
						this.currencyCode.emit(this.CurrencyCode);
						this.assignmentMoreDataEmitter.emit(Result);
						this.labelName = this.localizationService.GetLocalizeMessage('DynamicCurrency', [{ Value: 'POIncurredAmount', IsLocalizeKey: true }, { Value: this.CurrencyCode, IsLocalizeKey: false }]);
					}
					this.cdr.markForCheck();
				});
		} else {
			this.assignmentMoreData = this.assignmentDetails;
			this.CurrencyCode = this.assignmentDetails.CurrencyCode;
			this.labelName = this.localizationService.GetLocalizeMessage('DynamicCurrency', [{ Value: 'POIncurredAmount', IsLocalizeKey: true }, { Value: this.CurrencyCode, IsLocalizeKey: false }]);
		}


		let actionId: number;
		switch (true) {
			case this.isTimeAdjustment:
				actionId = magicNumber.fiveHundredFortySeven;
				break;
			case this.isTimeSheet:
				actionId = magicNumber.threeHundredTwentyone;
				break;
			default:
				actionId = magicNumber.threeHundredTwenty;
		}

		this.approvalConfigurationService.
			getTimeAndExpenseApprovers(this.entityId, actionId, this.recordId, this.assignmentId)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
				if (response.Succeeded)
					this.approvalDetails = response.Data;
				this.cdr.markForCheck();
			});
	}

	ngAfterViewInit(): void {
		this.labelName = this.localizationService.GetLocalizeMessage('DynamicCurrency', [{ Value: 'POIncurredAmount', IsLocalizeKey: true }, { Value: this.CurrencyCode, IsLocalizeKey: false }]);
	}

	ngOnDestroy() {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
