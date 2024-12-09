import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Optional, Output, SimpleChanges, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { ExpenseEntryDetailGrid } from '@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-grid';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DmsImplementationService } from '@xrm-shared/services/dms-implementation.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Subject, takeUntil } from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { statusIds } from '../../expense/expense/enum-constants/enum-constants';
import { ExpenseGridSummary } from '@xrm-core/models/acrotrac/expense-entry/expense-details/gridSummary';
import { IActionModel } from '@xrm-shared/models/grid-actionset.mode';

@Component({
	selector: 'app-expense-details',
	templateUrl: './expense-details.component.html',
	styleUrls: ['./expense-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ExpenseDetailsComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {

	@Input() isEditMode: boolean = false;
	@Input() detailsData: ExpenseEntryDetailGrid[];
	@Input() showActions: boolean = true;
	@Input() set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}
	@Input() currencyCode: string = 'USD';
	@Input() disableDelete: boolean = true;

	@Output() onRowClick: EventEmitter<{ selectedRow: ExpenseEntryDetailGrid, index: number, event: string }>
		= new EventEmitter<{ selectedRow: ExpenseEntryDetailGrid, index: number, event: string }>();
	@Output() updatedDetails: EventEmitter<ExpenseEntryDetailGrid[]> = new EventEmitter<ExpenseEntryDetailGrid[]>();

	public gridDataSummary: ExpenseGridSummary[] = [];
	public totalAmount: number = magicNumber.zero;
	public magicNumber = magicNumber;
	private formControl!: FormControl;
	public columnOptions: {fieldName: string, columnHeader: string, visibleByDefault: boolean, ValueType?: string, DecimalPlaces?: number}[];
	public tabOptions = {
		bindingField: 'Status',
		tabList: [
			{
				tabName: 'Expense Report Details',
				favourableValue: 'All',
				selected: true
			}
		]
	};
	public amountSummary: string = '';
	public totalAmountSummary: string = '';
	private destroyAllSubscribtion$ = new Subject<void>();
	private lineItemsActions: IActionModel[] = [];
	private actionStatus = [
		{ 'status': statusIds.Draft.toString() },
		{ 'status': statusIds.Declined.toString() },
		{ 'status': statusIds.Submitted.toString() },
		{ 'status': statusIds.ReSubmitted.toString() }
	];
	public actionSet = this.actionStatus.map((action) => {
		return {
			'Status': action.status,
			'Items': this.lineItemsActions
		};
	});

	constructor(
		private dmsImplementationService: DmsImplementationService,
		@Optional() private parentF: FormGroupDirective,
		private localizationService: LocalizationService,
		private toasterServc: ToasterService,
		private cdr: ChangeDetectorRef
	) {
		this.getColumnOption();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['detailsData'] ?? false) {
			const { currentValue } = changes['detailsData'];
			if (currentValue?.length) {
				this.stringAmountToInt(currentValue);
				this.gridDataSummary = this.accumulateAmounts(currentValue);
			}
		}

		if (this.columnOptions.length) {
			this.columnOptions = this.columnOptions.map((item, index) => {
				if (index === Number(magicNumber.four))
					item.columnHeader = this.localizationService.GetLocalizeMessage('DynamicCurrency', [{ Value: 'Amount', IsLocalizeKey: false }, { Value: this.currencyCode, IsLocalizeKey: false }]);
				return item;
			});

			this.amountSummary = this.columnOptions[4].columnHeader;
			this.totalAmountSummary = this.localizationService.GetLocalizeMessage('DynamicCurrency', [{ Value: 'TotalBillAmount', IsLocalizeKey: true }, { Value: this.currencyCode, IsLocalizeKey: false }]);
		}
	}

	ngOnInit(): void {
		this.lineItemsActions = [
			{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.handleClick },
			{ icon: 'trash-2', color: 'red-color', title: 'Delete', fn: this.handleClick }
		];
		this.getActionSets();
	}

	private getColumnOption() {
		this.columnOptions = [
			{
				fieldName: 'DateIncurred',
				columnHeader: 'DateIncurred',
				visibleByDefault: true,
				ValueType: "Date"
			},
			{
				fieldName: 'CostAccountingName',
				columnHeader: 'CostAccountingCode',
				visibleByDefault: true,
				ValueType: "Text"
			},
			{
				fieldName: 'ExpenseTypeName',
				columnHeader: 'ExpenseType',
				visibleByDefault: true,
				ValueType: "Text"
			},
			{
				fieldName: 'Quantity',
				columnHeader: 'MilesOrHours',
				visibleByDefault: true,
				DecimalPlaces: magicNumber.two,
				ValueType: "Number"
			},
			{
				fieldName: 'Amount',
				columnHeader: 'Amount (USD)',
				visibleByDefault: true,
				DecimalPlaces: magicNumber.two,
				ValueType: "Number"
			},
			{
				fieldName: 'Description',
				columnHeader: 'Description',
				visibleByDefault: true,
				ValueType: "Text"
			},
			{
				fieldName: 'DocumentFileName',
				columnHeader: 'Document',
				visibleByDefault: true
			}
		];
	}

	private getActionSets() {
		this.actionSet = this.actionStatus.map((action) => {
			return {
				'Status': action.status,
				'Items': this.lineItemsActions
			};
		});
	}

	ngAfterViewInit(): void {
		this.columnOptions[4].columnHeader = this.localizationService.GetLocalizeMessage('DynamicCurrency', [
			{ Value: 'Amount', IsLocalizeKey: true },
			{ Value: this.currencyCode, IsLocalizeKey: false }
		]);

		this.amountSummary = this.columnOptions[4].columnHeader;
		this.totalAmountSummary = this.localizationService.GetLocalizeMessage('DynamicCurrency', [
			{ Value: 'TotalBillAmount', IsLocalizeKey: true },
			{ Value: this.currencyCode, IsLocalizeKey: false }
		]);
		this.cdr.markForCheck();
	}

	private accumulateAmounts(arr: ExpenseEntryDetailGrid[]): ExpenseGridSummary[] {
		this.totalAmount = magicNumber.zero;
		const uniqueExpenses = arr.reduce((accumulator: Record<string, number>, currentValue: ExpenseEntryDetailGrid) => {
			const { ExpenseTypeName, Amount } = currentValue;
			if (!accumulator[ExpenseTypeName]) {
				accumulator[ExpenseTypeName] = Amount;
			} else {
				accumulator[ExpenseTypeName] += Amount;
			}
			this.totalAmount += Amount;
			if (this.formControl)
				this.formControl.setValue(this.totalAmount);
			return accumulator;
		}, {});
		return Object.entries(uniqueExpenses).map(([key, value]) =>
			({ 'ExpenseTypeName': key, 'Amount': value }));
	}

	public getFileExtension(filename: string) {
		const dotIndex = filename.lastIndexOf('.'),
			extension = (dotIndex !== -magicNumber.one)
				? filename.slice(dotIndex + magicNumber.one)
				: '';
		return `../../../assets/images/${extension}.png`;
	}

	private handleClick = (selectedRow: ExpenseEntryDetailGrid, event: string, index: number) => {
		this.formControl.markAsDirty();
		if (event === 'Edit') {
			this.onRowClick.emit({ selectedRow, index, event });
		} else if (this.disableDelete) {
			this.detailsData.splice(index, magicNumber.one);
			this.detailsData = Object.assign([], this.detailsData);
			this.updatedDetails.emit(this.detailsData);
			this.gridDataSummary = this.accumulateAmounts(this.detailsData);
		} else {
			this.toasterServc.showToaster(ToastOptions.Error, 'ExpenseRecordDelete');
		}
	};

	public downloadViaFileLink(file: {
		DocumentAddDto:{ DocumentConfigurationId: number, FileName: string,
			FileExtension: string, FileNameWithExtension: string, EncryptedFileName: string, FileSize: number}}) {
		if (!file.DocumentAddDto.FileName) {
			return;
		}
		this.dmsImplementationService.downloadFile(file.DocumentAddDto.EncryptedFileName, file.DocumentAddDto.FileExtension)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((blob: Blob) => {
				const url = window.URL.createObjectURL(blob),
					a = document.createElement('a');
				a.href = url;
				a.download = `${file.DocumentAddDto.FileName}.${file.DocumentAddDto.FileExtension}`;
				a.click();
				window.URL.revokeObjectURL(url);
			});
	}

	private stringAmountToInt(currArray: ExpenseEntryDetailGrid[]) {
		currArray.forEach((item) => {
			if (typeof item.Amount === 'string')
				item.Amount = parseFloat(item.Amount);
		});
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
