import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDefinedFieldsService } from '../services/user-defined-fields.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IFieldType, IListViewRow, IUdfData } from '@xrm-core/models/user-defined-field-config/udf-config-view.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IAppliesToSectorList, IDropDownList, IDropdown, ILinkedParent, ILinkedScreen, IPickListTypeItem, IPredefined } from '@xrm-core/models/user-defined-field-config/udf-config-common.model';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent implements OnInit, OnDestroy {
	public previewForm: FormGroup;
	private preFix: string = "item";
	public status: string = "not open";
	public udfData: IUdfData;
	public fieldtype: IFieldType;
	private udfVisibleTo: IDropDownList[];
	private udfEditingAllowedBy: IDropDownList[];
	public linkedScreenGridRows: IListViewRow[] = [];
	public pickList:IDropdown[] = [];
	public sectordata: IDropdown[];
	public previewDialogOpen: boolean = false;
	public dialogOpen: boolean = false;
	public visibleChecked: boolean = false;
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
			Span: magicNumber.two
		},
		{
			Name: 'ParentScreen',
			Span: magicNumber.three
		},
		{
			Name: 'VisibleTo',
			Span: magicNumber.two
		},
		{
			Name: 'EditingAllowedBy',
			Span: magicNumber.two
		}

	];

	// eslint-disable-next-line max-params
	constructor(
		public route: Router,
		private cd: ChangeDetectorRef,
		private formBuilder: FormBuilder,
		private userDefinedFieldsService: UserDefinedFieldsService,
		private activatedRoute: ActivatedRoute,
		private localizationService: LocalizationService,
		public dialogPopup: DialogPopupService,
		private toasterService: ToasterService
	) {
		this.initalizePreviewForm();
	}

	private initalizePreviewForm(){
		this.previewForm = this.formBuilder.group({
			TextBox: [null],
			TextArea: [null],
			DropDown: [null],
			DatePicker: [null]
		});
	}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			this.loadUDFData(param["uKey"], param["fieldTypeId"]);
		});
	}

	private loadUDFData(id: string, fieldTypeId: number) {
		const requestBody = this.createRequestBody(id, fieldTypeId);

		this.userDefinedFieldsService.GetUDFPreloadData(requestBody).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (response: GenericResponseBase<IUdfData>) => {
				if (!response.Succeeded || !response.Data) {
					return;
				}
				this.handleUDFResponse(response.Data);
				this.cd.detectChanges();
			}
		});
	}

	private createRequestBody(id: string, fieldTypeId: number) {
		return {
			udfConfigId: magicNumber.zero,
			udfConfigUkey: id,
			fieldTypeId: fieldTypeId,
			actionTypeId: magicNumber.three,
			baseScreenId: magicNumber.zero
		};
	}

	private handleUDFResponse(data: IUdfData): void {
		this.udfData = data;
		this.fieldtype = this.transformDateFields(data.FieldType);
		this.udfVisibleTo = data.FieldType.VisibleToList;
		this.udfEditingAllowedBy = data.FieldType.EditingAllowedByList;
		this.pickList = this.getPickList(data.FieldType.PredefinedList);
		this.sectordata = this.getSectorData(data.FieldType);
		this.linkedScreenGridRows = this.generateLinkedScreenRows(data.BaseScreen.LinkedScreen);
		this.updateSharedDataSubject(data);
	}

	private getPickList(predefinedList: IPredefined[] | null) {
		return predefinedList
			? this.transformPickListItems(predefinedList[magicNumber.zero]?.PickListTypeItems ?? [])
			: [];
	}

	private getSectorData(fieldType: IFieldType) {
		return !fieldType.IsAppliesToAllSector
			? fieldType.AppliesToAllSectorList.map((item: IAppliesToSectorList) =>
				({
					Text: item.SectorName,
					Value: item.SectorId
				}))
			: [];
	}

	private updateSharedDataSubject(details: IUdfData): void {
		this.userDefinedFieldsService.sharedDataSubject.next({
			Disabled: details.FieldType.Disabled,
			UdfConfigId: details.FieldType.UdfConfigId,
			UdfConfigCode: details.FieldType.Code
		});
	}

	public getDropdownDefaultValue(): string {
		const fieldType = this.udfData.FieldType;
		if (fieldType.PredefinedList && fieldType.PredefinedList.length > Number(magicNumber.zero)) {
			const defaultValueId = parseInt(fieldType.DefaultValue),
			 matchingItem = fieldType.PredefinedList[magicNumber.zero].PickListTypeItems.find((item: { Id: number; }) =>
				 item.Id === defaultValueId);
			if (matchingItem) {
				return matchingItem.Name;
			}
		}
		return '';
	}

	public getVisibleTo(): string {
		return this.udfVisibleTo.map((v: { Name: string; }) =>
			 v.Name).join(', ');
	}

	public getEditingAllowedBy(): string {
		return this.udfEditingAllowedBy.map((v: { Name: string; }) =>
			 v.Name).join(', ');
	}

	private transformDateFields(data: IFieldType) {
		data.MinDate = this.localizationService.TransformDate(data.MinDate);
		data.MaxDate = this.localizationService.TransformDate(data.MaxDate);
		return data;
	}

	public generateLinkedScreenRows(linkedScreens: ILinkedScreen[]): IListViewRow[] {
		const linkedScreensRowData: IListViewRow[] = [];
		let rowNo = magicNumber.one;
		linkedScreens.forEach((item) => {
			const prefix = `${this.preFix}${item.LinkedScreenId}`,
				levelRow: IListViewRow = this.createLevelRow(prefix, item.EntityLevel),
				nameRow: IListViewRow = this.createNameRow(prefix, item.LinkedScreenName),
				appliesToRow: IListViewRow = this.createAppliesToRow(prefix, item.AppliesTo),
				linkedParentRow: IListViewRow = this.createLinkedParentRow(prefix, item.LinkedParent),
				visibleToRow: IListViewRow = this.createVisibleToRow(prefix, item.VisibleTo),
				editingAllowedByRow: IListViewRow = this.createEditingAllowedByRow(prefix, item.EditingAllowedBy);

			rowNo++;
			linkedScreensRowData.push(levelRow, nameRow, appliesToRow, linkedParentRow, visibleToRow, editingAllowedByRow);
		});

		return linkedScreensRowData;
	}

	private createLevelRow(prefix: string, entityLevel: number): IListViewRow {
		return {
			ControlName: `${prefix}0`,
			ControlType: "label",
			DefaultValue: `Level - ${entityLevel}`,
			Span: magicNumber.one,
			IsReadOnly: true
		};
	}

	private createNameRow(prefix: string, linkedScreenName: string): IListViewRow {
		return {
			ControlName: `${prefix}1`,
			ControlType: "label",
			DefaultValue: linkedScreenName,
			Span: magicNumber.two,
			IsReadOnly: true
		};
	}

	private createAppliesToRow(prefix: string, appliesTo: boolean): IListViewRow {
		return {
			ControlName: `${prefix}2`,
			ControlType: "switch",
			DefaultValue: appliesTo,
			Span: magicNumber.two,
			IsReadOnly: true,
			OffLabel: 'No',
			OnLabel: 'Yes'
		};
	}

	private createLinkedParentRow(prefix: string, linkedParent: ILinkedParent[]): IListViewRow {
		return {
			ControlName: `${prefix}3`,
			ControlType: "multiselect_dropdown",
			DefaultValue: linkedParent.map((parent: ILinkedParent) =>
				 ({ Text: parent.ParentName, Value: parent.ParentId })),
			Data: [],
			Span: magicNumber.three,
			IsReadOnly: true
		};
	}

	private createVisibleToRow(prefix: string, visibleTo: IDropDownList[]): IListViewRow {
		return {
			ControlName: `${prefix}4`,
			ControlType: "multiselect_dropdown",
			DefaultValue: visibleTo.map((val: IDropDownList) =>
				 ({ Text: val.Name, Value: val.Id })),
			Data: [],
			Span: magicNumber.two,
			IsDisable: true,
			IsReadOnly: true
		};
	}

	private createEditingAllowedByRow(prefix: string, editingAllowedBy: IDropDownList[]): IListViewRow {
		return {
			ControlName: `${prefix}5`,
			ControlType: "multiselect_dropdown",
			DefaultValue: editingAllowedBy.map((val: IDropDownList) =>
				 ({ Text: val.Name, Value: val.Id })),
			Data: [],
			Span: magicNumber.two,
			IsReadOnly: true
		};
	}

	public onDecline() {
		this.status = "declined";
		this.dialogOpen = false;
	}

	public onPreviewAccept() {
		this.status = "accepted";
		this.previewDialogOpen = false;
	}

	private transformPickListItems(pickListTypeItems: IPickListTypeItem[]) {
		return pickListTypeItems.map((item: { Id: number; Name: string; }) =>
			 ({
				Value: item.Id,
				Text: item.Name
			}));
	}

	onPreviewClick(){
		this.previewDialogOpen = true;
		switch (this.udfData.FieldTypeId) {
			case magicNumber.one:
				this.previewForm.controls['TextBox'].setValue(this.udfData.FieldType.DefaultValue);
				break;
			case magicNumber.two:
				this.previewForm.controls['TextBox'].setValue(this.udfData.FieldType.DefaultValue);
				break;
			case magicNumber.three:
				this.previewForm.patchValue({
					DropDown: {Value: Number(this.udfData.FieldType.DefaultValue)}
				});
				break;
			default:
				return;
		}
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		this.toasterService.resetToaster();
	}
}

