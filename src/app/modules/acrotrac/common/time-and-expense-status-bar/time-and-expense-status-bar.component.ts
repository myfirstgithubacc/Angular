/* eslint-disable max-lines-per-function */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { FormControl } from '@angular/forms';
import { statusIds } from '../../expense/expense/enum-constants/enum-constants';
import { TimeEntryStatus } from '../../Time/enum-constants/enum-constants';
import { timeAdjustConst } from '../../Time/timesheet/adjustment-manual/enum';

@Component({
	selector: 'app-time-and-expense-status-bar',
	templateUrl: './time-and-expense-status-bar.component.html',
	styleUrls: ['./time-and-expense-status-bar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeAndExpenseStatusBarComponent implements OnChanges {
	@Input() steps: string[];
	@Input() currentStep: number;
	@Input() linear: boolean = false;
	@Input() controlName?: FormControl;
	@Input() statusId: number;
	@Output() stepChanged = new EventEmitter<number>();
	public step = [
		{ label: 'New' },
		{ label: 'PendingApproval' },
		{ label: 'PendingPosting' },
		{ label: 'PendingInvoicing' },
		{ label: 'PendingPayment' }
	];
	constructor(private cdr: ChangeDetectorRef){}
	ngOnChanges(changes: SimpleChanges): void {
		const { currentValue } = changes['statusId'];
		this.statusId = currentValue;
		this.setStepper(this.statusId);
		this.cdr.detectChanges();
	}

	setStepper(statusId: number) {
		this.step = [
			{ label: 'New' },
			{ label: 'PendingApproval' },
			{ label: 'PendingPosting' },
			{ label: 'PendingInvoicing' },
			{ label: 'PendingPayment' }
		];
		const setCommonSteps = (stepIndex: number, currentStep: number) => {
			this.step[stepIndex] = { label: 'Submitted' };
			this.currentStep = currentStep;
		};

		switch (statusId) {
			case statusIds.Draft:
			case TimeEntryStatus.Draft:
				this.step[0] = { label: 'Draft' };
				this.currentStep = magicNumber.zero;
				break;
			case statusIds.Declined:
			case TimeEntryStatus.Declined:
			case timeAdjustConst.Declined:
				setCommonSteps(magicNumber.zero, magicNumber.zero);
				this.step[0] = { label: 'ReSubmit' };
				break;
			case statusIds.Submitted:
			case statusIds.ReSubmitted:
			case TimeEntryStatus.Submitted:
			case TimeEntryStatus.ReSubmitted:
			case timeAdjustConst.Submitted:
			case timeAdjustConst.ReSubmitted:
				setCommonSteps(magicNumber.zero, magicNumber.one);
				break;
			case statusIds.PartiallyApproved:
			case TimeEntryStatus.PartiallyApproved:
			case timeAdjustConst.PartiallyApproved:
				setCommonSteps(magicNumber.zero, magicNumber.one);
				this.step[1] = { label: 'ApprovalInProgress' };
				break;
			case statusIds.Approved:
			case TimeEntryStatus.Approved:
			case timeAdjustConst.Approved:
				setCommonSteps(magicNumber.zero, magicNumber.two);
				this.step[1] = { label: 'Approved' };
				break;
			case statusIds.Posted:
			case TimeEntryStatus.Posted:
			case timeAdjustConst.Posted:
				setCommonSteps(magicNumber.zero, magicNumber.three);
				this.step[1] = { label: 'Approved' };
				this.step[2] = { label: 'Posted' };
				break;
			case statusIds.PartiallyInvoiced:
			case TimeEntryStatus.PartiallyInvoiced:
			case timeAdjustConst.PartiallyInvoiced:
				setCommonSteps(magicNumber.zero, magicNumber.three);
				this.step[1] = { label: 'Approved' };
				this.step[2] = { label: 'Posted' };
				this.step[3] = { label: 'InvoicingInProgress' };
				break;
			case statusIds.Invoiced:
			case TimeEntryStatus.Invoiced:
			case timeAdjustConst.Invoiced:
				setCommonSteps(magicNumber.zero, magicNumber.four);
				this.step[1] = { label: 'Approved' };
				this.step[2] = { label: 'Posted' };
				this.step[3] = { label: 'Invoiced' };
				break;
			case statusIds.PartiallyPaid:
			case TimeEntryStatus.PartiallyPaid:
			case timeAdjustConst.PartiallyPaid:
				setCommonSteps(magicNumber.zero, magicNumber.four);
				this.step[1] = { label: 'Approved' };
				this.step[2] = { label: 'Posted' };
				this.step[3] = { label: 'Invoiced' };
				this.step[4] = { label: 'PaymentInProgress' };
				break;
			case statusIds.Paid:
			case TimeEntryStatus.Paid:
			case timeAdjustConst.Paid:
				setCommonSteps(magicNumber.zero, magicNumber.five);
				this.step[1] = { label: 'Approved' };
				this.step[2] = { label: 'Posted' };
				this.step[3] = { label: 'Invoiced' };
				this.step[4] = { label: 'Paid' };
				break;
			default:
				// Handle unknown status
				break;
		}
		this.step = [...this.step];
		this.controlName?.setValue('statusId');
	}
}
