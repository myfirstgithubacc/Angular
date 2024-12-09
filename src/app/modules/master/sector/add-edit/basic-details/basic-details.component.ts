import { FormArray, FormGroup } from '@angular/forms';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from '@xrm-core/store/states/sector.state';
import { StateService } from 'src/app/services/masters/state.service';
import { Store } from '@ngxs/store';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { PasswordExpiryPeriods } from '@xrm-shared/services/common-constants/static-data.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { patchEmailApprovalConfig } from '../email-approval-configurations/utils/patch-email-approval-config';
import { IEmailApprovalConfigFM } from '../email-approval-configurations/utils/formModel';
import { patchShiftConfig } from '../shift-configurations/utils/patch-shift-config';
import { IShiftConfigFM } from '../shift-configurations/utils/formModel';
import { patchPricingModelConfig } from '../pricing-model-configurations/utils/patch-pricing-model-config';
import { IPricingModelConfigFM } from '../pricing-model-configurations/utils/formModel';
import { IRateAndFeesConfigFM, patchRateAndFeesConfig } from '../rates-and-fees-configurations/utils/helper';
import { ITenureConfigFM, patchTenureConfig } from '../tenure-configurations/utils/helper';
import { patchAssignmentExtAndOtherConfig } from '../assignment-extension-and-other-configurations/utils/patch-assignment-ext-config';
import { IAssignmentExtAndOtherConfigFM } from '../assignment-extension-and-other-configurations/utils/formModel';
import { patchConfigMSPProcessActivity } from '../configure-msp-process-activity/utils/patch-config-msp-process';
import { IConfigMSPProcessActivityFM } from '../configure-msp-process-activity/utils/formModel';
import { IChargeNumberConfigFM, patchCostAccCodeConfig } from '../charge-number-configurations/utils/helper';
import { ITimeAndExpenseConfigFM, patchTimeAndExpenseConfig } from '../time-and-expense-configurations/utils/helper';
import { IXrmTimeClockDetailsFM, patchXrmTimeClockDetails } from '../xrm-time-clock/utils/helper';
import { IRfxConfigFM, patchRfxConfig } from '../rfx-configurations/utils/helper';
import { SectorRfxConfiguration } from '@xrm-core/models/Sector/sector-rfx-configuration.model';
import { IPerformanceSurveyConfigFM, patchPerformanceSurveyConfig } from '../performance-survey-configurations/utils/helper';
import { SectorPerformanceSurveyConfiguration } from '@xrm-core/models/Sector/sector-performance-survey-configuration.model';
import { IBasicDetailsFM, patchBasicDetails } from './utils/helper';
import { isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IRequisitionConfigFM, patchRequisitionConfig } from '../requisition-configurations/utils/helper';
import { ISubmittalConfigFM, patchSubmittalConfig, setUniqueSubmittalsForConfigureClient } from '../submittal-configurations/utils/helper';
import { IBenefitAdderConfigFM, patchBenefitAdderConfig } from '../benefit-add-configurations/utils/helper';
import { SectorRequisitionConfiguration } from '@xrm-core/models/Sector/sector-requisition-configuration.model';
import { IBackgroundChecksFM, patchBackgroundChecks } from '../background-checks/utils/helper';
import { IDropdown } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-basic-details',
	templateUrl: './basic-details.component.html',
	styleUrls: ['./basic-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class BasicDetailsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
	@Input() copySectorForm: FormGroup;
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean = false;
	@Input() isDraft: boolean = false;
	@Input() ShowAll: boolean = false;
	@Input() isCopied: boolean = false;
	@Input() basicDetailTouched: number = magicNumber.zero;
	@Output() onCopyChange = new EventEmitter<{ counter: number, sectorId: IDropdown }>();
	@Output() setAllData = new EventEmitter();

	public copyFromExistingSectorLabelText: string;
	public copyFromSelectedSectorButtonText: string;
	public countryId: number = magicNumber.zero;
	public StateLabel: string = "State";
	public ZipCodeLabel: string = "PostalCode";
	public isEditMode: boolean;
	public basicDetailsForm: FormGroup<IBasicDetailsFM>;
	public isWeekendingReadOnlyMode: boolean = false;

	// Hide Show
	public isLimitWeekendingDatesTimeEntry: boolean = false;
	public stateList: IDropdown | null;
	public sectorDropDownList: SectorAllDropdowns;
	public sectorCode: string;
	public sectorAllDropdowns: SectorAllDropdowns| undefined;
	public magicNumbers = magicNumber;
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];

	private stateDropDownValue: IDropdown | null;
	private zipCodeValue: string | null;
	private destroyAllSubscribtion$ = new Subject<void>();
	private configureClient: { IsUidNumeric:boolean, UidLength:number, UidLabelLocalizedKey:string };
	private counter: number = magicNumber.zero;
	private timeoutId: number;

	// eslint-disable-next-line max-params
	constructor(
		private customvalidators: CustomValidators,
		private state: StateService,
		private store: Store,
		private sectorService: SectorService,
		private localizationService: LocalizationService,
		private configureClientService: ConfigureClientService,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		this.isEditMode = this.formStatus;
		const { currentValue } = changes['isCopied'] ?? false;
		if (currentValue) {
			this.isCopied = true;
		}
	}

	ngOnInit(): void {
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}
		this.store.select(SectorState.getSectorAllDropdowns).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: SectorAllDropdowns) => {
			this.sectorAllDropdowns = data;
			this.cdr.markForCheck();
		});

		this.basicDetailsForm = this.childFormGroup.get('BasicDetail') as FormGroup<IBasicDetailsFM>;

		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: Sector|undefined) => {
			if(data) {
				const {SectorCode, CountryId, IsLimitAvailableWeekendingInTimeCapture, IsWeekendingRequired} = data.BasicDetail;
				this.sectorCode = SectorCode ?? '0';
				this.countryId = CountryId;

				this.isWeekendingReadOnlyMode = IsWeekendingRequired;
				// this.changeLabelDependOnCountry(this.countryId);

				this.state.getDropdownListByCountry(CountryId).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
					if(isSuccessfulResponse(response)) {
						this.stateList = response.Data;
						this.cdr.markForCheck();
					}
				});

				patchBasicDetails(data.BasicDetail, this.basicDetailsForm as FormGroup<IBasicDetailsFM>);
				// give values before running this.onChangeCountryFunction()
				this.stateDropDownValue = this.basicDetailsForm.controls.StateId.value;
				this.zipCodeValue = this.basicDetailsForm.controls.PostalCode.value;
				this.onChangeCountry({'Text': data.BasicDetail.CountryName, 'Value': data.BasicDetail.CountryId.toString()});
				this.onChangeSwitchLimitWeekendingDatesTimeEntry(IsLimitAvailableWeekendingInTimeCapture);
				this.cdr.markForCheck();
			}
		});
	}

	private AddMode() {
		/* When we go in next section and come again in Basic Detail we have to hit Country api
				and get state data against that country and bind it wiht original value. */
		if (this.basicDetailsForm.controls.StateId.value) {
			this.stateDropDownValue = this.basicDetailsForm.controls.StateId.value;
			this.zipCodeValue = this.basicDetailsForm.controls.PostalCode.value;
			this.onChangeCountry(this.basicDetailsForm.controls.CountryId.value);
		}

		if (this.basicDetailTouched === Number(magicNumber.zero)) {
			this.loadBasicDetails();
			this.loadPasswordPolicy();
		}
		this.onChangeSwitchLimitWeekendingDatesTimeEntry(this.basicDetailsForm.controls.IsLimitAvailableWeekendingInTimeCapture.value);
		this.getSectorsData();
	}

	private loadPasswordPolicy() {
		this.configureClientService.getPasswordPolicy().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if(isSuccessfulResponse(data)) {
				let passwordValue;
				if (data.Data.PwdExpiryPeriod === magicNumber.threeHundredSixtyFive) {
					passwordValue = PasswordExpiryPeriods['365Days'].toString();
				} else if (data.Data.PwdExpiryPeriod === magicNumber.oneHundredEighty) {
					passwordValue = PasswordExpiryPeriods['180Days'].toString();
				} else if (data.Data.PwdExpiryPeriod === magicNumber.Ninety) {
					passwordValue = PasswordExpiryPeriods['90Days'].toString();
				} else {
					passwordValue = PasswordExpiryPeriods.Never.toString();
				}

				this.basicDetailsForm.patchValue({ 'PasswordExpiryPeriod': { 'Text': data.Data.PwdExpiryPeriod?.toString() ?? '', 'Value': passwordValue } });
				this.cdr.markForCheck();
			}
		});
	}

	private loadBasicDetails(patchBasicDetails:boolean = true) {
		this.configureClientService.getBasicDetails().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
			if(isSuccessfulResponse(response)) {
				const { Data } = response,
					{ IsUidNumeric, UidLength, UidLabelLocalizedKey } = Data;
				this.configureClient = { 'IsUidNumeric': IsUidNumeric, 'UidLength': UidLength, 'UidLabelLocalizedKey': this.localizationService.GetLocalizeMessage(UidLabelLocalizedKey) };
				// For Submittal Configurations...
				this.sectorService.configureClientUID.next(this.configureClient);
				setUniqueSubmittalsForConfigureClient(this.childFormGroup.get('SubmittalConfiguration.UniqueSubmittals') as FormArray, this.configureClient);
				if(patchBasicDetails) {
					this.basicDetailsForm.patchValue({
						'CountryId': { Text: 'USA', Value: Data.CountryId?.toString() ?? '' },
						'TimeZoneId': { Text: '', Value: Data.TimezoneId?.toString() ?? '' },
						'WeekEndingDayId': { Text: '', Value: Data.WeekEndingDayId?.toString() ?? '' },
						'IsLimitAvailableWeekendingInTimeCapture': Data.IsLimitAvailableWeekendingInTimeCapture,
						'NoOfPastWeekeding': (Data.IsLimitAvailableWeekendingInTimeCapture)
							? Data.NoOfPreviousWeekending
							: magicNumber.zero,
						'HomeLanguageCode': { Text: '', Value: Data.DefaultCultureId?.toString() ?? ''}
					});

					this.onChangeSwitchLimitWeekendingDatesTimeEntry(this.basicDetailsForm.controls.IsLimitAvailableWeekendingInTimeCapture.value);
					this.onChangeCountry({ Text: '', Value: Data.CountryId?.toString() ?? '' });
					this.cdr.markForCheck();
				}
			}
		});
	}


	CopyConfirmation(data: IDropdown|undefined|null) {
		if(data !== null && data !== undefined) {
			this.setAllData.emit(true);
			this.onCopyWithExistingSector(data);
			this.copySectorForm.controls['existingSectorDropDownList'].disable();
		} else {
			// if User didn't select "Exisitng Sector" dropdown then it becomes Mandatory.
			this.copySectorForm.controls['existingSectorDropDownList'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseSelectExistingSector', 'Sector'));
			this.copySectorForm.controls['existingSectorDropDownList'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
			this.copySectorForm.controls['existingSectorDropDownList'].markAsTouched();
		}
	}

	onSelectingExistingRule() {
		this.copySectorForm.controls['existingSectorDropDownList'].clearValidators();
		this.copySectorForm.controls['existingSectorDropDownList'].updateValueAndValidity();
	}

	private getSectorsData() {
		this.store.select(SectorState.existingCopySectorDropdowns).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: SectorAllDropdowns|null) => {
				if(data) {
					this.sectorDropDownList = data;
					this.cdr.markForCheck();
				}
			});
	}

	ngAfterViewInit(): void {
		this.copyFromExistingSectorLabelText = this.localizationService.GetLocalizeMessage("CopyFromExistingSector", this.sectorLabelTextParams);
		this.copyFromSelectedSectorButtonText = this.localizationService.GetLocalizeMessage("CopyFromSelectedSector", this.sectorLabelTextParams);
		this.cdr.markForCheck();
	}

	onChangeCountry(cId: IDropdown | null) {
		if (cId) {
			this.countryId = Number(cId.Value);
			const zipValue = this.basicDetailsForm.controls.PostalCode.value;
			this.basicDetailsForm.controls.PostalCode.reset(null);
			this.basicDetailsForm.controls.PostalCode.clearValidators();
			this.basicDetailsForm.controls.PostalCode.updateValueAndValidity();

			if (this.zipCodeValue) {
				this.basicDetailsForm.controls.PostalCode.setValue(this.zipCodeValue);
			}

			this.changeLabelDependOnCountry(this.countryId);
			this.stateBindInDropDown(this.countryId);
			this.changeZipValue(zipValue);
		}
	}

	isEditedProperty() {
		return this.isEditMode && !this.isDraft;
	}

	private stateBindInDropDown(Id: number) {
		this.state.getDropdownListByCountry(Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
			if (isSuccessfulResponse(response)) {
				this.basicDetailsForm.controls.StateId.setValue(null);
				this.stateList = response.Data;

				if (this.stateDropDownValue) {
					this.basicDetailsForm.controls.StateId.setValue(this.stateDropDownValue);
				}
				this.cdr.markForCheck();
			}
			else {
				this.stateList = null;
			}
			this.cdr.markForCheck();
		});
	};

	onChangeSwitchLimitWeekendingDatesTimeEntry(toggle: boolean|null) {
		if(toggle === null)
			return;

		this.isLimitWeekendingDatesTimeEntry = toggle;
	}


	private onCopyWithExistingSector(selectedSector: IDropdown) {
		++this.counter;
		let sectorCopiedData: Sector;
		this.childFormGroup.controls['IsCopySector'].setValue(true);
		this.configureClientService.getBasicDetails().pipe(
			switchMap((configClientServResponse) => {
				if(isSuccessfulResponse(configClientServResponse)) {
					const { Data } = configClientServResponse,
						{ IsUidNumeric, UidLength, UidLabelLocalizedKey } = Data;
					this.configureClient = { 'IsUidNumeric': IsUidNumeric, 'UidLength': UidLength, 'UidLabelLocalizedKey': this.localizationService.GetLocalizeMessage(UidLabelLocalizedKey) };
					// For Submittal Configurations...
					this.sectorService.configureClientUID.next(this.configureClient);
				}
				return this.sectorService.getSectorById(parseInt(selectedSector.Value));
			}),
			takeUntil(this.destroyAllSubscribtion$)
		).subscribe((data) => {
			sectorCopiedData = data.Data;
			this.persistData(data.Data);
			this.remainingSectionsPatch(sectorCopiedData);

			this.PerformanceSurveyFormArrayData(sectorCopiedData.PerformanceSurveyConfiguration);
			patchPerformanceSurveyConfig(sectorCopiedData.PerformanceSurveyConfiguration, this.childFormGroup.get('PerformanceSurveyConfiguration') as FormGroup<IPerformanceSurveyConfigFM>);

			this.RfxFormArrayData(sectorCopiedData.RfxConfiguration);
			patchRfxConfig(sectorCopiedData.RfxConfiguration, this.childFormGroup.get('RfxConfiguration') as FormGroup<IRfxConfigFM>);

			this.sectorService.holdPersistChargeNumber.
				next(this.removeArrayOfJsonElements(sectorCopiedData.ChargeNumberConfiguration.SectorCostCenterConfigs, 'Id', Number(magicNumber.zero)));

			patchCostAccCodeConfig(sectorCopiedData.ChargeNumberConfiguration, this.childFormGroup.get('ChargeNumberConfiguration') as FormGroup<IChargeNumberConfigFM>);
			patchBackgroundChecks(sectorCopiedData.BackgroundCheck, this.childFormGroup.get('BackgroundCheck') as FormGroup<IBackgroundChecksFM>);
			patchXrmTimeClockDetails(sectorCopiedData.XrmTimeClock, this.childFormGroup.get('XrmTimeClock') as FormGroup<IXrmTimeClockDetailsFM>);
			patchEmailApprovalConfig(sectorCopiedData.EmailApprovalConfiguration, this.childFormGroup.get('EmailApprovalConfiguration') as FormGroup<IEmailApprovalConfigFM>);

			this.onCopyChange.emit({ counter: this.counter, sectorId: selectedSector });

			// Stepper Correction for form array's in Copy Scenario...
			this.sectorService.viewListStepperCorrection(sectorCopiedData, this.childFormGroup);
			this.cdr.markForCheck();
		});
		this.timeoutId = window.setTimeout(() => {
			this.setAllData.emit(false);
		}, magicNumber.threeThousand);
	}


	private persistData(sectorCopiedData: Sector) {

		this.sectorService.holdDataPersistOrg.next(this.removeArrayOfJsonElements(sectorCopiedData.OrgLevelConfigs.SectorOrgLevelConfigDtos, 'Id', Number(magicNumber.zero)));
		const	{ UniqueSubmittals } = sectorCopiedData.SubmittalConfiguration;

		if((UniqueSubmittals[0].MaxLength ?? Number(magicNumber.zero)) >= Number(magicNumber.zero) &&
		 this.configureClient.UidLength !== Number(magicNumber.zero)) {
			UniqueSubmittals[0].MaxLength = this.configureClient.UidLength;
			UniqueSubmittals[0].IsNumeric = this.configureClient.IsUidNumeric;
		}

		setUniqueSubmittalsForConfigureClient(this.childFormGroup.get('SubmittalConfiguration.UniqueSubmittals') as FormArray, {
			'IsUidNumeric': UniqueSubmittals[0].IsNumeric,
			'UidLength': UniqueSubmittals[0].MaxLength ?? Number(magicNumber.zero),
			'UidLabelLocalizedKey': this.configureClient.UidLabelLocalizedKey
		});

		this.sectorService.holdUniqueSubmittals.next(this.removeArrayOfJsonElements(UniqueSubmittals, 'Id', Number(magicNumber.zero)));
		this.sectorService.holdBenefitAdder.next(this.removeArrayOfJsonElements(sectorCopiedData.BenefitAdderConfiguration.SectorBenefitAdders, 'Id', Number(magicNumber.zero)));
		this.sectorService.holdBackgroundDetails.next(this.removeArrayOfJsonElements(sectorCopiedData.BackgroundCheck.SectorBackgrounds, 'Id', Number(magicNumber.zero)));
	}


	private RfxFormArrayData(RfxConfiguration: SectorRfxConfiguration) {
		if (RfxConfiguration.IsRfxSowRequired) {
			this.sectorService.holdRfxStandardField.next(this.removeArrayOfJsonElements(RfxConfiguration.SectorRfxStandardFields, 'Id', Number(magicNumber.zero)));
			this.sectorService.holdCommodityTypes.next(this.removeArrayOfJsonElements(RfxConfiguration.SectorSowCommodityTypes, 'Id', Number(magicNumber.zero)));
		}
	}

	private PerformanceSurveyFormArrayData(PerformanceSurveyConfiguration: SectorPerformanceSurveyConfiguration) {
		PerformanceSurveyConfiguration.Id = magicNumber.zero;
		this.sectorService.holdCLPPerformanceFactor.next(this.removeArrayOfJsonElements(PerformanceSurveyConfiguration.
			SectorClpSurveyPerformanceFactors, 'Id', Number(magicNumber.zero)));

		this.sectorService.holdCLPSurveyScale.next(this.removeArrayOfJsonElements(PerformanceSurveyConfiguration.SectorClpSurveyScales, 'Id', Number(magicNumber.zero)));

		if (PerformanceSurveyConfiguration.SurveyForClosedReq) {
			this.sectorService.holdReqPerformanceFactor.next(this.removeArrayOfJsonElements(PerformanceSurveyConfiguration.
				SectorRequisitionSurveyPerformanceFactors ?? [], 'Id', Number(magicNumber.zero)));
			this.sectorService.holdReqSurveyScales.next(this.removeArrayOfJsonElements(PerformanceSurveyConfiguration.SectorRequisitionSurveyScales ?? [], 'Id', Number(magicNumber.zero)));
		}

		if (PerformanceSurveyConfiguration.NoOfDaysAfterAssignmentStart)
			this.sectorService.holdNoOfDaysAfterStartDateLevels.next(PerformanceSurveyConfiguration.NoOfDaysAfterStartDateLevels);
	}

	private RequisitionFormArrayData(RequisitionConfiguration: SectorRequisitionConfiguration) {
		this.sectorService.holdAssignmentRequisitionDetails.next(this.removeArrayOfJsonElements(RequisitionConfiguration.SectorAssignmentTypes, 'Id', Number(magicNumber.zero)));
		if(RequisitionConfiguration.IsSystemRankingFunctionality) {
			this.sectorService.holdEvaluationRequisitionDetails.
				next(this.removeArrayOfJsonElements(RequisitionConfiguration.SectorCandidateEvaluationItems, 'Id', Number(magicNumber.zero)));
		}
	}

	private remainingSectionsPatch(sectorCopiedData: Sector) {
		patchShiftConfig(sectorCopiedData.ShiftConfiguration, this.childFormGroup.get('ShiftConfiguration') as FormGroup<IShiftConfigFM>);
		patchPricingModelConfig(sectorCopiedData.PricingModelConfiguration, this.childFormGroup.get('PricingModelConfiguration') as FormGroup<IPricingModelConfigFM>);
		patchRateAndFeesConfig(sectorCopiedData.RatesAndFeesConfiguration, this.childFormGroup.get('RatesAndFeesConfiguration') as FormGroup<IRateAndFeesConfigFM>);
		patchTimeAndExpenseConfig(sectorCopiedData.TimeAndExpenseConfiguration, this.childFormGroup.get('TimeAndExpenseConfiguration') as FormGroup<ITimeAndExpenseConfigFM>);
		patchAssignmentExtAndOtherConfig(sectorCopiedData.AssignmentExtensionAndOtherConfiguration, this.childFormGroup.get('AssignmentExtensionAndOtherConfiguration') as FormGroup<IAssignmentExtAndOtherConfigFM>);
		patchTenureConfig(sectorCopiedData.TenureConfiguration, this.childFormGroup.get('TenureConfiguration') as FormGroup<ITenureConfigFM>);
		patchRequisitionConfig(sectorCopiedData.RequisitionConfiguration, this.childFormGroup.get('RequisitionConfiguration') as FormGroup<IRequisitionConfigFM>);
		this.RequisitionFormArrayData(sectorCopiedData.RequisitionConfiguration);
		patchSubmittalConfig(sectorCopiedData.SubmittalConfiguration, this.childFormGroup.get('SubmittalConfiguration') as FormGroup<ISubmittalConfigFM>);
		patchBenefitAdderConfig(sectorCopiedData.BenefitAdderConfiguration, this.childFormGroup.get('BenefitAdderConfiguration') as FormGroup<IBenefitAdderConfigFM>);
		patchConfigMSPProcessActivity(sectorCopiedData.ConfigureMspProcessActivity, this.childFormGroup.get('ConfigureMspProcessActivity') as FormGroup<IConfigMSPProcessActivityFM>);
	}

	private removeArrayOfJsonElements<T>(arrayToBePop: T[]|undefined, propertyName: keyof T, value: any): T[] {
		arrayToBePop?.forEach((obj: T) => {
			if (Object.prototype.hasOwnProperty.call(obj, propertyName)) {
				obj[propertyName] = value;
			}
		});
		return arrayToBePop ?? [];
	}


	private changeZipValue(zipValue: string | null) {
		this.basicDetailsForm.controls.PostalCode.clearValidators();
		this.basicDetailsForm.controls.PostalCode.setValidators([
			this.customvalidators.PostCodeValidator(this.countryId),
			this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', this.ZipCodeLabel)
		]);
		this.basicDetailsForm.controls.PostalCode.updateValueAndValidity();

		if (zipValue)
			this.basicDetailsForm.controls.PostalCode.markAsTouched();
	}

	private changeLabelDependOnCountry(countryId: number) {
		this.StateLabel = this.localizationService.GetCulture(CultureFormat.StateLabel, countryId);
		this.reApplyRequiredValidation(this.StateLabel);
		this.ZipCodeLabel = this.localizationService.GetCulture(CultureFormat.ZipLabel, countryId);
	}

	private reApplyRequiredValidation(updatedStateName: string) {
		this.basicDetailsForm.controls.StateId.clearValidators();
		this.basicDetailsForm.controls.StateId.updateValueAndValidity({ emitEvent: false, onlySelf: true });

		this.basicDetailsForm.controls.StateId.addValidators([this.customvalidators.requiredValidationsWithMessage('PleaseSelectData', updatedStateName)]);
		this.basicDetailsForm.controls.StateId.updateValueAndValidity({ emitEvent: false, onlySelf: true });
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();

		// Clear the timeout when the component is destroyed
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}

		this.sectorService.clearTimeout();
		this.copySectorForm.controls['existingSectorDropDownList'].clearValidators();
		this.copySectorForm.controls['existingSectorDropDownList'].updateValueAndValidity();
	}
}
