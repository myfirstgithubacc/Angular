import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DmsImplementationService } from '@xrm-shared/services/dms-implementation.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';
import { NavigationPaths } from '../../expense/expense/route-constants/route-constants';
import { ApproveDecline } from '@xrm-core/models/acrotrac/expense-entry/view-review/approve-decline';
import { statusIds } from '../../expense/expense/enum-constants/enum-constants';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { DatePipe } from '@angular/common';
import getSubractedDate from '../../expense/utils/CommonEntryMethods';
import { ExpenseEntryAddEdit } from '@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-add-edit';
import { ExpenseEntryDetailGrid } from '@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-grid';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { AssignmentDetail, DynamicExpenseEntryDetails } from './approve-decline.model';
import { ScrollOnErrorService } from '@xrm-shared/directives/services/scoll-on-error.service';
import { DropdownModel } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-view-review',
	templateUrl: './view-review.component.html',
	styleUrls: ['./view-review.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewReviewComponent {
	@Input() isReview: boolean = false;
	public approveDeclineForm: FormGroup;
	public periodHeading: string;
	public dateFormat: string;
	public amountWithCurrency: string = '';
	public totalAmountWithCurrency: string = '';
	public totalBillAmountWithCurrency: string = '';
	public mspFeeWithAmount: string = '';
	public statusId: number;
	private actionName: string;
	public updatedAmount: string;
	public otherUpdatedAmount: number;
	public totalAmount: number;
	public totalMSPFee: number;
	public assignmentId: string;
	private ukey: string;
	public recordId: number;
	public magicNumber = magicNumber;
	public dataWithInlineViewTrue: ExpenseEntryDetailGrid[];
	public dataWithInlineViewFalse: ExpenseEntryDetailGrid[];
	public expenseEntryData: ExpenseEntryAddEdit;
	private currenyCode: string;
	public separatedData: DynamicExpenseEntryDetails;
	public successFullySaved: boolean = false;
	public draftId = statusIds.Draft;
	public submittedId = statusIds.Submitted;
	public approved = statusIds.Approved;
	public isNotApproved : boolean = false;
	public entityId: number = XrmEntities.Expense;
	public weekendingDate:string;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private customvalidators: CustomValidators,
		private expenseEntryService: ExpenseEntryService,
		private activatedRoute: ActivatedRoute,
		private sessionStore: SessionStorageService,
		private localizationService: LocalizationService,
		private dmsImplementationService: DmsImplementationService,
		private router: Router,
		private toasterServc: ToasterService,
		private datePipe: DatePipe,
		private cdr: ChangeDetectorRef,
		private scrollOnErrorService: ScrollOnErrorService

	) {
		this.approveDeclineForm = this.formBuilder.group({
			'ApproverComment': [null]
		});
	}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(switchMap((param) => {
			return this.expenseEntryService.getExpenseReviewByUkey(param['id']);
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((response: GenericResponseBase<ExpenseEntryAddEdit>) => {
			this.getCandidatePoolByUkey(response);
			this.cdr.markForCheck();
		});
		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
	}

	private getCandidatePoolByUkey(res: GenericResponseBase<ExpenseEntryAddEdit>) {
		if (isSuccessfulResponse(res)) {
			this.expenseEntryData = res.Data;
			this.weekendingDate = this.datePipe.transform(this.expenseEntryData.WeekendingDate as string, 'MM/dd/YYYY') ?? '';
			this.expenseEntryService.updateHoldData({ 'ExpenseEntryCode': this.expenseEntryData.ExpenseEntryCode, 'ContractorName': this.expenseEntryData.ContractorName, 'StatusName': this.expenseEntryData.StatusName, 'StatusId': this.expenseEntryData.StatusId, 'Id': this.expenseEntryData.Id, 'Screen': 'view' });
			this.statusId = this.expenseEntryData.StatusId;
			this.assignmentId = this.expenseEntryData.AssignmentId as string;
			this.recordId = this.expenseEntryData.Id;
			this.ukey = this.expenseEntryData.UKey;
			this.dataWithInlineViewTrue = this.expenseEntryData.ExpenseEntryDetails.filter((item: ExpenseEntryDetailGrid) =>
				item.InlineViewDisabled);
			this.dataWithInlineViewFalse = this.expenseEntryData.ExpenseEntryDetails.filter((item: ExpenseEntryDetailGrid) =>
				!item.InlineViewDisabled);
			this.updatedAmount = this.calculateAmount(this.dataWithInlineViewFalse).toFixed(magicNumber.two);
			this.otherUpdatedAmount = this.calculateAmount(this.dataWithInlineViewTrue);
			this.separatedData = this.separateDataByExpenseName(this.expenseEntryData.ExpenseEntryDetails);
			this.totalAmount = this.calculateAmount(this.expenseEntryData.ExpenseEntryDetails);
			this.totalMSPFee = this.calculateMSPFee(this.expenseEntryData.ExpenseEntryDetails);
			if (this.expenseEntryData.WeekendingDate && (typeof this.expenseEntryData.WeekendingDate === 'string' || this.expenseEntryData.WeekendingDate instanceof Date)) {
				const localizeText = this.localizationService.TransformDate(this.expenseEntryData.WeekendingDate),
					localizeValue = this.datePipe.transform(this.expenseEntryData.WeekendingDate, 'MM/dd/yyyy') ?? '';
				this.changeTimeSheetGridHeading({ 'Text': localizeText, 'Value': localizeValue });
			}
			this.isNotApproved = this.expenseEntryData.IsPendingApproval;
		}
		this.isRouteFromReviewLink();
	}

	private changeTimeSheetGridHeading = (selectedDate: DropdownModel): void => {
		this.periodHeading = this.createEntryPeriodHeading(selectedDate.Value, 'ExpensePeriod');
	};

	private isRouteFromReviewLink(): void {
		if(!this.isNotApproved && localStorage.getItem('isReviewLink') == 'true' && this.isReview)
		{
			this.toasterServc.displayToaster(ToastOptions.Warning, this.localizationService.GetLocalizeMessage('AlreadyProcessedRecord'));
		}
	}

	private createEntryPeriodHeading = (endDate: string, preffix: string): string => {
		const subtractedDate = getSubractedDate(endDate, magicNumber.six),
			transformedDate: string | null = this.datePipe.transform(subtractedDate, 'MM/dd/YYYY'),
			startDateMessage = `${this.localizationService.GetLocalizeMessage(preffix)}: ${this.localizationService.TransformDate(transformedDate)}`,
			endDateMessage = this.localizationService.TransformDate(new Date(endDate));
		return `${startDateMessage} - ${endDateMessage}`;
	};
	public downloadViaFileLink(event: MouseEvent, file: ExpenseEntryDetailGrid): void {
		event.preventDefault();
		if (!file.DmsFieldRecord.DocumentAddDto.FileName) {
			return;
		}
		this.dmsImplementationService.downloadFile(
			file.DmsFieldRecord.DocumentAddDto.EncryptedFileName,
			file.DmsFieldRecord.DocumentAddDto.FileExtension
		)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((blob: Blob) => {
				const url = window.URL.createObjectURL(blob),
					a = document.createElement('a');
				a.href = url;
				a.download = `${file.DmsFieldRecord.DocumentAddDto.FileName}.${file.DmsFieldRecord.DocumentAddDto.FileExtension}`;
				a.click();
				window.URL.revokeObjectURL(url);
				this.cdr.markForCheck();
			});
	}

	private submitForm(statusId: number, message: string): void {
		const payload: ApproveDecline = new ApproveDecline(this.approveDeclineForm.getRawValue());
		payload.UKey = this.ukey;
		payload.StatusId = statusId;
		if (this.approveDeclineForm.valid) {
			const arrPayload: ApproveDecline[] = [];
			arrPayload.push(payload);
			this.expenseEntryService.submitApproveDecline(arrPayload).pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((response: GenericResponseBase<AssignmentDetail[]>) => {
					if (isSuccessfulResponse(response)) {
						this.toasterServc.displayToaster(ToastOptions.Success, this.localizationService.GetLocalizeMessage(message));
						this.backToList();
					}
					else if (hasValidationMessages(response)) {
						this.closeDialog();
						ShowApiResponseMessage.showMessage(response, this.toasterServc, this.localizationService);
					}
					else {
						this.closeDialog();
						this.toasterServc.displayToaster(ToastOptions.Error, response.Message);
					}
					this.cdr.markForCheck();
				});
		}
	}

	public getCurrencyCode(currencyCode: string | undefined | null): void {
		this.currenyCode = currencyCode ?? 'USD';
		const orgDynamicParam: DynamicParam[] = [
			{ Value: this.updatedAmount, IsLocalizeKey: false },
			{ Value: currencyCode ?? 'USD', IsLocalizeKey: false }
		];
		this.expenseEntryService.updateHoldData({ 'TotalAmount': orgDynamicParam });
		this.totalAmountWithCurrency = this.updateAmountWithCurrency(this.updatedAmount.toString(), this.currenyCode);
		this.amountWithCurrency = this.updateAmountWithCurrency('Amount', this.currenyCode);
		this.totalBillAmountWithCurrency = this.updateAmountWithCurrency('TotalBillAmount', this.currenyCode);
		this.mspFeeWithAmount = this.updateAmountWithCurrency('MSPFee', this.currenyCode);
	}

	public getAssigmnetCode(assignmentCode: string): void {
		this.expenseEntryService.updateHoldData({ 'AssignmentCode': assignmentCode });

	}

	private separateDataByExpenseName(expenseData: ExpenseEntryDetailGrid[]) {
		const separatedData: DynamicExpenseEntryDetails = {};
		expenseData.forEach((entry) => {
			const expenseTypeName: string = entry.ExpenseTypeName;
			if (!separatedData[expenseTypeName]) {
				separatedData[expenseTypeName] = [];
			}
			separatedData[expenseTypeName]?.push(entry);
		});
		return separatedData;
	}

	private calculateMSPFee(ExpenseEntryDetails: ExpenseEntryDetailGrid[]): number {
		let totalAmount = magicNumber.zero;
		ExpenseEntryDetails.forEach((element) => {
			totalAmount = totalAmount + element.MspFee;
		});
		return totalAmount;
	}

	public calculateAmount(ExpenseEntryDetails: ExpenseEntryDetailGrid[]): number {
		let totalAmount = magicNumber.zero;
		ExpenseEntryDetails.forEach((element) => {
			totalAmount = totalAmount + element.Amount;
		});
		return totalAmount;
	}

	private updateAmountWithCurrency(updatedAmount: string, currencyCode: string): string {
		return this.localizationService.GetLocalizeMessage('DynamicCurrency', [
			{ Value: updatedAmount, IsLocalizeKey: true },
			{ Value: currencyCode, IsLocalizeKey: false }
		]);
	}

	ngAfterViewInit() {
		this.totalAmountWithCurrency = this.updateAmountWithCurrency(this.updatedAmount.toString(), this.currenyCode);
		this.amountWithCurrency = this.updateAmountWithCurrency('Amount', this.currenyCode);
		this.totalBillAmountWithCurrency = this.updateAmountWithCurrency('TotalBillAmount', this.currenyCode);
		this.mspFeeWithAmount = this.updateAmountWithCurrency('MSPFee', this.currenyCode);
	}

	public getImageSource(fileExtension: string): string {
		switch (fileExtension) {
			case 'pdf':
				return './assets/images/pdf.png';
			case 'doc':
				return './assets/images/doc.png';
			case 'docx':
				return './assets/images/docx.png';
			case 'jpg':
				return './assets/images/jpg.png';
			case 'jpeg':
				return './assets/images/jpeg.png';
			default:
				return '';
		}
	}

	public rowClass = (args: { dataItem: { InlineViewDisabled: boolean; }; }): { "k-disabled": boolean } =>
		({
			"k-disabled": (args.dataItem.InlineViewDisabled)
		});

	public gridDatasummary = [
		{
			TotalExpenseAmount: '',
			MSPFee: ''
		}
	];

	public openDialog(): void {
		if (this.actionName == 'Decline') {
			this.submitForm(statusIds.Declined, 'ExpenseDeclined');
		}
		else {
			this.submitForm(statusIds.Approved, 'ExpenseApproved');
		}

	}

	public successStaff(action: string): void {
		this.actionName = action;
		const approverCommentControl = this.approveDeclineForm.controls['ApproverComment'];
		if (this.actionName == 'Decline') {
			this.approveDeclineForm.markAllAsTouched();
			approverCommentControl.addValidators(this.customvalidators.RequiredValidator(
				'PleaseEnterData',
				 [{ Value: 'Comment', IsLocalizeKey: true }]
			));
		} else {
			approverCommentControl.clearValidators();
		}
		approverCommentControl.updateValueAndValidity();
		setTimeout(() => {
			this.scrollOnErrorService.makeScreenScrollOnError();
		}, magicNumber.fifty);

		this.successFullySaved = this.approveDeclineForm.valid;
	}

	public closeDialog(): void {
		this.successFullySaved = false;
	}

	public backToList() {
		return this.router.navigate([`${NavigationPaths.list}`]);
	}

	public getFullFileName(dataItem: ExpenseEntryDetailGrid): string {
		const fileName = dataItem.DmsFieldRecord.DocumentAddDto.FileName,
			fileExtension = dataItem.DmsFieldRecord.DocumentAddDto.FileExtension;
		// fileName and fileExtension becomes null or undefined then send blank...
		if(!fileName || !fileExtension)
			return '';
		return `${fileName}.${fileExtension}`;
	}

	ngOnDestroy() {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.expenseEntryService.updateHoldData(null);
		if (this.toasterServc.isRemovableToaster)
			this.toasterServc.resetToaster();
		localStorage.removeItem('isReviewLink');
	}
}
