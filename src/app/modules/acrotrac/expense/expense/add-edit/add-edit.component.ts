import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileRestrictions } from "@progress/kendo-angular-upload";
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ExpenseEntryDetailGrid } from '@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-grid';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';
import { ExpenseEntryAddEdit } from '@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-add-edit';
import { ExpenseTypeService } from 'src/app/services/masters/expense-type.service';
import { TIMEANDEXPENTRYSELECTION, NatureOfExpenses, statusIds } from '../enum-constants/enum-constants';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, forkJoin, of, switchMap, takeUntil } from 'rxjs';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CommonService } from '@xrm-shared/services/common.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DmsImplementationService } from '@xrm-shared/services/dms-implementation.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { DatePipe } from '@angular/common';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { createToasterTable, getSubtractedDate } from '../../utils/CommonEntryMethods';
import { GenericResponseBase, hasData, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ExpenseAssignmentCostEffectiveDates } from '@xrm-core/models/acrotrac/expense-entry/add-edit/expense-AssignmentCostEffectiveDates';
import { FilterSideBar } from '@xrm-core/models/acrotrac/common/filterSideBar';
import { AssignmentDetailsData } from '@xrm-core/models/acrotrac/expense-entry/add-edit/assignment-details';
import { checkFileSizeExceedMaxDocumentSize, checkSelectedFileExtension, displayData, formatArrayAsString, normalizeExpenseEntryDetails, patchDataFromGetByUkey } from '../utils/helper';
import { formBindOnEditClick } from '../../../common/expense-details/patch-expense-details-grid';
import { alterExpenseEntryDetailsGrid } from '../../../common/expense-details/expense-details-grid-helper';
import { IAddEditExpenseFormModel, getAddEditExpenseEntryFormModel } from '../utils/formModel';
import { DocumentControlConfig, FileSelectEvent, FileUploadDetails, SelectFile } from '@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface';
import { DropdownModel, IDropdownWithExtras } from '@xrm-shared/models/common.model';
import { DateRangeParams, WeekendingDateValidationParams } from '@xrm-core/models/acrotrac/common/date-range.model';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AddEditComponent implements OnInit, OnDestroy {
	public detailsData: ExpenseEntryDetailGrid[] = [];
	public costAccountingList: DropdownModel[] = [];
	public expenseTypeList: DropdownModel[] = [];
	public NatureOfExpenseId: number;
	public isClassChange: boolean = true;
	public milesOrHours: string;
	public isReadOnly: boolean;
	public maxLength: number;
	public mileage: number = NatureOfExpenses.Mileage;
	public hoursAndAmount: number = NatureOfExpenses.HoursAndAmount;
	public roundedDecimal: number;
	public chooseFileBtnText = "ChooseFiles";
	public AddEditExpenseForm: FormGroup<IAddEditExpenseFormModel>;
	public ExpenseEntryForm: FormGroup;
	private allowedExtensions: string[] = [];
	public myRestrictions: FileRestrictions = {
		allowedExtensions: this.allowedExtensions
	};
	public dateIncurred = { 'AssignmentStartDate': '', 'AssignmentEndDate': '' };
	public successFullySaved: boolean = false;
	public buttonStatusChange: boolean = false;
	public isEditMode: boolean = false;
	public weekendingDate: string = '';
	public weekending: string = '';
	public assignmentId: string = '';
	public approvalId: number = magicNumber.zero;
	private recordId: number = magicNumber.zero;
	public statusId: number;
	public entityId: number = XrmEntities.Expense;
	public enabled: boolean = true;
	public currencyCode: string = 'USD';
	public currencyDynamicParams: DynamicParam[] = [{ Value: 'Amount', IsLocalizeKey: true }, { Value: this.currencyCode, IsLocalizeKey: false }];
	public draftId = statusIds.Draft;
	public submittedId = statusIds.Submitted;
	public assignmentDetailsFromService: AssignmentDetailsData;
	public dateFormat: string;
	public periodHeading: string;
	public magicNumber = magicNumber;

	private timeOut: number[] = [];
	private addToasterMessage: string = "TheExpenseRecordSuccessfullySubmittedAndMailSentToApprover";
	private draftToasterMessage: string = "ThisInformationHasBeenSuccessfullySavedAsADraft";
	private editToasterMessage: string = "TheExpenseRecordSuccessfullyUpdatedAndMailSentToApprover";
	private uKey: string = '';
	private expenseLabelTextParams: DynamicParam[] = [{ Value: 'Expense', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();
	private updateRowIndex: number = magicNumber.zero;
	private costAccountingEffData: ExpenseAssignmentCostEffectiveDates|undefined;
	private mileageRate: number;
	private isAllowExpenseEntry: boolean;
	private maxDocumentSize: number;
	private selectedFileValidationMsg: string = '';
	@ViewChild('scrollTo') scrollTo!: ElementRef;

	// eslint-disable-next-line max-params, max-lines-per-function
	constructor(
		private formBuilder: FormBuilder,
		private route: Router,
		private toasterServc: ToasterService,
		private customvalidators: CustomValidators,
		private expEntryService: ExpenseEntryService,
		private expTypeService: ExpenseTypeService,
		private sessionStore: SessionStorageService,
		private router: Router,
		private localizationService: LocalizationService,
		private commonGridViewService: CommonService,
		private dmsImplementationService: DmsImplementationService,
		private activatedRoute: ActivatedRoute,
		private eventLog: EventLogService,
		private datePipe: DatePipe,
		private cdr: ChangeDetectorRef
	) {
		this.AddEditExpenseForm = getAddEditExpenseEntryFormModel();

		this.ExpenseEntryForm = this.formBuilder.group({
			'CostAccountingCodeId': [null, [this.customvalidators.requiredValidationsWithMessage('PleaseSelectData', 'CostAccountingCode')]],
			'DateIncurred': [null, [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'DateIncurred')]],
			'ExpenseTypeId': [null, [this.customvalidators.requiredValidationsWithMessage('PleaseSelectData', 'ExpenseType')]],
			'Quantity': [null],
			'Amount': [null, [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Amount')]],
			'DocumentFileName': [null],
			'StatusId': [statusIds.Submitted],
			'Description': [null, [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Description')]],
			'DmsFieldRecord': [null],
			'Id': [magicNumber.zero]
		});
	}

	ngOnInit(): void {
		this.loadDataToGenerateControls();

		this.activatedRoute.params.pipe(
			switchMap((param) => {
				this.uKey = param['id'] ?? '';
				this.isEditMode = Boolean(this.uKey);
				this.expEntryService.dataHold.next({
					'Screen': (this.isEditMode)
						? 'edit'
						: 'add'
				});
				if (this.isEditMode) {
					return this.expEntryService.getExpenseEntryByUkey(this.uKey);
				} else {
					return of(null);
				}
			}),
			takeUntil(this.destroyAllSubscribtion$)
		).subscribe((response) => {
			if (response)
				this.expenseEditMode(response);
			else
				this.expenseAddMode();
			this.cdr.markForCheck();
		});
		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
	}

	private changeTimeSheetGridHeading = (selectedDate: { 'Value': string }) => {
		this.periodHeading = this.createEntryPeriodHeading(selectedDate.Value, 'Expense Period');
	};

	private createEntryPeriodHeading = (endDate: string, preffix: string): string => {
		const subtractedDate = getSubtractedDate(endDate, magicNumber.six),
			transformedDate = this.datePipe.transform(subtractedDate, 'MM/dd/YYYY'),
			startDate = transformedDate
				? new Date(transformedDate)
				: new Date(subtractedDate);
		return `${preffix}: ${this.localizationService.TransformDate(startDate)} - ${this.localizationService.TransformDate(new Date(endDate))}`;
	};

	private expenseAddMode() {
		const expenseEntrySelection = this.sessionStore.get(TIMEANDEXPENTRYSELECTION);
		if (expenseEntrySelection) {
			const { AssignmentDetails, WeekendingDate } = JSON.parse(expenseEntrySelection) as FilterSideBar;
			this.assignmentDetailsFromService = AssignmentDetails;
			this.assignmentId = AssignmentDetails?.AssignmentId.toString();

			this.AddEditExpenseForm.patchValue({
				'AssignmentId': AssignmentDetails?.AssignmentId,
				'WeekendingDate': WeekendingDate
			});
			this.changeTimeSheetGridHeading(WeekendingDate);
			this.bindingExpenseEntryDetails(AssignmentDetails, WeekendingDate?.Value);
		} else {
			this.backToList();
			return;
		}
	}

	private expenseEditMode(res: GenericResponseBase<ExpenseEntryAddEdit>) {
		if (isSuccessfulResponse(res)) {
			normalizeExpenseEntryDetails(res.Data);
			const { ExpenseEntryDetails, AssignmentId, WeekendingDate, Id, StatusName, ExpenseEntryCode, StatusId } = res.Data;
			this.expEntryService.updateHoldData({ 'ExpenseEntryCode': ExpenseEntryCode, 'StatusName': StatusName, 'StatusId': StatusId, 'Id': Id, 'Screen': 'edit' });
			this.changeTimeSheetGridHeading({ 'Value': WeekendingDate as string });
			if (StatusId != Number(statusIds.Draft) && StatusId != Number(statusIds.Declined)) {
				this.router.navigate([`/xrm/time-and-expense/expense/view/${this.uKey}`]);
				return;
			}
			this.statusId = StatusId;
			this.weekendingDate = this.datePipe.transform(WeekendingDate as string, this.localizationService.GetDateFormat()) ?? '';
			this.weekending = this.datePipe.transform(WeekendingDate as string, 'MM/dd/YYYY') ?? '';
			this.assignmentId = AssignmentId as string;
			this.recordId = Id;
			this.detailsData = ExpenseEntryDetails;
			patchDataFromGetByUkey(res.Data, this.AddEditExpenseForm);
		}
	}

	private submitNewForm(toasterMessage: string) {
		const addPayload = new ExpenseEntryAddEdit(this.AddEditExpenseForm.getRawValue());
		addPayload.ExpenseEntryDetails = this.detailsData;
		if (this.AddEditExpenseForm.valid) {
			this.expEntryService.submitExpenseEntry(addPayload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
				if (isSuccessfulResponse(response)) {
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.toasterServc.displayToaster(ToastOptions.Success, toasterMessage, this.expenseLabelTextParams);
					this.backToList();
				} else if (hasValidationMessages(response)) {
					const localizedErrorMsg = this.localizationService.GetLocalizeMessage(response.Message);
					this.toasterServc.displayToaster(
						ToastOptions.Error, `${localizedErrorMsg} ${createToasterTable(response.Data, this.localizationService)}`,
						[], true
					);
					this.rollBackStatusId();
				}
				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterServc.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', this.expenseLabelTextParams);
					this.rollBackStatusId();
				}
				else if (hasData(response)) {
					const localizedErrorMsg = this.localizationService.GetLocalizeMessage(response.Message);
					this.toasterServc.displayToaster(
						ToastOptions.Warning, `${localizedErrorMsg} ${createToasterTable(response.Data, this.localizationService)}`,
						[], true
					);
					this.rollBackStatusId();
				}
				else {
					this.toasterServc.displayToaster(ToastOptions.Error, response.Message);
					this.rollBackStatusId();
				}
				this.cdr.markForCheck();
			});
		}
	}

	private rollBackStatusId() {
		if (this.isEditMode)
			this.changeStatusId(statusIds.Draft);
	}

	private updateExistedRecord(toasterMessage: string) {
		const updatePayload = new ExpenseEntryAddEdit(this.AddEditExpenseForm.getRawValue());
		updatePayload.ExpenseEntryDetails = alterExpenseEntryDetailsGrid(this.detailsData, this.recordId, this.datePipe);
		updatePayload.UKey = this.uKey;

		if (this.AddEditExpenseForm.valid) {
			this.expEntryService.updateExpenseEntry(updatePayload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
				if (isSuccessfulResponse(response)) {
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.eventLog.isUpdated.next(true);
					this.AddEditExpenseForm.markAsPristine();
					this.ExpenseEntryForm.markAsPristine();
					this.toasterServc.displayToaster(ToastOptions.Success, toasterMessage);
					if (this.AddEditExpenseForm.controls.StatusId.value == Number(statusIds.Submitted)
						|| this.AddEditExpenseForm.controls.StatusId.value == Number(statusIds.ReSubmitted)) {
						this.backToList();
					}
					else {
						this.resetOnSucessfullySubmitDraft();
					}
				}
				else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterServc, this.localizationService);
				}
				else if (hasData(response)) {
					const localizedErrorMsg = this.localizationService.GetLocalizeMessage(response.Message);
					this.toasterServc.displayToaster(
						ToastOptions.Error, `${localizedErrorMsg} ${createToasterTable(response.Data, this.localizationService)}`,
						[], true
					);
				}
				else {
					this.toasterServc.displayToaster(ToastOptions.Error, response.Message);
				}
				this.cdr.markForCheck();
			});
		}
	}

	private resetOnSucessfullySubmitDraft() {
		this.OnResetClick(this.singleRecordWillDisplay, false);
		if (this.buttonStatusChange)
			this.buttonStatusChange = false;
	}

	private changeStatusId(statusId: number) {
		this.AddEditExpenseForm.controls.StatusId.setValue(statusId);
		this.ExpenseEntryForm.controls['StatusId'].setValue(statusId);
		this.detailsData.forEach((item) => {
			item.StatusId = statusId;
		});
	}

	private backToList() {
		this.route.navigate([`/xrm/time-and-expense/expense/list`]);
	}

	public onFileSelect(event: FileSelectEvent) {
		const filedata = event.files || null;
		if (filedata) {
			this.uploadFileData(filedata);
		}
	}

	private uploadFileData(selectedFile: SelectFile[]) {
		this.toasterServc.resetToaster();
		const data = selectedFile[0];
		if (!checkSelectedFileExtension(data.extension, this.allowedExtensions)) {
			const extentioData = this.allowedExtensions,
				allowedExtensions = formatArrayAsString(extentioData),
				localizeParamInvalidExtension: DynamicParam[] = [{ Value: allowedExtensions, IsLocalizeKey: false }];
			this.selectedFileValidationMsg = this.localizationService.GetLocalizeMessage('DocumentInvalidExtensionValidation', localizeParamInvalidExtension);
		} else if (checkFileSizeExceedMaxDocumentSize(data.size, this.maxDocumentSize)) {
			const localizeParamMaxSize: DynamicParam[] = [{ Value: this.maxDocumentSize.toString(), IsLocalizeKey: false }];
			this.selectedFileValidationMsg = this.localizationService.GetLocalizeMessage('DocumentUploadSizeValidation', localizeParamMaxSize);
		} else {
			this.selectedFileValidationMsg = '';
		}
		if (this.selectedFileValidationMsg == '') {
			this.onAddGridDataViaIFormFile(data);
		} else {
			this.toasterServc.displayToaster(ToastOptions.Error, this.selectedFileValidationMsg, []);
		}
	}

	public onAddGridDataViaIFormFile(fileData: SelectFile) {
		const record = fileData,
			formData = new FormData();
		formData.append(`documentAddDto.fileExtension`, (record.extension).replace('.', ''));
		formData.append(`documentAddDto.fileNameWithExtension`, record.name);
		formData.append(`documentAddDto.fileSize`, (record.size).toString());
		formData.append(`documentAddDto.contentType`, record.rawFile.type);
		formData.append(`documentAddDto.chunkNumber`, (magicNumber.zero).toString());
		formData.append(`documentAddDto.totalChunks`, (magicNumber.zero).toString());
		formData.append(`documentAddDto.file`, record.rawFile);
		formData.append(`documentAddDto.fileName`, (record.name).substring(magicNumber.zero, (record.name).lastIndexOf('.')));
		formData.append(`documentAddDto.documentConfigurationId`, '3');
		formData.append(`documentAddDto.documentProcessingType`, (magicNumber.one).toString());
		formData.append(`documentAddDto.encryptedFileName`, record.uid);
		this.dmsImplementationService.uploadDocument(formData).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<FileUploadDetails>) => {
				if (isSuccessfulResponse(res)) {
					const dmsFiledRecord = {
						"id": magicNumber.zero,
						"statusId": magicNumber.one,
						"DocumentName": res.Data.FileNameWithExtension,
						"FileName": res.Data.FileName,
						"FileExtension": (res.Data.FileExtension).replace('.', ''),
						"FileNameWithExtension": res.Data.FileNameWithExtension,
						"EncryptedFileName": res.Data.EncryptedFileName,
						"DocumentAddDto": {
							"DocumentConfigurationId": magicNumber.three,
							"FileName": res.Data.FileName,
							"FileExtension": (res.Data.FileExtension).replace('.', ''),
							"FileNameWithExtension": res.Data.FileNameWithExtension,
							"EncryptedFileName": res.Data.EncryptedFileName,
							"FileSize": res.Data.FileSize
						}
					};

					this.ExpenseEntryForm.patchValue({ 'DmsFieldRecord': dmsFiledRecord });
					this.ExpenseEntryForm.patchValue({ 'DocumentFileName': res.Data.FileNameWithExtension });
				} else {
					this.toasterServc.displayToaster(ToastOptions.Error, 'VirusDetected');
				}
				this.cdr.markForCheck();
			});
	}

	public clearFile() {
		this.ExpenseEntryForm.patchValue({ 'DmsFieldRecord': null });
		this.ExpenseEntryForm.patchValue({ 'DocumentFileName': null });
	}

	private loadDataToGenerateControls() {
		const data = {
			workFlowId: magicNumber.thirtySix,
			sectorId: magicNumber.zero,
			uploadStageId: magicNumber.twoHundredSixtyOne
		};
		this.dmsImplementationService.loadDataToGenerateControls(data).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<DocumentControlConfig[]>) => {
				if (isSuccessfulResponse(res)) {
					if (res.Data.length > Number(magicNumber.zero)) {
						this.allowedExtensions = res.Data[0].AllowedExtensions.split(',');
						this.maxDocumentSize = res.Data[0].MaxDocumentSize;
					}
				}
				this.cdr.markForCheck();
			});
	}

	public onDateSelect(date: string) {
		this.ExpenseEntryForm.controls['DateIncurred'].clearValidators();

		this.ExpenseEntryForm.controls['DateIncurred'].addValidators([
			this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'DateIncurred'),
			this.dateRange({
				firstDate: this.dateIncurred.AssignmentStartDate,
				secondDate: this.dateIncurred.AssignmentEndDate,
				validationMessage: 'DateIncurredWithinRange'
			})
		]);

		if (this.costAccountingEffData?.HasChargeEffectiveDate) {
			const dateRangeValidator = this.dateRange({
				firstDate: this.costAccountingEffData.EffectiveStartDate,
				secondDate: this.costAccountingEffData.EffectiveEndDate,
				validationMessage: 'DateIncurredNotFallWithinEffectiveaAndEndDate'
			});
			this.ExpenseEntryForm.controls['DateIncurred'].addValidators(dateRangeValidator);
		}

		this.ExpenseEntryForm.controls['DateIncurred'].updateValueAndValidity();
	}


	private dateRange(params :DateRangeParams) {
		return (control: AbstractControl) => {
			if (control.value == null) return null;
			// if (control.value.length == magicNumber.zero) return null;
			const date = control.value,
				error = this.weekendingDateValidation({
					selectedDateIncurred: date,
					firstDate: params.firstDate,
					secondDate: params.secondDate,
					validationMessage: params.validationMessage,
					dynamicParam: params.dynamicParam ?? []
				});
			return error;
		};
	}

	private weekendingDateValidation({
		selectedDateIncurred,
		firstDate,
		secondDate,
		validationMessage,
		dynamicParam = []
	}: WeekendingDateValidationParams) {
		const currWeekendingDate = new Date((this.isEditMode)
			? this.AddEditExpenseForm.controls.WeekendingDate.value as string
			: (this.AddEditExpenseForm.controls.WeekendingDate.value as IDropdownWithExtras).Value);
		selectedDateIncurred.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
		if ((selectedDateIncurred >= new Date(firstDate) && selectedDateIncurred <= new Date(secondDate))
			&& selectedDateIncurred <= currWeekendingDate) {
			return null;
		}
		else if (selectedDateIncurred > currWeekendingDate) {
			return { error: true, message: 'TheValueInDateIncurredCanNotBeyondTheWeekendingDate', dynamicParam: dynamicParam };
		}
		return { error: true, message: validationMessage, dynamicParam: dynamicParam };
	}


	public addUpdateExpenseEntry() {
		this.ExpenseEntryForm.markAllAsTouched();
		if (this.ExpenseEntryForm.valid) {
			if(this.isMileageRateConfigured())
				this.toasterServc.displayToaster(ToastOptions.Error, 'TheMileageRateIsNotConfigured');
			else {
				this.toasterServc.resetToaster();
				const expenseEntryPayload = new ExpenseEntryDetailGrid(this.ExpenseEntryForm.getRawValue());
				this.detailsData = !this.buttonStatusChange
					? [{ ...expenseEntryPayload, 'Id': magicNumber.zero }, ...this.detailsData]
					: this.detailsData.map((item, index) => {
						return index === this.updateRowIndex
							? expenseEntryPayload
							: item;
					});

				this.buttonStatusChange = false;
				this.OnResetClick(this.singleRecordWillDisplay);
			}
		}
	}

	private isMileageRateConfigured() {
		return this.mileageRate == Number(magicNumber.zero) && this.NatureOfExpenseId == Number(NatureOfExpenses.Mileage);
	}

	public bindingExpenseEntryDetails({ AssignmentId, SectorId, AssignmentStartDate, CurrencyCode,
		AssignmentEndDate, MileageRate, AllowExpenseEntry, AssignmentCode, ContractorName }: AssignmentDetailsData, weekendingDate: string = '') {

		this.mileageRate = MileageRate;
		this.isAllowExpenseEntry = AllowExpenseEntry;
		this.expEntryService.updateHoldData({ 'AssignmentCode': AssignmentCode, 'ContractorName': ContractorName });
		this.updateCurrencyCode(CurrencyCode);
		this.dateIncurred = { 'AssignmentStartDate': AssignmentStartDate, 'AssignmentEndDate': AssignmentEndDate };
		forkJoin({
			'CostCodeAgainstAssignment': this.expEntryService.getCostAccCodeAgainstAssingment(AssignmentId, this.datePipe.transform(weekendingDate, 'MM/dd/YYYY') ?? ''),
			'ExpenseTypeAgainstSector': this.expTypeService.getDropdownRecordsBySectorId(parseInt(SectorId))
		}).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(({ CostCodeAgainstAssignment, ExpenseTypeAgainstSector }) => {
			this.getCostAccCodeAgainstAssignment(CostCodeAgainstAssignment);
			this.getExpenseTypeForSector(ExpenseTypeAgainstSector);
			this.cdr.markForCheck();
		});
	}

	private updateCurrencyCode(currCode: string) {
		this.currencyCode = currCode;
		this.currencyDynamicParams[1].Value = currCode;
	}

	private getCostAccCodeAgainstAssignment(response: GenericResponseBase<DropdownModel[]>) {
		if (isSuccessfulResponse(response)) {
			const { Data } = response;
			this.costAccountingList = Data;
			if (this.costAccountingList.length === Number(magicNumber.one)) {
				displayData(this.costAccountingList, 'CostAccountingCodeId', this.ExpenseEntryForm);
				this.getAssignmentCostEffectiveDates(this.ExpenseEntryForm.get('CostAccountingCodeId')?.value);
			}
		}
	}

	public getAssignmentCostEffectiveDates(data: IDropdownWithExtras | undefined) {
		if (data) {
			this.expEntryService.getAssignmentCostEffectiveDates(parseInt(data.Value))
				.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
					if (isSuccessfulResponse(response))
						this.costAccountingEffData = response.Data;
					this.cdr.markForCheck();
				});
		}
	}

	private getExpenseTypeForSector(response: GenericResponseBase<DropdownModel[]>) {
		if (isSuccessfulResponse(response)) {
			const { Data } = response;
			this.expenseTypeList = Data;
			if(this.expenseTypeList.length === Number(magicNumber.one)) {
				displayData(this.expenseTypeList, 'ExpenseTypeId', this.ExpenseEntryForm);
				this.onExpenseTypeList(this.ExpenseEntryForm.controls['ExpenseTypeId'].getRawValue());
			}
		}
	}

	public onValidationChange(controlName: string, value: number, labelName: string) {
		this.ExpenseEntryForm.controls['Amount'].clearValidators();
		this.ExpenseEntryForm.controls[controlName].clearValidators();
		this.ExpenseEntryForm.controls[controlName].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', labelName));
		if (value == Number(magicNumber.zero)) {
			this.ExpenseEntryForm.controls[controlName].setErrors({ error: true, message: this.localizationService.GetLocalizeMessage('FieldSpecificValueGreaterThanZero', [{ Value: labelName, IsLocalizeKey: true }]) });
			this.ExpenseEntryForm.controls[controlName].markAsTouched();
		}
		else if (labelName == 'Hours') {
			if (value < Number(magicNumber.zero)) {
				this.ExpenseEntryForm.controls[controlName].addValidators(this.customvalidators.RangeValidator(-magicNumber.oneHundredSixtyEight, -magicNumber.zeroDotZeroOne, 'FieldSpecificValueGreaterEqual', [{ Value: labelName, IsLocalizeKey: true }, { Value: '-168.00', IsLocalizeKey: false }]));
				this.ExpenseEntryForm.controls[controlName].updateValueAndValidity();
			} else {
				this.ExpenseEntryForm.controls[controlName].addValidators(this.customvalidators.RangeValidator(magicNumber.zero, magicNumber.oneHundredSixtyEight, 'FieldSpecificValueLessEqual', [{ Value: labelName, IsLocalizeKey: true }, { Value: '168.00', IsLocalizeKey: false }]));
				this.ExpenseEntryForm.controls[controlName].updateValueAndValidity();
			}
		} else if (value < Number(magicNumber.zero)) {
			this.ExpenseEntryForm.controls[controlName].addValidators(this.customvalidators.RangeValidator(-magicNumber.tripleNineWithTripleNine, -magicNumber.zeroDotZeroOne, 'FieldSpecificValueGreaterEqual', [{ Value: labelName, IsLocalizeKey: true }, { Value: '-999999.00', IsLocalizeKey: false }]));
			this.ExpenseEntryForm.controls[controlName].updateValueAndValidity();
		} else {
			this.ExpenseEntryForm.controls[controlName].addValidators(this.customvalidators.RangeValidator(magicNumber.zero, magicNumber.tripleNineWithTripleNine, 'FieldSpecificValueLessEqual', [{ Value: labelName, IsLocalizeKey: true }, { Value: '999999.00', IsLocalizeKey: false }]));
			this.ExpenseEntryForm.controls[controlName].updateValueAndValidity();
		}
		this.cdr.markForCheck();
	}

	public calculatedAmount(labelName: string, value: number) {
		this.onValidationChange('Quantity', value, labelName);
		if (this.milesOrHours == 'Miles') {
			const calculatedValue = value * this.mileageRate,
				roundedValue = Number(calculatedValue.toFixed(magicNumber.two));

			this.ExpenseEntryForm.controls['Amount'].setValue(value
				? roundedValue.toFixed(magicNumber.two)
				: null);

			if (value < Number(magicNumber.zero)) {
				this.ExpenseEntryForm.controls['Quantity'].addValidators(this.customvalidators.RangeValidator(-magicNumber.tripleNineWithTripleNine / this.mileageRate, -magicNumber.zeroDotZeroOne, 'FieldSpecificValueGreaterEqual', [{ Value: 'Amount', IsLocalizeKey: true }, { Value: '-999999.00', IsLocalizeKey: false }]));
				this.ExpenseEntryForm.controls['Quantity'].updateValueAndValidity();
			} else {
				this.ExpenseEntryForm.controls['Quantity'].addValidators(this.customvalidators.RangeValidator(magicNumber.zero, magicNumber.tripleNineWithTripleNine / this.mileageRate, 'FieldSpecificValueLessEqual', [{ Value: 'Amount', IsLocalizeKey: true }, { Value: '999999.00', IsLocalizeKey: false }]));
				this.ExpenseEntryForm.controls['Quantity'].updateValueAndValidity();
			}
		}
		this.cdr.markForCheck();
	}

	// eslint-disable-next-line max-lines-per-function
	public onExpenseTypeList(param: IDropdownWithExtras | undefined, patchForm: boolean = false, selectedRow?: ExpenseEntryDetailGrid) {
		if (param) {
			this.toasterServc.resetToaster();
			const { Value } = param;
			this.ExpenseEntryForm.controls['Amount'].reset();
			this.ExpenseEntryForm.controls['Quantity'].reset();
			this.expEntryService.getByIdExpenseType(parseInt(Value)).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
				if(isSuccessfulResponse(response)) {
					this.NatureOfExpenseId = Number(response.Data.NatureOfExpenseId ?? magicNumber.zero);
					this.ExpenseEntryForm.controls['Quantity'].clearValidators();
					this.ExpenseEntryForm.controls['Quantity'].updateValueAndValidity();
					this.ExpenseEntryForm.controls['Amount'].clearValidators();
					this.ExpenseEntryForm.controls['Amount'].updateValueAndValidity();
					if (this.NatureOfExpenseId == Number(NatureOfExpenses.AmountOnly)) {
						this.isReadOnly = false;
						this.isClassChange = true;
						this.ExpenseEntryForm.controls['Amount'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Amount'));
						this.ExpenseEntryForm.controls['Amount'].updateValueAndValidity();
					}
					else if (this.NatureOfExpenseId == Number(NatureOfExpenses.Mileage)) {
						this.isClassChange = false;
						this.milesOrHours = 'Miles';
						this.maxLength = magicNumber.nine;
						this.isReadOnly = true;
						this.roundedDecimal = magicNumber.one;
						this.ExpenseEntryForm.controls['Quantity'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Miles'));
						this.ExpenseEntryForm.controls['Amount'].clearValidators();
						this.ExpenseEntryForm.controls['Amount'].updateValueAndValidity();
					}
					else if (this.NatureOfExpenseId == Number(NatureOfExpenses.HoursAndAmount)) {
						this.isClassChange = false;
						this.milesOrHours = 'Hours';
						this.isReadOnly = false;
						this.maxLength = magicNumber.seven;
						this.roundedDecimal = magicNumber.two;
						this.ExpenseEntryForm.controls['Quantity'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Hours'));
						this.ExpenseEntryForm.controls['Amount'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Amount'));
						this.ExpenseEntryForm.controls['Amount'].updateValueAndValidity();
					}
				}
				if (patchForm && selectedRow) {
					const selectedRowCopy = {...selectedRow};
					this.checkExpenseTypeOrCACIsInactive(selectedRowCopy);
					formBindOnEditClick(selectedRowCopy, this.ExpenseEntryForm, this.NatureOfExpenseId);
				}
				this.cdr.markForCheck();
			});
		} else {
			this.isClassChange = true;
			this.resetExpenseEntryForm();
		}
	}

	private checkExpenseTypeOrCACIsInactive = (selectedRow: ExpenseEntryDetailGrid) => {
		if(!this.elePresentInDropdownOrNot(this.expenseTypeList, selectedRow.ExpenseTypeId as string)) {
			selectedRow.ExpenseTypeName = '';
			selectedRow.ExpenseTypeId = '0';
		}

		if(!this.elePresentInDropdownOrNot(this.costAccountingList, selectedRow.CostAccountingCodeId as string)) {
			selectedRow.CostAccountingName = '';
			selectedRow.CostAccountingCodeId = '0';
		}
	};

	private resetExpenseEntryForm() {
		this.ExpenseEntryForm.controls['Amount'].reset();
		this.ExpenseEntryForm.controls['Quantity'].reset();
		this.NatureOfExpenseId = magicNumber.zero;
		this.ExpenseEntryForm.controls['Quantity'].clearValidators();
		this.ExpenseEntryForm.controls['Quantity'].updateValueAndValidity();
		this.ExpenseEntryForm.controls['Amount'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Amount'));
		this.ExpenseEntryForm.controls['Amount'].updateValueAndValidity();
		this.isReadOnly = false;
	}

	public OnResetClick(singleRecordWillDisplay?: () => void, makeExpenseFormDirty: boolean = true) {
		if (singleRecordWillDisplay) {
			this.enabled = false;
			singleRecordWillDisplay();

			if (this.expenseTypeList.length != Number(magicNumber.one))
				this.resetExpenseEntryForm();

		}
		else {
			this.ExpenseEntryForm.reset({ 'StatusId': statusIds.Submitted });
			this.resetExpenseEntryForm();
			this.toasterServc.resetToaster();
			this.buttonStatusChange = false;
		}
		if (this.ExpenseEntryForm.pristine && makeExpenseFormDirty)
			this.ExpenseEntryForm.markAsDirty();
	}

	private singleRecordWillDisplay = () => {
		this.ExpenseEntryForm.controls['CostAccountingCodeId'].reset((this.costAccountingList.length == Number(magicNumber.one))
			? this.costAccountingList[0]
			: null);

		this.ExpenseEntryForm.controls['ExpenseTypeId'].reset((this.expenseTypeList.length == Number(magicNumber.one))
			? this.expenseTypeList[0]
			: null);
		this.ExpenseEntryForm.controls['Amount'].reset(null, { emitEvent: false });
		this.ExpenseEntryForm.controls['Quantity'].reset(null, { emitEvent: false });
		this.ExpenseEntryForm.controls['DocumentFileName'].setValue(null, { emitEvent: false });
		this.ExpenseEntryForm.controls['DmsFieldRecord'].setValue(null, { emitEvent: false });
		this.ExpenseEntryForm.controls['Description'].reset(null, { emitEvent: false });
		this.ExpenseEntryForm.controls['DateIncurred'].reset(null, { emitEvent: false });
		if (this.NatureOfExpenseId == Number(NatureOfExpenses.Mileage)) {
			this.ExpenseEntryForm.controls['Quantity'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Miles'));
			this.ExpenseEntryForm.controls['Amount'].setValue(null);
		}
		else if (this.NatureOfExpenseId == Number(NatureOfExpenses.HoursAndAmount)) {
			this.ExpenseEntryForm.controls['Quantity'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Hours'));
		}
		this.ExpenseEntryForm.controls['Amount'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'Amount'));
		this.ExpenseEntryForm.controls['Amount'].updateValueAndValidity({ emitEvent: false });
		this.ExpenseEntryForm.controls['Quantity'].updateValueAndValidity({ emitEvent: false });
		const time = window.setTimeout(() => {
			this.enabled = true;
		}, magicNumber.oneThousand);

		this.timeOut.push(time);
	};

	public successStaff() {
		this.AddEditExpenseForm.markAllAsTouched();
		if (this.AddEditExpenseForm.valid) {
			this.successFullySaved = true;
		}
	}

	public closeDialog() {
		this.successFullySaved = false;
	}

	public openDialog(operation?: string) {
		if (!this.isAllowExpenseEntry) {
			this.restrictExpenseEntry();
			return;
		}
		this.validExpenseEntry(operation ?? '');

		this.successFullySaved = false;
	}

	private restrictExpenseEntry() {
		this.toasterServc.displayToaster(ToastOptions.Error, 'ExpenseEntryIsRestricted');
		this.closeDialog();
	}

	private validExpenseEntry(casee: string) {
		const caseOperation = { toasterMsg: '' };
		this.caseHandling(casee, caseOperation);

		if (this.isEditMode)
			this.updateExistedRecord(caseOperation.toasterMsg);
		else
			this.submitNewForm(caseOperation.toasterMsg);
	}

	private caseHandling(scenario: string, operation: { toasterMsg: string }) {
		switch (scenario) {
			case 'Draft':
				this.changeStatusId(statusIds.Draft);
				operation.toasterMsg = this.draftToasterMessage;
				break;

			case 'Add':
				this.changeStatusId(statusIds.Submitted);
				operation.toasterMsg = this.addToasterMessage;
				break;

			case 'Edit':
				this.changeStatusId((this.AddEditExpenseForm.controls.StatusId.value === Number(statusIds.Draft))
					? statusIds.Submitted
					: statusIds.ReSubmitted);
				operation.toasterMsg = (this.AddEditExpenseForm.controls.StatusId.value === Number(statusIds.Submitted))
					? this.addToasterMessage
					: this.editToasterMessage;
				break;

			default:
			// "Invalid"
		}
	}

	public editDetails({ selectedRow, index }: { selectedRow: ExpenseEntryDetailGrid, index: number }) {
		// if(!this.elePresentInDropdownOrNot(this.expenseTypeList, selectedRow.ExpenseTypeId as string) ||
		// 	!this.elePresentInDropdownOrNot(this.costAccountingList, selectedRow.CostAccountingCodeId as string)) {
		// 	return;
		// }
		this.buttonStatusChange = true;
		this.updateRowIndex = index;
		this.onExpenseTypeList({ 'Text': selectedRow.ExpenseTypeName, 'Value': selectedRow.ExpenseTypeId } as IDropdownWithExtras, true, selectedRow);
		this.screenScrollOnExpenseEntrySection();
		this.ExpenseEntryForm.controls['DateIncurred'].setValue(selectedRow.DateIncurred);
	}

	private elePresentInDropdownOrNot = (list: DropdownModel[], searchEle: string) => {
		return list.some((ele) =>
			ele.Value == searchEle);
	};

	public deletedDetails($event: ExpenseEntryDetailGrid[]) {
		this.detailsData = $event;
	}

	private screenScrollOnExpenseEntrySection() {
		this.scrollTo.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
	}

	ngOnDestroy(): void {
		if ((this.isEditMode && this.AddEditExpenseForm.controls.StatusId.value != Number(statusIds.Submitted)) ||
			this.toasterServc.isRemovableToaster) {
			if (this.AddEditExpenseForm.controls.StatusId.value != Number(statusIds.ReSubmitted))
				this.toasterServc.resetToaster();
		}
		if(this.timeOut.length) {
			this.timeOut.forEach((time) => {
				clearTimeout(time);
			});
		}
		this.expEntryService.updateHoldData(null);
		this.sessionStore.remove(TIMEANDEXPENTRYSELECTION);
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
