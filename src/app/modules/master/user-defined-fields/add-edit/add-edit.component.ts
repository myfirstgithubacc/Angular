import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { UserDefinedFieldsService } from '../services/user-defined-fields.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import {
	IDefaultUdfData, IFieldTypes, ILinkedScreensOnEdit, IPredefinedList, ISectorDropdown, IUdfConfiguration, ISelectedSector, IOvertimeHour,
	IAppliesToAllSectorList, IListViewRows, ILinkedScreens, IFormStructure, IListViewRowParams, ITreeNode, IDefaultUdfDataResponse,
	ILinkedScreenResponse, DynamicObject, IListViewData
} from '@xrm-core/models/user-defined-field-config/udf-config-addedit.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DatePipe } from '@angular/common';
import { CommonService } from '@xrm-shared/services/common.service';
import { UserDefinedFieldsPickListService } from '@xrm-master/user-defined-field-pick-list/services/user-defined-fields-pick-list.service';
import { NavigationPaths } from '../constant/route-constant';
import { FieldType } from '../constant/fieldType-constant';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IUdfData } from '@xrm-core/models/user-defined-field-config/udf-config-view.model';
import { IAppliesToSectorList, IDropDownList, IDropdown, ILinkedParent, ILinkedScreen, IPickListTypeItem, IPredefined } from '@xrm-core/models/user-defined-field-config/udf-config-common.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { UDFFieldTypes } from '@xrm-shared/common-components/udf-implementation/constant/field-types.enum';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public addEditUDFForm: FormGroup;
	public previewForm: FormGroup;
	public listViewForm?: FormArray<FormGroup>;
	public disableNumeric: boolean = false;
	private isPickListVisible: boolean = false;
	public isDefaultValueRequired: boolean = false;
	public isNumericDefaultValue: boolean = false;
	public isPreviewVisible: boolean = false;
	public isListViewVisible: boolean = true;
	public isAdded: boolean = false;
	public sowKeyClicked: boolean = false;
	private editIsViewOnly: boolean;
	public status: string = "not open";
	public preFix: string = "item";
	public uKey: string | null;
	private selectedFieldTypeId: string;
	public field: string;
	public maxLength: number = magicNumber.zero;
	public udfData: IUdfData;
	public entityId = XrmEntities.UserDefinedField;
	private appliesToNotTriggred: number = magicNumber.zero;
	private savedLinkedScreenData: ILinkedScreensOnEdit[] = [];
	public fieldTypeConfig: IDefaultUdfData = {};
	public listFieldTypes: IFieldTypes[] = [];
	public preDefinedPickList: IPredefinedList[] = [];
	public preDefinedPickListItems: IDropdown[] = [];
	public listViewData: DynamicObject;
	public listSectors: ISectorDropdown[] = [];
	public listVisibleTo: IDropdown[] = [];
	public listBaseScreen: IFieldTypes[] = [];
	public listViewSelectedRows: number[] = [];

	public selectedBaseScreen: IFieldTypes = { Text: '', Value: '', TextLocalizedKey: null, IsSelected: false };
	public selectedSectors: ISelectedSector[] = [];
	public selectedVisibleTo: IDropdown[] = [];
	public selectedEditAllowedBy: IDropdown[] = [];
	public sectorKey: string[] = [];
	public oldSelectedSector: ISelectedSector[] = [];
	private actualListViewRowsInfo: IListViewRows[] = [];
	public listViewRowsInfo: IListViewRows[] = [];
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	public listViewColumnInfo = [
		{
			Name: 'ScreenLevel',
			Span: magicNumber.one
		},
		{
			Name: 'LinkedScreen',
			Span: magicNumber.two
		},
		{
			Name: 'AppliesTo',
			Span: magicNumber.one
		},
		{
			Name: 'ParentScreen',
			Span: magicNumber.two
		},
		{
			Name: 'VisibleTo',
			Span: magicNumber.three
		},
		{
			Name: 'EditingAllowedBy',
			Span: magicNumber.three
		}

	];

	public sectorLabel: IOvertimeHour[] = [
		{
			Text: "All", Value: true
		},
		{
			Text: "Selected", Value: false
		}
	];

	// eslint-disable-next-line max-params
	constructor(
		private route: Router,
		private cd: ChangeDetectorRef,
		private activatedRoute: ActivatedRoute,
		private formBuilder: FormBuilder,
		private customValidators: CustomValidators,
		private localizationService: LocalizationService,
		private userDefinedFieldsService: UserDefinedFieldsService,
		private userDefinedFieldsPickListService: UserDefinedFieldsPickListService,
		private toasterService: ToasterService,
		private datePipe: DatePipe,
		private commonService: CommonService
	) {
		this.initalizeUdfForm();
		this.initalizePreviewForm();
		this.loadFieldTypeConfigAfterPopupClose();
	}

	private initalizeUdfForm() {
		this.addEditUDFForm = this.formBuilder.group({
			LabelText: [null, this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'DisplayName', IsLocalizeKey: true }])],
			ComplianceFieldName: [null],
			FieldType: [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'FieldType', IsLocalizeKey: true }])],
			IsNumeric: [false],
			MaxLength: [null, [this.maxLengthValidator, this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'SegmentMaxLength', IsLocalizeKey: true }])]],
			MinLength: [null, [this.minLengthValidator]],
			MinDate: [null, [this.customValidators.DateGreaterThanValidator('MaxDate', "UdfMinDateValidation"), this.customValidators.DateNotEqualToValidator('MaxDate', "UdfMinDateEqualValidation")]],
			MaxDate: [null, [this.customValidators.DateLessThanValidator('MinDate', "UdfMaxDateValidation"), this.customValidators.DateNotEqualToValidator('MinDate', "UdfMaxDateEqualValidation")]],
			PredefinedLists: [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'PickList', IsLocalizeKey: true }])],
			DefaultPredefinedList: [null],
			DefaultValue: [null, this.defaultValueValidator],
			IsAppliesToAllSectors: [true],
			IsStoreAsEncrypeted: [false],
			VisibleTo: [[], this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'VisibleTo', IsLocalizeKey: true }])],
			IsViewOnly: [false],
			EditingAllowedBy: [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'EditingAllowedBy', IsLocalizeKey: true }])],
			IsMandatory: [false],
			ToolTipText: [null],
			BaseScreen: [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'BaseScreen', IsLocalizeKey: true }])],
			RecordExist: [false],
			UDFMaxLen: [null],
			UDFMinLen: [null]
		});
	}
	private initalizePreviewForm() {
		this.previewForm = this.formBuilder.group({
			TextBox: [null],
			TextArea: [null],
			DropDown: [null],
			DatePicker: [null]
		});
	}

	ngOnInit(): void {
		this.loadAllData();
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			if (param['uKey'] != null) {
				this.uKey = param['uKey'];
				this.selectedFieldTypeId = param['fieldTypeId'];
			}
		});
	}

	private loadFieldTypeConfigAfterPopupClose() {
		this.userDefinedFieldsPickListService.setOnDestroyCallback(() => {
			this.loadFieldTypeConfig(this.addEditUDFForm.controls['FieldType'].value);
		});
	}

	private loadAllData(): void {
		forkJoin({
			fieldTypes: this.loadFieldTypes(),
			baseScreens: this.loadBaseScreens(),
			preloadedData: this.loadPreloadedData()
		}).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(({ fieldTypes, baseScreens, preloadedData }) => {
			if (fieldTypes.Succeeded && fieldTypes.Data) {
				this.listFieldTypes = fieldTypes.Data;
			}
			if (baseScreens.Succeeded && baseScreens.Data) {
				this.listBaseScreen = baseScreens.Data;
			}
			if (preloadedData.Succeeded && preloadedData.Data) {
				this.handlePreloadedData(preloadedData.Data);
			}
			this.cd.detectChanges();
		});
	}

	private handlePreloadedData(res: IUdfData): void {
		if (this.uKey == null) {
			this.setComplianceFieldName(res.FieldType.StandardFieldName);
		} else {
			this.getUDFById(this.uKey, this.selectedFieldTypeId);
		}

		this.setListVisibleTo(res.FieldType.VisibleToList);
		this.setListSectors(res.FieldType.AppliesToAllSectorList);
	}

	private setComplianceFieldName(standardFieldName: string): void {
		this.addEditUDFForm.get("ComplianceFieldName")?.setValue(standardFieldName);
	}

	private setListVisibleTo(visibleToList: IDropDownList[]): void {
		this.listVisibleTo = visibleToList.map((item: IDropDownList) =>
			({
				Text: item.Name,
				Value: item.Id
			}));
	}

	private setListSectors(appliesToAllSectorList: IAppliesToAllSectorList[]): void {
		this.listSectors = appliesToAllSectorList.map((item: IAppliesToAllSectorList, index: number) =>
			({
				Text: item.SectorName ?? '',
				Value: item.SectorId ?? magicNumber.zero,
				IsSelected: false,
				Index: index.toString()
			}));
	}

	private loadFieldTypes(): Observable<GenericResponseBase<IFieldTypes[]>> {
		return this.userDefinedFieldsService.GetUDFTypeDD();
	}

	private loadBaseScreens(): Observable<GenericResponseBase<IFieldTypes[]>> {
		return this.userDefinedFieldsService.GetBaseScreensDD();
	}

	private loadPreloadedData(): Observable<GenericResponseBase<IUdfData>> {
		const data = { udfConfigId: magicNumber.zero, fieldTypeId: magicNumber.zero, actionTypeId: magicNumber.one, baseScreenId: magicNumber.zero, udfConfigUkey: "" };
		return this.userDefinedFieldsService.GetUDFPreloadData(data);
	}

	private getUDFById(uKey: string, fieldTypeId: string) {
		const requestBody = {
			udfConfigId: magicNumber.zero, udfConfigUkey: uKey, fieldTypeId: Number(fieldTypeId),
			actionTypeId: magicNumber.two, baseScreenId: magicNumber.zero
		};

		this.userDefinedFieldsService.GetUDFPreloadData(requestBody).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (response: GenericResponseBase<IUdfData>) => {
				if (response.Succeeded && response.Data)
					this.processUDFData(response.Data);
			}
		});
	}

	private processUDFData(response: IUdfData): void {
		this.clearOldSelectedSector();
		this.handleUDFData(response);
		this.patchSector(response.FieldType.AppliesToAllSectorList);
		this.updateSectorSelection(response.FieldType.AppliesToAllSectorList);
		this.handleFieldTypeAndBaseScreen();
		this.setVisibleToLists(response.FieldType.VisibleToList, response.FieldType.EditingAllowedByList);
		this.setFormDataAndStatus();
	}

	private clearOldSelectedSector(): void {
		this.oldSelectedSector.length = magicNumber.zero;
	}

	private patchSector(data: IAppliesToSectorList[]){
		if(data.length){
			this.sectorLabel = [
				{
					Text: "All", Value: false
				},
				{
					Text: "Selected", Value: true
				}
			];
			this.cd.detectChanges();
		}
	}

	private updateSectorSelection(appliesToAllSectorList: IAppliesToAllSectorList[]): void {
		appliesToAllSectorList.forEach((item: IAppliesToAllSectorList) => {
			const index = this.listSectors.findIndex((x: ISectorDropdown) =>
				x.Value == item.SectorId);
			if (index > Number(magicNumber.minusOne)) {
				this.listSectors[index].IsSelected = true;
				this.sectorKey = [...this.sectorKey, this.listSectors[index].Index.toString()];
				this.oldSelectedSector = [...this.oldSelectedSector, { id: item.SectorId }];
			}
		});
	}

	private getFieldTypeData(fieldTypeId: number): IFieldTypes | undefined {
		return this.listFieldTypes.find((x: IFieldTypes) =>
			Number(x.Value) == fieldTypeId);
	}

	private getBaseScreenData(baseScreenType: number): IFieldTypes | undefined {
		return this.listBaseScreen.find((x: IFieldTypes) =>
			Number(x.Value) == baseScreenType);
	}

	private setVisibleToLists(visibleToList: IDropDownList[], editingAllowedByList: IDropDownList[]): void {
		this.selectedVisibleTo = visibleToList.map((item: IDropDownList) =>
			({
				Text: item.Name,
				Value: item.Id
			}));

		this.selectedEditAllowedBy = editingAllowedByList.map((item: IDropDownList) =>
			({
				Text: item.Name,
				Value: item.Id
			}));
	}

	private handleFieldTypeAndBaseScreen(): void {
		const fieldTypeData = this.getFieldTypeData(this.udfData.FieldTypeId),
			baseScreenData = this.getBaseScreenData(this.udfData.BaseScreen.BaseScreenType);
		if (!fieldTypeData || !baseScreenData) {
			return;
		}
		this.loadFieldTypeConfig(fieldTypeData);
		this.onBaseScreenChange(baseScreenData);
	}

	private handleUDFData(response: IUdfData): void {
		this.udfData = response;
		this.savedLinkedScreenData = this.udfData.BaseScreen.LinkedScreen;
		this.editIsViewOnly = response.FieldType.IsViewOnly;
		this.disableNumeric = !this.udfData.FieldType.IsNumeric;
	}

	private setFormDataAndStatus(): void {
		const fieldTypeData = this.getFieldTypeData(this.udfData.FieldTypeId),
			baseScreenData = this.getBaseScreenData(this.udfData.BaseScreen.BaseScreenType);
		if (fieldTypeData && baseScreenData) {
			this.setFormData(this.udfData, fieldTypeData, baseScreenData);
			this.updateStatusStrip();
		}
	}

	private setBaseFormData(udfData: IUdfData, fieldTypeData: IFieldTypes, baseScreenData: IFieldTypes): void {
		this.addEditUDFForm.patchValue({
		  ComplianceFieldName: udfData.FieldType.StandardFieldName,
		  LabelText: udfData.FieldType.LabelText,
		  FieldType: fieldTypeData,
		  IsAppliesToAllSectors: udfData.FieldType.IsAppliesToAllSector,
		  IsStoreAsEncrypeted: udfData.FieldType.IsStoreAsEncrypeted,
		  VisibleTo: this.selectedVisibleTo,
		  IsViewOnly: udfData.FieldType.IsViewOnly,
		  BaseScreen: baseScreenData
		});
	  }

	  private setEditingAllowedBy(udfData: IUdfData): void {
		const editingAllowedByControl = this.addEditUDFForm.controls['EditingAllowedBy'],
		 editingAllowedByValue = udfData.FieldType.IsViewOnly
		  ? this.customValidators.RemoveCascadeRequiredValidator([editingAllowedByControl])
		  : this.selectedEditAllowedBy;

		this.addEditUDFForm.patchValue({ EditingAllowedBy: editingAllowedByValue });
	  }

	  private setFieldLength(udfData: IUdfData): void {
		this.addEditUDFForm.patchValue({
		  UDFMaxLen: udfData.FieldType.MaxLength,
		  UDFMinLen: udfData.FieldType.MinLength
		});
	  }

	  private setAdditionalFields(udfData: IUdfData): void {
		this.addEditUDFForm.patchValue({
		  IsMandatory: udfData.FieldType.IsMandatory,
		  ToolTipText: udfData.FieldType.TooltipText
		});
	  }

	  private setFormData(udfData: IUdfData, fieldTypeData: IFieldTypes, baseScreenData: IFieldTypes): void {
		this.setBaseFormData(udfData, fieldTypeData, baseScreenData);
		this.setEditingAllowedBy(udfData);
		this.setFieldLength(udfData);
		this.setAdditionalFields(udfData);
	  }

	private updateStatusStrip(): void {
		this.isRecordForConfig(this.udfData.FieldType.UdfConfigId);
		this.userDefinedFieldsService.sharedDataSubject.next({
			'Disabled': this.udfData.FieldType.Disabled,
			'UdfConfigId': this.udfData.FieldType.UdfConfigId,
			'UdfConfigCode': this.udfData.FieldType.Code
		});
	}

	public isRecordForConfig(id: number) {
		this.userDefinedFieldsService.GetConfigRecord(id).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<boolean>) => {
				if (res.Succeeded && res.Data) {
					this.addEditUDFForm.get("RecordExist")?.setValue(res.Data);
				}
			});
	}

	private findPredefinedListData(predefinedListId: number | null): IPredefinedList | undefined {
		return this.preDefinedPickList.find((x: IPredefinedList) =>
			 x.Value === predefinedListId);
	  }

	  private findPredefinedDefaultValue(predefinedListData: IPredefinedList | undefined, defaultValue: string): IPickListTypeItem | undefined {
		return predefinedListData?.Items.find((x: IPickListTypeItem) =>
			 x.Id === parseInt(defaultValue));
	  }

	  private patchFormValues(predefinedListData: IPredefinedList | undefined, predefinedDefaultValue: IPickListTypeItem | undefined): void {
		this.addEditUDFForm.patchValue({
		  IsNumeric: this.udfData.FieldType.IsNumeric,
		  MinLength: this.udfData.FieldType.MinLength,
		  MaxLength: this.udfData.FieldType.MaxLength,
		  MinDate: this.udfData.FieldType.MinDate
		  ? new Date(this.udfData.FieldType.MinDate)
		  : null,
		  MaxDate: this.udfData.FieldType.MaxDate
		  ? new Date(this.udfData.FieldType.MaxDate)
		  : null,
		  PredefinedLists: predefinedListData,
		  DefaultPredefinedList: predefinedDefaultValue
		  ? { Text: predefinedDefaultValue.Name, Value: predefinedDefaultValue.Id }
		  : null,
		  DefaultValue: (!this.fieldTypeConfig.VisiblePredefinedPickList && this.fieldTypeConfig.VisibleDefaultValue)
				? this.udfData.FieldType.DefaultValue
				: null
		});
	  }

	  private handlePredefinedList(predefinedListData: IPredefinedList | undefined): void {
		if (this.udfData.FieldType.PredefinedListId && predefinedListData !== undefined) {
		  this.predfinedListData(predefinedListData);
		}
	  }

	  private patchSelectedFieldTypeData(): void {
		const predefinedListData = this.findPredefinedListData(this.udfData.FieldType.PredefinedListId),
		 predefinedDefaultValue = this.findPredefinedDefaultValue(predefinedListData, this.udfData.FieldType.DefaultValue);

		this.patchFormValues(predefinedListData, predefinedDefaultValue);
		this.handlePredefinedList(predefinedListData);

		this.setMaxMinLength();
	  }

	private backToList() {
		this.route.navigate([NavigationPaths.list]);
	}

	public loadFieldTypeConfig(dataItem: IFieldTypes) {
		this.initializeFieldConfig(dataItem);
		const data = { udfConfigId: magicNumber.zero, fieldTypeId: dataItem.Value, actionTypeId: magicNumber.two },
			isViewOnly = this.addEditUDFForm.get('IsViewOnly')?.value;

		this.userDefinedFieldsService.GetUDFTypeById(data).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IDefaultUdfDataResponse>) => {
				if (!res.Succeeded || !res.Data) {
					return;
				}
				this.processFieldTypeConfig(res.Data.FieldType, dataItem);
				this.cd.detectChanges();
				if (this.uKey == null) {
					this.resetControls();
				}
			});

		this.handleFieldTypeValidation(dataItem);
		this.handleFieldTypeId(this.uKey
			? this.editIsViewOnly
			: isViewOnly);
	}

	private initializeFieldConfig(dataItem: IFieldTypes) {
		this.field = dataItem.Value;
		this.preDefinedPickList = [];
		this.isPickListVisible = false;
		this.fieldTypeConfig = {};
		this.updateValidatorsOnControl(false);
		this.setMaxMinLength();
	}

	defaultValueChange(data: string | number){
		if(data){
			this.addEditUDFForm.controls['DefaultValue'].addValidators(this.defaultValueValidator);
			this.addEditUDFForm.controls['DefaultValue'].updateValueAndValidity();
		}

	}

	private processFieldTypeConfig(fieldTypeConfig: IDefaultUdfData, dataItem: IFieldTypes) {
		this.fieldTypeConfig = fieldTypeConfig;
		if (this.fieldTypeConfig.PredefinedList != null) {
			this.isPickListVisible = true;
			this.updateValidatorsOnControl(this.isPickListVisible);
			this.preDefinedPickList = this.fieldTypeConfig.PredefinedList.map((item: IPredefined) => {
				return { Text: item.Name, Value: item.Id, Items: item.PickListTypeItems };
			});
		}
		if (dataItem.Value == this.selectedFieldTypeId) {
			this.patchSelectedFieldTypeData();
		}
	}

	private handleFieldTypeValidation(dataItem: IFieldTypes) {
		if (dataItem.Text == FieldType.textbox || dataItem.Text == FieldType.multilineTextArea) {
			this.addEditUDFForm.controls['MaxLength'].addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'SegmentMaxLength', IsLocalizeKey: true }]));
			this.addEditUDFForm.controls['MaxLength'].addValidators(this.maxLengthValidator);
		} else {
			this.customValidators.RemoveCascadeRequiredValidator([this.addEditUDFForm.controls['MaxLength']]);
		}
	}


	public onPreDefinedListChange(dataItem: IPredefinedList | undefined) {
		this.addEditUDFForm.controls['DefaultPredefinedList'].reset();
		if (dataItem) {
			this.predfinedListData(dataItem);
		}
	}

	private predfinedListData(dataItem: IPredefinedList) {
		this.preDefinedPickListItems = [];
		this.preDefinedPickListItems = dataItem.Items.map((item: IPickListTypeItem) =>
			 { return { Text: item.Name, Value: item.Id }; });
	}

	public onBaseScreenChange(dataItem: IFieldTypes) {
		this.selectedBaseScreen = {
			Text: '',
			Value: '',
			TextLocalizedKey: null,
			IsSelected: false
		};
		this.actualListViewRowsInfo = [];
		this.listViewRowsInfo = [];
		this.listViewSelectedRows = [];

		const data = { udfConfigId: magicNumber.zero, baseScreenId: dataItem.Value, uKey: "", actionTypeId: 1 };

		this.selectedBaseScreen = dataItem;

		this.userDefinedFieldsService.GetBaseScreenConfig(data).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<ILinkedScreenResponse>) => {
				if (res.Succeeded && res.Data) {
					this.processLinkedScreenData(res.Data.BaseScreen.LinkedScreen);
				}

				if (this.uKey != null) {
					this.setListViewDefaultDataOnUpdate();
				}
				this.cd.detectChanges();
			});
	}

	private createLabelControl(config: {
		controlName: string,
		defaultValue: string, span: number, isReadOnly: boolean
	}): IListViewRows {
		const { controlName, defaultValue, span, isReadOnly } = config;
		return {
			ControlName: controlName,
			ControlType: "label",
			DefaultValue: defaultValue,
			Span: span,
			IsReadOnly: isReadOnly
		};
	}

	private createLinkedScreenLabelControl(config: {
		id: number,
		sr: number,
		rowNo: number,
		controlName: string,
		defaultValue: string,
		span: number,
		linkedScreenId: number,
		columnName: string,
		entityLevel: number,
		multipleSelectionAllowedAtSameLevel: boolean
	}): IListViewRows {
		const { id, sr, rowNo, controlName, defaultValue, span, linkedScreenId, columnName,
			entityLevel, multipleSelectionAllowedAtSameLevel } = config;
		return {
			Id: id,
			Sr: sr,
			RowNo: rowNo,
			ControlName: controlName,
			ControlType: "label",
			DefaultValue: defaultValue,
			Span: span,
			LinkedScreenId: linkedScreenId,
			ColumnName: columnName,
			EntityLevel: entityLevel,
			MultipleSelectionAllowedAtSameLevel: multipleSelectionAllowedAtSameLevel
		};
	}

	private createSwitchControl(config: {
		id: number,
		sr: number,
		rowNo: number,
		controlName: string,
		defaultValue: boolean,
		span: number,
		columnName: string,
		entityLevel: number,
		linkedScreenId: number,
		linkedScreenName: string,
		multipleSelectionAllowedAtSameLevel: boolean
	}): IListViewRows {
		const { id, sr, rowNo, controlName, defaultValue, span, columnName, entityLevel,
			linkedScreenId, linkedScreenName, multipleSelectionAllowedAtSameLevel } = config;
		return {
			Id: id,
			Sr: sr,
			RowNo: rowNo,
			ControlName: controlName,
			ControlType: "switch",
			DefaultValue: defaultValue,
			Span: span,
			ColumnName: columnName,
			EntityLevel: entityLevel,
			LinkedScreenId: linkedScreenId,
			LinkedScreenName: linkedScreenName,
			MultipleSelectionAllowedAtSameLevel: multipleSelectionAllowedAtSameLevel
		};
	}

	private createDropdownControl(config: {
		id: number,
		sr: number,
		rowNo: number,
		controlName: string,
		controlType: "label" | "switch" | "dropdown" | "multiselect_dropdown",
		defaultValue: [],
		data: [],
		span: number,
		isDisable: boolean,
		columnName: string,
		entityLevel: number,
		linkedScreenId: number,
		multipleSelectionAllowedAtSameLevel: boolean,
		linkedParent: ILinkedParent[],
		multipleParentAllowed: boolean
	}): IListViewRows {
		const { id, sr, rowNo, controlName, controlType, defaultValue, data, span, isDisable,
			columnName, entityLevel, linkedScreenId, multipleSelectionAllowedAtSameLevel,
			linkedParent, multipleParentAllowed } = config;
		return {
			Id: id,
			Sr: sr,
			RowNo: rowNo,
			ControlName: controlName,
			ControlType: controlType,
			DefaultValue: defaultValue,
			Data: data,
			Span: span,
			IsDisable: isDisable,
			ColumnName: columnName,
			EntityLevel: entityLevel,
			LinkedScreenId: linkedScreenId,
			MultipleSelectionAllowedAtSameLevel: multipleSelectionAllowedAtSameLevel,
			LinkedParent: linkedParent,
			MultipleParentAllowed: multipleParentAllowed
		};
	}

	private createMultiselect(config: {
		id: number,
		sr: number,
		rowNo: number,
		controlName: string,
		defaultValue: [],
		data: IDropdown[],
		span: number,
		isDisable: boolean,
		columnName: string,
		entityLevel: number,
		linkedScreenId: number,
		multipleSelectionAllowedAtSameLevel: boolean
	}): IListViewRows {
		const { id, sr, rowNo, controlName, defaultValue, data, span, isDisable,
			columnName, entityLevel, linkedScreenId, multipleSelectionAllowedAtSameLevel } = config;
		return {
			Id: id,
			Sr: sr,
			RowNo: rowNo,
			ControlName: controlName,
			ControlType: "multiselect_dropdown",
			DefaultValue: defaultValue,
			Data: data,
			Span: span,
			IsDisable: isDisable,
			ColumnName: columnName,
			EntityLevel: entityLevel,
			LinkedScreenId: linkedScreenId,
			MultipleSelectionAllowedAtSameLevel: multipleSelectionAllowedAtSameLevel
		};
	}

	private processLinkedScreenData(linkedScreens: ILinkedScreen[]) {
		let serialNo = 1,
			rowNo = 1;
		linkedScreens.forEach((item: ILinkedScreen) => {
			const id = this.getLinkedScreenId(item.LinkedScreenId),
				controlType = item.MultipleParentAllowed
					? "multiselect_dropdown"
					: "dropdown",
				data = [
					this.createLabelControl({ controlName: `${this.preFix}${item.LinkedScreenId}0`,
						defaultValue: `${"Level - "} ${item.EntityLevel}`, span: magicNumber.one, isReadOnly: true }),

					this.createLinkedScreenLabelControl({ id: id, sr: serialNo++, rowNo: rowNo, controlName: `${this.preFix}${item.LinkedScreenId}1`,
						span: magicNumber.two, defaultValue: item.LinkedScreenName, linkedScreenId: item.LinkedScreenId,
						columnName: this.listViewColumnInfo[magicNumber.zero].Name,
						entityLevel: item.EntityLevel, multipleSelectionAllowedAtSameLevel: item.MultipleSelectionAllowedAtSameLevel }),

					this.createSwitchControl({ id: id, sr: serialNo++, rowNo: rowNo, span: magicNumber.one,
						controlName: `${this.preFix}${item.LinkedScreenId}2`, defaultValue: item.AppliesTo,
						columnName: this.listViewColumnInfo[magicNumber.one].Name, entityLevel: item.EntityLevel,
						linkedScreenId: item.LinkedScreenId, linkedScreenName: item.LinkedScreenName,
						multipleSelectionAllowedAtSameLevel: item.MultipleSelectionAllowedAtSameLevel }),

					this.createDropdownControl({ id: id, sr: serialNo++, rowNo: rowNo, defaultValue: [],
						controlName: `${this.preFix}${item.LinkedScreenId}3`, controlType: controlType,
						span: magicNumber.two, isDisable: true, columnName: this.listViewColumnInfo[magicNumber.two].Name,
						entityLevel: item.EntityLevel, linkedScreenId: item.LinkedScreenId, data: [],
						multipleSelectionAllowedAtSameLevel: item.MultipleSelectionAllowedAtSameLevel,
						linkedParent: item.LinkedParent, multipleParentAllowed: item.MultipleParentAllowed }),

					this.createMultiselect({ id: id, sr: serialNo++, rowNo: rowNo, isDisable: true,
						controlName: `${this.preFix}${item.LinkedScreenId}4`, defaultValue: [],
						data: this.listVisibleTo, span: magicNumber.three, columnName: this.listViewColumnInfo[magicNumber.three].Name,
						entityLevel: item.EntityLevel, linkedScreenId: item.LinkedScreenId,
						multipleSelectionAllowedAtSameLevel: item.MultipleSelectionAllowedAtSameLevel }),

					this.createMultiselect({ id: id, sr: serialNo++, rowNo: rowNo,
						controlName: `${this.preFix}${item.LinkedScreenId}5`, defaultValue: [],
						data: this.listVisibleTo, columnName: this.listViewColumnInfo[magicNumber.four].Name,
						entityLevel: item.EntityLevel, linkedScreenId: item.LinkedScreenId, span: magicNumber.three, isDisable: true,
						multipleSelectionAllowedAtSameLevel: item.MultipleSelectionAllowedAtSameLevel })
				];
			rowNo++;
			this.listViewRowsInfo = [...this.listViewRowsInfo, ...data];
			this.actualListViewRowsInfo = [...this.actualListViewRowsInfo, ...data];
		});
	}

	private getLinkedScreenId(linkedScreenId: number) {
		let id = Number(magicNumber.zero);

		if (this.savedLinkedScreenData.length > Number(magicNumber.zero)) {
			const v1 = this.savedLinkedScreenData.filter((x: ILinkedScreensOnEdit) =>
				x.LinkedScreenId == linkedScreenId);

			if (v1.length > Number(magicNumber.zero)) {
				id = v1[magicNumber.zero].Id;
			}
		}
		return id;
	}

	private resetControls() {
		this.isNumericDefaultValue = false;
		this.addEditUDFForm.get("IsNumeric")?.setValue(false);
		this.addEditUDFForm.get("MinLength")?.reset();
		this.addEditUDFForm.get("MaxLength")?.reset();

		this.addEditUDFForm.get("MinDate")?.reset();
		this.addEditUDFForm.get("MaxDate")?.reset();

		this.addEditUDFForm.get("DefaultValue")?.reset();
		this.addEditUDFForm.get("PredefinedLists")?.reset();
		this.addEditUDFForm.get("DefaultPredefinedList")?.reset();
	}

	private setMaxMinLength() {
		this.maxLength = Number(magicNumber.zero);
		const fieldTypeId = this.addEditUDFForm.get('FieldType')?.value?.Value,
			isNumeric = this.addEditUDFForm.get('IsNumeric')?.value;
		if (fieldTypeId == undefined || fieldTypeId == null) return;
		if (fieldTypeId == magicNumber.one) this.maxLength = isNumeric
			? magicNumber.eighteen
			: magicNumber.oneFifty;
		else if (fieldTypeId == magicNumber.two) this.maxLength = magicNumber.eightThousand;

	}

	private processListViewRows(dataItem: IFormStructure, data: { "isAppliesTo": boolean, "rowNo": number, "serialNo": number }) {
		let i = magicNumber.zero,
			srNo = data.serialNo;

		this.manageListViewParentScreenData();
		const isViewOnly = this.addEditUDFForm.get("IsViewOnly")?.value;

		this.listViewRowsInfo.map((x: IListViewRows) => {
			i++;
			if (i <= magicNumber.three) {
				srNo++;
				const item = this.listViewRowsInfo.find((value: IListViewRows) =>
					value.Sr == srNo);

				if (data.isAppliesTo) {
					if (i == magicNumber.one && item) {
						const obj = {
							"item": item,
							"isAppliesTo": data.isAppliesTo,
							"dataItem": dataItem,
							"rowNo": data.rowNo
						};
						this.handleFirstIteration(obj);
					} else if (i == magicNumber.two && item) {
						this.handleSecondIteration(item, data.isAppliesTo, dataItem);
					} else if (i == magicNumber.three && item) {
						this.handleThirdIteration(item, isViewOnly, dataItem);
					}
				} else if (item) {
					this.handleIterationElsePart(item, data.isAppliesTo, dataItem);
				}

				if (item?.ControlName) {
					const control = dataItem.FormArray.at(magicNumber.zero).get(item.ControlName);
					control?.updateValueAndValidity();
				}
			}
		});
	}

	private handleFirstIteration(obj: IListViewRowParams) {
		if (obj.item.Data?.length == Number(magicNumber.zero)) {
			this.handleNoDataCase(obj);
		} else {
			this.handleDataCase(obj);
		}
	}

	private handleNoDataCase(obj: IListViewRowParams) {
		obj.isAppliesTo = false;
		this.toasterService.resetToaster();
		this.toasterService.showToaster(ToastOptions.Error, 'LinkedScreenSelectionNotApplicable');
		this.deselectRow(obj.rowNo);
		if (obj.dataItem.CellInfo.ControlName) {
			const control = obj.dataItem.FormArray.at(magicNumber.zero).get(obj.dataItem.CellInfo.ControlName);
			if (control) {
				control.setValue(false);
				control.disabled(true);
			}
		}
	}

	private handleDataCase(obj: IListViewRowParams) {
		obj.item.IsDisable = !obj.isAppliesTo;
		const data = obj.item.Data ?? [],
			selectedParentScreen = this.getNearestAppliedScreen(obj.rowNo, data);
		if (obj.item.ControlName) {
			const control = obj.dataItem.FormArray.at(magicNumber.zero).get(obj.item.ControlName);
			if (control) {
				if (selectedParentScreen === null) {
					control.setValue(null);
				} else if (obj.item.MultipleParentAllowed) {
					control.setValue(selectedParentScreen);
				} else {
					control.setValue(selectedParentScreen?.[magicNumber.zero]);
				}
				control.setValidators([this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.listViewColumnInfo[magicNumber.three].Name, IsLocalizeKey: true }])]);
			}
		}
	}

	private handleSecondIteration(item: IListViewRows, isAppliesTo: boolean, dataItem: IFormStructure) {
		item.IsDisable = !isAppliesTo;
		dataItem.FormArray.at(magicNumber.zero)
			.get(item.ControlName)
			.setValue(this.selectedVisibleTo);
		dataItem.FormArray.at(magicNumber.zero)
			.get(item.ControlName)
			?.setValidators([this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.listViewColumnInfo[magicNumber.four].Name, IsLocalizeKey: true }])]);
	}

	private handleThirdIteration(item: IListViewRows, isViewOnly: boolean, dataItem: IFormStructure) {
		item.IsDisable = isViewOnly;
		dataItem.FormArray.at(magicNumber.zero)
			.get(item.ControlName)
			.setValue(this.selectedEditAllowedBy);

		if (isViewOnly) {
			dataItem.FormArray.at(magicNumber.zero)
				.get(item.ControlName)
				?.clearValidators();
		} else {
			dataItem.FormArray.at(magicNumber.zero)
				.get(item.ControlName)
				?.setValidators([this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: this.listViewColumnInfo[magicNumber.five].Name, IsLocalizeKey: true }])]);
		}
	}

	private handleIterationElsePart(item: IListViewRows, isAppliesTo: boolean, dataItem: IFormStructure) {
		item.IsDisable = !isAppliesTo;
		dataItem.FormArray.at(magicNumber.zero)
			.get(item.ControlName)
			.setValue(null);
		dataItem.FormArray.at(magicNumber.zero)
			.get(item.ControlName)
			?.clearValidators();
	}

	public onAppliesToChange(dataItem: IFormStructure) {
		this.appliesToNotTriggred++;
		const rowNo = dataItem.CellInfo.RowNo ?? magicNumber.minusOne,
			min = Math.min(...this.listViewSelectedRows),
			max = Math.max(...this.listViewSelectedRows),
			serialNo = dataItem.CellInfo.Sr ?? magicNumber.minusOne,
			isAppliesTo = dataItem.Value;
		this.listViewForm = dataItem.FormArray;

		if (!isNaN(min) && this.listViewSelectedRows.length != Number(magicNumber.zero) &&
			isAppliesTo && (rowNo < min || rowNo < max)) {
			this.handleInvalidRow(dataItem);
			return;
		}
		if (!isNaN(min) && this.listViewSelectedRows.length != Number(magicNumber.zero) &&
			!isAppliesTo && (rowNo < min || rowNo < max)) {
			this.handleInvalidRowOfTopRow(dataItem);
			return;
		}

		if (isAppliesTo) {
			const isValid = this.validateAppliesToRow(dataItem);
			if (isValid) {
				this.listViewSelectedRows.push(rowNo);
			}
			else {
				this.deselectRow(rowNo);
				return;
			}
		}
		else {
			this.deselectRow(rowNo);
		}
		this.processListViewRows(dataItem, { "isAppliesTo": isAppliesTo, "rowNo": rowNo, "serialNo": serialNo });
	}

	public onMultiSelectChange(dataItem: IFormStructure) {
		this.setDropdownValidator(dataItem);
		const controlName = dataItem.CellInfo.ControlName,
			firstDigitIndex = controlName.search(/\d/),
			controlPrefix = controlName.slice(magicNumber.zero, firstDigitIndex),
			controlNumber = parseInt(controlName.slice(firstDigitIndex), magicNumber.ten),
			newControlNumber = controlNumber + magicNumber.one,
			newControlName = `${controlPrefix}${newControlNumber}`,
			formControls = dataItem.FormArray.controls[magicNumber.zero].controls;

		if (formControls[newControlName]) {
			formControls[newControlName].setValue(null);
			formControls[newControlName].markAsUntouched();
		}
	}

	public onDropDownChange(dataItem: IFormStructure) {
		this.setDropdownValidator(dataItem);
	}

	public setDropdownValidator(dataItem: IFormStructure)
	{
		if(this.uKey == null){
			return;
		}
		this.setValidationOnControl(dataItem);
	}

	private setValidationOnControl(dataItem: IFormStructure) {
		dataItem.FormArray.controls.forEach((group: AbstractControl) => {
		  const formGroup = group as FormGroup,
		   control = formGroup.controls[dataItem.CellInfo.ControlName];
		  if (control) {
				const lastDigit = parseInt(dataItem.CellInfo.ControlName.slice(magicNumber.minusOne), magicNumber.ten);
				if (!isNaN(lastDigit) && lastDigit < this.listViewColumnInfo.length) {
			     const columnInfo = this.listViewColumnInfo[lastDigit];
					control.setValidators([this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: columnInfo.Name, IsLocalizeKey: true }])]);
					control.updateValueAndValidity();
				}
		  }
		});
	  }

	private handleInvalidRowOfTopRow(dataItem: IFormStructure) {
		dataItem.FormArray.at(magicNumber.zero).get(dataItem.CellInfo.ControlName).setValue(true);
		this.toasterService.resetToaster();
		this.toasterService.showToaster(ToastOptions.Error, 'UDFLinkedScreenValidation');
	}

	private handleInvalidRow(dataItem: IFormStructure) {
		dataItem.FormArray.at(magicNumber.zero).get(dataItem.CellInfo.ControlName).setValue(false);
		this.toasterService.resetToaster();
		this.toasterService.showToaster(ToastOptions.Error, 'UDFLinkedScreenValidation');
	}

	private validateAppliesToRow(dataItem: IFormStructure): boolean {
		let isValid = true;
		const serialNo = dataItem.CellInfo.Sr,
			entityLevel = dataItem.CellInfo.EntityLevel;

		this.listViewRowsInfo.forEach((item: IListViewRows) => {
			if (isValid && item.MultipleSelectionAllowedAtSameLevel === false &&
				entityLevel === item.EntityLevel && item.Sr !== serialNo &&
				item.ColumnName === this.listViewColumnInfo[1].Name) {
				isValid = !this.listViewData[item.ControlName];
			}
		});
		if (!isValid) {
			dataItem.FormArray.at(magicNumber.zero)
				.get(dataItem.CellInfo.ControlName).setValue(false);
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Error, 'UDFLinkedScreenLevelValidation');

		}
		return isValid;
	}

	private deselectRow(rowNo: number) {
		const index = this.listViewSelectedRows.findIndex((item: number) =>
			item == rowNo);
		if (index !== Number(magicNumber.minusOne)) {
			this.listViewSelectedRows.splice(index, magicNumber.one);
		}
	}

	private getNearestAppliedScreen(rowNo: number, selectedRowData: IDropdown[]) {
		if (selectedRowData.length <= Number(magicNumber.zero)) return;
		let result = null;

		for (let i = rowNo - magicNumber.one; i > Number(magicNumber.zero); i--) {
			const item = this.listViewRowsInfo.filter((x: IListViewRows) =>
					x.RowNo == i),
				isApplied = this.listViewData[item[magicNumber.one].ControlName],
				isExists = selectedRowData.filter((x: IDropdown) =>
					x.Value == item[magicNumber.zero].LinkedScreenId);
			if (isApplied && isExists.length > Number(magicNumber.zero)) {
				result = isExists;
				break;
			}
		}

		if (result == null) {
			const isExists = selectedRowData.filter((x: IDropdown) =>
				x.Value == this.selectedBaseScreen.Value as unknown as number);
			if (isExists.length > Number(magicNumber.zero)) result = isExists;
		}

		return result;
	}

	public getListViewData(dataItems: IListViewData) {
		this.listViewData = dataItems.value['Fields'][magicNumber.zero];
		this.listViewForm = dataItems.formArray;
		if (this.uKey != null && this.appliesToNotTriggred == Number(magicNumber.zero)) {
			const rowCountSet = new Set<number>();

			for (const item of dataItems.CellInfo) {
				if (item.ControlType === "switch" && item.DefaultValue === true) {
					if (item.RowNo !== undefined) {
						rowCountSet.add(item.RowNo);
					  }
				}
			}

			this.listViewSelectedRows = Array.from(rowCountSet);

		}
	}

	private manageListViewParentScreenData() {
		this.listViewRowsInfo.map((item: IListViewRows) => {
			if (item.ColumnName == this.listViewColumnInfo[magicNumber.two].Name) {
				item.Data = this.getParentData(item.RowNo);
			}
		});
	}

	private getParentData(rowNo: undefined | number) {
		let data: IDropdown[] = [],
			selectedScreens: IDropdown[] = [];
		selectedScreens = [
			...selectedScreens,
			{ Text: this.selectedBaseScreen.Text, Value: parseInt(this.selectedBaseScreen.Value) }
		];

		this.listViewRowsInfo.map((item: IListViewRows) => {
			if (item.RowNo !== undefined && rowNo !== undefined
				&& item.RowNo < rowNo && item.ColumnName == this.listViewColumnInfo[magicNumber.one].Name) {
				const isApplied = this.listViewData[item.ControlName];
				if (isApplied)
					selectedScreens = [
						...selectedScreens,
						{ Text: item.LinkedScreenName ?? '', Value: item.LinkedScreenId ?? magicNumber.zero }
					];
			}
		});
		const parentItem = this.actualListViewRowsInfo.find((x: IListViewRows) =>
			x.RowNo == rowNo && x.ColumnName == this.listViewColumnInfo[magicNumber.two].Name);
		if (parentItem == null) return data;

		parentItem.LinkedParent?.map((item: ILinkedParent) => {
			const result = selectedScreens.find((x: IDropdown) =>
				x.Value == item.ParentId);
			if (result != undefined)
				data = [...data, result];
		});

		return data;
	}

	private getFinalLinkedScreenData() {
		const count = this.listViewRowsInfo.length / this.listViewColumnInfo.length;
		let linkedScreenData: ILinkedScreens[] = [];

		for (let rowNo = magicNumber.one; Number(rowNo) <= count; rowNo++) {
			const item = this.filterRowsByRowNo(rowNo);

			if (this.listViewData[item[magicNumber.one].ControlName]) {
				const parentEntityIds = this.getParentEntityIds(item),
					record = this.createRecordObject(item, parentEntityIds);
				linkedScreenData = [...linkedScreenData, record];
			}
		}
		return linkedScreenData;
	}

	private filterRowsByRowNo(rowNo: number) {
		return this.listViewRowsInfo.filter((x: IListViewRows) =>
			x.RowNo == rowNo);
	}

	private getParentEntityIds(item: IListViewRows[]) {
		let parentEntityIds: { parentXrmEntityId: number }[] = [];
		const isMultipleParentAllowed = item[magicNumber.two].ControlType == "multiselect_dropdown";

		if (this.listViewData[item[magicNumber.two].ControlName] != null &&
			this.listViewData[item[magicNumber.one].ControlName] != undefined) {
			if (isMultipleParentAllowed) {
				parentEntityIds = this.listViewData[item[magicNumber.two].ControlName].map((x: IDropdown) =>
					({ parentXrmEntityId: x.Value }));
			} else {
				parentEntityIds = [{ parentXrmEntityId: parseInt(this.listViewData[item[magicNumber.two].ControlName].Value) }];
			}
		}
		return parentEntityIds;
	}

	private createRecordObject(item: IListViewRows[], parentEntityIds: { parentXrmEntityId: number }[]): ILinkedScreens {
		const isMultipleParentAllowed = item[magicNumber.two].ControlType === "multiselect_dropdown";

		return {
			id: item[magicNumber.zero].Id ?? magicNumber.zero,
			linkedEntityId: item[magicNumber.zero].LinkedScreenId ?? magicNumber.zero,
			appliesTo: this.listViewData[item[magicNumber.one].ControlName],
			multipleParentAllowed: isMultipleParentAllowed,
			parentXrmEntityDto: parentEntityIds,
			visibleToListDto: this.listViewData[item[magicNumber.three].ControlName] == null
				? []
				: this.listViewData[item[magicNumber.three].ControlName].map((x: IDropdown) =>
					({ userGroupId: x.Value })),
			editingAllowedByListDto: this.listViewData[item[magicNumber.four].ControlName] == null
				? []
				: this.listViewData[item[magicNumber.four].ControlName].map((x: IDropdown) =>
					({ userGroupId: x.Value }))
		};
	}

	private setListViewDefaultDataOnUpdate() {
		this.udfData.BaseScreen.LinkedScreen.map((x: ILinkedScreensOnEdit) => {
			const item = this.listViewRowsInfo.filter((y: IListViewRows) =>
				y.LinkedScreenId == x.LinkedScreenId);
			item[magicNumber.one].DefaultValue = x.AppliesTo;

			item[magicNumber.two].IsDisable = false;
			item[magicNumber.two].Data = x.LinkedParent?.map((items: ILinkedParent) =>
				 { return { Text: items.ParentName, Value: items.ParentId }; });
			item[magicNumber.two].DefaultValue = item[magicNumber.two].MultipleParentAllowed
				? item[magicNumber.two].Data
				: item[`2`].Data?.[magicNumber.zero];

			item[magicNumber.three].IsDisable = false;
			item[magicNumber.three].Data = this.listVisibleTo;
			item[magicNumber.three].DefaultValue = x.VisibleTo?.map((data: IDropDownList) =>
				({
					Text: data.Name,
					Value: data.Id
				}));

			item[magicNumber.four].IsDisable = this.addEditUDFForm.get('IsViewOnly')?.value;
			item[magicNumber.four].DefaultValue = x.EditingAllowedBy?.map((data: IDropDownList) =>
				({
					Text: data.Name,
					Value: data.Id
				}));
		});
	}

	private updateValidatorsOnControl(isApplied: boolean) {
		const nameControl = this.addEditUDFForm.controls['PredefinedLists'],
			controlList: AbstractControl[] = [nameControl];

		if (isApplied) {
			this.addEditUDFForm.controls['PredefinedLists'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'PickList', IsLocalizeKey: true }]));
		} else {
			this.customValidators.RemoveCascadeRequiredValidator(controlList);
		}
	}

	public onViewOnlyChanged(isViewOnly: boolean) {
		this.customValidators.RemoveCascadeRequiredValidator([this.addEditUDFForm.controls['EditingAllowedBy']]);
		if (!isViewOnly) {

			this.addEditUDFForm.controls['EditingAllowedBy'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'EditingAllowedBy', IsLocalizeKey: true }]));
		}

		this.addEditUDFForm.get("EditingAllowedBy")?.setValue(null);
		this.addEditUDFForm.get("IsMandatory")?.setValue(false);
		this.selectedEditAllowedBy = [];

		this.listViewRowsInfo.map((item: IListViewRows) => {
			const controlName = `${item.ControlName.slice(magicNumber.zero, magicNumber.minusOne)}2`,
				isApplied = this.listViewData[controlName];
			if (item.ColumnName == this.listViewColumnInfo[magicNumber.four].Name && isApplied) {
				item.IsDisable = isViewOnly;
				if (isViewOnly) {
					this.listViewForm?.at(magicNumber.zero).get(item.ControlName)?.setValue(null);
					this.listViewForm?.at(magicNumber.zero).get(item.ControlName)?.clearValidators();
				}
				else {
					this.listViewForm?.at(magicNumber.zero).get(item.ControlName)
						?.setValue(this.selectedEditAllowedBy);
					this.listViewForm?.at(magicNumber.zero).get(item.ControlName)
						?.setValidators([this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.listViewColumnInfo[5].Name, IsLocalizeKey: true }])]);
				}
				this.listViewForm?.at(magicNumber.zero).get(item.ControlName)
					?.updateValueAndValidity();
			}
		});

		this.handleFieldTypeId(isViewOnly);
	}

	public onMandatoryChange(isMandatory: boolean) {
		const minLengthControl = this.addEditUDFForm.controls['MinLength'],
		 requiredValidator = this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'SegmentMinLength', IsLocalizeKey: true }]),
		 fiedType = this.addEditUDFForm.get('FieldType')?.value.Value,
		 zeroMinLengthValidator = this.minLengthCannotBeZeroValidator();
		if (isMandatory && (fiedType == UDFFieldTypes.Textbox || fiedType == UDFFieldTypes.MultiTextBox) ) {
		  minLengthControl.addValidators([requiredValidator, zeroMinLengthValidator]);
		} else {
			minLengthControl.clearValidators();
			minLengthControl.addValidators(this.minLengthValidator);
			minLengthControl.markAsUntouched();
		}
		minLengthControl.updateValueAndValidity();
	  }

	  private minLengthCannotBeZeroValidator(validationMessage: string = 'Min length cannot be zero'): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
		  if (control.value === magicNumber.zero) {
				return {
			  error: true,
			  message: validationMessage
				};
		  }
		  return null;
		};
	  }

	private handleFieldTypeId(isViewOnly: boolean) {
		const fieldTypeId = this.uKey
			? this.selectedFieldTypeId
			: this.addEditUDFForm.get('FieldType')?.value.Value;

		if (fieldTypeId == null) return;
		if (fieldTypeId <= magicNumber.two) {
			this.handleValidation('DefaultValue', 'PleaseEnterData', isViewOnly);
		} else if (fieldTypeId == magicNumber.three) {
			this.handleValidation('DefaultPredefinedList', 'PleaseSelectData', isViewOnly);
		}
	}

	private handleValidation(controlName: string, errorMessageKey: string, isViewOnly: boolean) {
		const control = this.addEditUDFForm.get(controlName);
		if (!control) return;

		if (isViewOnly) {
			control.addValidators(this.customValidators.RequiredValidator(errorMessageKey, [{ Value: controlName, IsLocalizeKey: true }]));
		} else {
			this.customValidators.RemoveCascadeRequiredValidator([control]);
		}
		control.updateValueAndValidity();
	}

	public onIsNumericChange(isNumeric: boolean) {
		this.isNumericDefaultValue = isNumeric;
		this.addEditUDFForm.get("DefaultValue")?.setValue(null);
		this.addEditUDFForm.get("MinLength")?.setValue(null);
		this.addEditUDFForm.get("MaxLength")?.setValue(null);
		this.setMaxMinLength();
	}

	public getSelectedSectors(dataItem: ITreeNode[]) {
		this.sowKeyClicked = true;
		this.selectedSectors.length = magicNumber.zero;
		if (this.uKey != null) {
			this.listSectors.forEach((secDt: ISectorDropdown) => {
				if (secDt.IsSelected) {
					this.selectedSectors.push({ id: Number(secDt.Value), text: secDt.Text });
				}
			});
		}

		for (const element of dataItem) {
			const itemIndex = this.selectedSectors.findIndex((x: ISelectedSector) =>
				x.id == Number(element.item.dataItem.Value));
			if (element.checked && itemIndex !== Number(magicNumber.minusOne)) {
				continue;
			}
			if (!element.checked && itemIndex !== Number(magicNumber.minusOne)) {
				this.selectedSectors.splice(itemIndex, magicNumber.one);
				continue;
			}
			if (!element.checked) {
				continue;
			}
			this.selectedSectors.push({
				id: Number(element.item.dataItem.Value),
				text: element.item.dataItem.Text
			});
		}
		this.oldSelectedSector.length = magicNumber.zero;
	}

	public onVisibleToChange(dataItem: IDropdown[]) {
		this.selectedVisibleTo = dataItem;
		this.addEditUDFForm.get("EditingAllowedBy")?.reset();
	}

	public onEditingAllowedByChange(dataItem: IDropdown[]) {
		this.selectedEditAllowedBy = dataItem;
	}

	private prepareUdfData(): IUdfConfiguration {
		const pickListItem = this.addEditUDFForm.get('PredefinedLists')?.value == null
				? null
				: this.addEditUDFForm.get('PredefinedLists')?.value?.Value,
			visibleTo = this.addEditUDFForm.get("VisibleTo")?.value == null
				? []
				: this.addEditUDFForm.get("VisibleTo")?.value.map((item: IDropdown) => { return { userGroupId: item.Value }; }),
			editingAllowedBy = this.addEditUDFForm.get("EditingAllowedBy")?.value == null
				? []
				: this.addEditUDFForm.get("EditingAllowedBy")?.value.map((item: IDropdown) => { return { userGroupId: item.Value }; }),
			defaultValue = this.isPickListVisible
				? this.addEditUDFForm.get("DefaultPredefinedList")?.value?.Value
				: this.addEditUDFForm.get('DefaultValue')?.value,
			linkScreenData = this.getFinalLinkedScreenData();
		return {
			fieldTypeId: this.addEditUDFForm.get('FieldType')?.value.Value,
			labelText: this.addEditUDFForm.get('LabelText')?.value.trim(),
			isNumeric: this.addEditUDFForm.get('IsNumeric')?.value,
			minLength: this.addEditUDFForm.get('MinLength')?.value,
			maxLength: this.addEditUDFForm.get('MaxLength')?.value,
			defaultValue: defaultValue,
			predefinedListId: pickListItem,
			minDate: this.datePipe.transform(this.addEditUDFForm.get('MinDate')?.value, 'yyyy-MM-dd'),
			maxDate: this.datePipe.transform(this.addEditUDFForm.get('MaxDate')?.value, 'yyyy-MM-dd'),
			isMandatory: this.addEditUDFForm.get('IsMandatory')?.value,
			isViewOnly: this.addEditUDFForm.get('IsViewOnly')?.value,
			isStoreAsEncrypeted: this.addEditUDFForm.get('IsStoreAsEncrypeted')?.value,
			isAppliesToAllSectors: this.addEditUDFForm.get("IsAppliesToAllSectors")?.value,
			tooltipText: this.addEditUDFForm.get("ToolTipText")?.value,
			visibleToList: visibleTo,
			editingAllowedByList: editingAllowedBy,
			baseScreenTypeId: this.selectedBaseScreen.Value,
			linkedScreens: linkScreenData
		};
	}

	private saveOrUpdateData(data: IUdfConfiguration) {
		if (!this.addEditUDFForm.valid) return;
		if (!this.listViewForm?.valid && this.listViewForm) return;
		if (this.uKey == null) {
			let addData: IUdfConfiguration;
			if (this.addEditUDFForm.get("IsAppliesToAllSectors")?.value) {
				addData = {
					...data,
					appliesToAllSectorList: []
				};
			} else {
				addData = {
					...data,
					appliesToAllSectorList: this.selectedSectors.map((item: ISelectedSector) =>
						({
							sectorId: item.id,
							sectorName: item.text
						})) as IAppliesToAllSectorList[]
				};
			}
			this.saveUdfConfiguration(addData);
		} else {
			this.updateUdfConfiguration(data);
			this.addEditUDFForm.markAsPristine();
			this.listViewForm?.markAsPristine();
			this.sowKeyClicked = false;
		}
	}

	public confirmToSubmitForm() {
		this.listViewForm?.markAllAsTouched();
		this.addEditUDFForm.markAllAsTouched();
		if (this.uKey == null) {
			if (!this.addEditUDFForm.get('IsAppliesToAllSectors')?.value && this.selectedSectors.length == Number(magicNumber.zero)) {
				this.toasterService.resetToaster();
				this.toasterService.showToaster(ToastOptions.Error, 'PleaseSelectOneSector');
				return;
			}
		} else if (!this.addEditUDFForm.get('IsAppliesToAllSectors')?.value && this.selectedSectors.length == Number(magicNumber.zero) && this.oldSelectedSector.length == Number(magicNumber.zero)) {
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Error, 'PleaseSelectOneSector');
			return;
		}
		this.saveData();
	}

	private saveData(): void {
		const data = this.prepareUdfData();
		if (this.isValidUdfData(data)) {
			this.saveOrUpdateData(data);
		}
	}

	private isValidUdfData(data: IUdfConfiguration): boolean {
		if (!this.isEditingAllowedInVisibleList(data.editingAllowedByList, data.visibleToList)) {
			if(!data.isViewOnly){
				this.addEditUDFForm.get('EditingAllowedBy')?.setErrors({error: true});
				this.addEditUDFForm.updateValueAndValidity();
			}
			this.toasterService.showToaster(ToastOptions.Error, 'UserGroupMisMatch');
			return false;
		}

		for (const screen of data.linkedScreens) {
			if (!this.isEditingAllowedInVisibleList(screen.editingAllowedByListDto, screen.visibleToListDto)) {
				this.getInvalidControl();
				this.toasterService.showToaster(ToastOptions.Error, 'UserGroupMisMatch');
				return false;
			}
		}

		return true;
	}

	private isEditingAllowedInVisibleList(
		editingAllowedByList: { userGroupId: number }[],
		visibleToList: { userGroupId: number }[]
	): boolean {
		const visibleToSet = new Set(visibleToList.map((user) =>
			 user.userGroupId));
		return editingAllowedByList.every((user) =>
			 visibleToSet.has(user.userGroupId));
	}

	private getInvalidControl(): void {
		const controls = this.listViewForm?.controls[magicNumber.zero].controls;
		for (const controlName in controls) {
		  if (Object.hasOwn(controls, controlName) && controlName.endsWith('2')) {
				const controlValue = controls[controlName].value;
				if (controlValue === true) {
			  this.validateControl(controlName, controls);
				}
		  }
		}
	  }

	private validateControl(controlName: string, controls: Record<string, AbstractControl>): void {
		const baseName = controlName.slice(magicNumber.zero, magicNumber.minusOne),
			controlName4 = `${baseName}4`,
			controlName5 = `${baseName}5`;

		if (Object.hasOwn(controls, controlName4) && Object.hasOwn(controls, controlName5)) {
			const controlValue4 = controls[controlName4].value,
				controlValue5 = controls[controlName5].value,
				missingObjects = controlValue5.filter((item5: { Text: string; Value: number }) =>
					!controlValue4.some((item4: { Text: string; Value: number }) =>
						item4.Value === item5.Value));

			if (missingObjects.length > magicNumber.zero) {
				this.listViewForm?.at(magicNumber.zero).get(controlName5)?.setErrors({ error: true });
				this.listViewForm?.updateValueAndValidity();
			} else {
				controls[controlName5].setErrors(null);
			}
			this.listViewForm?.updateValueAndValidity();
		}
	}

	private saveUdfConfiguration(data: IUdfConfiguration) {
		this.userDefinedFieldsService.SubmitUdfConfiguration(data).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: ApiResponseBase) => {
				if (!res.Succeeded && res.Message) {
					this.toasterService.resetToaster();
					return this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
				this.localizationService.Refresh();
				this.toasterService.resetToaster();
				this.commonService.resetAdvDropdown(this.entityId);
				this.toasterService.showToaster(ToastOptions.Success, 'UdfAddedSuccessfully');
				this.isAdded = true;
				this.backToList();
			});
	}

	private updateUdfConfiguration(data: IUdfConfiguration) {
		if (this.uKey === null) {
			return;
		}
		if (!data.isAppliesToAllSectors) {
			data.appliesToAllSectorList =
				this.selectedSectors.length == Number(magicNumber.zero)
					? this.oldSelectedSector.map((item: ISelectedSector) => { return { sectorId: item.id }; })
					: this.selectedSectors.map((item: ISelectedSector) => { return { sectorId: item.id }; });
		} else {
			data.appliesToAllSectorList = [];
		}
		this.userDefinedFieldsService.updateUdfConfiguration(this.uKey, data)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: ApiResponseBase) => {
				if (!res.Succeeded && res.Message) {
					this.toasterService.resetToaster();
					return this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
				this.localizationService.Refresh();
				this.toasterService.resetToaster();
				this.commonService.resetAdvDropdown(this.entityId);
				this.toasterService.showToaster(ToastOptions.Success, 'UdfAddedSuccessfully');

			});
	}

	private maxLengthValidator(control: AbstractControl) {
		const minLength = control.parent?.get('MinLength')?.value,
			maxLength = control.parent?.get('MaxLength')?.value,
			recordExist = control.parent?.get('RecordExist')?.value,
			previousMaxValue = control.parent?.get('UDFMaxLen')?.value,
			previousMinLength = control.parent?.get('UDFMinLen')?.value;

		if (maxLength == null) return null;
		if (recordExist) {
			if (maxLength < previousMaxValue) return { error: true, message: 'Maxlencannotbelessthanthepreviousmaxlen' };
			if (minLength > previousMinLength) control.parent.get('MinLength')?.setErrors({ error: true, message: 'Minlencannotbegreaterthanthepreviousminlen' });
		}
		if (maxLength === magicNumber.zero) return { error: true, message: 'UdfMaxLengthNotZero' };
		if (minLength == null || minLength === magicNumber.zero) return null;
		if (minLength > maxLength) return { error: true, message: 'UdfMaxLengthValidation' };

		control.parent?.get('MinLength')?.setErrors(null);
		control.parent?.get('MaxLength')?.setErrors(null);

		return null;
	}

	private minLengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
		const minLength = control.parent?.get('MinLength')?.value,
		  maxLength = control.parent?.get('MaxLength')?.value,
		  defaultValue = control.parent?.get('DefaultValue')?.value,
		  recordExist = control.parent?.get('RecordExist')?.value,
		  previousMinLength = control.parent?.get('UDFMinLen')?.value,
		  previousMaxLength = control.parent?.get('UDFMaxLen')?.value;

		if (minLength == null || minLength === magicNumber.zero) return null;
		if (maxLength == null) return null;
		if (minLength < magicNumber.zero) return { error: true, message: 'Minlencannotbenegative' };

		if (recordExist) {
		  if (minLength > previousMinLength) return { error: true, message: 'Minlencannotbegreaterthanthepreviousminlen' };
		  if (maxLength < previousMaxLength) control.parent.get('MaxLength')?.setErrors({ error: true, message: 'Maxlencannotbelessthanthepreviousmaxlen' });
		}

		if (minLength > maxLength) return { error: true, message: 'UdfMinLengthValidation' };
		if (defaultValue == null || defaultValue == "") return null;

		if (defaultValue.length < minLength) {
		  control.parent?.get('DefaultValue')?.setErrors({ error: true, message: 'Default value length must be at least the min length' });
		  return null;
		}

		return null;
	  };


	private defaultValueValidator(control: AbstractControl) {
		const value = control.value;
		let minLength = control.parent?.get('MinLength')?.value,
			maxLength = control.parent?.get('MaxLength')?.value,
			valLen = magicNumber.zero;
		if (typeof value === 'number') {
			valLen = value.toString().length;
		} else if (typeof value === 'string') {
			valLen = value.length;
		}

		if (value == undefined || value == null || valLen == magicNumber.zero) return null;
		if (minLength == undefined || minLength == null) minLength = magicNumber.zero;
		if (maxLength == undefined || maxLength == null) maxLength = magicNumber.zero;
		if (valLen < minLength) return { error: true, message: 'DefaultValueLengthValidation' };
		if (valLen > maxLength) return { error: true, message: 'DefaultValueLengthValidation' };
		return null;
	}

	public onDecline() {
		this.status = "declined";
		this.closeDialog();
	}

	public onPreviewAccept() {
		this.status = "accepted";
		this.previewCloseDialog();
	}

	private previewCloseDialog() {
		this.isPreviewVisible = false;
	}

	private closeDialog() {
		this.isPreviewVisible = false;
	}

	public openPopupPredefinedlist() {
		this.toasterService.resetToaster();
		this.userDefinedFieldsPickListService.openDialogList();
	}

	public onPreviewClick() {
		this.isPreviewVisible = true;
		switch (this.field) {
			case "1":
				this.previewForm.controls['TextBox'].setValue(this.addEditUDFForm.controls['DefaultValue'].value);
				break;
			case "2":
				this.previewForm.controls['TextBox'].setValue(this.addEditUDFForm.controls['DefaultValue'].value);
				break;
			case "3":
				this.previewForm.patchValue({
					DropDown: this.addEditUDFForm.controls['DefaultPredefinedList'].value.Value
				});
				break;
			default:
				return;
		}
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		if (!this.isAdded) {
			this.toasterService.resetToaster();
		}
	}
}
