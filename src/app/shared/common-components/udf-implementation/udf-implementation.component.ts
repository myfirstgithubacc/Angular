import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { UDFFieldTypes } from '@xrm-shared/common-components/udf-implementation/constant/field-types.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { UdfImplementationService } from '@xrm-shared/common-components/udf-implementation/service/udf-implementation.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IUdfConfigPayloadData, IParentsInfos, IPredefinedListItem, IPreparedUdfPayloadData, IUdfConfig, IPreparedDataParams } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { ActionType } from './constant/action-types.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { UdfCommonMethods } from './common-method/udf-common-methods';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
@Component({
	selector: 'app-udf-implementation',
	templateUrl: './udf-implementation.component.html',
	styleUrls: ['./udf-implementation.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UdfImplementationComponent implements OnInit, OnDestroy, OnChanges {
	@Input() entityId: number = magicNumber.zero;
	@Input() sectorId: number | null | undefined = magicNumber.zero;
	@Input() actionTypeId: number = magicNumber.zero;
	@Input() recordId: number | null | undefined = magicNumber.zero;
	@Input() recordUKey: string | null | undefined = '';
	@Input() parentsInfos: IParentsInfos[] = [];
	@Output() onDataPicked = new EventEmitter<{ data: IPreparedUdfPayloadData[], formGroup: FormGroup }>();
	@Input() isDataPersist: boolean = false;
	@Input() title: string = "OtherDetailsUDFs";
	@Input() showTitle: boolean = true;
	@Input() isMasterScreen: boolean = true;
	@Input() showNewUdfConfigs: boolean = false;
	@Input() isDraft: boolean = false;
	@Output() hasUDFLength = new EventEmitter<boolean>();

	public isViewOnly: boolean = false;
	public udfForm: FormGroup;
	public udfControlConfig: IUdfConfig[] = [];

	private propertNames: string[] = ['sectorId', 'actionTypeId', 'recordId', 'recordUKey', 'parentsInfos'];

	private presistData$: Observable<IPreparedUdfPayloadData[] | null>;
	private presistData: IPreparedUdfPayloadData[] = [];
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private cd: ChangeDetectorRef,
		private formBuilder: FormBuilder,
		private customValidators: CustomValidators,
		private udfImplementationService: UdfImplementationService,
		private sector: SectorService,
		private udfCommonMethods: UdfCommonMethods,
		private localizationSrv: LocalizationService
	) {

		this.udfForm = this.formBuilder.group({
			Test: [null]
		});

		this.udfForm.valueChanges.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((value) => {
			delete value.Test;
			const data = this.prePareRequestedData();
			this.onDataPicked.emit({ data: data, formGroup: this.udfForm });
		});

	}

	ngOnInit(): void {
		this.presistData$ = this.sector.dataPersistUdfdataObs;
		this.presistData$.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: IPreparedUdfPayloadData[] | null) => {
			if (res) {
				this.presistData = res;
			}
		});
		this.hasUDFLength.emit(false);
	}

	ngOnChanges(updatedData: SimpleChanges) {
		const updatedProperties = this.propertNames.filter((element) =>
			Object.hasOwn(updatedData, element));

		if (updatedProperties.length === Number(magicNumber.zero)) {
			return;
		}

		updatedProperties.forEach((element) => {
			(this as any)[element] = updatedData[element].currentValue;
		});

		this.isViewOnly = this.actionTypeId === Number(ActionType.View);
		this.loadDataToGenerateControls();
	}

	private loadDataToGenerateControls() {
		const data: IUdfConfigPayloadData = {
			entityId: this.entityId,
			sectorId: this.sectorId,
			recordId: this.recordId,
			recordUKey: this.recordUKey,
			IsShowNewUdfConfigs: this.showNewUdfConfigs,
			editMode: this.actionTypeId,
			parentsInfos: this.parentsInfos,
			IsDraft: this.isDraft
		};
		this.udfImplementationService.loadDataToGenerateControls(data)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<IUdfConfig[]>) => {
				if (!res.Succeeded) {
					return;
				}
				this.udfControlConfig = res.Data ?? [];
				this.hasUDFLength.emit(this.udfControlConfig.length > Number(magicNumber.zero));
				this.udfImplementationService.updateUdfData(this.udfControlConfig);
				this.createGroup();
				this.cd.detectChanges();
			});
	}

	private removeControls() {
		for (const field in this.udfForm.controls) {
			this.udfForm.removeControl(field);
		}
	}

	private createGroup() {
		this.removeControls();
		this.udfControlConfig.forEach((item: IUdfConfig) => {
			const validators = this.setValidatorsForItem(item);
			this.udfForm.addControl(item.StandardFieldName, new FormControl(null, validators));
			this.updatePredefinedListItems(item);
		});
		this.setDefaultData();
	}

	private setValidatorsForItem(item: IUdfConfig): ValidatorFn[] {
		const validators: ValidatorFn[] = [];
		if (!item.IsReadOnly && item.IsEditable && !this.isViewOnly) {
			if (item.IsMandatory) {
				validators.push(this.setRequiredValidator(item));
			}
			if (item.MinLength > Number(magicNumber.zero)) {
				validators.push(this.customValidators.MinLengthWithMessageValidator(item.MinLength) as ValidatorFn);
			}
			if (item.MaxLength > Number(magicNumber.zero)) {
				validators.push(this.customValidators.MaxLengthWithMessageValidator(item.MaxLength) as ValidatorFn);
			}
		}
		return validators;
	}

	private setRequiredValidator(item: IUdfConfig): ValidatorFn {
		if (item.FieldTypeId === Number(UDFFieldTypes.Dropdown)) {
			return this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: item.FieldLabelLocalizedKey, IsLocalizeKey: true }]);
		} else {
			return this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: item.FieldLabelLocalizedKey, IsLocalizeKey: true }]);
		}
	}

	private updatePredefinedListItems(item: IUdfConfig): void {
		if (item.PredefinedListItems.length != Number(magicNumber.zero)) {
			item.PredefinedListItems = item.PredefinedListItems.map((x: IPredefinedListItem) => {
				return { Text: x.Name, Value: x.Id };
			});
		}
	}


	private setDefaultData() {
		let val = null;

		this.udfControlConfig.forEach((item) => {
			val = this.getInitialValue(item, this.presistData);

			if (val == null) {
				val = this.getDefaultValue(item);
			}

			this.udfForm.get(item.StandardFieldName)?.setValue(val);
		});
	}

	private getInitialValue(
		item: {
			UdfConfigId: number;
			FieldTypeId: number;
			IsNumeric: boolean;
			PredefinedListItems: IPredefinedListItem[];
		},
		data: IPreparedUdfPayloadData[] | null
	): null | undefined | string | number | Date | IPredefinedListItem {
		let val: null | undefined | string | number | Date | IPredefinedListItem = null;
		if (data != null && this.isDataPersist) {
			const itemData = data.find((x) =>
				x.udfConfigId === item.UdfConfigId);
			if (itemData) {
				val = this.getFieldValue(item, itemData);
			}
		}
		return val;
	}

	private getFieldValue(
		item: { UdfConfigId: number; FieldTypeId: number; IsNumeric: boolean; PredefinedListItems: IPredefinedListItem[] },
		itemData: IPreparedUdfPayloadData
	): null | string | number | Date | IPredefinedListItem {
		switch (item.FieldTypeId) {
			case UDFFieldTypes.Textbox:
				return this.getTextboxValue(item, itemData);
			case UDFFieldTypes.MultiTextBox:
				return itemData.udfTextValue;
			case UDFFieldTypes.Dropdown:
				return this.getDropdownValue(item, itemData);
			case UDFFieldTypes.Date:
				return this.getDateValue(itemData);
			default:
				return null;
		}
	}

	private getTextboxValue(item: { IsNumeric: boolean }, itemData: IPreparedUdfPayloadData): null | string | number {
		if (item.IsNumeric) {
			if (itemData.udfIntegerValue != null) {
				return parseInt(itemData.udfIntegerValue.toString());
			} else if (itemData.udfNumericValue != null) {
				return parseFloat(itemData.udfNumericValue.toString());
			}
		} else {
			return itemData.udfTextValue;
		}
		return null;
	}

	private getDropdownValue(item: { PredefinedListItems: IPredefinedListItem[] }, itemData: IPreparedUdfPayloadData): IPredefinedListItem | null {
		const val = itemData.udfTextValue;
		if (val === null) {
			return null;
		}
		return item.PredefinedListItems.find((x) =>
			x.Value?.toString() === val) ?? null;
	}

	private getDateValue(itemData: IPreparedUdfPayloadData): Date | null {
		const dateValue = itemData.udfDateValue;
		return dateValue
			? new Date(dateValue)
			: null;
	}

	private getDefaultValue(item: IUdfConfig) {
		switch (item.FieldTypeId) {
			case Number(UDFFieldTypes.Textbox):
				return this.getValueForTextboxFieldType(item);
			case Number(UDFFieldTypes.MultiTextBox):
				return this.getValueForMultiTextBoxFieldType(item);
			case Number(UDFFieldTypes.Dropdown):
				return this.getValueForDropdownFieldType(item);
			case Number(UDFFieldTypes.Date):
				return this.getValueForDateFieldType(item);
			default:
				return null;
		}
	}

	ngDoCheck(): void {
		if ((this.udfForm?.touched && !this.udfForm?.valid)) {
			this.cd.markForCheck();
		}
	}
	private getValueForTextboxFieldType(item: IUdfConfig) {
		return item.IsNumeric
			? this.getValueForNumericField(item)
			: this.getValueForNonNumericField(item);
	}

	private getValueForNumericField(item: IUdfConfig) {
		const { actionTypeId } = this,
			{ DefaultValue, UdfIntegerValue, UdfNumericValue } = item;
		if (actionTypeId === Number(ActionType.Add)) {
			if (DefaultValue == null) {
				return null;
			}
			return DefaultValue.includes('.')
				? parseFloat(DefaultValue)
				: parseInt(DefaultValue);
		}
		if (UdfIntegerValue != null) {
			return parseInt(UdfIntegerValue.toString());
		}
		if (UdfNumericValue != null) {
			return parseFloat(UdfNumericValue.toString());
		}
		return null;
	}

	private getValueForNonNumericField(item: IUdfConfig) {
		if (this.actionTypeId === Number(ActionType.Add)) {
			return item.UdfId === Number(magicNumber.zero)
				? item.DefaultValue
				: item.UdfTextValue;
		}
		return item.UdfTextValue;
	}

	private getValueForMultiTextBoxFieldType(item: IUdfConfig) {
		return this.actionTypeId == Number(ActionType.Add)
			? item.DefaultValue
			: item.UdfTextValue;
	}

	private getValueForDropdownFieldType(item: IUdfConfig) {
		const { PredefinedListId, PredefinedListItems, DefaultValue, UdfTextValue } = item,
			isListValid = PredefinedListId != null && PredefinedListId != Number(magicNumber.zero)
				&& PredefinedListItems.length > Number(magicNumber.zero);
		if (!isListValid) {
			return null;
		}
		let val: string | number | IPredefinedListItem | null = this.actionTypeId === Number(ActionType.Add)
			? DefaultValue
			: UdfTextValue;
		if (val != null) {
			val = PredefinedListItems.find((x) =>
				(x as { Value: number }).Value == val) ?? null;
		}
		return val;
	}

	private getValueForDateFieldType(item: IUdfConfig): Date | null {
		const { DefaultValue, UdfDateValue } = item;
		if (this.actionTypeId === Number(ActionType.Add) && DefaultValue != null) {
			return new Date(DefaultValue);
		}
		if (UdfDateValue != null) {
			return new Date(UdfDateValue);
		}
		return null;
	}

	private prePareRequestedData(): IPreparedUdfPayloadData[] {
		const data: IPreparedUdfPayloadData[] = [];

		this.udfControlConfig.forEach((item: IUdfConfig) => {
			const { integerData, decimalData, textVal, dateVal } = this.getFieldValues(item);

			data.push(this.createPreparedData({
				item,
				integerData,
				decimalData,
				textVal,
				dateVal
			}));
		});

		return data;
	}

	private getFieldValues(item: IUdfConfig):
	 { integerData: number | null, decimalData: number | null, textVal: string | null, dateVal: string | null } {
		let integerData: number | null = null,
			decimalData: number | null = null,
			textVal: string | null = null,
			dateVal: string | null = null;

		const val = this.udfForm.get(item.StandardFieldName)?.value;

		switch (item.FieldTypeId) {
			case Number(UDFFieldTypes.Textbox):
				if (item.IsNumeric && val != null) {
					if (Number.isInteger(val)) integerData = val;
					else decimalData = val;
				} else {
					textVal = val;
				}
				break;
			case Number(UDFFieldTypes.MultiTextBox):
				textVal = val;
				break;
			case Number(UDFFieldTypes.Dropdown):
				textVal = val?.Value ?? null;
				break;
			case Number(UDFFieldTypes.Date):
				dateVal = this.localizationSrv.TransformDate(val, 'MM/dd/yyyy');
				break;
		}

		return { integerData, decimalData, textVal, dateVal };
	}

	private createPreparedData(params: IPreparedDataParams): IPreparedUdfPayloadData {
		const { item, integerData, decimalData, textVal, dateVal } = params;
		return {
			udfId: item.UdfId,
			xrmEntityId: this.entityId,
			sectorId: this.sectorId,
			recordId: this.recordId,
			recordUKey: this.recordUKey,
			udfConfigId: item.UdfConfigId,
			udfIntegerValue: integerData,
			udfNumericValue: decimalData,
			udfTextValue: textVal,
			udfDateValue: dateVal,
			udfFieldTypeId: item.FieldTypeId
		};
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		this.udfCommonMethods.parentsInfos = [];
	}

}
