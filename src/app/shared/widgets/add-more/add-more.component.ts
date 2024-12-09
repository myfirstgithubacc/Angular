import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddMoreColumnConfigure } from '@xrm-shared/models/add-more.model';
import { ColumnConfigure } from '@xrm-shared/models/list-view.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { takeUntil, Subject } from 'rxjs';

@Component({selector: 'app-add-more',
	templateUrl: './add-more.component.html',
	styleUrls: ['./add-more.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMoreComponent implements OnInit, OnChanges {
	myForm: FormGroup;
	private unsubscribe$ = new Subject<void>();

	@Output() listData = new EventEmitter<any>();

	@Output() formData = new EventEmitter<any>();
	@Input() columnData: AddMoreColumn[];
	@Input() populatedData: PopulatedDataItem[];
	@Input() columnConfigure: AddMoreColumnConfigure;
	@Input() labelText: string[] = [];

	items: PopulatedDataItem[] = [];
	newItem: PopulatedDataItem = {};

	constructor(
		private customValidator: CustomValidators,
		private formBuilder: FormBuilder,
		private changeDetectorRef: ChangeDetectorRef
	) {

	}
	public listItems = [
		{ Text: 'X-Small', Value: '1' },
		{ Text: 'Small', Value: '3' },
		{ Text: 'X-large', Value: '4' }
	];

	public listValue: any;
	ngOnChanges(changes: SimpleChanges): void {
		this.fa.clear();
		for (let i = 0; i < this.columnConfigure.noOfRows; i++) {
			this.fa.push(this.initFields(null));
		}
		if (this.columnConfigure.isShowLastColumn) {
			this.columnConfigure.noOfRows = magicNumber.zero;
			if (this.populatedData.length < magicNumber.one)
				this.columnConfigure.noOfRows = magicNumber.one;
		}
		this.populateData();
	}
	ngOnInit(): void {

		this.myForm = this.formBuilder.group({
			fields: this.formBuilder.array([], Validators.required)
		});

		this.fa.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
			this.listValue = value;
		});

		this.items = [];

		if (this.columnConfigure.isShowLastColumn) {
			this.columnConfigure.noOfRows = magicNumber.zero;
			if (this.populatedData.length < magicNumber.one)
				this.columnConfigure.noOfRows = magicNumber.one;
		}

		for (let i = magicNumber.zero; i < this.columnConfigure.noOfRows; i++) {
			this.items.push(this.newItem);
		}

		this.items.map((item, i: number) => {
			this.addGroup(false);
		});

		this.populateData();
	}
	populateData() {
		this.populatedData.map((item: PopulatedDataItem) => {
			this.addGroup(false, item);
		});

		this.fa.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
			this.listData.emit(value);
			this.formData.emit(this.myForm);
			this.listValue = value;
		});
	}

	evaluationType(e: any, i: number): void { }

	trackByFn(index: number, item: any) {
		return item.trackingId;
	}

	initFields(data: PopulatedDataItem | null = null): FormGroup {
		const group = new FormGroup({});
		if (data) {
			group.addControl('uKey', new FormControl(data.uKey));
			group.addControl('Id', new FormControl(data.Id));
		}
		this.columnData.map((control: AddMoreColumn) => {
			control.controls.map((item: ColumnControl) => {
				const controlId = item.controlId,
					defaultData =
						(data == null ||
							data[controlId] == undefined)
							? item.defaultValue
							: data[controlId];

				if (item.controlType == "dropdown"
					|| item.controlType == "multi_select_dropdown") {
					if (data === null) {
						group.addControl(
							item.controlId,
							new FormControl(null, this.customValidator.RequiredValidator())
						);
					} else {
						group.addControl(
							item.controlId,
							new FormControl(defaultData, this.customValidator.RequiredValidator())
						);
					}
				}
				else {
					group.addControl(
						controlId,
						new FormControl(
							defaultData,
							this.customValidator.RequiredValidator()
						)
					);
					group.addControl('isDisabled', new FormControl(false));
					group.addControl('uKey', new FormControl(null));
					group.addControl('Id', new FormControl(null));
				}
			});
		});

		return group;
	}

	generateUniqueId() {
		return Math.random().toString(magicNumber.thirtySix).
			substring(magicNumber.two, magicNumber.fifteen)
			+ Math.random().toString(magicNumber.thirtySix).
				substring(magicNumber.two, magicNumber.fifteen);
	}

	get fa(): FormArray { return this.myForm.get('fields') as FormArray; }

	addGroup(isNewItem: boolean, data: PopulatedDataItem | null = null): void {
		if (isNewItem) {
			this.items.push(this.newItem);
		}
		this.fa.push(this.initFields(data));
	}

	removeGroup(i: number):void{
		if (!this.columnConfigure.changeStatus) {
			this.items.pop();
			this.fa.removeAt(i);
		} else {
			this.fa.value[i].isDisabled = true;
			this.listData.emit(this.fa.value);
			this.formData.emit(this.myForm);
			this.listValue = this.fa.value;
		}

	}

	onSubmit() {
	}

	onSwitchChange(value: boolean, index: number, controlId: string): void {
		if (this.columnConfigure.isShowLastColumn) return;
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}

export interface addMoreColumn1 {
	colSpan: number,
	columnName: string,
	controlType: string,
	controlId?: string,
	controls: any;
	placeholder?: any,
	onLabel?: any,
	offLabel?: any,
	requiredMsg: string,
	defaultValue?: any
}

export interface columnConfig1 {
	isShowfirstColumn: boolean,
	isShowLastColumn: boolean,
	firstColumnName: string,
	secondColumnName: string,
	deleteButtonName: string,
	noOfRows: number,
	itemLabelName: string,
	changeStatus?: boolean
}
export interface AddMoreColumn {
  colSpan: number;
  columnName: string;
  controlType: string;
  controlId?: string;
  controls: ColumnControl[];
  placeholder?: string;
  onLabel?: string;
  offLabel?: string;
  requiredMsg?: string;
  defaultValue?: any;
}

export interface ColumnControl {
  controlId: string;
  controlType: string;
  defaultValue?: any;
  placeholder?: string;
  requiredMsg?: string;
  onLabel?: string;
  offLabel?: string;
}

export interface ColumnConfig {
  isShowfirstColumn: boolean;
  isShowLastColumn: boolean;
  firstColumnName: string;
  secondColumnName: string;
  deleteButtonName: string;
  noOfRows: number;
  itemLabelName: string;
  changeStatus?: boolean;
}

export interface PopulatedDataItem {
  uKey?: string;
  Id?: string;
  [controlId: string]: any;
}

export interface ListItem {
  Text: string;
  Value: string;
}
