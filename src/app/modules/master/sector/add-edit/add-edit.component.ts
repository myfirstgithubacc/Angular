
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { GetExisitngSectors, GetSector, GetSectorAllDropdowns, GetSectorByUKey, ResetSectorStates, SetSectorDetails } from '@xrm-core/store/actions/sector.action';
import { BehaviorSubject, Observable, Subject, Subscription, catchError, forkJoin, map, of, take, takeUntil } from 'rxjs';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { StepperActivateEvent } from '@progress/kendo-angular-layout';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import formArrayAddModeValidationHandle from '../common/patchFormArray';
import { BackgroundCheckValidation, removeIsVisibleToClientError } from './background-checks/BackgroundChecks-DependentValidations';
import { getEmailApprovalConfigFormModel } from './email-approval-configurations/utils/formModel';
import { getShiftConfigFormModel } from './shift-configurations/utils/formModel';
import { getPricingModelConfigFormModel } from './pricing-model-configurations/utils/formModel';
import { getRateAndFeesConfigFormModel } from './rates-and-fees-configurations/utils/helper';
import { getTenureConfigFormModel } from './tenure-configurations/utils/helper';
import { getChargeNumberConfigFormModel } from './charge-number-configurations/utils/helper';
import { getConfigMSPProcessActivityFormModel } from './configure-msp-process-activity/utils/formModel';
import { getAssignmentExtOtherConfigFormModel } from './assignment-extension-and-other-configurations/utils/formModel';
import { getTimeAndExpenseConfigFormModel } from './time-and-expense-configurations/utils/helper';
import { getXrmTimeClockDetailsFormModel, IXrmTimeClockDetailsFM, patchXrmTimeClockDetails } from './xrm-time-clock/utils/helper';
import { getRfxConfigFormModel } from './rfx-configurations/utils/helper';
import { getBenefitAdderConfigFormModel } from './benefit-add-configurations/utils/helper';
import { getOrgStructureFormModel } from './organization-structure/utils/helper';
import { getPerformanceSurveyConfigFormModel, IPerformanceSurveyConfigFM } from './performance-survey-configurations/utils/helper';
import { getBasicDetailsFormModel, IBasicDetailsFM, patchBasicDetails } from './basic-details/utils/helper';
import { getSubmittalConfigFormModel } from './submittal-configurations/utils/helper';
import { getRequisitionConfigFormModel } from './requisition-configurations/utils/helper';
import { StepDataModel } from '@xrm-core/models/Sector/sector-rfx-configuration.model';
import { getBackgroundChecksFormModel } from './background-checks/utils/helper';
import { getUserDefinedFieldsFormModel } from './user-defined-fields/utils/helper';
import { ISectorFM } from '../common/helper';
import { IPreparedUdfPayloadData, IUdfConfig } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { hasValidationMessages } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDropdown } from '@xrm-shared/models/common.model';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { UdfImplementationService } from '@xrm-shared/common-components/udf-implementation/service/udf-implementation.service';

@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('BackGroundCheckslist') BackGroundCheckslist: ElementRef|undefined;
	private udfLoadControlsPayload = {
		"entityId": 1,
		"sectorId": 0,
		"recordId": 0,
		"recordUKey": "",
		"IsShowNewUdfConfigs": true,
		"editMode": 1,
		"parentsInfos": [],
		"IsDraft": false
	};
	public isCopy: number = magicNumber.zero;
	public disableFocusOnErrorScroll: boolean = true;
	public isEditMode: boolean = false;
	public currentStep: number = magicNumber.zero;
	public resetStep: boolean = false;
	public isSubmitted: boolean = false;
	private updatedSteps = 'updateAllData';
	public IsCopied: boolean = false;
	public showAllSectionsSwitch: boolean = false;
	private showAllSectionsSwitchOld: boolean = false;
	public EditSectorForm: FormGroup<ISectorFM>;
	public CopySectorForm: FormGroup;
	public directiveForms: FormGroup;
	public wholeSectorSubmitData: Sector = new Sector();
	public isDraft: boolean = false;
	private sectorId: string;
	private statusCode: string;
	private getByUkeySectorData: Sector|undefined;
	public BasicDetailsTouched: number = magicNumber.zero;
	private uKey: string = '';
	private copySectorId: number;
	private allSectorList: { Text:string|null, Status:string|null }[] = [];
	private dialogPopupSubscribe: Subscription;
	private unsubscribe$: Subject<void> = new Subject<void>();
	public btnType = 'add';
	public udfControlConfig = new BehaviorSubject([]);
	private populatedDataOrgLevelConfigs = [
		{ OrgName: '', IsVisible: true, OrgType: magicNumber.one, IsMandatory: true, Id: magicNumber.zero },
		{ OrgName: '', IsVisible: false, OrgType: magicNumber.two, IsMandatory: false, Id: magicNumber.zero },
		{ OrgName: '', IsVisible: false, OrgType: magicNumber.three, IsMandatory: false, Id: magicNumber.zero },
		{ OrgName: '', IsVisible: false, OrgType: magicNumber.four, IsMandatory: false, Id: magicNumber.zero }
	];

	public prefilledDataSubmittal = [
		{
			Id: magicNumber.zero,
			LabelName: 'UID',
			ToolTip: '',
			MaxLength: null,
			IsNumeric: false,
			IsPartialEntry: false,
			RightmostChars: null
		}
	];

	private updateButtonClicked: boolean = false;
	private SectorLoaded$!: Observable<boolean>;
	private errorToasterEnable: boolean = false;
	private requestedIndex: number;
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	private performanceQuestionLabel: string = '';
	private countryName: string;
	private timeoutIds: number[] = [];
	public steps: StepDataModel[] = [];
	public fieldSectorName: string;

	// eslint-disable-next-line max-params, max-lines-per-function
	constructor(
		private formBuilder: FormBuilder,
		private customvalidators: CustomValidators,
		private store: Store,
		private route: Router,
		private sectorService: SectorService,
		private activatedRoute: ActivatedRoute,
		private dialogPopupService: DialogPopupService,
		private localizationService: LocalizationService,
		private eventLog: EventLogService,
		private translate: TranslateService,
		private loaderService: LoaderService,
		private screenTitle: PageTitleService,
		private toasterService: ToasterService,
		private cdr: ChangeDetectorRef,
		private widget: WidgetServiceService,
		private udfService: UdfImplementationService
	) {
		this.steps = this.sectorService.getSteps();
		this.localizeStepperLabel();
		this.fieldSectorName = this.localizationService.GetLocalizeMessage('SectorName', this.sectorLabelTextParams);
		this.activatedRoute.params.pipe(take(magicNumber.one), takeUntil(this.unsubscribe$)).subscribe((param: Params) => {
			this.sectorService.setRoute.next(param['id']);
		});
		this.CopySectorForm = this.formBuilder.group({
			'existingSectorDropDownList': [null]
		});
		this.EditSectorForm = this.formBuilder.group<ISectorFM>({
			'UKey': new FormControl<string|null>(null),
			'SectorUkey': new FormControl<string|null>(null),
			'IsCopySector': new FormControl<boolean>(false, { nonNullable: true }),
			'BasicDetail': getBasicDetailsFormModel(this.customvalidators),
			'OrgLevelConfigs': getOrgStructureFormModel(this.customvalidators),
			'ShiftConfiguration': getShiftConfigFormModel(),
			'PricingModelConfiguration': getPricingModelConfigFormModel(this.customvalidators),
			'RatesAndFeesConfiguration': getRateAndFeesConfigFormModel(this.customvalidators),
			'TimeAndExpenseConfiguration': getTimeAndExpenseConfigFormModel(this.customvalidators),
			'AssignmentExtensionAndOtherConfiguration': getAssignmentExtOtherConfigFormModel(this.customvalidators),
			'TenureConfiguration': getTenureConfigFormModel(this.customvalidators),
			'RequisitionConfiguration': getRequisitionConfigFormModel(this.customvalidators),
			'SubmittalConfiguration': getSubmittalConfigFormModel(this.customvalidators),
			'BenefitAdderConfiguration': getBenefitAdderConfigFormModel(),
			'ConfigureMspProcessActivity': getConfigMSPProcessActivityFormModel(),
			'PerformanceSurveyConfiguration': getPerformanceSurveyConfigFormModel(this.customvalidators),
			'RfxConfiguration': getRfxConfigFormModel(this.customvalidators),
			'ChargeNumberConfiguration': getChargeNumberConfigFormModel(this.customvalidators),
			'BackgroundCheck': getBackgroundChecksFormModel(this.customvalidators),
			'XrmTimeClock': getXrmTimeClockDetailsFormModel(this.customvalidators),
			'UserDefineFields': getUserDefinedFieldsFormModel(),
			'EmailApprovalConfiguration': getEmailApprovalConfigFormModel(),
			'StatusCode': new FormControl<string>('A', { nonNullable: true }),
			'CopyFromSectorId': new FormControl<number|null>(null)
		});
		// it is for appFocusOnError Directive
		this.directiveForms = this.EditSectorForm.get(this.steps[0].name ?? '') as FormGroup;
		this.SectorLoaded$ = this.store.select(SectorState.sectorsLoaded);
	}

	ngOnInit(): void {

		this.requestedIndex = this.currentStep;
		this.sectorService.getRoute.pipe(take(magicNumber.one), takeUntil(this.unsubscribe$)).subscribe((id) => {
			this.uKey = id;
		});
		this.sectorService.ShowAllSectionsSwitch.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
			this.showAllSectionsSwitch = data;
		});
		this.sectorService.showAllSectorSection.pipe(takeUntil(this.unsubscribe$)).subscribe((data:boolean) => {
			this.showAll(data);
		});
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		this.store.dispatch(new GetSectorAllDropdowns(this.uKey ?? ''));
		if (this.uKey)
		{
			this.getIsEditSectorDetails(this.uKey);
		} else {
			this.isUdfSectionShow();
		}

		if (!this.isEditMode && !this.isDraft) {
			this.store.select(SectorState.exisitngCopyDropdownListLoaded).pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
				if (!data) {
					this.getExisitngSectorDropdownList();
				}
			});
		}

		this.dialogPopupServiceResponse();

		if (this.isEditMode) this.btnType = 'edit';

		this.getExistingSectorsData();
		this.sectorService.setInitialDefault();
	}

	ngAfterViewInit(): void {
		this.performanceQuestionLabel = this.localizationService.GetLocalizeMessage('WouldYouConsiderCLPHire');
		const form = this.EditSectorForm.get('PerformanceSurveyConfiguration') as FormGroup<IPerformanceSurveyConfigFM>;
		form.controls.QuestionLabel.setValue(this.performanceQuestionLabel);
	}

	private isUdfSectionShow = () => {
		this.udfService.loadDataToGenerateControls(this.udfLoadControlsPayload).pipe(take(magicNumber.one), takeUntil(this.unsubscribe$))
			.subscribe((res) => {
				if(!res.Succeeded)
					return;
				const controls = res.Data ?? [];
				if(!controls.length) {
					this.steps.splice(magicNumber.eighteen, magicNumber.one);
					this.steps = [...this.steps];
				}
				this.cdr.markForCheck();
			});
	};

	private dialogPopupServiceResponse() {
		this.dialogPopupSubscribe =
			this.dialogPopupService.dialogButtonObs.pipe(takeUntil(this.unsubscribe$)).subscribe((data:{text: string; value: number; Id: string;
				 themeColor?:string}|null) => {
				if (data && (data.Id !== '')) {
					if (data.value === Number(magicNumber.one)) {
						this.toasterService.resetToaster();
						this.updateSector(data.Id);
					} else if (data.value === Number(magicNumber.two)) {
						const currentSectionDetail = this.EditSectorForm.get(this.steps[this.currentStep].name ?? '') as FormGroup;
						if (this.currentStep != this.requestedIndex)
							currentSectionDetail.markAsPristine();
						this.currentStep = this.requestedIndex;
					} else if (data.value == Number(magicNumber.three)) this.requestedIndex = this.currentStep;
					else if (data.value == Number(magicNumber.four)) {
						this.toasterService.resetToaster();
						this.SaveAsDraft(this.steps[this.currentStep].name ?? '');
					} else if (data.value == Number(magicNumber.five))
						this.route.navigate(['/xrm/master/sector/list']);
					this.cdr.markForCheck();
				}
				this.dialogPopupService.resetDialogButton();
			});
	}

	private getPopupButtons(id: string) {
		return [
			{
				text: 'Yessave',
				value: magicNumber.one,
				themeColor: 'primary',
				Id: id
			},
			{
				text: 'Nosave',
				value: magicNumber.two,
				Id: id
			},
			{
				text: 'Cancel',
				value: magicNumber.three,
				Id: id
			}
		];
	}

	private getPopupButtonsDraft(id: string) {
		return [
			{
				text: 'Yessave',
				value: magicNumber.four,
				themeColor: 'primary',
				Id: id
			},
			{
				text: 'Nosave',
				value: magicNumber.two,
				Id: id
			},
			{
				text: 'Cancel',
				value: magicNumber.three,
				Id: id
			}
		];
	}

	private addAndUpdateDialogResponse(data: {response:string, section?:string, message?:string}) {
		this.toasterService.resetToaster();
		if (data.response === 'add') {
			this.submit();
		} else if (data.response === 'Update') {
			this.updateSector(data.section ?? '');
		}
	}

	private updateSector(steps: string) {
		const formGroup = this.EditSectorForm.get(steps),
			patchData = formGroup?.getRawValue();
		patchData.UKey = this.uKey;

		/* isEditMode property always want countryName and Value to show as a Paragraph
		 but after putting data on store countryName is removed from it.*/
		if (steps === 'BasicDetail') {
			patchData.CountryName = this.countryName;
		}

		this.sectorService.updateSectorData(patchData, steps).pipe(take(magicNumber.one), takeUntil(this.unsubscribe$))
			.subscribe((res) => {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.sectorLabelTextParams);
				if (res.Succeeded) {
					this.eventLog.isUpdated.next(true);
					const messageParams: DynamicParam[] = [{ Value: this.steps[this.currentStep].id ?? '', IsLocalizeKey: true }];
					let messageParam:DynamicParam[]= [{ Value: '', IsLocalizeKey: true }];
					if(this.steps[this.currentStep].id === 'TAndEConfigurations' || this.steps[this.currentStep].id === 'RFxConfigurations'){
						const data = this.localizationService.GetLocalizeMessage(messageParams[0].Value),
							result = data.replace('Configurations', 'Configurations'.toLowerCase());
						messageParam[0].Value=result;
					}else{
						messageParam = this.localizationService.getLocalizationMessageInLowerCase(messageParams);
					}
					this.showToaster(ToastOptions.Success, 'SubmitSuccessConfirmation', messageParam);

					this.currentStep = this.updateButtonClicked
						? this.currentStep
						: this.requestedIndex;

					this.store.dispatch(new ResetSectorStates(patchData, steps));

					formGroup?.markAsPristine();
					this.loaderService.isBusy.next(false);
					this.localizationService.Refresh();
				} else if (hasValidationMessages(res)) {
					ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
				} else if (res.StatusCode == Number(magicNumber.fourHundredNine)) {
					this.showToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
				} else {
					if(res.Message === 'RuleNotImplementedForModified')
						res.Message = this.localizationService.GetLocalizeMessage('RuleNotImplementedForModified', localizeTextParams);
					this.showToaster(ToastOptions.Error, res.Message);
				}
				this.cdr.markForCheck();
			});
	}

	private getSector() {
		this.SectorLoaded$.pipe(take(magicNumber.one), takeUntil(this.unsubscribe$)).subscribe((result) => {
			if (!result) {
				this.store.dispatch(new GetSector()).pipe(catchError(() => {
					this.cdr.markForCheck();
					return of('');
				}));
			}
		});
	}

	// Binding on Edit Mode of Sector...
	private getIsEditSectorDetails(id: string) {
		this.getSector();
		this.uKey = id;
		this.isEditMode = true;
		this.btnType = 'edit';
		this.store.dispatch(new GetSectorByUKey(id)).pipe(take(magicNumber.one), takeUntil(this.unsubscribe$)).subscribe({
			next: (data) => {
				this.getByUkeySectorData = data.sectors.sectorDetails;
				this.sectorId = data.sectors.sectorDetails.BasicDetail.SectorId;
				this.isDraft = (data.sectors.sectorDetails.StatusCode === 'D');

				this.btnType =
					data.sectors.sectorDetails.StatusCode === 'D'
						? 'draft'
						: '';
				this.statusCode = data.sectors.sectorDetails.StatusCode;

				this.uKey = this.getByUkeySectorData?.SectorUkey ?? '';
				this.sectorService.holdData.next({'SectorCode': this.getByUkeySectorData?.BasicDetail.SectorCode, 'RecordStatus': this.getByUkeySectorData?.Status, 'Id': this.getByUkeySectorData?.Id});
				this.countryName = this.getByUkeySectorData?.BasicDetail.CountryName ?? '';

				if (this.statusCode === 'D') {
					// Stepper Correction for form array's in Draft Scenario...
					this.getFormArrays();
				}
				// for Edit and Draft
				this.udfLoadControlsPayload.sectorId = this.getByUkeySectorData?.SectorId ?? magicNumber.zero;
				this.udfLoadControlsPayload.recordId = this.getByUkeySectorData?.SectorId ?? magicNumber.zero;
				this.udfLoadControlsPayload.recordUKey = this.uKey;
				this.udfLoadControlsPayload.editMode = 2;
				this.isUdfSectionShow();
			}
		});
		this.setSectorsScreenTitle();
	}

	private setSectorsScreenTitle() {
		this.store.select(SectorState.sectorName).pipe(takeUntil(this.unsubscribe$)).subscribe((data: string) => {
			if (data) {
				this.performanceQuestionLabel = this.localizationService.GetLocalizeMessage('WouldYouConsiderCLPHire');
				this.screenTitle.setTitle(`${this.localizationService.GetLocalizeMessage('Sector', this.sectorLabelTextParams)} - ${data}`);
				this.cdr.markForCheck();
			}
		});
	}

	private getFormArrays() {
		if(this.getByUkeySectorData) {
			this.sectorService.viewListStepperCorrection(this.getByUkeySectorData, this.EditSectorForm);
			this.copySectorId = this.getByUkeySectorData.CopyFromSectorId;
			this.EditSectorForm.controls.IsCopySector.setValue(this.getByUkeySectorData.IsCopySector);
		}
	}

	private getExistingSectorsData() {
		this.store.select(SectorState.getAllSector).pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
			this.allSectorList = data.map((item) =>
				({
					'Text': item.SectorName,
					'Status': item.Status
				}));
		});
	}

	showAll(toggle: boolean) {
		if (toggle) {
			this.showAllSectionsSwitch = true;
			this.sectorService.showAllSectionsSwitch.next(true);
			this.showAllSectionsSwitchOld = true;
			this.resetStep = true;
			if (this.isEditMode) {
				this.btnType = 'edit';
			}
			if (this.isDraft) {
				this.btnType = 'draft';
			}
			const timeout = window.setTimeout(() => {
				this.loaderService.isBusy.next(false);
			}, magicNumber.fiveHundred);

			this.timeoutIds.push(timeout);
			this.sectorService.setInitialDefault();
			this.cdr.markForCheck();
		} else {
			this.resetStep = false;
			this.showAllSectionsSwitch = false;
			this.sectorService.showAllSectionsSwitch.next(false);
			this.showAllSectionsSwitchOld = false;
			this.isCopy = magicNumber.zero;
		}
	}

	private allSectionsCheck(formControls: ISectorFM) {
		for (const row of this.steps) {
			if (this.hasValidationErrorOtherThanRequired(formControls[row.name ?? ''] as FormGroup)) {
				return true;
			}

		}
		return false;
	}

	private handleButtonType(type: string) {
		this.btnType = type === 'SaveAndContinuedraft'
			? 'SaveAndContinuedraft'
			: this.btnType;

		if(type === 'add')
			this.btnType = 'add';
	}

	private handleCustomValidation(isToasterDisplay: boolean = true) {
		if (!this.EditSectorForm.get('TimeAndExpenseConfiguration.IsPoSentToPm')?.value &&
			!this.EditSectorForm.get('TimeAndExpenseConfiguration.IsPoSentToPoOwner')?.value) {
			this.EditSectorForm.get('TimeAndExpenseConfiguration.IsPoSentToPm')?.setErrors({
				error: true
			});
		}

		removeIsVisibleToClientError(this.EditSectorForm.get('BackgroundCheck.SectorBackgrounds') as FormArray);
		const {error, index } = BackgroundCheckValidation(this.EditSectorForm.get('BackgroundCheck.SectorBackgrounds') as FormArray, this.EditSectorForm.valid);
		if(error && isToasterDisplay) {
			this.toasterService.showToaster(
				ToastOptions.Error,
				 `Please select at least one option among Professional, Light Industrial, and IC/SOW for Onboarding Item ${index}.`
			);
			this.disableFocusOnErrorScroll = false;
			if(this.BackGroundCheckslist === undefined) {
				const timeout = window.setTimeout(() => {
					this.BackGroundCheckslist?.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
				}, magicNumber.hundred);

				this.timeoutIds.push(timeout);
			} else {
				this.BackGroundCheckslist.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
			}
		} else {
			this.disableFocusOnErrorScroll = true;
		}
	}

	private setPayloadStateData(type: string) {
		const payloadz = new Sector(this.EditSectorForm.getRawValue());
		// basiDetails = new SectorBasicDetails(this.EditSectorForm.controls.BasicDetail.getRawValue()),
		payloadz.StatusCode = (type === 'SaveAndContinuedraft')
			? 'D'
			: 'A';
		this.wholeSectorSubmitData.StatusCode = payloadz.StatusCode;
		if (this.isEditMode) {
			payloadz.SectorUkey = this.uKey;
			payloadz.UKey = this.uKey;
			this.bindWholeSectorForEdit(payloadz);
		}
		this.EditSectorForm.markAllAsTouched();
		payloadz.bindWholeSectorData(this.wholeSectorSubmitData);
	}
	private setConditionalState(type: string) {
		if (this.EditSectorForm.status === 'INVALID' && type != 'SaveAndContinuedraft') {
			this.isSubmitted = true;
			this.showAll(true);
			if (this.showAllSectionsSwitch) this.sectionCheck(false);
		} else if (type === 'SaveAndContinuedraft') {
			this.addAndUpdateDialogResponse({ response: 'add' });
		} else if (type === 'edit') {
			this.addAndUpdateDialogResponse({ response: 'add' });
		} else if (type === 'add' || type === 'draft') {
			this.EditSectorForm.markAllAsTouched();
			this.addAndUpdateDialogResponse({ response: 'add' });
		}
	}

	// eslint-disable-next-line max-lines-per-function
	save(type: string, save3BtnClicked: boolean = false) {
		if(save3BtnClicked && type == 'SaveAndContinuedraft') {
			 type = 'draft';
			 this.btnType = 'draft';
		}
		this.CopySectorForm.controls['existingSectorDropDownList'].clearValidators();
		this.CopySectorForm.controls['existingSectorDropDownList'].updateValueAndValidity();
		this.handleButtonType(type);
		if (this.btnType === 'SaveAndContinuedraft' && this.allSectionsCheck(this.EditSectorForm.controls)) {
			return;
		}
		this.handleCustomValidation();

		this.steps.forEach((ele) => {
			if (this.btnType === 'edit' || this.btnType == 'SaveAndContinuedraft') {
				this.EditSectorForm.get(ele.name ?? '')?.patchValue({
					SectorId: parseInt(this.sectorId),
					SectorUKey: this.uKey,
					StatusCode: type === 'SaveAndContinuedraft'
						? 'D'
						: 'A',
					ReasonForChange: ''
				});
			}
		});
		this.setPayloadStateData(type);
		this.setConditionalState(type);
		if(this.disableFocusOnErrorScroll) {
			this.focusOnError();
		}
	}

	private focusOnError() {
		const timeout = window.setTimeout(() => {
			const fieldWithError: NodeListOf<HTMLElement> | null =
			document.querySelectorAll('.ng-invalid');
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
			if (fieldWithError.length != magicNumber.zero) {
				let index = magicNumber.zero;
				for (let i = magicNumber.zero; i < fieldWithError.length; i++) {
					if (fieldWithError[i].localName != "form" && fieldWithError[i].localName != "div" && fieldWithError[i].localName != "tr") {
						index = i;
						break;
					}
				}
				const error = fieldWithError[index].querySelector('.k-input-inner');
				if (error instanceof HTMLElement) {
					setTimeout(() => {
						error.scrollIntoView({ block: 'center' });
					}, magicNumber.hundred);
					error.focus();
				} else {
					setTimeout(() => {
						fieldWithError[index].scrollIntoView({ block: 'center' });
					}, magicNumber.hundred);
					fieldWithError[index].focus();
				}
			}
		}, magicNumber.fiveHundred);

		this.timeoutIds.push(timeout);
	}

	private bindWholeSectorForEdit(payload: Sector) {
		this.wholeSectorSubmitData.UKey = payload.UKey;
		this.wholeSectorSubmitData.SectorUkey = payload.SectorUkey;
		// this.wholeSectorSubmitData.ReasonForChange = payload.reasonForChange;
		this.wholeSectorSubmitData.SectorId =
			this.btnType === 'draft'
				? magicNumber.zero
				: parseInt(this.sectorId);
	}

	private submit() {
		this.dialogPopupService.resetDialogButton();
		if (this.btnType === 'add' || this.btnType === 'draft') {
			this.AddOrDraft();
		} else if (this.btnType === 'SaveAndContinuedraft' || this.btnType === 'edit') {
			this.updateSectorData();
		}
	}

	updateSectorData() {
		this.sectorService.updateSectorData(this.wholeSectorSubmitData, this.updatedSteps).pipe(take(magicNumber.one), takeUntil(this.unsubscribe$))
			.subscribe((res) => {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.sectorLabelTextParams);
				if (res.Succeeded) {
					if (this.isDraft) {
						this.showToaster(ToastOptions.Success, 'ThisInformationHasBeenSuccessfullySavedAsADraft');
					} else {
						this.showToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
					}
					this.store.dispatch(new ResetSectorStates(this.wholeSectorSubmitData, this.updatedSteps));
					this.EditSectorForm.markAsPristine();
					this.EditSectorForm.markAsUntouched();
					this.localizationService.Refresh();
				} else if (hasValidationMessages(res)) {
					ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
				} else {
					if(res.Message === 'RuleNotImplementedForModified')
						res.Message = this.localizationService.GetLocalizeMessage('RuleNotImplementedForModified', localizeTextParams);
					this.showToaster(ToastOptions.Error, res.Message);
				}
				this.cdr.markForCheck();
			});
	}

	AddOrDraft() {
		if (this.wholeSectorSubmitData.IsCopySector && this.btnType === 'add')
			this.wholeSectorSubmitData.BackgroundCheck.Id = magicNumber.zero;

		this.sectorService.submitSectorData(this.wholeSectorSubmitData).pipe(take(magicNumber.one), takeUntil(this.unsubscribe$))
			.subscribe((res) => {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.sectorLabelTextParams);
				if (res.Succeeded) {
					if (this.EditSectorForm.get('IsCopySector')?.value) {
						this.store.dispatch(new ResetSectorStates(null, ''));
						this.toasterService.showToaster(ToastOptions.Success, this.copySuccessMsg(), [], true);
						this.errorToasterEnable = false;
					} else {
						this.store.dispatch(new ResetSectorStates(null, ''));
						this.showToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
					}
					this.successToasterWillNotRemove();
					this.backToList();
					this.localizationService.Refresh();
				} else if (hasValidationMessages(res)) {
					ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
				} else if (res.StatusCode == Number(magicNumber.fourHundredNine)) {
					this.showToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
				} else {
					if(res.Message === 'RuleNotImplementedForModified')
						res.Message = this.localizationService.GetLocalizeMessage('RuleNotImplementedForModified', localizeTextParams);
					this.showToaster(ToastOptions.Error, res.Message);
				}
				this.cdr.markForCheck();
			});
	}

	private successToasterWillNotRemove = () => {
		this.isEditMode = false;
	};

	Update(sectionName: string, val: boolean) {
		this.updateButtonClicked = val;
		this.isSubmitted = true;
		const formCheck = this.EditSectorForm.get(sectionName) as FormGroup;
		this.handleCustomValidation();
		if (!formCheck.valid) {
			formCheck.markAllAsTouched();
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (formCheck.valid) {
			this.addAndUpdateDialogResponse({ response: 'Update', section: sectionName, message: '' });
		}
	}

	private localizeStepperLabel() {
		const observables = this.steps.map((step) =>
			this.translate.stream(step.label ?? '').pipe(
				take(magicNumber.one),
				map((res) =>
					res as string), takeUntil(this.unsubscribe$)
			));
		forkJoin(observables).pipe(takeUntil(this.unsubscribe$)).subscribe((localizedLabels) => {
			this.steps.forEach((step, index) => {
				this.steps[index].label = localizedLabels[index];
			});
			this.cdr.markForCheck();
		});
	}

	private copySuccessMsg() {
		const sectorSuccessMessage: string =
			this.localizationService.GetLocalizeMessage('SavedSuccesfully', this.sectorLabelTextParams),
			copyLookUp: string = this.localizationService.GetLocalizeMessage('CopyLookUp');
		return `<p> ${sectorSuccessMessage} </p> ${copyLookUp}`;
	}

	public cardMovement(sectionName: string, stepMovement: number) {
		this.isSubmitted = true;
		const formContol = this.EditSectorForm.get('BasicDetail') as FormGroup;

		formContol.markAllAsTouched();
		if (this.isEditMode || formContol.valid) {
			this.requestedIndex = this.currentStep + stepMovement;
			this.updateButtonClicked = false;
			this.withoutClickingUpdate(sectionName, this.requestedIndex);
		}
		this.sectionCheck();
		this.BasicDetailsTouched = magicNumber.one;
	}

	withoutClickingUpdate(currentForm: string, nextIndex: number) {
		this.requestedIndex = nextIndex;
		this.updateButtonClicked = false;
		const sectionDetail = this.EditSectorForm.get(currentForm) as FormGroup,
			messageParams: DynamicParam[] = [{ Value: this.steps[this.currentStep].id ?? '', IsLocalizeKey: true }];

		if(currentForm === 'BackgroundCheck' || currentForm === ' TimeAndExpenseConfiguration')
			this.handleCustomValidation(false);
		this.checkAllCondition(sectionDetail, currentForm, messageParams, nextIndex);
		this.directiveFistFieldFocus();
		// if(this.disableButtonOnSectorChangeAndStepper()) {
		// 	this.EditSectorForm.markAsPristine();
		// }
	}

	private disableButtonOnSectorChangeAndStepper = () => {
		return this.requestedIndex === this.currentStep && this.isEditMode && !this.EditSectorForm.pristine;
	};

	// eslint-disable-next-line max-params
	private checkAllCondition(sectionDetail: FormGroup, currentForm: string, messageParams: DynamicParam[], nextIndex: number) {
		if (!this.isEditMode && !this.isDraft) {
			this.currentStep = this.requestedIndex;
		} else if (sectionDetail.valid && this.isEditMode) {
			if (sectionDetail.dirty) {
				if (this.isDraft) {
					this.dialogPopupService.showConfirmation('DoYouWantToSaveThisInformationAsADraft', this.getPopupButtonsDraft(currentForm), messageParams);
				} else {
					this.dialogPopupService.showConfirmationwithTextArea('UpdateConfirmation', this.getPopupButtons(currentForm), messageParams);
				}
			} else {
				this.currentStep = nextIndex;
			}
		} else if (sectionDetail.valid && !this.isEditMode) {
			this.dialogPopupService.showConfirmation('DoYouWantToSaveThisInformationAsADraft', this.getPopupButtonsDraft(currentForm), messageParams);
		} else {
			this.currentStep = this.requestedIndex;
			sectionDetail.markAsPristine();
		}
	}

	stepperEvent(ev: StepperActivateEvent) {
		if (this.showAllSectionsSwitch) {
			this.showAll(false);
		}

		this.requestedIndex = ev.index;
		const sectionDetail = this.EditSectorForm.get(this.steps[this.currentStep].name ?? '') as FormGroup,
			formContol = this.EditSectorForm.get('BasicDetail') as FormGroup;
		formContol.markAllAsTouched();
		if (this.isEditMode) {
			ev.preventDefault();
			this.withoutClickingUpdate(this.steps[this.currentStep].name ?? '', ev.index);
		} else if (formContol.valid) {
			if (sectionDetail.dirty) {
				if (ev.index !== this.currentStep) {
					ev.preventDefault();
					this.withoutClickingUpdate(this.steps[this.currentStep].name ?? '', ev.index);
				}
			}
		} else {
			ev.preventDefault();
		}

		this.sectionCheck();
		this.BasicDetailsTouched = magicNumber.one;
		for (let index = magicNumber.zero; index < this.currentStep; index++) {
			this.sectorService.setFormInitStatus(index);
		}
		this.cdr.markForCheck();
	}

	sectionCheck(checkFillData: boolean = true) {
		this.steps.forEach((ele, i: number) => {
			if (this.getByUkeySectorData) {
				if (checkFillData) {
					if (i <= this.requestedIndex && this.EditSectorForm.get(ele.name ?? '')?.invalid) {
						if(this.steps[i].name === "BasicDetail") {
							patchBasicDetails(this.getByUkeySectorData.BasicDetail, this.EditSectorForm.get('BasicDetail') as FormGroup<IBasicDetailsFM>);
						} else if (this.steps[i].name === "XrmTimeClock") {
							patchXrmTimeClockDetails(this.getByUkeySectorData.XrmTimeClock, this.EditSectorForm.get('XrmTimeClock') as FormGroup<IXrmTimeClockDetailsFM>);
						} else {
							this.EditSectorForm.patchValue({
								[this.steps[i].name ?? '']: this.getByUkeySectorData[this.steps[i].name ?? '']
							});
						}
						// if you set error on Org Structure and you move to other than Org Structure than this function will run...
						if(this.isEditMode && (ele.name !== this.steps[this.requestedIndex].name)) {
							formArrayAddModeValidationHandle(
								ele.name ?? '', this.EditSectorForm.get(ele.name ?? '') as FormGroup,
							 this.sectorService, this.getByUkeySectorData[this.steps[i].name ?? '']
							);
						}
					}
				}
			}
			ele['cssClass'] = this.EditSectorForm.get(ele.name ?? '')?.valid
				? ''
				: 'text-error';
			this.cdr.markForCheck();
		});
		this.cdr.detectChanges();
	}

	public SaveAsDraft(sectionName: string): void {
		this.CopySectorForm.controls['existingSectorDropDownList'].clearValidators();
		this.CopySectorForm.controls['existingSectorDropDownList'].updateValueAndValidity();
		const sectionFormControls = this.EditSectorForm.get(sectionName) as FormGroup,
			localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.sectorLabelTextParams);
		if (this.hasValidationErrorOtherThanRequired(sectionFormControls))
			return;

		this.handleCustomValidation();

		if (sectionName === 'BasicDetail') {
			sectionFormControls.markAllAsTouched();
			if (sectionFormControls.invalid) {
				return;
			}
		}

		// eslint-disable-next-line one-var
		const payload = sectionFormControls.getRawValue();

		if (this.allSectorList.find((sector) =>
			sector.Text?.toLowerCase() === payload.SectorName?.toLowerCase()) &&
			!this.isEditMode) {
			this.showToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
		} else if (this.isEditMode) {
			this.UpdateAsDraft(payload, sectionName);
		} else {
			this.AddAsDraft();
		}
	}

	private hasValidationErrorOtherThanRequired(formControl: FormGroup) {
		const formControlKeys = Object.keys(formControl.controls),
			breaked = { isBreak: false, isFormArrayBreak: false };

		for (const element of formControlKeys) {
			const control = formControl.get(element);
			if (control instanceof FormArray) {
				this.findErrorInFormArray(control, element, breaked);
			} else {
				const errors: ValidationErrors | null | undefined = formControl.get(element)?.errors;
				// PoDepletionNoticesSentTo Error message case is only in T&E Config Send PO Depletion Notice to.
				if (errors !== null && errors?.['message'] !== 'PleaseEnterData' && errors?.['message'] !== 'PleaseSelectData' && errors?.['message'] !== 'PoDepletionNoticesSentTo') {
					breaked.isBreak = true;
					formControl.get(element)?.markAsTouched();
					this.scrollToValidationErrorOtherThanRequired();
					break;
				} else {
					breaked.isBreak = false;
				}
			}
		}
		return (breaked.isBreak || breaked.isFormArrayBreak);
	}

	private findErrorInFormArray(control: FormArray, element:string, breaked: { isBreak: boolean, isFormArrayBreak: boolean }) {
		outerLoop:
		for (const ele of control.controls) {
			const formArrayControlKeys = Object.keys(ele.getRawValue());
			for (const row of formArrayControlKeys) {
				const rowWiseErrors = ele.get(row)?.errors;
				if (rowWiseErrors !== null && rowWiseErrors?.['message'] !== 'PleaseEnterData' && rowWiseErrors?.['message'] !== 'PleaseSelectData') {
					breaked.isFormArrayBreak = true;
					ele.get(row)?.markAsTouched();
					break outerLoop;
				} else {
					breaked.isFormArrayBreak = false;
				}
			}
		}
	}

	private scrollToValidationErrorOtherThanRequired() {
		const timeout = window.setTimeout(() => {
			this.focusOnError();
		}, magicNumber.fifty);
		this.timeoutIds.push(timeout);
	}

	public UpdateAsDraft<T extends keyof Sector>(payload: Sector[T], sectionName: string) {
		payload.UKey = this.uKey;
		payload.StatusCode = this.statusCode;

		this.sectorService.updateSectorData(payload, sectionName).pipe(take(magicNumber.one), takeUntil(this.unsubscribe$)).subscribe((res) => {
			const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.sectorLabelTextParams);
			if (res.Succeeded) {
				this.showToaster(ToastOptions.Success, 'ThisInformationHasBeenSuccessfullySavedAsADraft');
				this.store.dispatch(new ResetSectorStates(payload, sectionName));
				this.EditSectorForm.get(sectionName)?.markAsPristine();
				this.EditSectorForm.get(sectionName)?.markAsUntouched();
				this.currentStep = this.requestedIndex;
				this.localizationService.Refresh();
				this.cdr.markForCheck();
			} else if (res.StatusCode == Number(magicNumber.fourHundredNine) || res.Message == 'EnitityAlreadyExists') {
				this.showToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
			} else if (hasValidationMessages(res)) {
				ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
			} else {
				if(res.Message === 'RuleNotImplementedForModified')
					res.Message = this.localizationService.GetLocalizeMessage('RuleNotImplementedForModified', localizeTextParams);
				this.showToaster(ToastOptions.Error, res.Message);
			}
		});
	}

	// eslint-disable-next-line max-lines-per-function
	public AddAsDraft() {
		this.steps.forEach((ele) => {
			if (ele.name == 'BasicDetail' || ele.name == 'UserDefineFields') {
				return;
			}

			this.EditSectorForm.get(ele.name ?? '')?.patchValue({
				StatusCode: 'D'
			});
		});

		const payload = new Sector(this.EditSectorForm.getRawValue());
		payload.StatusCode = 'D';

		this.alterWhileAddAndDraft(payload);
		this.populateUdfFieldRecords(payload);

		this.sectorService.postSectorBasicDetails(payload).pipe(take(magicNumber.one), takeUntil(this.unsubscribe$)).subscribe((res) => {
			const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.sectorLabelTextParams);
			if (res.Succeeded) {
				this.showToaster(ToastOptions.Success, 'ThisInformationHasBeenSuccessfullySavedAsADraft');
				this.store.dispatch(new ResetSectorStates(null, ''));
				this.currentStep = this.requestedIndex;
				this.loaderService.isBusy.next(false);
				this.backToList();
				this.localizationService.Refresh();
			} else if (res.StatusCode == Number(magicNumber.fourHundredNine)) {
				this.showToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
			} else if (hasValidationMessages(res)) {
				ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
			} else {
				if(res.Message === 'RuleNotImplementedForModified')
					res.Message = this.localizationService.GetLocalizeMessage('RuleNotImplementedForModified', localizeTextParams);
				this.showToaster(ToastOptions.Error, res.Message);
			}
		});
	}

	private alterWhileAddAndDraft(payload: Sector) {
		if (payload.OrgLevelConfigs.SectorOrgLevelConfigDtos.length === Number(magicNumber.zero)) {
			payload.OrgLevelConfigs.SectorOrgLevelConfigDtos = this.populatedDataOrgLevelConfigs;
		}
		if (payload.SubmittalConfiguration.UniqueSubmittals.length === Number(magicNumber.zero)) {
			payload.SubmittalConfiguration.UniqueSubmittals = this.prefilledDataSubmittal;
		}

		if (payload['UserDefineFields'] instanceof Object) {
			payload.UdfFieldRecords = payload['UserDefineFields'].UdfFieldRecords;
			delete payload['UserDefineFields'];
		}
		payload.CopyFromSectorId = payload.IsCopySector
			? this.copySectorId
			: magicNumber.zero;
		payload.BackgroundCheck.Id = payload.IsCopySector
			? magicNumber.zero
			: payload.BackgroundCheck.Id;
	}

	private populateUdfFieldRecords(payload: Sector) {
		if (this.isEmpty(payload.UdfFieldRecords[0] ?? [])) {
			const buildUdf: IPreparedUdfPayloadData[] = [];
			this.udfControlConfig.pipe(takeUntil(this.unsubscribe$)).subscribe((data:IUdfConfig[]) => {
				data.map((val) => {
					buildUdf.push({
						recordId: magicNumber.zero,
						recordUKey: '',
						sectorId: magicNumber.zero,
						udfConfigId: val.UdfConfigId,
						udfDateValue: val.UdfDateValue,
						udfId: magicNumber.zero,
						udfIntegerValue: val.IsNumeric
							? Number(val.DefaultValue)
							: magicNumber.zero,
						udfNumericValue: magicNumber.zero,
						udfTextValue: val.IsNumeric
							? ''
							: val.DefaultValue,
						xrmEntityId: magicNumber.one,
						udfFieldTypeId: val.FieldTypeId
					});
				});
			});
			payload.UdfFieldRecords = buildUdf;
		}
	}

	private isEmpty(obj: IPreparedUdfPayloadData) {
		return Object.keys(obj).length === Number(magicNumber.zero);
	}

	private getExisitngSectorDropdownList() {
		this.store.dispatch(new GetExisitngSectors());
	}

	handleCopyChange(data: { counter: number; sectorId: IDropdown; }) {
		this.isCopy = data.counter;
		this.copySectorId = parseInt(data.sectorId.Value);

		if (!this.showAllSectionsSwitch)
			this.isCopy = magicNumber.zero;

		this.loaderService.setState(false);

		this.IsCopied = true;
		this.showToaster(ToastOptions.Information, 'CopySuccesfull', [
			{ Value: data.sectorId.Text, IsLocalizeKey: false },
			this.sectorLabelTextParams[0]
		]);
		this.EditSectorForm.controls.CopyFromSectorId.setValue(Number(data.sectorId.Value));
	}

	private directiveFistFieldFocus() {
		this.directiveForms = this.EditSectorForm.get(this.steps[this.currentStep].name ?? '') as FormGroup;
	}

	backToList() {
		this.route.navigate(['xrm/master/sector/list']);
	}

	private destroyGridViewWidgetSubjects() {
		this.sectorService.holdPersistChargeNumber.next(null);
		this.sectorService.holdDataPersistOrg.next(null);
		this.sectorService.holdBenefitAdder.next(null);
		this.sectorService.holdRfxStandardField.next(null);
		this.sectorService.holdCommodityTypes.next(null);
		this.sectorService.holdReqSurveyScales.next(null);
		this.sectorService.holdReqPerformanceFactor.next(null);
		this.sectorService.holdCLPPerformanceFactor.next(null);
		this.sectorService.holdCLPSurveyScale.next(null);
		this.sectorService.holdNoOfDaysAfterStartDateLevels.next(null);
		this.sectorService.holdAssignmentRequisitionDetails.next(null);
		this.sectorService.holdEvaluationRequisitionDetails.next(null);
		this.sectorService.holdUniqueSubmittals.next(null);
		this.sectorService.holdBackgroundDetails.next(null);
	}

	showToaster(
		toasterOptions: ToastOptions,
		message: string,
		params: DynamicParam[] = []
	) {
		if (toasterOptions === ToastOptions.Error) {
			this.toasterService.showToaster(ToastOptions.Error, message, params);
			this.errorToasterEnable = true;
		} else if (toasterOptions === ToastOptions.Success) {
			this.toasterService.showToaster(ToastOptions.Success, message, params);
			this.errorToasterEnable = false;
		} else if (toasterOptions === ToastOptions.Information) {
			this.toasterService.showToaster(ToastOptions.Information, message, params);
			this.errorToasterEnable = true;
		}
	}

	changeSubmit(event:boolean) {
		if(event){
			this.isSubmitted = false;
		}
	}

	setAllData(data: boolean) {
		if (data) {
			this.showAllSectionsSwitch = true;
			/* this.sectorService.showAllSectionsSwitch.next(true);
			   this.resetStep = true; */
		} else if (!this.showAllSectionsSwitchOld) {
			this.showAllSectionsSwitch = false;
			// this.sectorService.showAllSectionsSwitch.next(false);
			this.resetStep = false;
		}
	}

	ngOnDestroy(): void {
		if ((this.isEditMode) || this.errorToasterEnable) {
			this.toasterService.resetToaster();
		}

		this.timeoutIds.forEach((timeoutId) =>
			clearTimeout(timeoutId));
    	this.timeoutIds = [];

		this.dialogPopupSubscribe.unsubscribe();
		this.dialogPopupService.resetDialogButton();
		this.screenTitle.setTitle('');
		this.store.dispatch(new SetSectorDetails());
		this.uKey = '';
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		this.sectorService.showAllSectorSection.next(false);
		this.sectorService.showAllSectionsSwitch.next(false);
		// Org Structure UI Issue Bug Fix.
		this.widget.updateForm.next(false);
		this.destroyGridViewWidgetSubjects();
	}

}

