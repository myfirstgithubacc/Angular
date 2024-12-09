/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { WidgetServiceService } from '../services/widget-service.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { TooltipDirective } from "@progress/kendo-angular-tooltip";
import { Subscription, Subject, takeUntil } from 'rxjs';
import { ActionItemParams, Column, ColumnConfigure, LabelTextItem, NumericChangeData, OutputParams, RemovedRow } from '@xrm-shared/models/list-view.model';
@Component({
	selector: 'app-list-view',
	templateUrl: './list-view.component.html',
	styleUrls: ['./list-view.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListViewComponent implements OnInit, OnChanges {

	@ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
	public showTooltip(e: MouseEvent): void {
		const element = e.target as HTMLElement;
		if (
			(element.nodeName === "TD" || element.nodeName === "TH") &&
			element.offsetWidth < element.scrollWidth
		) {
			this.tooltipDir.toggle(element);
		} else {
			this.tooltipDir.hide();
		}

	}
	public myForm: FormGroup;
	@ViewChild('addMore', { read: ElementRef })
		addMore: ElementRef;

	@ViewChild('listView', { read: ElementRef })
		listView: ElementRef;

	@Output() listData = new EventEmitter<any>();
	@Output() formData = new EventEmitter<any>();
	@Output() actionEvent = new EventEmitter<ActionItemParams>();
	@Input() columnData: Column[];
	@Input() populatedData: any;
	@Input() columnConfigure: ColumnConfigure;
	@Input() labelText: LabelTextItem[] | string[] = [];
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Input() countryId: string | number | null = null;
	@Input() phoneMaskedValue: string;
	@Input() phoneExtMaskedValue: string = "";
	@Output() onDelete = new EventEmitter<RemovedRow>();
	@Output() onChangeSwitch = new EventEmitter<OutputParams>();
	@Output() onChangeText = new EventEmitter<OutputParams>();
	@Output() onChangeTextArea = new EventEmitter<OutputParams>();
	@Output() onChangeRadio = new EventEmitter<OutputParams>();
	@Output() onChangeCheckbox = new EventEmitter<OutputParams>();
	@Output() onChangeDropdown = new EventEmitter<OutputParams>();
	@Output() onChangeMultiDropdown = new EventEmitter<OutputParams>();
	@Output() onChangeNumeric = new EventEmitter<NumericChangeData>();
	@Output() onChangeTime = new EventEmitter<OutputParams>();
	@Output() onChangeDate = new EventEmitter<OutputParams>();
	@Output() onChangeDateRange = new EventEmitter<OutputParams>();
	public maskTypeArray: any[] = [];
	public phoneMask: string;
	public phoneExtMask: string;
	public filterSettings: DropDownFilterSettings = {
		caseSensitive: false,
		operator: 'contains'
	};
	public value: Date = new Date(magicNumber.nineHundredTwenty, magicNumber.zero, magicNumber.one);
	public timeFormat = this.localizationService.GetCulture(CultureFormat.TimeFormat);
	public dateTimeformat = '';
	public items: any[] = [];
	public newItem: any = {};
	private unsubscribe$ = new Subject<void>();
	public dateFormat: string;
	public placeholderFormat: any;
	public zipCodeFormat: string;
	public zipCodeLength: any;
	public maskType: string;

	// eslint-disable-next-line max-params
	constructor(
		private customValidator: CustomValidators,
		private formBuilder: FormBuilder,
		private widget: WidgetServiceService,
		public localizationService: LocalizationService,
		private renderer: Renderer2,
		private elementRef: ElementRef,
		protected cdr: ChangeDetectorRef
	) {

	}

	public listItems = [
		{ Text: 'X-Small', Value: '1' },
		{ Text: 'Small', Value: '3' },
		{ Text: 'X-large', Value: '4' }
	];

	public listValue: any;
	public populate: any;


	ngOnChanges(changes: SimpleChanges): void {
		this.myForm = this.formBuilder.group({
			fields: this.formBuilder.array([], Validators.required)
		});
		if (this.columnConfigure.isShowLastColumn) {
			this.columnConfigure.noOfRows = magicNumber.zero;
			if (this.populatedData.length < magicNumber.one) this.columnConfigure.noOfRows = magicNumber.one;
		}
		this.populateData();
		this.formData.emit(this.fa);
		this.fa.valueChanges.pipe(takeUntil(this.unsubscribe$))
			.subscribe((value) => {
				this.listData.emit(this.myForm.getRawValue().fields);
				this.listValue = this.myForm.getRawValue().fields;
				this.widget.addMoreFormData.next(this.fa);
				this.formData.emit(this.fa);
				this.fa.controls.forEach((control: {pristine:boolean}) => {

					if (!control.pristine) {
						this.widget.updateForm.next(true);
					}
				});
				this.cdr.markForCheck();
			});
	}

	public localizePlaceholder(localizeKey: string) {
		return this.localizationService.GetLocalizeMessage(
			localizeKey,
			this.columnConfigure.itemlabelLocalizeParam
		);
	}

	public dynamicParamLocalizaion(localizeKey: string, dynamicParam: DynamicParam[]) {
		return this.localizationService.GetLocalizeMessage(
			localizeKey,
			dynamicParam
		);
	}

	ngOnInit(): void {
		if (this.countryId == null)
			this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.dateTimeformat = this.localizationService.GetCulture(CultureFormat.DateFormat);
		this.dateFormat = this.localizationService.GetCulture(CultureFormat.DateFormat);
		this.placeholderFormat = this.localizationService.GetCulture(CultureFormat.DatePlaceholder);
		this.phoneMask = this.localizationService.GetCulture(CultureFormat.PhoneFormat, this.countryId);
		this.phoneExtMask = this.localizationService.GetCulture(CultureFormat.PhoneExtFormat, this.countryId);

		this.formData.emit(this.fa);
		this.widget.addMoreFormData.next(this.fa);
		this.myForm = this.formBuilder.group({
			fields: this.formBuilder.array([], Validators.required)
		});

		this.fa.valueChanges.pipe(takeUntil(this.unsubscribe$))
			.subscribe((value) => {
				this.formData.emit(this.fa);

				this.widget.addMoreFormData.next(this.fa);
				this.fa.controls.forEach((control: {pristine: boolean}) => {
					if (!control.pristine) {
						this.widget.updateForm.next(true);
					}
				});
				this.listData.emit(this.myForm.getRawValue().fields);
				this.listValue = this.myForm.getRawValue().fields;
			});
		this.items = [];

		if (this.columnConfigure.isShowLastColumn) {
			this.columnConfigure.noOfRows = magicNumber.zero;
			if (this.populatedData.length < magicNumber.one) this.columnConfigure.noOfRows = magicNumber.one;
		}

		for (let i = 0; i < this.columnConfigure.noOfRows; i++) {
			this.items.push(this.newItem);
		}

		this.items.forEach(() => {
			this.addGroup(false);
		});

		this.populateData();

	}

	isLabelTextItemArray() {
		return (this.labelText && this.labelText.length > magicNumber.zero && typeof this.labelText[0] === 'object');
	}
	isLabelTextItem(item: any, key: string) {
		return item[key] ?? '';
	}
	isLabelTextItemInArry(data: any) {
		return data;
	}
	// Inside your component
	public calculateColumnWidth(columnName: string): string {
		columnName = this.localizePlaceholder(columnName);
		// Using 'ch' unit, where 1ch is equal to the width of the '0' character
		return `${columnName.length + magicNumber.four}ch`;
	}

	private populateData() {

		this.populatedData.map((item: any) => {
			this.addGroup(false, item);
		});
		this.fa.valueChanges.pipe(takeUntil(this.unsubscribe$))
			.subscribe((value) => {
				this.listData.emit(this.myForm.getRawValue().fields);
				this.listValue = this.myForm.getRawValue().fields;
				this.widget.addMoreFormData.next(this.fa);
				this.formData.emit(this.fa);
				this.fa.controls.forEach((control: any) => {
					if (!control.pristine) {
						this.widget.updateForm.next(true);
					}
				});
			});
	}


	private renderColumnSection(r: string, control: string, data: any) {
		this.renderer.setStyle(
			this.addMore.nativeElement.querySelectorAll(`.columnSection${r} .${control}`)[data.index],
			'display',
			'block'
		);
	}


	ngAfterViewInit() {

		if (this.listView) {

			const firstInput = this.listView.nativeElement
				.querySelectorAll('.k-input-inner');

		}
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public trackByFn(index: number, item: any) {
		return item;
	}

	private initFields(data: any = null) {
		const group = new FormGroup({});
		if (data) {
			this.columnConfiguration(group, data);
		}
		this.columnData.map((control: any) => {
			control.controls.map((item: any) => {
				const controlId = item.controlId,
					validators =
						item.validators == undefined || item.validators == null
							? []
							: item.validators,
					defaultData =
						data == null || data[controlId] == undefined
							? item.defaultValue
							: data[controlId];
				this.cdr.markForCheck();

				if (
					item.controlType == 'dropdown' ||
					item.controlType == 'multi_select_dropdown'
				) {
					this.addControlForDropDown(data, group, { 'validators': validators, 'item': item });
				} else if (
					item.controlType == 'daterange' ||
					item.controlType == 'maskTypeWithExtension' || item.controlType == 'time' || item.controlType == 'date'
				) {
					if (data == null) {
						this.addControlForDateRangeNull(group, { 'validators': validators, 'item': item });
					} else if (data[item.controlId]) {
						if (!(data[item.controlId].toString() === 'Invalid Date')) {
							group.addControl(
								item.controlId,
								new FormControl(data[item.controlId], validators)
							);
						}
					}

				} else if (data == null && item.controlType == 'switch') {
					group.addControl(controlId, new FormControl({ value: defaultData, disabled: item.isDisable }, validators));
				} else {
					this.addControlForDefalutData(group, { 'defaultData': defaultData, 'validators': validators, 'item': item, 'controlId': controlId });
				}
			});
			this.cdr.markForCheck();
		});
		return group;
	}

	public actionItem(index: number, data: any, action: string) {
		const params = {
			index: index,
			data: data,
			formData: this.fa,
			action: action
		};
		this.actionEvent.emit(params);
	}

	private addControlForDropDown(data: any, group: any, value: any) {
		if (data == null) {
			group.addControl(
				value.item.controlId,
				new FormControl({ value: null, disabled: value.item.isDisable }, value.validators)
			);
		}
		else {
			group.addControl(
				value.item.controlId,
				new FormControl({ value: data[value.item.controlId], disabled: value.item.isDisable }, value.validators)
			);
		}
		this.cdr.markForCheck();
	}


	private addControlForDefalutData(group: any, data: any) {
		group.addControl(data.controlId, new FormControl({ value: data.defaultData, disabled: data.item.isDisable }, data.validators));
		if (this.columnConfigure.changeStatus) {
			group.addControl('isDisabled', new FormControl(false));
		}
		if (this.columnConfigure.uKey) {
			group.addControl('uKey', new FormControl(null));
		}
		if (this.columnConfigure.Id) {
			group.addControl('Id', new FormControl(null));
		}
		if (this.columnConfigure.widgetId) {
			group.addControl(
				this.columnConfigure.widgetId,
				new FormControl('widgetId')
			);
		}
	}

	private addControlForDateRangeNull(group: any, value: any) {
		group.addControl(
			value.item.controlId + magicNumber.zero,
			new FormControl({ value: null, disabled: value.item.isDisable }, value.validators)
		);
		group.addControl(
			value.item.controlId + magicNumber.one,
			new FormControl({ value: null, disabled: value.item.isDisable }, value.validators)
		);
	}
	private columnConfiguration(group: any, data: any) {
		if (this.columnConfigure.uKey) {
			group.addControl('uKey', new FormControl(data.uKey));
		}
		if (this.columnConfigure.Id) {
			group.addControl('Id', new FormControl(data.Id));
		}
		if (this.columnConfigure.changeStatus) {
			group.addControl('isDisabled', new FormControl(data.isDisabled));
		}
	}

	private generateUniqueId(): string {
		const array = new Uint32Array(magicNumber.two);
		window.crypto.getRandomValues(array);

		return (
			array[0].toString(magicNumber.thirtySix).substring(magicNumber.two) +
			array[1].toString(magicNumber.thirtySix).substring(magicNumber.two)
		);
	}

	get fa(): FormArray {
		return this.myForm.get('fields') as FormArray;
	}

	public checkTouched() {
		this.fa.setErrors(null);
		this.fa.markAllAsTouched();
		this.fa.updateValueAndValidity();
	}

	public checkTouchedSpecificFormArray(formArrayName: string) {
		this.myForm?.get(formArrayName)?.markAllAsTouched();
		this.myForm?.get(formArrayName)?.updateValueAndValidity();
	}

	onClickAddMore() {
		if (this.columnConfigure?.isAddMoreClicked ?? false) {
			this.fa.markAsTouched();
		}
		this.addGroup(false);
	}

	public addGroup(isNewItem: boolean, data: any = null) {
		this.widget.addMoreFormData.next(this.fa);
		if (this.columnConfigure.isAddMoreValidation) {
			if (this.myForm.invalid && this.fa.length >= magicNumber.one) {
				this.myForm.markAllAsTouched();
				return;
			}
		}

		if (isNewItem) {
			this.items.push(this.newItem);
		}
		this.fa.push(this.initFields(data));
	}

	public removeGroup(i: number) {
		let removedRow;

		if (!this.columnConfigure.changeStatus) {
			this.fa.removeAt(i);
			this.checkTouched();
			this.widget.updateForm.next(true);
			this.widget.addMoreFormData.next(this.fa);
			removedRow = {
				index: i,
				formArray: this.fa
			};
		} else {
			if (this.fa.value[i].Id == null) {
				this.fa.removeAt(i);
			} else {
				this.fa.at(i).get('isDisabled')?.setValue(true);
				this.fa.at(i).get('text1')?.setValue(this.populatedData[i]?.text1);
				this.fa.at(i).markAsDirty();
				this.fa.at(i).markAsTouched();
				this.fa.at(i).updateValueAndValidity();
			}
			this.listData.emit(this.myForm.getRawValue().fields);
			this.listValue = this.myForm.getRawValue().fields;
			this.formData.emit(this.fa);
		}

		this.onDelete.emit(removedRow);
	}

	public onSubmit() {
	}

	public maskedTextFormat(index: number, data: any): string {
		const Countryid = data.countryId
			? data.countryId
			: this.countryId;
		let maxLen = 0;
		this.zipCodeLength = data.zipLength
			? data.zipLength
			: this.localizationService.
				GetCulture(CultureFormat.ZipLengthSeries, Countryid);

		if (this.zipCodeLength == null || this.zipCodeLength == undefined) return '';

		this.zipCodeFormat = data.zipFormat
			? data.zipFormat
			: this.localizationService.
				GetCulture(CultureFormat.ZipFormat, Countryid);
		if (this.zipCodeFormat == null || this.zipCodeFormat == undefined) return '';
		this.zipCodeLength = this.zipCodeLength.toString().split(',');
		maxLen = Math.max.apply(magicNumber.zero, this.zipCodeLength);
		this.maskTypeArray.push({ "maskType": this.localizationService.GetZipMasking(this.zipCodeFormat, maxLen) });
		return this.maskTypeArray[index].maskType;
	}


	public applyFormat(deciamls: any) {
		if (!deciamls) {
			deciamls = this.appliedDecimal();
		}

		let zero = '';
		for (let index = 0; index < deciamls; index++) {
			zero = `${zero}0`;
		}
		return `#.${zero}`;
	}

	public onSwitchChange(index: number, data: any, controId: number) {
		const params = {
			index: index,
			control: controId,
			data: data,
			formData: this.fa
		};
		this.onChangeSwitch.emit(params);
	}
	public onTextArea(index: number, data: any, controId: number) {
		const params = {
			index: index,
			control: controId,
			data: data,
			formData: this.fa
		};
		this.onChangeTextArea.emit(params);
	}
	public onRadio(index: number, data: any, controId: number) {
		const params = {
			index: index,
			control: controId,
			data: data,
			formData: this.fa
		};
		this.onChangeRadio.emit(params);
	}
	public onCheckbox(index: number, data: any, controId: number) {
		const params = {
			index: index,
			control: controId,
			data: data,
			formData: this.fa
		};
		this.onChangeCheckbox.emit(params);
	}
	public onText(index: number, data: any, controlId: number) {
		const params = {
			index: index,
			data: data,
			control: controlId,
			formData: this.fa
		};
		this.onChangeText.emit(params);
	}
	public onDropDown(index: number, data: any, controlId: number) {
		const params = {
			index: index,
			data: data,
			control: controlId,
			formData: this.fa
		};
		this.onChangeDropdown.emit(params);
	}
	public onMultiDropDown(index: number, data: any, controlId: number) {
		const params = {
			index: index,
			data: data,
			control: controlId,
			formData: this.fa
		};
		this.onChangeMultiDropdown.emit(params);
	}
	public onNumericChange(index: number, data: any, controlId: number) {
		const params = {
			index: index,
			data: data,
			control: controlId,
			formData: this.fa
		};
		this.onChangeNumeric.emit(params);
	}

	public onTimePicker(index: number, data: any, controlId: number) {
		const params = {
			index: index,
			data: data,
			control: controlId,
			formData: this.fa
		};
		this.onChangeTime.emit(params);
	}
	public onMaskedTextBoxChange(
		index: number,
		data: any,
		obj: any

	) {
		if (!obj.isZipCode) return;
		// eslint-disable-next-line no-unused-expressions
		this.zipCodeLength = obj.zipLength
			? obj.zipLength
			: this.localizationService.
				GetCulture(CultureFormat.ZipLengthSeries, this.countryId),
		this.zipCodeFormat = obj.zipFormat
			? obj.zipFormat
			: this.localizationService.
				GetCulture(CultureFormat.ZipFormat, this.countryId);

		this.fa.at(index).get(obj.controlId)?.setValidators(this.customValidator.
			ZipCodeValidator(this.zipCodeLength, this.zipCodeFormat, "ZipCodeConsist", this.validatorsParams(this.zipCodeLength, obj.label)));
		this.fa.at(index).get(obj.controlId)?.updateValueAndValidity();

		const isError = this.fa.at(index).get(obj.controlId)?.errors?.['patternError'] != undefined,
			params = {
				index: index,
				data: data,
				control: obj.controlId,
				formData: this.fa
			};
		if (isError) {
			this.fa.at(index).get(obj.controlId)?.setErrors({ error: true, message: 'Pattern Error' });
		}

		this.onChangeTime.emit(params);
	}

	private validatorsParams(value: any, label: string) {
		return [
			{ Value: label, IsLocalizeKey: false },
			{ Value: value.toString(), IsLocalizeKey: false }
		];

	}
	public onDatePicker(index: number, data: any, controlId: number) {
		const params = {
			index: index,
			data: data,
			control: controlId,
			formData: this.fa
		};
		this.onChangeDate.emit(params);
	}
	public onPhoneTextBoxChange(index: number, data: any, controlId: any) {
		const isError =
			this.fa.at(index).get(controlId)?.errors?.['patternError'] != undefined,
			params = {
				index: index,
				data: data,
				control: controlId,
				formData: this.fa
			};
		if (isError) {
			this.fa
				.at(index)
				.get(controlId)
				?.setErrors({ error: true, message: 'PhoneValidationMessage' });
		}

		this.onChangeDate.emit(params);
	}

	public appliedDecimal() {
		const decimal = localStorage.getItem("DecimalPlaces");
		return decimal;

	}

	public onPhoneTextBoxWithExtensionChange(index: number, data: any, controlId: any) {
		const isError =
			this.fa.at(index).get(controlId)?.errors?.['patternError'] != undefined,
			params = {
				index: index,
				data: data,
				control: controlId,
				formData: this.fa
			};
		if (isError) {
			this.fa
				.at(index)
				.get(controlId)
				?.setErrors({ error: true, message: 'PhoneExtValidationMessage' });
		}

		this.onChangeDate.emit(params);
	}
	public onDateRangePicker(index: number, data: any, controlId: number) {
		const params = {
			index: index,
			data: data,
			control: controlId,
			formData: this.fa
		};
		this.onChangeDateRange.emit(params);
	}

	public onFocus(isZipCode: string, controlId: string, index: number) {

		if (isZipCode && this.fa.at(index).get(controlId)?.value != null && this.fa.at(index).get(controlId)?.value != undefined) {
			const maxLen = Math.max.apply(magicNumber.zero, this.zipCodeLength);
			this.maskTypeArray[index] = { "maskType": this.localizationService.GetZipMasking(this.zipCodeFormat, maxLen) };
		}
	}
	public onBlur(isZipCode: boolean, controlId: string, index: number) {
		if (isZipCode && this.fa.at(index).get(controlId)?.value != null && this.fa.at(index).get(controlId)?.value != undefined) {
			const valLen = this.fa.at(index).get(controlId)?.value.trim().length.toString();
			if (valLen > magicNumber.zero && this.zipCodeLength.includes(valLen)) {
				this.maskTypeArray[index] = { "maskType": this.localizationService.GetZipMasking(this.zipCodeFormat, valLen) };

			}
		}
	}

	public timePicker(index: number) {
		const fieldWithError = this.elementRef.nativeElement.querySelector(`#timePickerList${index}`),
			inputDate = fieldWithError.querySelector('.k-dateinput'),
			input = inputDate.querySelector('.k-input-inner');
		input?.blur();
	}

	public datePicker(index: number) {
		const id = `#datePickerList${index}`,
			fieldWithError = this.elementRef.nativeElement.querySelector(id),
			inputDate = fieldWithError.querySelector('.k-input'),
			input = inputDate.querySelector('.k-input-inner');
		input?.blur();
	}

}
