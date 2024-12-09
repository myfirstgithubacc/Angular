import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation, ChangeDetectionStrategy, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DmsImplementationService } from '@xrm-shared/services/dms-implementation.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from "@xrm-shared/services/Localization/localization.service";
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { KendoTemplateDropdown } from '@xrm-shared/widgets/form-controls/kendo-template-dropdown/kendo-template-interface';
import { Dropdown, TagVisibility } from '@xrm-shared/enums/dropdown.enum';
import { Subject, takeUntil } from 'rxjs';
import {
	AdditionalWorkFlows, DMSApiRequestPayload, DocumentControlConfig, DocumentTitleDropdownList, FileSelectEvent, FileUploadDetails,
	IDocumentControlConfigPayload, IResponseFileUploadDetails, IUploadedDocumentGridList, IUploadOrUploadedDocumentGridList, SelectFile
} from './utils/dms-implementation.interface';
import { BYTES_IN_GIGABYTE, BYTES_IN_KILOBYTE, BYTES_IN_MEGABYTE, FileSizeUnit } from './utils/dms-implementation.constant';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({
	selector: 'app-dms-implementation',
	templateUrl: './dms-implementation.component.html',
	styleUrls: ['./dms-implementation.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DmsImplementationComponent implements OnInit, OnDestroy {
	public dmsForm: FormGroup;
	public isEditMode: boolean = false;
	// request from component
	@Input() isButtonVisible: boolean = false;
	@Input() workFlowId: number = magicNumber.zero;
	@Input() userGroupId: number = magicNumber.zero;
	@Input() sectorId: number = magicNumber.zero;
	@Input() uploadStageId: number = magicNumber.zero;
	@Input() actionTypeId: number = magicNumber.zero;
	@Input() recordId: number = magicNumber.zero;

	// will remove in next version no need to pass
	@Input() processingId: number = magicNumber.zero;

	@Input() docTitle: string = "DocumentUpload";
	@Input() showTitle: boolean = true;
	@Input() additionalWorkFlows: AdditionalWorkFlows[] = [];
	/**
	  * Controls the text displayed below the grid:
	  * - Set to "true" for transaction screens, showing "Submit".
	  * - Set to "false" for master screens, displaying "Save".
	  */
	@Input() isTransactionScreen: boolean = true;
	@Input() isDraft: boolean = false;
	@Output() hasDMSLength = new EventEmitter<boolean>();
	@Output() gridChange = new EventEmitter<void>();

	public dmsControlConfig: DocumentControlConfig[] = [];
	public documentTitleDropdownList: DocumentTitleDropdownList[] = [];

	// validation property for upload
	public uploadingInfoMsg: string;
	public allowedExtensions: string[] = [];
	public maxDocumentSize: number;
	public multipleDocumentAllowed: boolean;
	public isDisable: boolean = true;
	public extensionsAllow: FileRestrictions = {
		allowedExtensions: this.allowedExtensions
	};
	// public isMultipleUpload: false;
	public gridListData: IUploadOrUploadedDocumentGridList[] = [];
	private allUploadedRecordGridData: IUploadedDocumentGridList[] = [];

	private selectedFileValidationMsg: string = '';
	// Define a variable to hold the uploaded file object
	private selectedFile: SelectFile[] = [];

	private propertNames: string[] = ['workFlowId', 'userGroupId', 'sectorId', 'uploadStageId', 'actionTypeId', 'recordId', 'additionalWorkFlows'];
	// public isViewOnly:boolean = false;

	// public chooseFileBtnText = "Choose File(s)";
	public chooseFileBtnText: string = "ChooseFiles";
	// public unitOfFileSizeDenotedBy: 'KB' | 'MB' | 'GB' = "KB";

	private userFullName: string;
	private isDDContainSingleData: boolean = false;
	public newFileUploadedMessage: string;
	private fileNameExistInGrid: IUploadOrUploadedDocumentGridList;
	public gridTitle: string = this.actionTypeId === Number(magicNumber.three)
		? 'GridAction'
		: 'Actions';

	public dropDownInterFaceWithSource: KendoTemplateDropdown = {
		isEditMode: false,
		list: [],
		listControlName: null,
		isRequired: false,
		label: 'DocumentType',
		placeholder: null,
		filterable: false,
		isDisabled: false,
		isValuePrimitiveAllowed: false,
		tooltipTitle: '',
		tooltipTitleLocalizeParam: [],
		tooltipVisible: false,
		dropDownList: null,
		entityType: '',
		fieldName: '',
		isHtmlContent: false,
		isItemTemplate: false,
		isRendered: false,
		isValueTemplate: false,
		itemTemplate: false,
		KendoTemplateDropdown: '',
		labelLocalizeParam: [],
		valueTemplate: '',
		xrmEntityId: 0,
		tagName: '*',
		tagAlign: Dropdown.right,
		TagVisibility: TagVisibility.Custom
	};
	private isValidateDocumentsAndUploadForm: boolean = false;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private dmsImplementationService: DmsImplementationService,
		private changeDetectorRef: ChangeDetectorRef,
		private formBuilder: FormBuilder,
		private toasterService: ToasterService,
		private localizationService: LocalizationService,
		private renderer: Renderer2,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.dmsFormInitialization();
		this.userFullName = this.getUserFullName();
		this.hasDMSLength.emit(false);
	}

	ngOnChanges(updatedData: SimpleChanges) {
		let isRefresh = false;
		for (const element of this.propertNames) {
			if (element in updatedData) {
				isRefresh = true;
				(this as any)[element] = updatedData[element].currentValue;
			}
		}
		if (isRefresh) {
			this.gridListData = [];
			this.loadDataToGenerateControls();
		}
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

	private getUserFullName() {
		return this.localizationService.GetCulture(CultureFormat.UserFullName);
	}

	private dmsFormInitialization() {
		this.dmsForm = this.formBuilder.group({
			'documentTitle': [null]
		});
	}

	private loadDataToGenerateControls(): void {
		const data: IDocumentControlConfigPayload = {
			workFlowId: Number(this.workFlowId),
			sectorId: Number(this.sectorId),
			uploadStageId: Number(this.uploadStageId)
		};
		this.dmsImplementationService.loadDataToGenerateControls(data).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<DocumentControlConfig[]>) => {
				if (!res.Succeeded) {
					return;
				}
				// whole configuration
				this.dmsControlConfig = res.Data ?? [];
				this.emitDMSLength();
				this.dmsImplementationService.updateDmsData(this.dmsControlConfig);
				// create dropdown list data only
				this.createDocumentTitleDropdown();
				if (this.actionTypeId > Number(magicNumber.one)) {
					/* for edit and view call previous created documents list */
					this.getGridListData();
					this.gridTitle = this.actionTypeId === Number(magicNumber.three)
						? 'GridAction'
						: 'Actions';
				}
				this.changeDetectorRef.markForCheck();
			});
	}

	private createDocumentTitleDropdown() {
		const dropdown = this.dmsControlConfig.map((ele: DocumentControlConfig) => {
			return {
				...ele,
				Text: ele.DocumentTitle,
				Value: ele.DocumentConfigId,
				TagEnabled: ele.Mandatory
			};
		});
		this.documentTitleDropdownList = dropdown;
		this.dropDownInterFaceWithSource.list = this.documentTitleDropdownList;

		// Check if the configuration array has a single object then patch the form with the single object
		if (this.documentTitleDropdownList.length === Number(magicNumber.one)) {
			this.patchFieldTypeConfig();
		}
	}

	// create all validation here for uploader when user select the doc title along with message
	public loadFieldTypeConfig(e: DocumentTitleDropdownList) {
		if (e !== undefined) {
			this.isDisable = false;
			const localizeParamMultipleFileAllowed = this.localizationService.GetLocalizeMessage('MultipleFileAllowed', []),
				localizeParamSingleFileAllowed = this.localizationService.GetLocalizeMessage('SingleFileAllowed', []),
				localizeParamFileFormat = this.localizationService.GetLocalizeMessage('FileFormat', []),
				localizeParamMax = this.localizationService.GetLocalizeMessage('Max', []);

			this.uploadingInfoMsg = `${e.MultipleDocumentAllowed
				? localizeParamMultipleFileAllowed
				: localizeParamSingleFileAllowed}, ${localizeParamFileFormat} - ${this.returnFileFormat(e.AllowedExtensions)} 
				(${localizeParamMax}. ${e.MaxDocumentSize} MB)`;

			// assign to variable for restrict uploader based on selected title
			this.allowedExtensions = (e.AllowedExtensions).split(',');
			this.maxDocumentSize = e.MaxDocumentSize;
			this.multipleDocumentAllowed = e.MultipleDocumentAllowed;
			this.extensionsAllow.allowedExtensions = this.allowedExtensions.map((ext: string) =>
				`.${ext}`);
			if (this.isValidateDocumentsAndUploadForm)
				this.checkIfAllRequiredDocumentTitleFileUploadForm();
		} else {
			this.isDisable = true;
		}
	}

	// patch if configuration contain single data/index
	private patchFieldTypeConfig(): void {
		const singleConfig = this.documentTitleDropdownList[0];
		this.loadFieldTypeConfig(singleConfig);
		// Patch the properties of the Kendo Dropdown with the values from the single object.
		this.dmsForm.patchValue({
			documentTitle: singleConfig
		});
		this.isDDContainSingleData = true;
	}

	public onFileSelect(event: FileSelectEvent): void {
		this.toasterService.resetToaster();
		this.selectedFile = event.files;
		this.prepareGridData();
	}

	private prepareGridData(): void {
		if (this.multipleDocumentAllowed) {
			this.handleMultipleDocumentUpload();
		} else {
			this.handleSingleDocumentUpload();
		}
	}

	private handleMultipleDocumentUpload(): void {
		let isMultipleFileValid = true;
		for (const data of this.selectedFile) {
			this.validateSelectedFiles(data);
			if (this.selectedFileValidationMsg !== '') {
				isMultipleFileValid = false;
				this.toasterService.showToaster(ToastOptions.Error, this.selectedFileValidationMsg, [], true);
				break;
			}
		}
		if (isMultipleFileValid) {
			this.selectedFile.forEach((data: SelectFile) =>
				this.onAddGridData(data));
		}
	}

	private handleSingleDocumentUpload(): void {
		const documentTitle = this.dmsForm.value.documentTitle.DocumentTitle;
		if (this.checkDocumentTitleExistInGridListForSingle(documentTitle)) {
			// if document title exist in grid the show then message to user
			const localizeParamMultipleUpload: DynamicParam[] = [{ Value: documentTitle, IsLocalizeKey: false }],
				DocumentMultipleUploadValidation = this.localizationService.GetLocalizeMessage('DocumentMultipleUploadValidation', localizeParamMultipleUpload);
			this.toasterService.showToaster(ToastOptions.Error, DocumentMultipleUploadValidation, [], true);
		} else {
			// if document title not exist in grid then proceed to validate file for upload
			const data = this.selectedFile[0];
			this.validateSelectedFiles(data);
			if (this.selectedFileValidationMsg == '') {
				this.onAddGridData(data);
			} else {
				this.toasterService.showToaster(ToastOptions.Error, this.selectedFileValidationMsg, [], true);
			}
		}
	}

	// check document title exist in grid list for which allow only single doc only
	private checkDocumentTitleExistInGridListForSingle(documentTitle: string): boolean {
		const findDoc = this.gridListData.find((x: IUploadOrUploadedDocumentGridList) =>
			((x.documentTitle).toLowerCase() == (documentTitle).toLowerCase())
			&& (x.statusId !== Number(magicNumber.zero)));
		if (findDoc) {
			return true;
		} else {
			return false;
		}
	}


	/**
	 * when user choose a file so before proceed further we are validating selected file based on these vaidation config
	 * 1.. extension
	 * 2.. size
	 * 3.. duplicacy
	 */
	private validateSelectedFiles(data: SelectFile): string {
		if (!this.checkSelectedFileExtension(data.extension)) {
			// validate extension
			const allowedExtensions = this.formatArrayAsString(this.allowedExtensions),
				localizeParamInvalidExtension: DynamicParam[] = [{ Value: allowedExtensions, IsLocalizeKey: false }];
			// The allowed extension(s) are ${allowedExtensions}. Please select Document with these extension(s) only
			this.selectedFileValidationMsg = this.localizationService.GetLocalizeMessage('DocumentInvalidExtensionValidation', localizeParamInvalidExtension);

		} else if (this.checkFileSizeExceedMaxDocumentSize(data.size)) {
			// validate size
			const localizeParamMaxSize: DynamicParam[] = [{ Value: String(this.maxDocumentSize), IsLocalizeKey: false }];
			// Document size should not exceed ${this.maxDocumentSize} MB for uploads.;
			this.selectedFileValidationMsg = this.localizationService.GetLocalizeMessage('DocumentUploadSizeValidation', localizeParamMaxSize);

		} else if (this.checkFileNameExistInGridList(data.name)) {
			/**
			 * validate duplicacy
			 * return this.selectedFileValidationMsg = 'duplicacy' + data.name
			 * need to dynamic document title for which it matched
			 */
			const localizeParamAlreadyExist: DynamicParam[] = [{ Value: this.fileNameExistInGrid.documentTitle, IsLocalizeKey: false }];
			// The selected file has already been uploaded against the {documentTitle}. Please select a different file or a different Document Title.
			this.selectedFileValidationMsg = this.localizationService.GetLocalizeMessage('DocumentAlreadyExistsValidation', localizeParamAlreadyExist);

		} else {
			// valid
			this.selectedFileValidationMsg = '';
		}
		return this.selectedFileValidationMsg;
	}

	private checkSelectedFileExtension(extension: string): boolean {
		/**
		 * extension is coming as i.e., ".png"of selected file
		 * allowed extension is coming as "[png, jpg, xlsx]"
		 * Step 1: Check if the uploaded file's extension exists in the allowedExtensions by removing prefix dot
		 */
		const isExtensionAllowed = this.allowedExtensions.includes(extension.replace('.', ''));
		if (isExtensionAllowed) {
			// File extension is allowed, proceed with the upload process.
			return true;
		} else {
			// File extension is not allowed, handle the error or show a message to the user.
			return false;
		}
	}

	/**
	 * @param sizeInBytes
	 * @returns
	 * check size
	 * megabytes = bytes/1024*1000
	 */
	private checkFileSizeExceedMaxDocumentSize(sizeInBytes: number): boolean {
		const fileSizeInMB: number = parseFloat((sizeInBytes / BYTES_IN_MEGABYTE).toFixed(magicNumber.two));
		if (fileSizeInMB > this.maxDocumentSize) {
			return true;
		} else {
			return false;
		}
	}

	// check file duplicacy
	private checkFileNameExistInGridList(name: string): boolean {
		const findDoc = this.gridListData.find((x: IUploadOrUploadedDocumentGridList) =>
			((x.fileNameWithExtension).toLowerCase() == (name).toLowerCase())
			&& (x.statusId !== Number(magicNumber.zero)));
		if (findDoc) {
			this.fileNameExistInGrid = findDoc;
			return true;
		} else {
			return false;
		}
	}

	/**
	 * on add grid data trigger based on file size
	 * 1. IformFile -> this contain file and we will send this file as a FormData on upload api at the time of user uplaoded
	 * -- and based on success and failer we will opearte add data on grid
	 * 2. IformFile With Chunk -> this contain file and we will send file as a FormData on upload api at the time of user uplaoded in form of chunk
	 * -- and based on success and failer we will opearte add data on grid
	 */
	// #region IFormFile and byte array upload methods
	private onAddGridData(fileData: SelectFile): void {
		const fileSize = fileData.size;
		if (fileSize <= BYTES_IN_MEGABYTE) {
			// 1 MB in bytes
			this.onAddGridDataViaIFormFile(fileData);
		} else {
			this.onAddGridDataViaIFormFileWithChunk(fileData);
		}
	}

	private onAddGridDataViaIFormFile(fileData: SelectFile): void {
		const record: SelectFile = fileData,
			formData: FormData = new FormData();
		// create form data
		formData.append(`documentAddDto.fileExtension`, (record.extension).replace('.', ''));
		formData.append(`documentAddDto.fileNameWithExtension`, record.name);
		formData.append(`documentAddDto.fileSize`, (record.size).toString());
		formData.append(`documentAddDto.contentType`, record.rawFile.type);
		formData.append(`documentAddDto.chunkNumber`, (magicNumber.zero).toString());
		formData.append(`documentAddDto.totalChunks`, (magicNumber.zero).toString());
		formData.append(`documentAddDto.file`, record.rawFile);
		formData.append(`documentAddDto.fileName`, (record.name).substring(magicNumber.zero, (record.name).lastIndexOf('.')));

		formData.append(`documentAddDto.documentConfigurationId`, this.dmsForm.value.documentTitle.DocumentConfigId);
		formData.append(`documentAddDto.documentProcessingType`, (magicNumber.one).toString());
		// kendo generated uid send to backend for chunk folder creation
		formData.append(`documentAddDto.encryptedFileName`, record.uid);
		// end form data

		this.dmsImplementationService.uploadDocument(formData).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<FileUploadDetails>) => {
				if (res.Succeeded) {
					// push the data in grid for final submition
					this.handleUploadSuccessViaIFormFile(res as IResponseFileUploadDetails);
				} else {
					this.toasterService.showToaster(ToastOptions.Error, 'VirusDetected');
				}
			});
	}

	private onAddGridDataViaIFormFileWithChunk(fileData: SelectFile): void {
		const record: SelectFile = fileData,
			/* handle chunked upload, 1 MB chunks, const chunkSize = 1024 * 1024; */
			chunkSize = BYTES_IN_MEGABYTE,
			totalChunks = Math.ceil(record.rawFile.size / chunkSize),
			formData: FormData = new FormData();
		formData.append(`documentAddDto.fileExtension`, (record.extension).replace('.', ''));
		formData.append(`documentAddDto.fileNameWithExtension`, record.name);
		formData.append(`documentAddDto.fileSize`, (record.size).toString());
		formData.append(`documentAddDto.contentType`, record.rawFile.type);
		formData.append(`documentAddDto.fileName`, (record.rawFile.name).substring(magicNumber.zero, (record.rawFile.name).lastIndexOf('.')));
		formData.append(`documentAddDto.documentConfigurationId`, this.dmsForm.value.documentTitle.DocumentConfigId);
		formData.append(`documentAddDto.documentProcessingType`, (magicNumber.three).toString());
		formData.append(`documentAddDto.encryptedFileName`, record.uid);

		let chunkNumber = Number(magicNumber.one);
		// eslint-disable-next-line one-var
		const uploadNextChunk = () => {
			const start = (chunkNumber - magicNumber.one) * chunkSize,
				end = Math.min(start + chunkSize, record.rawFile.size),
				// create chunk data of file
				chunk = record.rawFile.slice(start, end);
			// delete previous chunk of file data
			formData.delete(`documentAddDto.chunkNumber`);
			formData.delete(`documentAddDto.totalChunks`);
			formData.delete(`documentAddDto.file`);
			// addend next chunk of file data
			formData.append(`documentAddDto.chunkNumber`, chunkNumber.toString());
			formData.append(`documentAddDto.totalChunks`, totalChunks.toString());
			formData.append(`documentAddDto.file`, chunk);

			this.dmsImplementationService.uploadDocument(formData).pipe(takeUntil(this.destroyAllSubscriptions$))
				.subscribe((res: GenericResponseBase<FileUploadDetails>) => {
					chunkNumber++;
					if (chunkNumber <= totalChunks) {
						uploadNextChunk();
					} else if (res.Succeeded) {
						// push the data in grid for final submition
						this.handleUploadSuccessViaIFormFile(res as IResponseFileUploadDetails);
					} else {
						this.toasterService.showToaster(ToastOptions.Error, 'VirusDetected');
					}
				}, () => {
					this.toasterService.showToaster(ToastOptions.Error, 'Somethingwentwrong');
				});
		};
		uploadNextChunk();
	}

	/**
	 * Handles the upload success event when using IFormFile.
	 * push the response data in grid for final submition
	 * @param data - The data object containing the uploaded file information.
	 * @returns void
	 */
	private handleUploadSuccessViaIFormFile(data: IResponseFileUploadDetails): void {
		const ZERO = Number(magicNumber.zero),
			ONE = Number(magicNumber.one);
		this.gridListData.push({
			"documentConfigurationId": this.dmsForm.value.documentTitle.DocumentConfigId,
			"id": ZERO,
			"visibleTo": this.userGroupId,
			"file": (data.Data.EncryptedFileNameWithExtension).split("\\").pop() ?? '',
			"documentTitle": this.dmsForm.value.documentTitle.DocumentTitle,
			"documentFile": data.Data.FileName,
			"documentType": '',
			"documentSize": data.Data.FileSize,
			"uploadedOn": this.localizationService.TransformData(new Date(), CultureFormat.DateFormat),
			"uploadedBy": this.userFullName,
			"documentExtension": (data.Data.FileExtension).replace('.', ''),
			"statusId": ONE,
			"fileNameWithExtension": data.Data.FileNameWithExtension,
			"encryptedFileName": data.Data.EncryptedFileName,
			"isDeleteAllowed": true
		});
		this.gridChange.emit();
		if (this.isValidateDocumentsAndUploadForm)
			this.checkIfAllRequiredDocumentTitleFileUploadForm();
	}
	// #endregion IFormFile and byte array upload methods

	public validateDocumentsAndUpload(): boolean {
		return this.checkIfAllRequiredDocumentTitleFileUpload();
	}

	private checkIfAllRequiredDocumentTitleFileUpload(): boolean {
		const missingMandatoryDocumentTitles: string[] = [];

		this.dmsControlConfig.forEach((element: DocumentControlConfig) => {
			if (element.Mandatory && !this.gridListData.some((x: IUploadOrUploadedDocumentGridList) =>
				x.documentConfigurationId === element.DocumentConfigId && x.statusId !== Number(magicNumber.zero))) {
				missingMandatoryDocumentTitles.push(element.DocumentTitle);
			}
		});

		if (missingMandatoryDocumentTitles.length > Number(magicNumber.zero)) {
			// Conjunction: 'and'
			const missingDocumentTitlesString = this.formatArrayAsString(missingMandatoryDocumentTitles, 'and'),
				localizeParamMandatory: DynamicParam[] = [{ Value: missingDocumentTitlesString, IsLocalizeKey: false }],
				DocumentMandatoryValidation = this.localizationService.GetLocalizeMessage('DocumentMandatoryValidation', localizeParamMandatory);
			this.toasterService.showToaster(ToastOptions.Error, DocumentMandatoryValidation, [], true);
			// Return false if any documents are missing
			return false;
		} else {
			// Return true if all documents are uploaded
			return true;
		}
	}

	// form validate on submit
	public validateDocumentsAndUploadForm(): boolean {
		this.isValidateDocumentsAndUploadForm = true;
		return this.checkIfAllRequiredDocumentTitleFileUploadForm();
	}

	private checkIfAllRequiredDocumentTitleFileUploadForm(): boolean {
		const missingMandatoryDocumentTitles: string[] = [];

		this.dmsControlConfig.forEach((element: DocumentControlConfig) => {
			if (element.Mandatory && !this.gridListData.some((x: IUploadOrUploadedDocumentGridList) =>
				x.documentConfigurationId === element.DocumentConfigId && x.statusId !== Number(magicNumber.zero))) {
				missingMandatoryDocumentTitles.push(element.DocumentTitle);
			}
		});

		if (missingMandatoryDocumentTitles.length > Number(magicNumber.zero)) {
			this.dmsForm.get('documentTitle')?.setErrors({ 'customValidation': true });
			this.dmsForm.get('documentTitle')?.setErrors({ required: true });
			this.dmsForm.markAllAsTouched();
			this.cdr.markForCheck();
			// Return false if any documents are missing
			return false;
		} else {
			this.dmsForm.get('documentTitle')?.setErrors(null);
			this.dmsForm.get('documentTitle')?.clearValidators();
			this.dmsForm.markAllAsTouched();
			this.cdr.markForCheck();
			// Return true if all documents are uploaded
			return true;
		}
	}

	public isNewFileUploaded(): boolean {
		const localizeParamNewFile: DynamicParam[] = [{ Value: this.getScreenType(), IsLocalizeKey: false }];
		this.newFileUploadedMessage = this.localizationService.GetLocalizeMessage('DocumentNewFileMessage', localizeParamNewFile);

		return this.gridListData.length
			? this.gridListData.some((item: IUploadOrUploadedDocumentGridList) =>
				item.id === Number(magicNumber.zero))
			: false;
	}

	private filterRequiredRequestPayload(dataArray: IUploadOrUploadedDocumentGridList[]) {
		/**
		 * Filter the array based on the conditions
		 * case 1: contain id = 0
		 * case 2: contain id > 0 && status = DELETED
		 */
		// remove object whose statusId is two
		return dataArray.filter((item: IUploadOrUploadedDocumentGridList) =>
			item.statusId < Number(magicNumber.two));
	}

	public prepareAndEmitFormData(): DMSApiRequestPayload[] {
		const payload: IUploadOrUploadedDocumentGridList[] = this.filterRequiredRequestPayload(this.gridListData),
			apiRequest: DMSApiRequestPayload[] = [];
		for (const record of payload) {
			// Prepare your apiRequest based on record
			apiRequest.push({
				"id": record.id,
				"statusId": record.statusId,
				"documentAddDto":
				{
					"documentConfigurationId": record.documentConfigurationId,
					"fileName": record.documentFile,
					"fileExtension": record.documentExtension,
					"fileNameWithExtension": record.fileNameWithExtension,
					"fileSize": record.documentSize,
					"encryptedFileName": record.encryptedFileName
				}
			});
		}
		return apiRequest;
	}

	/**
	 *
	 * @param data
	 *  delete status 0
	 * add status 1
	 * edit status 2
	 */
	public deleteDocument(data: IUploadOrUploadedDocumentGridList) {
		if (data.id > Number(magicNumber.zero)) {
			const findIndex: number = this.gridListData.findIndex((item: IUploadOrUploadedDocumentGridList) =>
				item.id == data.id),
				localizeParam: DynamicParam[] = [{ Value: this.getScreenType(), IsLocalizeKey: false }];
			this.gridListData[findIndex].statusId = 0;
			this.toasterService.showToaster(
				ToastOptions.Warning,
				`DocumentOnDeleteMessage`, localizeParam, false
			);
		} else {
			this.removeItemFromGridDataList(data);
		}
		this.filteredGridListData();
		this.gridChange.emit();
	}

	private removeItemFromGridDataList(data: IUploadOrUploadedDocumentGridList) {
		const indexToRemove = this.gridListData.findIndex((item: IUploadOrUploadedDocumentGridList) =>
			item.id === Number(magicNumber.zero) && item.documentFile === data.documentFile);

		if (indexToRemove !== Number(magicNumber.minusOne)) {
			this.gridListData.splice(indexToRemove, magicNumber.one);
		}
	}

	private returnFileFormat(extension: string): string {
		return this.formatStringAsString(extension);
	}

	// edit previous uploaded data for grid also use for view
	private getGridListData() {
		const payload: AdditionalWorkFlows[] = [
			{
				"workFlowId": Number(this.workFlowId),
				"recordId": Number(this.recordId),
				"isParentWorkflow": true,
				"IsDraft": this.isDraft
			}
		];
		// Merge additionalWorkFlows into data
		if (this.additionalWorkFlows.length > Number(magicNumber.zero)) {
			const existingWorkflowIds = new Set(payload.map((item: AdditionalWorkFlows) =>
					item.workFlowId)),
				newAdditionalWorkFlows = this.additionalWorkFlows.filter((additionalItem: AdditionalWorkFlows) =>
					!existingWorkflowIds.has(additionalItem.workFlowId));
			payload.push(...newAdditionalWorkFlows);
		}
		this.dmsImplementationService.getAllUploadedDmsRecord(payload).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IUploadedDocumentGridList[]>) => {
				if (res.Succeeded) {
					// whole configuration
					this.allUploadedRecordGridData = res.Data ?? [];
					if (this.allUploadedRecordGridData.length > Number(magicNumber.zero))
						this.emitDMSLength();
					// clear array before adding new grid list data //
					this.gridListData = [];
					this.allUploadedRecordGridData.forEach((element: IUploadedDocumentGridList) => {
						this.onAddAllUploadedRecordGridData(element);
					});
					this.dmsImplementationService.updateUploadedRecords(this.allUploadedRecordGridData);
				} else {
					this.allUploadedRecordGridData = [];
					this.gridListData = [];
					this.emitDMSLength();
				}
				this.changeDetectorRef.markForCheck();
			});
	}

	private onAddAllUploadedRecordGridData(data: IUploadedDocumentGridList): void {
		this.gridListData.push({
			"documentConfigurationId": data.DocumentConfigurationId,
			"id": data.Id,
			"visibleTo": this.userGroupId,
			"file": data.DocumentFile,
			"documentTitle": data.DocumentTitle,
			"documentFile": (data.DocumentName).split('.')[0],
			"documentType": "",
			"documentSize": data.DocumentSize,
			"uploadedOn": this.localizationService.TransformData(data.UploadedOn, CultureFormat.DateFormat),
			"uploadedBy": data.UploadedBy,
			"documentExtension": (this.getExtension(data.DocumentName)).replace('.', ''),
			"statusId": data.StatusId,
			"fileNameWithExtension": data.DocumentName,
			"isDeleteAllowed": data.IsDeleteAllowed,
			"encryptedFileName": data.EncryptedFileName
		});
	}

	private getExtension(filename: string): string {
		return `.${(filename.split(".").pop())}`;
	}

	// show on grid except DELETED data so filter out here
	public filteredGridListData() {
		return this.gridListData.filter((item: IUploadOrUploadedDocumentGridList) =>
			item.statusId !== Number(magicNumber.zero));
	}


	/**
	 * download file
	 * via link downloadViaFileLink()
	 */

	public downloadFile(file: IUploadOrUploadedDocumentGridList): void {
		if (!file.file) {
			return;
		}
		const filePath = (file.file).split('.')[0],
			fileExtension = file.documentExtension;
		this.dmsImplementationService.downloadFile(filePath, fileExtension).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((blob: Blob) => {
			const url = window.URL.createObjectURL(blob),
				fileNameWithExtension = file.documentFile.endsWith(`.${fileExtension}`)
					? file.documentFile
					: `${file.documentFile}.${fileExtension}`,
				anchor = this.renderer.createElement('a');
			this.renderer.setAttribute(anchor, 'href', url);
			this.renderer.setAttribute(anchor, 'download', fileNameWithExtension);

			anchor.click();
			window.URL.revokeObjectURL(url);
		});
	}

	/**
	 * @param arrayString
	 * @param conjunction
	 * @returns
	 * You can now call the formatArrayAsString function with the optional conjunction parameter to specify
	 * whether you want "and" or "or" between the array elements.
	 * If you don't provide a value for conjunction, it will default to "or":
	 */
	private formatArrayAsString(arrayString: string[], conjunction: 'and' | 'or' = 'or'): string {
		// Create a copy of the array and sort array
		const arrayStringData = [...arrayString].sort((a: string, b: string) =>
			a.localeCompare(b));
		let formattedString = "";
		if (arrayStringData.length === Number(magicNumber.one)) {
			formattedString = arrayStringData[0];
		} else if (arrayStringData.length === Number(magicNumber.two)) {
			formattedString = arrayStringData.join(` ${conjunction} `);
		} else if (arrayStringData.length > Number(magicNumber.two)) {
			const lastTitle = arrayStringData.pop();
			formattedString = `${arrayStringData.join(", ")} ${conjunction} ${lastTitle}`;
		}
		return formattedString;
	}


	// format string from sring and making conditional join based on length of array
	private formatStringAsString(data: string): string {
		const stringData = data,
			// Split the stringData string into individual extensions
			stringDataArray = stringData.split(',');
		stringDataArray.sort((a: string, b: string) =>
			a.localeCompare(b));
		let formattedString = "";
		if (stringDataArray.length === Number(magicNumber.one)) {
			formattedString = stringDataArray[0];
		} else if (stringDataArray.length === Number(magicNumber.two)) {
			formattedString = stringDataArray.join(" or ");
		} else if (stringDataArray.length > Number(magicNumber.two)) {
			const lastExtension = stringDataArray.pop();
			formattedString = `${stringDataArray.join(", ")} or ${lastExtension}`;
		}
		return formattedString;
	}

	public getFileSizeWithUnit(fileSizeInBytes: number): string {
		if (fileSizeInBytes >= BYTES_IN_MEGABYTE) {
			return this.manipulateFileSize(fileSizeInBytes, FileSizeUnit.MB);
		} else {
			return this.manipulateFileSize(fileSizeInBytes, FileSizeUnit.KB);
		}
	}

	private manipulateFileSize(fileSizeInBytes: number, manipulationType: FileSizeUnit): string {
		let sizeInBytes = fileSizeInBytes;
		switch (manipulationType) {
			case FileSizeUnit.KB:
				// Convert to KB
				sizeInBytes = sizeInBytes / BYTES_IN_KILOBYTE;
				break;
			case FileSizeUnit.MB:
				// Convert to MB
				sizeInBytes /= BYTES_IN_MEGABYTE;
				break;
			case FileSizeUnit.GB:
				// Convert to GB
				sizeInBytes /= BYTES_IN_GIGABYTE;
				break;
			default:
				throw new Error('Invalid manipulation type. Supported types are KB, MB, and GB.');
		}
		return `${sizeInBytes.toFixed(Number(magicNumber.two))} ${manipulationType}`;
	}

	private getScreenType(): string {
		return this.isTransactionScreen
			? "Submit"
			: "Save";
	}

	private emitDMSLength(): void {
		if (this.actionTypeId === Number(magicNumber.three) || this.actionTypeId === Number(magicNumber.two)) {
			this.hasDMSLength.emit(this.allUploadedRecordGridData.length > Number(magicNumber.zero));
		} else {
			this.hasDMSLength.emit(this.dmsControlConfig.length > Number(magicNumber.zero));
		}
	}

}

