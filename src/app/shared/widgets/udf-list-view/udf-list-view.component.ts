import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewEncapsulation, ChangeDetectionStrategy, Renderer2, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { INumberDropdown } from '@xrm-shared/models/common.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { Subject, takeUntil } from 'rxjs';
import { IBaseRowData, IRowData } from './interface/udf-list.interface';
import { MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
@Component({selector: 'app-udf-list-view',
	templateUrl: './udf-list-view.component.html',
	styleUrls: ['./udf-list-view.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UdfListViewComponent implements OnInit {
	@ViewChildren('multiselect') public multiselects: QueryList<MultiSelectComponent>;
	@ViewChildren('multiselectElement', { read: ElementRef }) public multiselectElements: QueryList<ElementRef>;
	public popupStates: boolean[] = [];
	@HostListener('focus', ['$event'])
	onFocus(event: any):void {
		if (event.target.classList.contains('disabled-control')) {
			event.preventDefault();
			const focusableElements = document.querySelectorAll('input:not(.disabled-control), select:not(.disabled-control), button:not(.disabled-control)');
			if (focusableElements.length > Number(magicNumber.zero)) {
				const nextFocusableElement = focusableElements[0] as HTMLElement;
				nextFocusableElement.focus();
			}
		}
	}

	// #region declaration part
	private unsubscribe$ = new Subject<void>();
	udfListForm: FormGroup;
	@Input() columnsInfo: any[] = [];
	@Input() rows: any[] = [];
	@Output() switchChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() multiSelectChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() dropDownChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() onDataPicked = new EventEmitter<any>();


	listBaseScreen: any[] = [
		{
			Text: "Bse Scree 1",
			Value: magicNumber.one
		},
		{
			Text: "Bse Scree 2",
			Value: magicNumber.seven
		},
		{
			Text: "Bse Scree 3",
			Value: magicNumber.tweleve
		},
		{
			Text: "Bse Scree 4",
			Value: magicNumber.nineteen
		},
		{
			Text: "Bse Scree 5",
			Value: magicNumber.twentyThree
		}
	];

	rowsInfo: any[] = [];

	// #endregion declaration part

	constructor(private formBuilder: FormBuilder, private customValidators: CustomValidators, private renderer: Renderer2) {

	}

	ngOnInit(): void {
		this.udfListForm = this.formBuilder.group({
			Fields: this.formBuilder.array([])
		});

		this.udfListForm.valueChanges.pipe(takeUntil(this.unsubscribe$))
			.subscribe((value) => {
				const data = { CellInfo: this.rows, value: value, formArray: this.fa };
				this.onDataPicked.emit(data);
			});

		this.addNewRow();
	}

	ngAfterViewInit() {
		this.popupStates = this.multiselects.toArray().map(() =>
			 false);
		this.multiselectElements.forEach((element, index) => {
			this.renderer.listen(element.nativeElement, 'click', (event: Event) => {
				const target = event.target as HTMLElement;
				if (target.closest('kendo-searchbar')) {
					return;
				}
				this.onMultiSelectChangeNew(index);
			});
		});
	}

	private onMultiSelectChangeNew(index: number): void {
		const multiselect = this.multiselects.toArray()[index],
		 isOpen = multiselect.isOpen;
		multiselect.focus();
		if (!isOpen) {
			multiselect.toggle(true);
			this.popupStates[index] = true;
		} else {
			multiselect.toggle(false);
			this.popupStates[index] = false;
		}
	}

	get fa(): FormArray { return this.udfListForm.get('Fields') as FormArray; }

	onSubmit() {
	}

	trackByFn(index: number, item: any) {
		return item.trackingId;
	}

	initFields(data: ColumnInfo[]):FormGroup {
		const group = new FormGroup({});
		data.map((item: any) => {
			const controlId = item.ControlName,
				defaultValue = item.DefaultValue ?? null;
			// eslint-disable-next-line no-unused-expressions
			item.IsRequired
				? group.addControl(controlId, new FormControl(defaultValue, this.customValidators.RequiredValidator()))
				: group.addControl(controlId, new FormControl(defaultValue));
		});
		return group;
	}

	addNewRow() {
		this.fa.reset();
		this.fa.clear();
		this.rowsInfo.length = 0;

		this.rows.forEach((item) => {
			this.rowsInfo.push(item);
		});

		this.fa.push(this.initFields(this.rowsInfo));
	}

	onSwitchChange(value: any, row: any) {
		this.switchChange.emit({ CellInfo: row, Value: value, FormArray: this.fa });
	}

	public onMultiSelectChange(value: INumberDropdown[], row: IBaseRowData) {
		this.multiSelectChange.emit({ CellInfo: row, Value: value, FormArray: this.fa });
	}

	public onDropDownChange(value: INumberDropdown, row: IRowData) {
		this.dropDownChange.emit({ CellInfo: row, Value: value, FormArray: this.fa });
	}

	getCommonSeparatedItems(data: ListItem[]):string {
		return data.map((v: { Text: string; }) =>
			v.Text).join(', ');
	}

	onControlClick(combobox: any): void {
		combobox.toggle(true);
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
interface ColumnInfo {
 Name: string,
 Span: number
}

interface ListItem {
  Text: string;
  Value: number;
}
