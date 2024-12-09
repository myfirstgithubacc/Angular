import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { DocumentConfigurationService } from '../services/document-configuration.service';
import { NavigationPaths } from '../constant/routes-constant';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { IColumnConfig, IDmsSectorDitails, IDocumentConfiguration, IDocumentConfigurationResponse, IDocumentConfigurationSector,
	     IDocumentConfigurationSectorDtos, IDropDownDataResponse, IWorkflowDto } from '@xrm-core/models/document-configuration/document-configuration.model';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CommonService } from '@xrm-shared/services/common.service';
import { IDropdownOption } from '@xrm-shared/models/common.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { dropdownWithExtras } from '@xrm-core/models/dropdown.model';
import { OutputParams } from '@xrm-shared/models/list-view.model';

import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class AddEditComponent implements OnInit, OnDestroy {
	@ViewChild('configureBySectorListView', { static: false }) configureBySectorListView: ListViewComponent;
	public AddEditDocumentConfigurationForm: FormGroup;
	private listViewFormArray: FormArray;
	private entityID = XrmEntities.DocumentUploadConfiguration;
	public countryId: number;
	private uKey: string;
	public isEditMode: boolean = false;
	private isAdded = false;
	public uplodedStageList: IDropdownOption[] = [];
	public visibleToList: IDropdownOption[] = [];
	public workflowList: IDropdownOption[] = [];
	public allowedExtList: IDropdownOption[] = [];
	private documentConfigurationSectorDtos: IDocumentConfigurationSector[] = [];
	public configureBySectorPrefilledData: IDocumentConfigurationSector[] = [];
	private documentConfigurationDetails: IDocumentConfigurationResponse|undefined;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	private previousFormState: boolean = false;
	public configureBySectorColumnConfiguration = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: 'ItemNumber',
		secondColumnName: 'Add More',
		deleteButtonName: 'Delete',
		noOfRows: magicNumber.zero,
		itemSr: true,
		itemLabelName: '',
		firstColumnColSpan: magicNumber.zero,
		lastColumnColSpan: magicNumber.zero,
		isAddMoreValidation: false
	};

	public configureBySectorColumn: IColumnConfig[] = [
		{
			colSpan: magicNumber.two,
			columnName: 'Sector Name',
			controls: [
				{
					controlType: 'text',
					controlId: 'sectorName',
					defaultValue: '',
					isEditMode: false,
					isDisable: false,
					placeholder: ''
				}
			]
		},

		{
			colSpan: magicNumber.two,
			columnName: 'Applies To',
			controls: [
				{
					controlType: 'switch',
					controlId: 'appliesTo',
					defaultValue: true,
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					offLabel: 'No',
					onLabel: 'Yes'
				}
			]
		},
		{
			colSpan: magicNumber.six,
			columnName: 'Visible To',
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'visibleTo',
					defaultValue: [],
					dataType: 'string',
					isEditMode: true,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: ['@'],
					specialCharactersNotAllowed: ['#'],
					placeholder: 'DdlSelect',
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'VisibleTo', IsLocalizeKey: true }])]
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'Mandatory',
			controls: [
				{
					controlType: 'switch',
					controlId: 'mandatory',
					defaultValue: false,
					isEditMode: true,
					placeholder: '',
					offLabel: 'No',
					onLabel: 'Yes'
				}
			]
		}
	];

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		public sectorService: SectorService,
		public documentConfigurationService: DocumentConfigurationService,
		private customValidators: CustomValidators,
		private activatedRoute: ActivatedRoute,
		private localizationService: LocalizationService,
		private widget: WidgetServiceService,
		private toasterService: ToasterService,
		private commonService: CommonService
	) {
		this.documentConfigurationFormInitialization();
	}

	ngOnInit(): void {
		this.listViewFormArray = this.AddEditDocumentConfigurationForm.controls['documentConfigurationSectorDtos'] as FormArray;
		this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.widget.updateForm.next(false);
		this.handleRouteParams();
		this.getAllDropdownData();
		this.toasterService.resetToaster();
	}

	private handleRouteParams(): void {
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			if (param['id']) {
				this.uKey = param['id'];
				this.isEditMode = true;
			}
		});
	}

	private getAllDropdownData() {
		forkJoin({
			documentWorkflow: this.documentConfigurationService.getDocumentWorkflowAndVisibleTo(),
			dmsType: this.documentConfigurationService.selectDMSTypeAndAllowedExt(),
			sectorData: this.sectorService.getSectorDropDownList()
		}).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (x: IDropDownDataResponse) => {
				this.patchCombinedDropdown(x);
				this.getSectorListData(x.sectorData);
			}
		});
	}

	private patchCombinedDropdown(data: IDropDownDataResponse) {
		if(data.documentWorkflow.ddlgetdocumentworkflow.Data && data.dmsType.selecttypenamefordmsExt.Data
			&& data.documentWorkflow.ddlgetdocumentvisibleto.Data && data.dmsType.selecttypefordmsStage.Data){
			this.uplodedStageList = this.swapTextAndTextLocalizedKey(data.dmsType.selecttypefordmsStage.Data);
			this.visibleToList = data.documentWorkflow.ddlgetdocumentvisibleto.Data;
			this.allowedExtList = data.dmsType.selecttypenamefordmsExt.Data;
			this.workflowList = data.documentWorkflow.ddlgetdocumentworkflow.Data;

			this.configureBySectorColumn.forEach((item: IColumnConfig) => {
				if (item.controls[magicNumber.zero].controlId == "visibleTo") {
					item.controls[magicNumber.zero].defaultValue = this.visibleToList;
				}
			});
		}
	}

	private swapTextAndTextLocalizedKey(array: IDropdownOption[]): IDropdownOption[] {
		return array.map((item) =>
			({
				...item,
				Text: this.localizationService.GetLocalizeMessage(item.TextLocalizedKey),
				TextLocalizedKey: item.Text
			}));
	}

	private documentConfigurationFormInitialization() {
		this.AddEditDocumentConfigurationForm = this.formBuilder.group({
			"documentTitle": [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'DocumentType', IsLocalizeKey: true }]), this.customValidators.MaxLengthValidator(magicNumber.hundred)]],
			"uploadedStage": [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'UploadedStage', IsLocalizeKey: true }])],
			"visibleTo": [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'VisibleTo', IsLocalizeKey: true }])],
			"documentConfigurationWorkflowDtos": [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Workflow', IsLocalizeKey: true }])],
			"allowedExtensions": [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'AllowedExtensions', IsLocalizeKey: true }])],
			"mandatory": [false],
			"multipleDocumentAllowed": [false],
			"resume": [false],
			"configurationBySector": [false],
			"documentConfigurationSectorDtos": this.formBuilder.array([])
		});
	}

	private getSectorListData(data: GenericResponseBase<dropdownWithExtras[]>): void {
		if (!data.Succeeded || !data.Data) {
			return;
		}

		this.configureBySectorPrefilledData = this.mapSectorData(data.Data);

		if (this.isEditMode) {
			this.getDocumentConfigurationById(this.uKey);
		}
	}

	private mapSectorData(sectors: dropdownWithExtras[]): IDocumentConfigurationSector[] {
		return sectors.map((element: dropdownWithExtras) =>
			({
				Id: element.Value,
				sectorName: element.Text,
				appliesTo: false,
				visibleTo: null,
				mandatory: false
			}));
	}

	private getDocumentConfigurationById(id: string): void {
		this.documentConfigurationService.getDocumentConfigurationById(id)
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: GenericResponseBase<IDocumentConfigurationResponse>) => {
				if (!data.Succeeded || !data.Data) {
					return;
				}

				this.documentConfigurationDetails = data.Data;
				this.patchDocumentConfigurationFormData(this.documentConfigurationDetails);
				this.updateSharedDataSubject(this.documentConfigurationDetails);
			});
	}

	private updateSharedDataSubject(details: IDocumentConfigurationResponse): void {
		this.documentConfigurationService.sharedDataSubject.next({
			Disabled: details.Disabled,
			DmsConfigId: details.Id,
			DmsConfigCode: details.Code
		});
	}

	private patchDocumentConfigurationFormData(documentConfigurationDetails: IDocumentConfigurationResponse) {
		this.AddEditDocumentConfigurationForm.patchValue({
			'documentTitle': this.getDocumentTitle(documentConfigurationDetails),
			'uploadedStage': this.getUploadedStage(documentConfigurationDetails),
			'visibleTo': this.getVisibleTo(documentConfigurationDetails),
			'documentConfigurationWorkflowDtos': this.getDocumentConfigurationWorkflowDtos(documentConfigurationDetails),
			'allowedExtensions': this.getAllowedExtensions(documentConfigurationDetails),
			'mandatory': documentConfigurationDetails.Mandatory,
			'multipleDocumentAllowed': documentConfigurationDetails.MultipleDocumentAllowed,
			'resume': documentConfigurationDetails.Resume,
			'configurationBySector': documentConfigurationDetails.ConfigurationBySector
		});
		this.onConfigurationBySectorChange(documentConfigurationDetails.ConfigurationBySector);
	}

	private getDocumentTitle(documentConfigurationDetails: IDocumentConfigurationResponse): string | null {
		return documentConfigurationDetails.DocumentTitle
			? documentConfigurationDetails.DocumentTitle.trim()
			: null;
	}

	private getUploadedStage(documentConfigurationDetails: IDocumentConfigurationResponse): IDropdownOption | null | undefined {
		return documentConfigurationDetails.UploadedStageId
			? this.uplodedStageList.find((list: IDropdownOption) =>
				 list.Value == documentConfigurationDetails.UploadedStageId)
			: null;
	}

	private getVisibleTo(documentConfigurationDetails: IDocumentConfigurationResponse): IDropdownOption | null | undefined {
		return documentConfigurationDetails.DocumentConfigurationVisibleTo.length > Number(magicNumber.zero)
			? this.visibleToList.find((data: IDropdownOption) =>
				 data.Value == documentConfigurationDetails.DocumentConfigurationVisibleTo[magicNumber.zero].Id)
			: null;
	}

	private getDocumentConfigurationWorkflowDtos(documentConfigurationDetails: IDocumentConfigurationResponse):
	 { Text: string, Value: string }[] | null {
		return documentConfigurationDetails.DocumentConfigurationWorkflowGetAllDtos.length
			? documentConfigurationDetails.DocumentConfigurationWorkflowGetAllDtos.map((element: IWorkflowDto) =>
				({
					Text: element.Text,
					Value: String(element.WorkflowId)
				}))
			: null;
	}

	private getAllowedExtensions(documentConfigurationDetails: IDocumentConfigurationResponse): (IDropdownOption | undefined)[] | null {
		return documentConfigurationDetails.AllowedExtensions
			? documentConfigurationDetails.AllowedExtensions.split(',').map((element) =>
				this.allowedExtList.find((data: IDropdownOption) =>
					 data.Text == element))
			: null;
	}

	public submitForm() {
		this.toasterService.resetToaster();
		this.AddEditDocumentConfigurationForm.markAllAsTouched();
		if (!this.AddEditDocumentConfigurationForm.valid) {
			return;
		}
		if (this.AddEditDocumentConfigurationForm.controls['configurationBySector'].value && !this.isAtleastOneSwitchIsOn()) {
			return this.toasterService.showToaster(ToastOptions.Error, 'PleaseSelectOneSector');
		}
		this.submitFormConfirmation();

	}

	private isAtleastOneSwitchIsOn(): boolean {
		return this.documentConfigurationSectorDtos.some((x: IDocumentConfigurationSector) =>
			x.appliesTo);
	}

	private createDocumentConfigurationData(): IDocumentConfiguration {
		const documentConfigurationData: IDocumentConfiguration = {
			"documentTitle": (this.AddEditDocumentConfigurationForm.controls['documentTitle'].value).trim(),
			"UploadedStageId": this.AddEditDocumentConfigurationForm.controls['uploadedStage'].value
				? this.AddEditDocumentConfigurationForm.controls['uploadedStage'].value.Value
				: '',
			"documentConfigurationVisibleTo": this.AddEditDocumentConfigurationForm.controls['visibleTo'].value
				? [{"visibleTo": this.AddEditDocumentConfigurationForm.controls['visibleTo'].value.Value}]
				: [],
			"documentConfigurationWorkflowDtos": ((this.AddEditDocumentConfigurationForm.controls['documentConfigurationWorkflowDtos'].value).map((data: { Value: string }) =>
				 { return { "workflowId": data.Value }; })),
			"allowedExtensions": ((this.AddEditDocumentConfigurationForm.controls['allowedExtensions'].value).map((val: { Text: string }) =>
				val.Text).join(",")),
			"mandatory": this.AddEditDocumentConfigurationForm.controls['mandatory'].value,
			"multipleDocumentAllowed": this.AddEditDocumentConfigurationForm.controls['multipleDocumentAllowed'].value,
			"resume": this.AddEditDocumentConfigurationForm.controls['resume'].value,
			"configurationBySector": this.AddEditDocumentConfigurationForm.controls['configurationBySector'].value,
			"documentConfigurationSectorDtos": this.getDocumentConfigurationSectorDtos()
		};
		return documentConfigurationData;
	}

	private getDocumentConfigurationSectorDtos(): IDocumentConfigurationSectorDtos[] {
		return this.documentConfigurationSectorDtos.filter((data: IDocumentConfigurationSector) =>
			 data.appliesTo)
		  .map((dataItem: IDocumentConfigurationSector) =>
			 ({
					sectorId: dataItem.Id,
					appliesTo: dataItem.appliesTo,
					documentConfigurationVisibleToSector: dataItem.visibleTo
			  ? [{ visibleTo: String(dataItem.visibleTo.Value) }]
			  : null,
					mandatory: dataItem.mandatory
		  } as IDocumentConfigurationSectorDtos));
	  }

	  private submitFormConfirmation() {
		this.toasterService.resetToaster();
		const documentConfigurationData: IDocumentConfiguration = this.createDocumentConfigurationData();
		this.AddEditDocumentConfigurationForm.markAllAsTouched();

		if (this.isEditMode) {
			this.handleEditMode(documentConfigurationData);
		} else {
			this.handleAddMode(documentConfigurationData);
		}
	}

	private handleEditMode(documentConfigurationData: IDocumentConfiguration): void {
		documentConfigurationData.UKey = this.documentConfigurationDetails?.UKey ?? null;

		this.documentConfigurationService.updateDocumentConfiguration(documentConfigurationData)
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: ApiResponseBase) => {
				this.processResponse(data);
			});

		this.AddEditDocumentConfigurationForm.markAsPristine();
	}

	private handleAddMode(documentConfigurationData: IDocumentConfiguration): void {
		this.documentConfigurationService.addDocumentConfiguration(documentConfigurationData)
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: ApiResponseBase) => {
				this.processResponse(data);
				if (data.StatusCode == HttpStatusCode.Ok) {
					this.isAdded = true;
					this.router.navigate([NavigationPaths.list]);
				}
			});
	}

	private processResponse(data: ApiResponseBase): void {
		this.toasterService.resetToaster();
		if (data.StatusCode == HttpStatusCode.Conflict) {
			this.toasterService.showToaster(ToastOptions.Error, 'DocumentConfigurationDuplicateValidation');
		} else if (data.StatusCode == HttpStatusCode.Ok) {
			this.commonService.resetAdvDropdown(this.entityID);
			this.toasterService.showToaster(ToastOptions.Success, 'DocumentConfigurationSavedSuccessfully');
		}
	}


	public findInvalidControls() {
		const invalid = [],
			controls = this.AddEditDocumentConfigurationForm.controls;
		for (const name in controls) {
			if (controls[name].invalid) {
				invalid.push(name);
			}
		}
		return invalid;
	}


	public onConfigurationBySectorChange(getBooleanValue: boolean) {
		if (!getBooleanValue) {
			this.documentConfigurationSectorDtos = [];
		}
		this.patchConfigureBySectorData();
	}

	private patchConfigureBySectorData() {
		this.configureBySectorPrefilledData.forEach((element: IDocumentConfigurationSector) => {
			const row = this.documentConfigurationDetails?.DocumentConfigurationSectorGetAllDtos.find((data: IDmsSectorDitails) =>
				(((data.SectorId).toString()) == element.Id));
			if (row) {
				element.appliesTo = row.AppliesTo;
				element.visibleTo = this.visibleToList.find((data: IDropdownOption) =>
					data.Value == (row.DocumentConfigurationVisibleToSector[magicNumber.zero].Id)) ?? null;
				element.mandatory = row.Mandatory;
			}
		});
		this.widget.updateForm.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data) => {
			if (data) {
				this.AddEditDocumentConfigurationForm.markAsDirty();
			}
		});
	}

	public getConfigureBySectorFormStatus(list: FormArray): void {
		this.documentConfigurationSectorDtos = list.getRawValue();
		list.controls.forEach((formGroup) => {
			if(!formGroup.get('appliesTo')?.value){
				formGroup.get('visibleTo')?.disable({ onlySelf: true, emitEvent: false });
				formGroup.get('mandatory')?.disable({ onlySelf: true, emitEvent: false });
			}
		});

		this.widget.updateForm.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data) => {
			if (!data && this.previousFormState) {
				this.updateSectorFormControls(list);
			}
			this.previousFormState = data;
		});
		this.pushAndPopInFormArray(list.value);
	}

	private updateSectorFormControls(list: FormArray): void {
		this.configureBySectorPrefilledData.forEach((row: IDocumentConfigurationSector) => {
			const rowIndex = list.value.findIndex((x: { Id: string }) =>
				 x.Id === row.Id),
			 formGroup = list.at(rowIndex);
			if (row.appliesTo && rowIndex !== magicNumber.minusOne) {
				formGroup.get('mandatory')?.setValue(row.mandatory, { onlySelf: true, emitEvent: false });
				formGroup.get('mandatory')?.enable({ onlySelf: true, emitEvent: false });
				formGroup.get('visibleTo')?.setValue(row.visibleTo, { onlySelf: true, emitEvent: false });
				formGroup.get('visibleTo')?.enable({ onlySelf: true, emitEvent: false });
			}
		});
	}

	public switchChange(event: OutputParams) {
		if (event.control == 'appliesTo') {
			if (!event.data.value.appliesTo) {
				event.formData.at(event.index).get('mandatory')?.setValue(false);
				event.formData.at(event.index).get('visibleTo')?.setValue(null);
				event.formData.at(event.index).get('mandatory')?.disable();
				event.formData.at(event.index).get('visibleTo')?.disable();
			} else {
				event.formData.at(event.index).get('mandatory')?.setValue(this.AddEditDocumentConfigurationForm.value.mandatory);
				event.formData.at(event.index).get('visibleTo')?.setValue(this.AddEditDocumentConfigurationForm.value.visibleTo);
				event.formData.at(event.index).get('mandatory')?.enable();
				event.formData.at(event.index).get('visibleTo')?.enable();
			}
		}
	}

	private pushAndPopInFormArray(sectors: IDocumentConfigurationSector[]): void {
		this.listViewFormArray.clear();
		sectors.forEach((sector: IDocumentConfigurationSector) => {
			if (sector.appliesTo) {
				this.listViewFormArray.push(this.createSectorFormGroup(sector));
			}
		});
	}

	private createSectorFormGroup(sector: IDocumentConfigurationSector): FormGroup {
		return this.formBuilder.group({
			sectorId: [sector.Id],
			appliesTo: [sector.appliesTo],
			documentConfigurationVisibleToSector: this.formBuilder.array([
				this.formBuilder.group({
					visibleTo: [sector.visibleTo, [this.customValidators.RequiredValidator()]]
				})
			]),
			mandatory: [sector.mandatory]
		});
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		if (!this.isAdded) {
			this.toasterService.resetToaster();
		}
	}

}

