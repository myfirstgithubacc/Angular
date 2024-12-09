import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Subject, takeUntil } from 'rxjs';
import { TimeEntryService } from 'src/app/services/acrotrac/time-entry.service';
import { TooltipDirective } from "@progress/kendo-angular-tooltip";
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ExpandedTimeSheetDetails } from '@xrm-core/models/acrotrac/time-entry/expanded-time-sheet-model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
@Component({
	selector: 'app-expended-timesheet-details',
	templateUrl: './expended-timesheet-details.component.html',
	styleUrls: ['./expended-timesheet-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpendedTimesheetDetailsComponent {
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
	@Input('TimesheetPeriodRange') periodHeading: string = '';
	@Input() Ukey: string;
	@Input() apiResponse: ExpandedTimeSheetDetails[];
	@Input() isView: boolean = false;
	@Input() isExpandedDetails: boolean = false;
	@Input() currencyCode: string;
	@Input() isPenaltyApplied: boolean = false;
	@Output() changeIsExpandedDetails: EventEmitter<boolean> = new EventEmitter<boolean>();
	public stTotal: number;
	public otTotal: number;
	public dtTotal: number;
	public ptTotal: number;
	public totalEstimatedCost: number;
	public isDisabled = false;
	public getTimeEntryDetailsData: ExpandedTimeSheetDetails[];
	public estimatedCostWithCurrency: string;
	public showBillRateWithCurrency : string;
	public dateFormat: string;
	public magicNumber = magicNumber;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private timeEntryService: TimeEntryService,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef,
		private sessionStore: SessionStorageService,
		private renderer: Renderer2
	) { }

	ngOnInit(): void {
		this.estimatedCostWithCurrency = this.updateAmountWithCurrency('ExpectedAmount', this.currencyCode);
		this.showBillRateWithCurrency = this.localizationService.GetLocalizeMessage('ShowBillingRates', [{ Value: this.currencyCode, IsLocalizeKey: false }]);
		if (this.isView) {
			this.fetchTimeEntryDetails();
		} else {
			this.handleResponse(this.apiResponse);
		}
		const storedFormat = this.sessionStore.get('DateFormat') ?? '';
		this.dateFormat = this.getDateFormat(storedFormat);

	}

	private getDateFormat(storedFormat: string): string {
		if (!storedFormat) {
			return 'EEE, M/d';
		}
		switch (storedFormat) {
			case 'M/d/yyyy':
				return 'EEE, M/d';
			case 'd/M/yyyy':
				return 'EEE, d/M';
			case 'd.M.yyyy':
				return 'EEE, d.M';
			default:
				return 'EEE, M/d';
		}
	}

	private fetchTimeEntryDetails = (): void => {
		this.timeEntryService.getTimeEntryDetailsByUkey(this.Ukey).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ExpandedTimeSheetDetails[]>) => {
				if (isSuccessfulResponse(res)) {
					this.handleResponse(res.Data);
				}
				this.cdr.markForCheck();
			});
	};

	private handleResponse(res: ExpandedTimeSheetDetails[]): void {
		this.getTimeEntryDetailsData = res;
		this.stTotal = this.calculateAmount(this.getTimeEntryDetailsData, (entry) =>
			entry.StHour);
		this.otTotal = this.calculateAmount(this.getTimeEntryDetailsData, (entry) =>
			entry.OtHour);
		this.dtTotal = this.calculateAmount(this.getTimeEntryDetailsData, (entry) =>
			entry.DtHour);
		this.ptTotal = this.calculateAmount(this.getTimeEntryDetailsData, (entry) =>
			entry.PtHour);
		this.totalEstimatedCost = this.calculateAmount(this.getTimeEntryDetailsData, (entry) =>
			entry.EstimatedCost);
	};


	private calculateAmount(ExpenseEntryDetails: ExpandedTimeSheetDetails[], getAmountElement: (entry: ExpandedTimeSheetDetails) => number): number {
		let totalAmount = magicNumber.zero;
		ExpenseEntryDetails.forEach((element) => {
			totalAmount += getAmountElement(element);
		});
		return totalAmount;
	}

	ngAfterViewInit() {
		this.estimatedCostWithCurrency = this.updateAmountWithCurrency('ExpectedAmount', this.currencyCode);
		this.showBillRateWithCurrency = this.localizationService.GetLocalizeMessage('ShowBillingRates', [{ Value: this.currencyCode, IsLocalizeKey: false }]);
		this.renderer.addClass(document.body, 'scrolling__hidden');
		this.cdr.markForCheck();
	}

	private updateAmountWithCurrency(updatedAmount: string, currencyCode: string): string {
		return this.localizationService.GetLocalizeMessage('DynamicCurrency', [
			{ Value: updatedAmount, IsLocalizeKey: true },
			{ Value: currencyCode, IsLocalizeKey: false }
		]);
	}

	public closePopup(): void {
		this.changeIsExpandedDetails.emit();
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.renderer.removeClass(document.body, 'scrolling__hidden');
	}
}
