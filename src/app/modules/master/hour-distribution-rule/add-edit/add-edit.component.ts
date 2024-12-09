import { AfterViewInit, Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HourDistributionRuleService } from 'src/app/services/masters/hour-distribution-rule.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Store } from '@ngxs/store';
import { GetHourDistributionRuleAllDropdowns } from '@xrm-core/store/actions/hour-distribution-rule.action';
import { Subject, forkJoin, of, switchMap, takeUntil } from 'rxjs';
import { HourDistributionRuleState } from '@xrm-core/store/states/hour-distribution-rule.state';
import { HourDistributionRuleDropDowns } from '@xrm-core/models/hour-distribution-rule/hour-distribution-rule-dropdowns';
import { Days, PreDefinedSchedules, SpecialDays } from '@xrm-shared/services/common-constants/static-data.enum';
import { HourDistributionRuleAddEdit } from '@xrm-core/models/hour-distribution-rule/add-Edit/hour-distribution-rule-add-Edit.model';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ConditionParameters } from '../hdr-enum-constants/enum-constants';
import { WeekDayRule } from '@xrm-core/models/hour-distribution-rule/add-Edit/hour-distribution-rule-WeekDayRule.model';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { getFourBy40PrefilledData, getNineBy80Week1PrefilledData, getNineBy80Week2PrefilledData, getNoneWithDailyPrefilledData, getNoneWithWeeklyPrefilledData } from '../utils/gridPrefilledData';
import { getNineBy80Week1FirstColumnText, getNineBy80Week2FirstColumnText, getNoneFirstColumn } from '../utils/gridFirstColumnTexts';
import { getWeek2RuleColumnConfigs, getWeekDayColumns, getWeekDaysColumnConfigs } from '../utils/WeekDayGridColumns';
import { getAdditionalRuleColumnConfigs, getAdditionalRuleColumns, getAdditionalRuleFirstColumnText, getAdditionalRuleWith9By80PrefilledData, getAdditionalRuleWithNonePrefilledData } from '../utils/additionalRuleGridSettings';
import { getSpecialRuleColumnConfigs, getSpecialRuleColumns, getSpecialRuleDefaultPrefilledData, getSpecialRuleIn4By40PrefilledData } from '../utils/specialDayRuleGridSetting';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { addCustomFocus, removeArrayOfJsonElements, resetValidationGrids } from '../utils/helpers';
import { checkInvalidOperator, checkValidationOnFields, showIncompleteHours, showInvalidHours } from '../utils/gridValidations';
import { CustomData, ListViewDataValidation } from '@xrm-core/models/hour-distribution-rule/add-Edit/hour-distribution-rule-customdays';
import { Column, LabelTextItem, OutputParams } from '@xrm-shared/models/list-view.model';
import { DropdownModel } from '@xrm-shared/models/common.model';

@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, AfterViewInit {
	public labelLocalizeParam: DynamicParam[] = [{ Value: 'Rule', IsLocalizeKey: true }];
	public ruleNameLocalizeParam: DynamicParam[] = [{ Value: 'RuleName', IsLocalizeKey: true }];
	public copyFromExistingHDRText: string;
	public magicNumber = magicNumber;
	public isEditMode: boolean = false;
	public isTooltipVisible: boolean = true;
	public is440 = false;
	public is980 = false;
	public isNotPrestine = true;
	public isOtCalculation = false;
	public hdrAllDropdowns: HourDistributionRuleDropDowns;
	public AddEditHourAdjustmentForm: FormGroup;
	public CopyFromExistingRuleForm: FormGroup;
	public hdrCopyDrodown: DropdownModel[];
	public CalculationMethod = [
		{ Text: "Daily", Value: 'D' },
		{ Text: "Weekly", Value: 'W' }
	];
	public selectedPreScheduled: number = PreDefinedSchedules.None;
	public nineby80Id: number = PreDefinedSchedules['9/80'];
	public isSpecialDayRuleOn: boolean = false;
	public isManualEntry: boolean = false;

	private hourDistributionRuleTextParams: DynamicParam[] = [{ Value: 'HourDistributionRule', IsLocalizeKey: true }];
	private UKey: string;
	private hourDistributionRuleData: HourDistributionRuleAddEdit;
	private currentRow: string = '';
	private listViewDataValidation: ListViewDataValidation;
	private isFoundError: boolean = false;
	private weekDayRuleFormArray: FormArray;
	private additionalDayRuleFormArray: FormArray;
	private week1RuleFormArray: FormArray;
	private week2RuleFormArray: FormArray;
	private specialDayRuleFormArray: FormArray;
	private destroyAllSubscribtion$ = new Subject<void>();
	private ruleDes9By80: string = '9/80 is a compressed two-week work schedule where contractor have one day off every other week';
	private ruleDes4By40: string = '"(A) Monday to Thursday:If Hrs >= 10: ST = 10, OT = 10.01-12.00, DT > 12.If Hrs < 10: ST <= 8, OT = 8.01-10.00, DT = NA. (B) Friday to Sunday:ST = NA, OT <= 8 per day (24 hrs), DT > 8."';

	// WeekDay Rule
	private noneWithWeeklyPrefilledData = getNoneWithWeeklyPrefilledData();
	public WeekDayPrefilledData: WeekDayRule[] = this.noneWithWeeklyPrefilledData;

	private noneWithDailyPrefilledData = getNoneWithDailyPrefilledData();
	private nineBy80Week1PrefilledData: WeekDayRule[] = getNineBy80Week1PrefilledData();
	public nineBy80Week2PrefilledData: WeekDayRule[] = getNineBy80Week2PrefilledData();

	private fourBy40PrefilledData = getFourBy40PrefilledData();

	private nineBy80Week1FirstColumnText = getNineBy80Week1FirstColumnText();
	public nineBy80Week2FirstColumnText = getNineBy80Week2FirstColumnText();

	private noneFirstColumn = getNoneFirstColumn();
	public WeekDayRuleFirstColumnText: LabelTextItem[] = this.noneFirstColumn;

	public WeekDayColumns: Column[] = getWeekDayColumns({"dynamicRequiredValidator": this.dynamicRequiredValidator.bind(this),
		"addValidationForDecimal": this.addValidationForDecimal.bind(this),
		"ValidationsForHoursPerDay": this.ValidationsForHoursPerDay.bind(this)});

	public WeekDaysColumnConfigs = getWeekDaysColumnConfigs();
	public Week2RuleColumnConfigs = getWeek2RuleColumnConfigs();

	// Additional Rule
	private AdditionalRuleWithNonePrefilledData = getAdditionalRuleWithNonePrefilledData();
	private AdditionalRuleWith9By80PrefilledData = getAdditionalRuleWith9By80PrefilledData();

	public AdditionalRulePrefilledData: WeekDayRule[] = this.AdditionalRuleWithNonePrefilledData;
	public AdditionalRuleFirstColumnText = getAdditionalRuleFirstColumnText();

	public AdditionalRuleColumns:Column[] = getAdditionalRuleColumns({"dynamicRequiredValidator": this.dynamicRequiredValidator.bind(this),
		"addValidationForDecimal": this.addValidationForDecimal.bind(this),
		"ValidationsForHoursPerDay": this.ValidationsForHoursPerDay.bind(this)});

	public AdditionalRuleColumnConfigs = getAdditionalRuleColumnConfigs();

	// Special Rule
	private specialRuleDefaultPrefilledData = getSpecialRuleDefaultPrefilledData();
	public SpecialRulePrefilledData: WeekDayRule[] = this.specialRuleDefaultPrefilledData;
	private specialRuleIn4By40PrefilledData = getSpecialRuleIn4By40PrefilledData();

	public SpecialRuleColumns: Column[] = getSpecialRuleColumns({"dynamicRequiredValidator": this.dynamicRequiredValidator.bind(this),
		"addValidationForDecimal": this.addValidationForDecimal.bind(this),
		"ValidationsForHoursPerDay": this.ValidationsForHoursPerDay.bind(this)}, this.customvalidators);

	public SpecialRuleColumnConfigs = getSpecialRuleColumnConfigs();

	// eslint-disable-next-line max-params
	constructor(
		private authService: AuthGuardService,
		private formBuilder: FormBuilder,
		private router: Router,
		private hourDistributionRuleService: HourDistributionRuleService,
		private customvalidators: CustomValidators,
		private localizationService: LocalizationService,
		private store: Store,
		private toasterService: ToasterService,
		private activatedRoute: ActivatedRoute,
		private eventLog: EventLogService,
		private commonHeaderIcons: CommonHeaderActionService,
		private cdr: ChangeDetectorRef
	) {
		this.listViewDataValidation = {
			'WeekDayRule': this.formBuilder.array([]),
			'Week2Rule': this.formBuilder.array([]),
			'AdditionalRuleDay': this.formBuilder.array([]),
			'SpecialRuleDay': this.formBuilder.array([])
		};
		this.createHDRFormGroups();
		this.initializeHDRAllDropDownsFromStore();
	}

	ngOnInit(): void {
		this.weekDayRuleFormArray = this.AddEditHourAdjustmentForm.controls['WeekDayRule'] as FormArray;
		this.additionalDayRuleFormArray = this.AddEditHourAdjustmentForm.controls['AdditionalRules'] as FormArray;
		this.week1RuleFormArray = this.AddEditHourAdjustmentForm.controls['Week1Rule'] as FormArray;
		this.week2RuleFormArray = this.AddEditHourAdjustmentForm.controls['Week2Rule'] as FormArray;
		this.specialDayRuleFormArray = this.AddEditHourAdjustmentForm.controls['SpecialDayRules'] as FormArray;

		this.hdrAllDrodpownsFromStore();
		this.activatedRoute.params.pipe(
			switchMap((param: Params) => {
				if (param['id']) {
					this.isEditMode = true;
					this.UKey = param['id'];
					this.nineBy80Week2PrefilledData = [];
					this.WeekDayPrefilledData = [];
					this.AdditionalRulePrefilledData = [];
					return forkJoin({
						'getByUkeyResponse': this.hourDistributionRuleService.getHourDistributionRuleByUkey(this.UKey),
						'copyDropdownResponse': of(null)
					});
				} else {
					return forkJoin({
						'copyDropdownResponse': this.hourDistributionRuleService.getHourDistributionRuleCopyDropdown(),
						'getByUkeyResponse': of(null)
					});
				}
			})
			, takeUntil(this.destroyAllSubscribtion$)
		).subscribe(({copyDropdownResponse, getByUkeyResponse}) => {
			if(getByUkeyResponse)
				this.getHDRDataByUKey(getByUkeyResponse);

			if(copyDropdownResponse)
				this.getCopyDropdownValues(copyDropdownResponse);

			this.cdr.markForCheck();
		});
		this.authService.unsaved = false;
	}

	private hdrAllDrodpownsFromStore() {
		this.store.select(HourDistributionRuleState.getHourDistributionRuleAllDropdowns).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((res) => {
				if (res) {
					this.hdrAllDropdowns = res;
					this.initializeDefaultValueInColumns(this.WeekDayColumns);
					this.initializeDefaultValueInColumns(this.AdditionalRuleColumns);
					this.initializeDefaultValueInColumns(this.SpecialRuleColumns);
					this.cdr.markForCheck();
				}
			});
	}

	private getHDRDataByUKey(res: GenericResponseBase<HourDistributionRuleAddEdit>) {
		this.isTooltipVisible = false;
		if (isSuccessfulResponse(res)) {
			this.hourDistributionRuleData = res.Data;
			const { PreDefinedWorkScheduleId, PreDefinedWorkScheduleName, ManualOtDtEntry,
						  Week1Rule, Week2Rule, SpecialDayRule, SpecialDayRules, AdditionalRules } = res.Data;

			this.AddEditHourAdjustmentForm.patchValue(this.hourDistributionRuleData);
			this.AddEditHourAdjustmentForm.patchValue({
				'PreDefinedWorkScheduleId': { 'Text': PreDefinedWorkScheduleName, 'Value': PreDefinedWorkScheduleId.toString() }
			});

			this.onChangeEnableManualEntry(ManualOtDtEntry);

			if (!ManualOtDtEntry) {
				if (PreDefinedWorkScheduleId === Number(PreDefinedSchedules['4/40']) || PreDefinedWorkScheduleId === Number(PreDefinedSchedules.None)) {
					this.WeekDayPrefilledData = removeArrayOfJsonElements(this.hourDistributionRuleData.WeekDayRule, this.isEditMode);
					this.nineBy80Week2PrefilledData = [];
					this.bindSpecialDayRulesForPreDefinedSchedule(this.hdrAllDropdowns.Days ?? [{Text: '', Value: ''}]);
				} else if (PreDefinedWorkScheduleId === Number(PreDefinedSchedules['9/80'])) {
					this.nineBy80Week1PrefilledData = removeArrayOfJsonElements(Week1Rule, this.isEditMode);
					this.nineBy80Week2PrefilledData = removeArrayOfJsonElements(Week2Rule, this.isEditMode);
					this.bindSpecialDayRulesForPreDefinedSchedule(this.hdrAllDropdowns.SpecialDays ?? [{Text: '', Value: ''}]);
					this.nineBy80DefaultValues(SpecialDayRule);
				}
				this.AdditionalRulePrefilledData = removeArrayOfJsonElements(AdditionalRules, this.isEditMode);
				if (SpecialDayRule) {
					this.SpecialRulePrefilledData = removeArrayOfJsonElements(SpecialDayRules, this.isEditMode, true);
				}
				this.selectedPreScheduled = PreDefinedWorkScheduleId;
				this.isSpecialDayRuleOn = SpecialDayRule;
			}
			this.createCommonHeader(res.Data);
			this.cdr.markForCheck();
		}
	}

	private createCommonHeader({Disabled, RuleCode, Id}: HourDistributionRuleAddEdit) {
		this.commonHeaderIcons.holdData.next({'Disabled': Disabled, 'RuleCode': RuleCode, 'Id': Id});
	}

	private bindSpecialDayRulesForPreDefinedSchedule(dropdownData: DropdownModel[]) {
		this.SpecialRuleColumns[0].controls[0].defaultValue = dropdownData;
		this.cdr.markForCheck();
	}

	private getCopyDropdownValues(res: GenericResponseBase<DropdownModel[]>) {
		if (isSuccessfulResponse(res))
			this.hdrCopyDrodown = res.Data;
	}

	private initializeDefaultValueInColumns(listViewData: Column[]) {
		listViewData.forEach((item) => {
			if (item.columnName === 'StraightTime' || item.columnName === 'OverTime' || item.columnName === 'DoubleTime') {
				item.controls[0].defaultValue = this.hdrAllDropdowns.ComparisonOperators;
			}
			else if (item.columnName === 'Day') {
				item.controls[0].defaultValue = this.hdrAllDropdowns.Days;
			}
			else if (item.columnName === 'ApplicableOn') {
				item.controls[0].defaultValue = this.hdrAllDropdowns.ConditionParameters;
				item.controls[1].defaultValue = this.hdrAllDropdowns.ComparisonOperators;
			}
		});
		this.cdr.markForCheck();
	}

	ngAfterViewInit(): void {
		this.copyFromExistingHDRText = this.localizationService.GetLocalizeMessage("CopyFromExistingSector", this.labelLocalizeParam);
		this.cdr.markForCheck();
	}

	private createHDRFormGroups() {
		this.CopyFromExistingRuleForm = this.formBuilder.group({
			'IsCopyHDR': [null]
		});

		this.AddEditHourAdjustmentForm = this.formBuilder.group({
			'RuleName': [null, [this.dynamicRequiredValidator('PleaseEnterData', 'RuleName')]],
			'PreDefinedWorkScheduleId': [{ Value: PreDefinedSchedules.None.toString() }, [this.dynamicRequiredValidator('PleaseSelectData', 'PreDefinedWorkScheduleId')]],
			'RuleDescription': [null],
			'ManualOtDtEntry': [false],
			'OtCalculation': [{ Value: 'W' }, [this.dynamicRequiredValidator('PleaseSelectData', 'OTCalculationMethod')]],
			'RegularStHoursPerWeek': [magicNumber.forty, [this.dynamicRequiredValidator('PleaseEnterData', 'RegularStHoursPerWeek'), this.addValidationForDecimal(), this.ValidationsForHoursPerWeek('RegularStHoursPerWeek', null, magicNumber.one)]],
			'MaxStHourAllowed': [magicNumber.forty, [this.dynamicRequiredValidator('PleaseEnterData', 'MaxStHourAllowed'), this.addValidationForDecimal(), this.ValidationsForHoursPerWeek('MaxStHourAllowed', 'ControlRangeShouldBeLessThanOrEqualAndGreaterThan')]],
			'MaxOtHourAllowed': [magicNumber.oneHundredSixtyEight, [this.dynamicRequiredValidator('PleaseEnterData', 'MaxOtHourAllowed'), this.addValidationForDecimal(), this.ValidationsForHoursPerWeek('MaxOtHourAllowed', 'ControlRangeShouldBeLessThanOrEqualAndGreaterThan')]],
			'MaxDtHourAllowed': [magicNumber.oneHundredSixtyEight, [this.dynamicRequiredValidator('PleaseEnterData', 'MaxDtHourAllowed'), this.addValidationForDecimal(), this.ValidationsForHoursPerWeek('MaxDtHourAllowed', 'ControlRangeShouldBeLessThanOrEqualAndGreaterThan')]],
			'MaxTotalHourAllowed': [magicNumber.oneHundredSixtyEight, [this.dynamicRequiredValidator('PleaseEnterData', 'MaxTotalHourAllowed'), this.addValidationForDecimal(), this.ValidationsForHoursPerWeek('MaxTotalHourAllowed', 'ControlRangeShouldBeLessThanOrEqualAndGreaterThan')]],
			'WeekDayRule': this.formBuilder.array([]),
			'Week1Rule': this.formBuilder.array([]),
			'Week2Rule': this.formBuilder.array([]),
			'AdditionalRules': this.formBuilder.array([]),
			'SpecialDayRule': [false],
			'SpecialDayRules': this.formBuilder.array([])
		});
	}

	private dynamicRequiredValidator(errorMessage: string, dynamicParamName: string): ValidatorFn {
		return this.customvalidators.RequiredValidator(errorMessage, [{ Value: dynamicParamName, IsLocalizeKey: true }]);
	}

	private addValidationForDecimal() {
		return this.customvalidators.DecimalValidator(magicNumber.two, 'PleaseEnterNumericValuesUpto2Decimal');
	}

	private ValidationsForHoursPerWeek(controlName: string, validationMessage?: string | undefined | null, minHourPerWeek?: number) {
		return this.customvalidators.RangeValidator(minHourPerWeek ?? magicNumber.zero, magicNumber.oneHundredSixtyEightDotZeroZero, validationMessage ?? 'ControlRangeShouldBeLessThanAndGreaterThan', [
			{ Value: controlName, IsLocalizeKey: true },
			{ Value: '0', IsLocalizeKey: false },
			{ Value: '168', IsLocalizeKey: false },
			{ Value: 'hours', IsLocalizeKey: true }
		]);
	}

	private ValidationsForHoursPerDay() {
		return this.customvalidators.RangeValidator(magicNumber.zeroDotZeroZero, magicNumber.twentyFourDotZeroZero, 'YouCanEnterValueBetween', [
			{ Value: '0', IsLocalizeKey: false },
			{ Value: '24', IsLocalizeKey: false }
		]);
	}

	private initializeHDRAllDropDownsFromStore() {
		this.store.dispatch(new GetHourDistributionRuleAllDropdowns(''));
	}

	public getFormStatus(formArray: FormArray) {
		// WeekDayRule widget key in formArray to categorize the list-view widgets
		if ('WeekDayRule' in formArray.value[0]) {
			// 9/80 grids bind.
			if (this.AddEditHourAdjustmentForm.controls['PreDefinedWorkScheduleId'].value.Value == PreDefinedSchedules['9/80']) {
				// Week 1 Grid
				this.initializeFormArray(formArray.value, this.week1RuleFormArray, magicNumber.two, this.nineBy80Week1PrefilledData);
				this.week1RuleFormArray.markAsTouched();
			}
			// None with Daily and Weekly and 4/40 grid bind.
			else {
				this.initializeFormArray(formArray.value, this.weekDayRuleFormArray, magicNumber.one, this.WeekDayPrefilledData);
				this.weekDayRuleFormArray.markAsTouched();
			}
			this.listViewDataValidation.WeekDayRule = undefined;
			this.listViewDataValidation.WeekDayRule = formArray;
		}
		// 9/80 Week 2 Grid
		else if ('Week2Rule' in formArray.value[0]) {
			this.initializeFormArray(formArray.value, this.week2RuleFormArray, magicNumber.three, this.nineBy80Week2PrefilledData);
			this.week2RuleFormArray.markAsTouched();
			this.listViewDataValidation.Week2Rule = formArray;
		}
		// Additional Rule Grid
		else if ('AdditionalRuleDay' in formArray.value[0]) {
			this.initializeFormArray(formArray.value, this.additionalDayRuleFormArray, magicNumber.four, this.AdditionalRulePrefilledData);
			this.additionalDayRuleFormArray.markAsTouched();
			this.listViewDataValidation.AdditionalRuleDay = formArray;
		}
		// Special Rule Grid
		else if ('SpecialRuleDay' in formArray.value[0] && this.isSpecialDayRuleOn) {
			this.initializeFormArray(formArray.value, this.specialDayRuleFormArray, magicNumber.five, []);
			this.specialDayRuleFormArray.markAsTouched();
			this.listViewDataValidation.SpecialRuleDay = formArray;
		}

		if ((formArray.touched || !formArray.pristine)) {
			this.AddEditHourAdjustmentForm.markAsDirty();
		}
		this.AddEditHourAdjustmentForm.updateValueAndValidity();
		this.cdr.markForCheck();
	}

	public onDelete() {
		this.AddEditHourAdjustmentForm.markAsDirty();
	}

	private initializeFormArray(gridDetails: WeekDayRule[], formArray: FormArray, ruleId: number, prefilledData: WeekDayRule[]) {
		formArray.clear();

		gridDetails.forEach((day, index: number) => {
			formArray.push(this.formBuilder.group({
				'Id': [
					(gridDetails[index]?.Id == Number(magicNumber.zero) || gridDetails[index]?.Id == null) ?
						magicNumber.zero :
						gridDetails[index]?.Id
				],
				'RuleType': [ruleId],
				'WeekDayId': [
					(prefilledData.length === Number(magicNumber.zero))
						? day?.WeekDayId
						: prefilledData[index]?.WeekDayId
				],
				'StOperator': [day?.StOperator?.toString()],
				'StValue': [day?.StValue],
				'OtOperator': [day?.OtOperator?.toString()],
				'OtValue': [day?.OtValue],
				'DtOperator': [day?.DtOperator?.toString()],
				'DtValue': [day?.DtValue],
				'MaxHoursAllowed': [day?.MaxHoursAllowed],
				'ApplicableOnTypeId': [
					(prefilledData.length === Number(magicNumber.zero))
						? day?.ApplicableOnTypeId
						: null
				],
				'ApplicableOnOperator': [
					(prefilledData.length === Number(magicNumber.zero))
						? day?.ApplicableOnOperator?.toString()
						: null
				],
				'ApplicableOnValue': [
					(prefilledData.length === Number(magicNumber.zero))
						? day.ApplicableOnValue
						: null
				]
			}));
		});
	}

	private getHourDistributionRuleById(selectedExistingRule: DropdownModel) {
		const id = parseInt(selectedExistingRule.Value);
		this.hourDistributionRuleService.getHourDistributionRuleById(id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if(isSuccessfulResponse(res)) {
				const {PreDefinedWorkScheduleId, RuleDescription, ManualOtDtEntry, RegularStHoursPerWeek,
						MaxStHourAllowed, MaxOtHourAllowed, MaxDtHourAllowed, MaxTotalHourAllowed, SpecialDayRule } = res.Data,
					otCalculation: string = (PreDefinedWorkScheduleId !== Number(PreDefinedSchedules.None))
						? 'D'
						: 'W';
				this.toasterService.resetToaster();

				this.isOtCalculation = (PreDefinedWorkScheduleId !== Number(PreDefinedSchedules.None));
				this.patchingFormArray(res.Data);
				this.AddEditHourAdjustmentForm.patchValue({
					'PreDefinedWorkScheduleId': { 'Value': PreDefinedWorkScheduleId.toString() },
					'RuleDescription': RuleDescription,
					'ManualOtDtEntry': ManualOtDtEntry,
					'OtCalculation': { 'Value': otCalculation },
					'RegularStHoursPerWeek': RegularStHoursPerWeek,
					'MaxStHourAllowed': MaxStHourAllowed,
					'MaxOtHourAllowed': MaxOtHourAllowed,
					'MaxDtHourAllowed': MaxDtHourAllowed,
					'MaxTotalHourAllowed': MaxTotalHourAllowed,
					'SpecialDayRule': SpecialDayRule
				});

				this.onChangeEnableManualEntry(ManualOtDtEntry);

				this.selectedPreScheduled = PreDefinedWorkScheduleId;
				this.onSpecialDayRuleChange(SpecialDayRule);
				this.updateFirstColumnForNineEightySetting();
			}
			this.cdr.markForCheck();
		});
	}

	private updateFirstColumnForNineEightySetting() {
		if (this.selectedPreScheduled == Number(PreDefinedSchedules['9/80'])) {
			this.WeekDayRuleFirstColumnText = this.nineBy80Week1FirstColumnText;
			this.WeekDayColumns[0].columnName = 'Days_s';
		} else {
			this.WeekDayRuleFirstColumnText = this.noneFirstColumn;
			this.WeekDayColumns[0].columnName = 'WeekDayId';
		}
	}

	public OnCopyExistingRuleName(selectedExistingRule: DropdownModel | null | undefined) {
		this.authService.unsaved = true;
		if (selectedExistingRule) {
			this.getHourDistributionRuleById(selectedExistingRule);
		} else {
			this.CopyFromExistingRuleForm.controls['IsCopyHDR'].addValidators(this.dynamicRequiredValidator('PleaseSelectData', this.localizationService.GetLocalizeMessage('CopyFromSelectedSector', this.ruleNameLocalizeParam)));
			this.CopyFromExistingRuleForm.controls['IsCopyHDR'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
			this.CopyFromExistingRuleForm.controls['IsCopyHDR'].markAsTouched();
		}
	}

	public onSelectingExistingRule() {
		this.CopyFromExistingRuleForm.controls['IsCopyHDR'].clearValidators();
		this.CopyFromExistingRuleForm.controls['IsCopyHDR'].updateValueAndValidity();
	}

	private patchingFormArray(data: HourDistributionRuleAddEdit) {
		if (data.PreDefinedWorkScheduleId !== Number(PreDefinedSchedules['9/80'])) {
			this.WeekDayPrefilledData = (data.WeekDayRule.length)
				? removeArrayOfJsonElements(data.WeekDayRule, this.isEditMode)
				: this.WeekDayPrefilledData;

			this.bindSpecialDayRulesForPreDefinedSchedule(this.hdrAllDropdowns.Days ?? [{Text: '', Value: ''}]);
		}
		else {
			this.WeekDayPrefilledData = (data.Week1Rule.length)
				? removeArrayOfJsonElements(data.Week1Rule, this.isEditMode)
				: this.WeekDayPrefilledData;
			this.nineBy80Week2PrefilledData = (data.Week2Rule.length)
				? removeArrayOfJsonElements(data.Week2Rule, this.isEditMode)
				: this.nineBy80Week2PrefilledData;

			this.bindSpecialDayRulesForPreDefinedSchedule(this.hdrAllDropdowns.SpecialDays ?? [{Text: '', Value: ''}]);
		}

		// Additional Grid.
		this.AdditionalRulePrefilledData = (data.AdditionalRules.length)
			? removeArrayOfJsonElements(data.AdditionalRules, this.isEditMode)
			: this.AdditionalRulePrefilledData;

		// Special Grid.
		if (data.SpecialDayRule) {
			this.SpecialRulePrefilledData = (data.SpecialDayRules.length)
				? removeArrayOfJsonElements(data.SpecialDayRules, this.isEditMode, true)
				: this.SpecialRulePrefilledData;
		} else {
			this.SpecialRulePrefilledData = this.specialRuleDefaultPrefilledData;
		}
	}

	public onPreDefinedWorkScheduleChange(event: DropdownModel | null | undefined) {
		this.selectedPreScheduled = parseInt(event?.Value ?? '0');
		if (this.selectedPreScheduled === Number(PreDefinedSchedules.None)) {
			this.WeekDayRuleFirstColumnText = this.noneFirstColumn;
			this.AdditionalRulePrefilledData = this.AdditionalRuleWithNonePrefilledData;
			this.WeekDayColumns[0].columnName = 'WeekDayId';
			this.SetBasicDetails({ 'maxTotalHours': magicNumber.oneHundredSixtyEight, 'regularStHours': magicNumber.forty, 'maxStHours': magicNumber.forty, 'maxOtHours': magicNumber.oneHundredSixtyEight, 'maxDtHours': magicNumber.oneHundredSixtyEight });
			this.preDefinedScheduleDependency(false, null, { 'Value': 'W' });
			this.onOTCalculationMethodChange(this.AddEditHourAdjustmentForm.controls['OtCalculation'].value, this.AddEditHourAdjustmentForm.controls['PreDefinedWorkScheduleId'].value);
			this.updateSpecialDayRule(false, this.specialRuleDefaultPrefilledData);
		} else if (event?.Value !== undefined) {
			this.preDefinedScheduleDependency(true, event.Value, { 'Value': 'D' });

			if (event.Value === PreDefinedSchedules['9/80'].toString()) {
				this.nineBy80DefaultValues();
			} else {
				this.fourBy40DefaultValues();
			}
		}
	}

	public onChangeEnableManualEntry(isManualEntryAllowed: boolean) {
		this.isManualEntry = isManualEntryAllowed;
		if (this.isManualEntry) {
			this.removeValidationsOnControl('OtCalculation');
			this.removeValidationsOnControl('RegularStHoursPerWeek');
			this.removeValidationsOnControl('MaxStHourAllowed');
			this.removeValidationsOnControl('MaxOtHourAllowed');
			this.removeValidationsOnControl('MaxDtHourAllowed');
		} else {
			this.addValidationsOnControl('OtCalculation', [this.dynamicRequiredValidator('PleaseSelectData', 'OTCalculationMethod')]);
			this.addValidationsOnControl('RegularStHoursPerWeek', [this.dynamicRequiredValidator('PleaseEnterData', 'RegularStHoursPerWeek'), this.addValidationForDecimal(), this.ValidationsForHoursPerWeek('RegularStHoursPerWeek', null, magicNumber.one)]);
			this.addValidationsOnControl('MaxStHourAllowed', [this.dynamicRequiredValidator('PleaseEnterData', 'MaxStHourAllowed'), this.addValidationForDecimal(), this.ValidationsForHoursPerWeek('MaxStHourAllowed', 'ControlRangeShouldBeLessThanOrEqualAndGreaterThan')]);
			this.addValidationsOnControl('MaxOtHourAllowed', [this.dynamicRequiredValidator('PleaseEnterData', 'MaxOtHourAllowed'), this.addValidationForDecimal(), this.ValidationsForHoursPerWeek('MaxOtHourAllowed', 'ControlRangeShouldBeLessThanOrEqualAndGreaterThan')]);
			this.addValidationsOnControl('MaxDtHourAllowed', [this.dynamicRequiredValidator('PleaseEnterData', 'MaxDtHourAllowed'), this.addValidationForDecimal(), this.ValidationsForHoursPerWeek('MaxDtHourAllowed', 'ControlRangeShouldBeLessThanOrEqualAndGreaterThan')]);
		}
	}

	private addValidationsOnControl(controlName: string, validations: ValidatorFn | ValidatorFn[]) {
		this.AddEditHourAdjustmentForm.controls[controlName].addValidators(validations);
	}

	private removeValidationsOnControl(controlName: string) {
		this.AddEditHourAdjustmentForm.controls[controlName].clearValidators();
		this.AddEditHourAdjustmentForm.controls[controlName].updateValueAndValidity();
	}

	private SetBasicDetails(basicDetails: { 'maxTotalHours': number, 'regularStHours': number, 'maxStHours': number, 'maxOtHours': number, 'maxDtHours': number }) {
		this.AddEditHourAdjustmentForm.controls['MaxTotalHourAllowed'].setValue(basicDetails.maxTotalHours);
		this.AddEditHourAdjustmentForm.controls['RegularStHoursPerWeek'].setValue(basicDetails.regularStHours);
		this.AddEditHourAdjustmentForm.controls['MaxStHourAllowed'].setValue(basicDetails.maxStHours);
		this.AddEditHourAdjustmentForm.controls['MaxOtHourAllowed'].setValue(basicDetails.maxOtHours);
		this.AddEditHourAdjustmentForm.controls['MaxDtHourAllowed'].setValue(basicDetails.maxDtHours);
	}

	private preDefinedScheduleDependency(disableOtCalculation: boolean, preDefineSelected: string | null, changeOtCalculation: {Value: string}) {
		this.isOtCalculation = disableOtCalculation;
		if(disableOtCalculation)
			this.AddEditHourAdjustmentForm.controls['OtCalculation'].disable();
		else
			this.AddEditHourAdjustmentForm.controls['OtCalculation'].enable();

		const ruleType = (preDefineSelected == PreDefinedSchedules['9/80'].toString())
			? this.ruleDes9By80
			: this.ruleDes4By40;
		this.AddEditHourAdjustmentForm.controls['RuleDescription'].patchValue((preDefineSelected === null)
			? null
			: ruleType);
		this.AddEditHourAdjustmentForm.controls['OtCalculation'].patchValue(changeOtCalculation);
		if (preDefineSelected == PreDefinedSchedules['9/80'].toString()) {
			this.SpecialRuleColumns[0].controls[0].defaultValue = this.hdrAllDropdowns.SpecialDays ?? [{Text: '', Value: ''}];
		}
		else {
			this.SpecialRuleColumns[0].controls[0].defaultValue = this.hdrAllDropdowns.Days ?? [{Text: '', Value: ''}];
		}
		this.cdr.markForCheck();
	}

	public onOTCalculationMethodChange(otCalculation: {Value: string}, PreDefinedSchedule: DropdownModel) {
		if (parseInt(PreDefinedSchedule.Value) === Number(PreDefinedSchedules.None)) {
			if (otCalculation.Value === "D") {
				this.WeekDayPrefilledData = this.noneWithDailyPrefilledData;
			}
			else if (otCalculation.Value === "W") {
				this.WeekDayPrefilledData = this.noneWithWeeklyPrefilledData;
			}
		}
	}

	private setFormArrayNull(formArrayNames: string[]) {
		try {
			formArrayNames.forEach((item: string) => {
				const emptyFormArray: FormArray = this.AddEditHourAdjustmentForm.controls[item] as FormArray;
				emptyFormArray.clear();
			});
		}
		catch (ex) {
			this.toasterService.showToaster(ToastOptions.Error, 'SomeErrorOccured');
		}
	}

	private nineBy80DefaultValues(splDay = false) {
		this.weekDayGridChanges(this.nineBy80Week1FirstColumnText, this.nineBy80Week1PrefilledData, this.AdditionalRuleWith9By80PrefilledData);
		this.updateSpecialDayRule(splDay, this.modifyObjectInArray(this.specialRuleDefaultPrefilledData, magicNumber.zero, 'WeekDayId', SpecialDays['Week1_Non-working_Day']));
		this.WeekDayColumns[0].columnName = 'Days_s';
	}

	private modifyObjectInArray(originalArray: WeekDayRule[], indexToModify: number, keyToChange: string, newValue: string) {
		return originalArray.map((item: WeekDayRule, index: number) =>
			index === indexToModify
				? { ...item, [keyToChange]: newValue }
				: item);
	}

	private fourBy40DefaultValues() {
		this.weekDayGridChanges(this.noneFirstColumn, this.fourBy40PrefilledData, this.AdditionalRuleWithNonePrefilledData);
		this.updateSpecialDayRule(true, this.specialRuleIn4By40PrefilledData);
		this.WeekDayColumns[0].columnName = 'WeekDayId';
	}

	private weekDayGridChanges(weekDayFirstColumn: LabelTextItem[], prefilledData: WeekDayRule[], additionalRuleGridData: WeekDayRule[]) {
		this.WeekDayRuleFirstColumnText = weekDayFirstColumn;
		this.WeekDayPrefilledData = prefilledData;
		this.SetBasicDetails({ 'maxTotalHours': magicNumber.oneHundredSixtyEight, 'regularStHours': magicNumber.forty, 'maxStHours': magicNumber.forty, 'maxOtHours': magicNumber.thirtyTwo, 'maxDtHours': magicNumber.ninetySix });
		this.AdditionalRulePrefilledData = additionalRuleGridData;
	}

	private updateSpecialDayRule(isShow: boolean, specialDayPrefilledData: WeekDayRule[]) {
		this.onSpecialDayRuleChange(isShow);
		this.AddEditHourAdjustmentForm.controls['SpecialDayRule'].patchValue(this.isSpecialDayRuleOn);
		this.SpecialRulePrefilledData = specialDayPrefilledData;
	}

	public onSpecialDayRuleChange(event: boolean) {
		this.isSpecialDayRuleOn = event;
		if (!event) {
			this.specialDayRuleFormArray.clear();
		}
	}

	public backToList() {
		this.router.navigate(['xrm/master/hour-distribution-rule/list']);
	}

	public checkAllForm() {
		if (this.hourDistributionRuleData?.PreDefinedWorkScheduleId === Number(PreDefinedSchedules['9/80'])) {
			if (this.isSpecialDayRuleOn) {
				return (this.AddEditHourAdjustmentForm.pristine
					&& this.listViewDataValidation.WeekDayRule?.pristine
					&& this.listViewDataValidation.AdditionalRuleDay?.pristine
					&& this.listViewDataValidation.SpecialRuleDay?.pristine
					&& this.listViewDataValidation.Week2Rule?.pristine
				);
			} else {
				return (this.AddEditHourAdjustmentForm.pristine
					&& this.listViewDataValidation.WeekDayRule?.pristine
					&& this.listViewDataValidation.AdditionalRuleDay?.pristine
					&& this.listViewDataValidation.Week2Rule?.pristine
				);
			}
		} else if (this.isSpecialDayRuleOn) {
			return (this.AddEditHourAdjustmentForm.pristine
				&& this.listViewDataValidation.WeekDayRule?.pristine
				&& this.listViewDataValidation.AdditionalRuleDay?.pristine
				&& this.listViewDataValidation.SpecialRuleDay?.pristine
			);
		} else {
			return (this.AddEditHourAdjustmentForm.pristine
				&& this.listViewDataValidation.WeekDayRule?.pristine
				&& this.listViewDataValidation.AdditionalRuleDay?.pristine
			);
		}
	}

	private clearAllError() {
		this.applyValidationsOnGrids('WeekDayRule');

		const checkType = !this.isEditMode
			? this.AddEditHourAdjustmentForm.value.PreDefinedWorkScheduleId.Value
			: this.AddEditHourAdjustmentForm.value.PreDefinedWorkScheduleId;
		if (checkType == magicNumber.oneHundredTwentyNine) {
			this.applyValidationsOnGrids('Week2Rule');
		}

		this.applyValidationsOnGrids('AdditionalRuleDay');

		if (this.isSpecialDayRuleOn) {
			this.applyValidationsOnGrids('SpecialRuleDay');
		}
	}

	private applyValidationsOnGrids(formArrayName: string) {
		const fields = ['StValue', 'OtValue', 'DtValue', 'StOperator', 'OtOperator', 'DtOperator'];
		this.listViewDataValidation[formArrayName]?.value.map((res: WeekDayRule, index: number) => {
			const e = {
				'formData': this.listViewDataValidation[formArrayName]?.controls ?? [], 'data':
					{ 'value': this.listViewDataValidation[formArrayName]?.value[index] }, 'index': index
			};
			fields.forEach((fieldName) => {
				this.applyValidationOnFields(e, fieldName, magicNumber.one);
			});
		});
	}

	private addAndRemoveError() {
		this.clearAllError();
		this.CopyFromExistingRuleForm.controls['IsCopyHDR'].clearValidators();
		this.CopyFromExistingRuleForm.controls['IsCopyHDR'].updateValueAndValidity();
		this.isFoundError = false;
		this.listViewDataValidation.WeekDayRule?.value.map((res: WeekDayRule, index: number) => {
			if (!this.isFoundError) {
				this.onChangeText(this.listViewDataValidation.WeekDayRule, index, magicNumber.one);
			}
		});
		const checkType = !this.isEditMode
			? this.AddEditHourAdjustmentForm.value.PreDefinedWorkScheduleId.Value
			: this.AddEditHourAdjustmentForm.value.PreDefinedWorkScheduleId;
		if (checkType == magicNumber.oneHundredTwentyNine) {
			this.listViewDataValidation.Week2Rule?.value.map((res: WeekDayRule, index: number) => {
				if (!this.isFoundError) {
					this.onChangeText(this.listViewDataValidation.Week2Rule, index, magicNumber.two);
				}
			});
		}
		this.listViewDataValidation.AdditionalRuleDay?.value.map((res: WeekDayRule, index: number) => {
			if (!this.isFoundError) {
				this.onChangeText(this.listViewDataValidation.AdditionalRuleDay, index, magicNumber.three);
			}
		});
		if (this.isSpecialDayRuleOn) {
			this.listViewDataValidation.SpecialRuleDay?.value.map((res: WeekDayRule, index: number) => {
				if (!this.isFoundError) {
					this.onChangeText(this.listViewDataValidation.SpecialRuleDay, index, magicNumber.four);
				}
			});
		}
	}

	public submitForm() {
		if (!this.isManualEntry) {
			this.addAndRemoveError();
			addCustomFocus(this.AddEditHourAdjustmentForm);
			const isValidListView = this.validateListViewData();
			if (!this.AddEditHourAdjustmentForm.valid || !isValidListView) {
				return;
			} else {
				this.setFormArrayNull((this.AddEditHourAdjustmentForm.controls['PreDefinedWorkScheduleId'].value.Value == PreDefinedSchedules['9/80'])
					? ['WeekDayRule']
					: ['Week1Rule', 'Week2Rule']);
			}
		} else {
			resetValidationGrids(this.AddEditHourAdjustmentForm);
		}
		// eslint-disable-next-line one-var
		const submitPayload: HourDistributionRuleAddEdit = new HourDistributionRuleAddEdit(this.AddEditHourAdjustmentForm.getRawValue());
		submitPayload.AdditionalRule = false;
		this.toasterService.resetToaster();
		this.isNotPrestine = true;
		if (!this.isEditMode) {
			this.addNewHDRRule(submitPayload);
		} else {
			this.updateExistingHDRRule(submitPayload);
		}
	}

	private validateListViewData() {
		let isValidListView = true;
		if (this.listViewDataValidation.WeekDayRule) {
			isValidListView = this.listViewDataValidation.WeekDayRule.valid;
		}
		if (this.listViewDataValidation.Week2Rule && isValidListView) {
			isValidListView = this.listViewDataValidation.Week2Rule.valid;
		}
		if (this.listViewDataValidation.AdditionalRuleDay && isValidListView) {
			isValidListView = this.listViewDataValidation.AdditionalRuleDay.valid;
		}
		if (this.listViewDataValidation.SpecialRuleDay && isValidListView && this.isSpecialDayRuleOn) {
			isValidListView = this.listViewDataValidation.SpecialRuleDay.valid;
			this.listViewDataValidation.SpecialRuleDay.markAllAsTouched();
		}
		return isValidListView;
	}

	private updateExistingHDRRule(payload: HourDistributionRuleAddEdit) {
		this.hourDistributionRuleService.updateHourDistributionRule(payload, this.UKey).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res) => {
				if (res.Succeeded) {
					const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.hourDistributionRuleTextParams);
					this.authService.unsaved = false;
					this.eventLog.isUpdated.next(true);
					this.toasterService.displayToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
					this.AddEditHourAdjustmentForm.markAsPristine();
					this.listViewDataValidation.WeekDayRule?.markAsPristine();
					this.listViewDataValidation.AdditionalRuleDay?.markAsPristine();
					if (this.hourDistributionRuleData.PreDefinedWorkScheduleId === Number(PreDefinedSchedules['9/80'])) {
						this.listViewDataValidation.Week2Rule?.markAsPristine();
					}
					if (this.isSpecialDayRuleOn) {
						this.listViewDataValidation.SpecialRuleDay?.markAsPristine();
					}
				}
				else if (hasValidationMessages(res)) {
					ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
					this.AddEditHourAdjustmentForm.markAsDirty();
				}
				else if (res.StatusCode === Number(HttpStatusCode.Conflict)) {
					const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.labelLocalizeParam);
					this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
					this.AddEditHourAdjustmentForm.markAsDirty();
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, res.Message);
					this.AddEditHourAdjustmentForm.markAsDirty();
				}
				this.cdr.markForCheck();
			});
	}

	private addNewHDRRule(payload: HourDistributionRuleAddEdit) {
		this.hourDistributionRuleService.postNewHourDistributionRule(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if (isSuccessfulResponse(res)) {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.hourDistributionRuleTextParams);
				this.authService.unsaved = false;
				this.toasterService.displayToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
				this.backToList();
			}
			else if (hasValidationMessages(res)) {
				ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
			}
			else if (res.StatusCode === Number(HttpStatusCode.Conflict)) {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.labelLocalizeParam);
				this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
			}
			else {
				this.toasterService.displayToaster(ToastOptions.Error, res.Message);
			}
		});
	}

	private showToasterForValidation(row: WeekDayRule, add = magicNumber.zero, code = 'st', type = magicNumber.one, maxValue = magicNumber.twentyFour) {
		let msg = '',
			rowWiseMsg = '';
		if (this.currentRow != '') {
			rowWiseMsg = `for ${this.currentRow}`;
		}
		if (type == magicNumber.one) {
			msg = showIncompleteHours(row, add, code, msg, rowWiseMsg);
		}
		if (type == magicNumber.two) {
			msg = showInvalidHours(row, add, code, msg, rowWiseMsg);
		}
		if (type == magicNumber.three) {
			msg = `The hour distribution setup is inappropriate ${rowWiseMsg}. Standard Time (ST), Overtime (OT), and Double Time (DT) have the option to allocate the maximum ${maxValue}th hour of the day. Please adjust the hour distribution to ensure there are no overlapping conditions.`;
		}
		if (type == magicNumber.four) {
			msg = `The hour distribution setup is inappropriate ${rowWiseMsg}. Please allocate the hours entered under the "Max Hours Allowed per Day" to either Standard Time (ST), Overtime (OT), or Double Time (DT), or you can use a combination of ST, OT, and DT.`;
		}
		if (type == magicNumber.five) {
			msg = `The hour distribution setup is incorrect ${rowWiseMsg}. Please ensure all operators and values are valid.`;
		}
		this.toasterService.displayToaster(ToastOptions.Error, msg);
	}

	private stOperatorValidation(e: CustomData) {
		const row = e.data.value;
		if (row.StOperator != ConditionParameters.Equal && row.OtOperator == ConditionParameters.Equal
			 && row.DtOperator == ConditionParameters.Equal) {
			if (row.StOperator == ConditionParameters.LessThan &&
				 row.StValue != ((row.MaxHoursAllowed ?? magicNumber.twentyFour) + magicNumber.zeroDotZeroOne)) {
				this.applyValidationOnFields(e, 'StValue', magicNumber.zero);
				this.showToasterForValidation(row, magicNumber.zeroDotZeroOne, 'st');
			}
			if (row.StOperator == ConditionParameters.LessThanOrEqual && row.StValue != (row.MaxHoursAllowed ?? magicNumber.twentyFour)) {
				this.applyValidationOnFields(e, 'StValue', magicNumber.zero);
				this.showToasterForValidation(row, magicNumber.zero, 'st');
			}
		}
	}

	private otOperatorValidation(e: CustomData) {
		const row = e.data.value;
		if (row.DtOperator == ConditionParameters.Equal && row.DtValue == magicNumber.zero &&
			 (row.StOperator != ConditionParameters.GreaterThanOrEqual && row.DtOperator.toString() != String(ConditionParameters.GreaterThan))) {
			if (row.OtOperator == ConditionParameters.LessThan &&
				 row.OtValue != ((row.MaxHoursAllowed ?? magicNumber.twentyFour) + magicNumber.zeroDotZeroOne)) {
				this.applyValidationOnFields(e, 'OtValue', magicNumber.zero);
				this.showToasterForValidation(row, magicNumber.zeroDotZeroOne, 'ot');
			}
			if (row.OtOperator == ConditionParameters.LessThanOrEqual && row.OtValue != (row.MaxHoursAllowed ?? magicNumber.twentyFour)) {
				this.applyValidationOnFields(e, 'OtValue', magicNumber.zero);
				this.showToasterForValidation(row, magicNumber.zero, 'ot');
			}
		}
	}

	private checkInCompleteHDR(e: CustomData) {
		const row = e.data.value;
		this.stOperatorValidation(e);
		this.otOperatorValidation(e);
		if ((row.StOperator != ConditionParameters.GreaterThanOrEqual &&
			 row.DtOperator != ConditionParameters.GreaterThan) &&
			  (row.OtOperator != ConditionParameters.GreaterThanOrEqual &&
					 row.OtOperator != ConditionParameters.GreaterThan) &&
					  (row.DtOperator == ConditionParameters.LessThan || row.DtOperator == ConditionParameters.LessThanOrEqual)) {
			if (row.DtOperator == ConditionParameters.LessThan &&
				 row.OtValue != ((row.MaxHoursAllowed ?? magicNumber.twentyFour) + magicNumber.zeroDotZeroOne)) {
				this.applyValidationOnFields(e, 'DtValue', magicNumber.zero);
				this.showToasterForValidation(row, magicNumber.zeroDotZeroOne, 'dt');
			}
			if (row.DtOperator == ConditionParameters.LessThanOrEqual && row.DtValue != (row.MaxHoursAllowed ?? magicNumber.twentyFour)) {
				this.applyValidationOnFields(e, 'DtValue', magicNumber.zero);
				this.showToasterForValidation(row, magicNumber.zero, 'dt');
			}
		}
	}

	private validateDTifOtSkip(row: WeekDayRule) {
		if ((row.OtOperator == ConditionParameters.Equal && row.StOperator == ConditionParameters.LessThanOrEqual &&
			 row.DtOperator == ConditionParameters.GreaterThanOrEqual) && ((row.StValue ?? magicNumber.zero) >= (row.DtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'dt', magicNumber.two);
		}
		if ((row.OtOperator == ConditionParameters.Equal && row.StOperator == ConditionParameters.LessThan &&
			 row.DtOperator == ConditionParameters.GreaterThanOrEqual) && ((row.StValue ?? magicNumber.zero) > (row.DtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'dt', magicNumber.two);
		}
		if ((row.OtOperator == ConditionParameters.Equal && row.StOperator == ConditionParameters.LessThanOrEqual &&
			 row.DtOperator == ConditionParameters.GreaterThan) && ((row.StValue ?? magicNumber.zero) > (row.DtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'dt', magicNumber.two);
		}
		if ((row.OtOperator == ConditionParameters.Equal && row.StOperator == ConditionParameters.LessThan &&
			 row.DtOperator == ConditionParameters.GreaterThan) &&
			  ((row.StValue ?? magicNumber.zero - magicNumber.zeroDotZeroOne) > (row.DtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'dt', magicNumber.two);
		}
	}

	private checkOverLappedHDR(row: WeekDayRule) {
		this.otOverLappedValidationForHDR(row);

		if ((row.OtOperator == ConditionParameters.LessThanOrEqual && row.DtOperator == ConditionParameters.GreaterThanOrEqual)
			 && ((row.OtValue ?? magicNumber.zero) >= (row.DtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'dt', magicNumber.two);
		}
		if ((row.OtOperator == ConditionParameters.LessThan && row.DtOperator == ConditionParameters.GreaterThanOrEqual)
			 && ((row.OtValue ?? magicNumber.zero) > (row.DtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'dt', magicNumber.two);
		}
		if ((row.OtOperator == ConditionParameters.LessThanOrEqual && row.DtOperator == ConditionParameters.GreaterThan)
			 && ((row.OtValue ?? magicNumber.zero) > (row.DtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'dt', magicNumber.two);
		}
		if ((row.OtOperator == ConditionParameters.LessThan && row.DtOperator == ConditionParameters.GreaterThan)
			 && ((row.OtValue ?? magicNumber.zero - magicNumber.zeroDotZeroOne) > (row.DtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'dt', magicNumber.two);
		}
		/**
 * if OT skip
 */
		this.validateDTifOtSkip(row);
	}

	private otOverLappedValidationForHDR(row: WeekDayRule) {
		if ((row.StOperator == ConditionParameters.LessThanOrEqual && row.OtOperator == ConditionParameters.GreaterThanOrEqual)
			 && ((row.StValue ?? magicNumber.zero) >= (row.OtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'ot', magicNumber.two);
		}
		if ((row.StOperator == ConditionParameters.LessThan && row.OtOperator == ConditionParameters.GreaterThanOrEqual) &&
		 ((row.StValue ?? magicNumber.zero) > (row.OtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'ot', magicNumber.two);
		}
		if ((row.StOperator == ConditionParameters.LessThanOrEqual && row.OtOperator == ConditionParameters.GreaterThan) &&
		 ((row.StValue ?? magicNumber.zero) > (row.OtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'ot', magicNumber.two);
		}
		if ((row.StOperator == ConditionParameters.LessThan && row.OtOperator == ConditionParameters.GreaterThan) &&
		 ((row.StValue ?? magicNumber.zero - magicNumber.zeroDotZeroOne) > (row.OtValue ?? magicNumber.zero))) {
			this.showToasterForValidation(row, magicNumber.zero, 'ot', magicNumber.two);
		}
	}

	private setCurrentRowName(e: CustomData, type = magicNumber.zero) {
		if (type === magicNumber.four) {
			if (e.data.value.WeekDayId != undefined) {
				const Day = (this.selectedPreScheduled == Number(PreDefinedSchedules['9/80']))
					? SpecialDays
					: Days;

				Object.entries(Day).forEach((val) => {
					if ((val[1] ?? '') == e.data.value.WeekDayId) {
						this.currentRow = this.localizationService.GetLocalizeMessage(val[0]);
					}
				});
			} else {
				this.currentRow = '';
			}
		}
	}

	private setCurrentRow(e: CustomData, type = magicNumber.zero) {
		if (type === magicNumber.one) {
			this.currentRow = this.localizationService.GetLocalizeMessage(this.WeekDayRuleFirstColumnText[e.index].label);
		}
		if (type === magicNumber.two) {
			this.currentRow = this.localizationService.GetLocalizeMessage(this.nineBy80Week2FirstColumnText[e.index].label);
		}
		if (type === magicNumber.three) {
			this.currentRow = this.localizationService.GetLocalizeMessage(this.AdditionalRuleFirstColumnText[e.index].label);
		}
		this.setCurrentRowName(e, type);
	}

	private applyMandatoryCondition(e: CustomData, type: number, msg: string) {
		if (type != Number(magicNumber.three) && e.data.value.StOperator == ConditionParameters.Equal &&
		 e.data.value.OtOperator == ConditionParameters.Equal && e.data.value.DtOperator == ConditionParameters.Equal
			&& e.data.value.StValue == magicNumber.zero && e.data.value.OtValue == magicNumber.zero && e.data.value.DtValue == magicNumber.zero
		) {
			this.applyValidationOnFields(e, 'DtValue', magicNumber.zero);
			this.applyValidationOnFields(e, 'DtOperator', magicNumber.zero, msg);
			this.showToasterForValidation(e.data.value, magicNumber.zero, 'dt', magicNumber.four);
		}
	}

	public onChangeDropdown(e: OutputParams) {
		if (e.control === 'ApplicableOnTypeId' || e.control === 'ApplicableOnOperator') {
			if (e.formData.at(e.index).get('ApplicableOnTypeId').value == "140") {
				e.formData.at(e.index).get('ApplicableOnValue').clearValidators();
				e.formData.at(e.index).get('ApplicableOnValue')?.setValidators([
					this.dynamicRequiredValidator('PleaseEnterData', 'ApplicableOnValue'), this.customvalidators.DecimalValidator(magicNumber.two, 'PleaseEnterNumericValuesUpto2Decimal'),
					this.customvalidators.RangeValidator(magicNumber.zero, magicNumber.oneHundredSixtyEightDotZeroZero, 'YouCanEnterValueBetween', [{ Value: '0', IsLocalizeKey: false }, { Value: '168', IsLocalizeKey: false }])
				]);
				if (e.formData.at(e.index).get('ApplicableOnTypeId').value <= magicNumber.oneHundredSixtyEight) {
					e.formData.at(e.index).get('ApplicableOnValue')?.setErrors(null);
					e.formData.at(e.index).get('ApplicableOnValue')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
					e.formData.at(e.index).get('ApplicableOnValue')?.markAsTouched();
				}
			} else {
				e.formData.at(e.index).get('ApplicableOnValue').clearValidators();
				e.formData.at(e.index).get('ApplicableOnValue')?.setValidators([
					this.dynamicRequiredValidator('PleaseEnterData', 'ApplicableOnValue'), this.customvalidators.DecimalValidator(magicNumber.two, 'PleaseEnterNumericValuesUpto2Decimal'),
					this.customvalidators.RangeValidator(magicNumber.zero, magicNumber.twentyFourDotZeroZero, 'YouCanEnterValueBetween', [{ Value: '0', IsLocalizeKey: false }, { Value: '24', IsLocalizeKey: false }])
				]);
				if (e.formData.at(e.index).get('ApplicableOnTypeId').value <= magicNumber.twentyFour) {
					e.formData.at(e.index).get('ApplicableOnValue')?.setErrors(null);
					e.formData.at(e.index).get('ApplicableOnValue')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
					e.formData.at(e.index).get('ApplicableOnValue')?.markAsTouched();
				} else {
					e.formData.at(e.index).get('ApplicableOnValue')?.setErrors({ 'incorrect': true });
					e.formData.at(e.index).get('ApplicableOnValue')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
					e.formData.at(e.index).get('ApplicableOnValue')?.markAsTouched();
				}
			}
		}
	}

	private alloperatorAndValueCheck(e: CustomData, msg: string) {
		// single rows field Validation
		if (checkValidationOnFields(e, 'StValue')) {
			// 1 means it is passed
			this.applyValidationOnFields(e, 'StValue', magicNumber.one);
		} else {
			// 0 means Error is Present
			this.applyValidationOnFields(e, 'StValue', magicNumber.zero);
			this.showToasterForValidation(e.data.value, magicNumber.zero, 'st', magicNumber.five);
		}
		if (checkValidationOnFields(e, 'OtValue')) {
			this.applyValidationOnFields(e, 'OtValue', magicNumber.one);
		} else {
			this.applyValidationOnFields(e, 'OtValue', magicNumber.zero);
			this.showToasterForValidation(e.data.value, magicNumber.zero, 'st', magicNumber.five);
		}
		if (checkValidationOnFields(e, 'DtValue')) {
			this.applyValidationOnFields(e, 'DtValue', magicNumber.one);
		} else {
			this.applyValidationOnFields(e, 'DtValue', magicNumber.zero);
			this.showToasterForValidation(e.data.value, magicNumber.zero, 'st', magicNumber.five);
		}
		if (checkValidationOnFields(e, 'StOperator')) {
			this.applyValidationOnFields(e, 'StOperator', magicNumber.one);
		} else {
			this.applyValidationOnFields(e, 'StOperator', magicNumber.zero, msg);
			this.showToasterForValidation(e.data.value, magicNumber.zero, 'st', magicNumber.five);
		}
		if (checkValidationOnFields(e, 'OtOperator')) {
			this.applyValidationOnFields(e, 'OtOperator', magicNumber.one);
		} else {
			this.applyValidationOnFields(e, 'OtOperator', magicNumber.zero, msg);
			this.showToasterForValidation(e.data.value, magicNumber.zero, 'st', magicNumber.five);
		}
		if (checkValidationOnFields(e, 'DtOperator')) {
			this.applyValidationOnFields(e, 'DtOperator', magicNumber.one);
		} else {
			this.applyValidationOnFields(e, 'DtOperator', magicNumber.zero, msg);
			this.showToasterForValidation(e.data.value, magicNumber.zero, 'st', magicNumber.five);
		}
	}

	private onChangeText(customData: FormArray | undefined, index: number, type = magicNumber.zero) {
		this.toasterService.isRemovableToaster = false;
		this.toasterService.resetToaster();
		const e: CustomData = { 'formData': customData?.controls, 'data': { 'value': customData?.value[index] }, 'index': index },
			msg: string = '';

		this.setCurrentRow(e, type);
		this.alloperatorAndValueCheck(e, msg);
		let MaxHoursAllowed = null;
		if ('MaxHoursAllowed' in e.data.value) {
			MaxHoursAllowed = e.data.value.MaxHoursAllowed;
		} else {
			MaxHoursAllowed = magicNumber.twentyFour;
		}

		// eslint-disable-next-line one-var
		const max = e.data.value.MaxHoursAllowed
			? e.data.value.MaxHoursAllowed
			: magicNumber.twentyFour;
		// all values must be set
		if (e.data.value.StValue != null && e.data.value.OtValue != null && e.data.value.DtValue != null
			&& e.data.value.StOperator != undefined && e.data.value.OtOperator != undefined
			&& e.data.value.DtOperator != undefined && MaxHoursAllowed != null &&
			e.data.value.StValue <= max && e.data.value.OtValue <= max && e.data.value.DtValue <= max
		) {
			if (!checkInvalidOperator(e)) {
				this.checkInCompleteHDR(e);
				this.checkOverLappedHDR(e.data.value);
			}
		}
		if (e.data.value.StValue != null && e.data.value.OtValue != null && e.data.value.DtValue != null
			&& e.data.value.StOperator != undefined && e.data.value.OtOperator != undefined
			&& e.data.value.DtOperator != undefined && MaxHoursAllowed != null &&
			(e.data.value.StValue > (MaxHoursAllowed + magicNumber.zeroDotZeroOne) ||
			 e.data.value.OtValue > (MaxHoursAllowed + magicNumber.zeroDotZeroOne) ||
				e.data.value.DtValue > (MaxHoursAllowed + magicNumber.zeroDotZeroOne))) {
			this.showToasterForValidation(e.data.value, magicNumber.zero, 'MaxHoursAllowed', magicNumber.three, MaxHoursAllowed);
		}
		this.applyMandatoryCondition(e, type, msg);
	}

	private applyValidationOnFields(e: CustomData, fieldName: string, data: number, msg: string = '') {
		if (data) {
			e.formData?.at(e.index)?.get(fieldName)?.clearValidators();
			if (fieldName == 'StValue' || fieldName == 'OtValue' || fieldName == 'DtValue') {
				e.formData?.at(e.index)?.get(fieldName)?.setValidators([this.dynamicRequiredValidator('PleaseEnterData', fieldName), this.addValidationForDecimal(), this.ValidationsForHoursPerDay()]);
			} else {
				e.formData?.at(e.index)?.get(fieldName)?.setValidators([this.dynamicRequiredValidator('PleaseSelectData', fieldName)]);
			}
			e.formData?.at(e.index)?.get(fieldName)?.setErrors(null);
			e.formData?.at(e.index)?.get(fieldName)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
			e.formData?.at(e.index)?.get(fieldName)?.markAsTouched();
		} else {
			if (fieldName == 'StValue' || fieldName == 'OtValue' || fieldName == 'DtValue') {
				e.formData?.at(e.index)?.get(fieldName)?.setValidators([this.customvalidators.checkValidHours(msg), this.addValidationForDecimal(), this.ValidationsForHoursPerDay(), this.dynamicRequiredValidator('PleaseEnterData', fieldName)]);
			} else {
				e.formData?.at(e.index)?.get(fieldName)?.setValidators([this.customvalidators.checkValidHours(msg), this.dynamicRequiredValidator('PleaseSelectData', fieldName)]);
			}
			e.formData?.at(e.index)?.get(fieldName)?.setErrors({ 'incorrect': true });
			e.formData?.at(e.index)?.get(fieldName)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
			e.formData?.at(e.index)?.get(fieldName)?.markAsTouched();
			this.isFoundError = true;
		}
	}

	ngOnDestroy(): void {
		if (this.isEditMode || this.toasterService.isRemovableToaster) {
			this.toasterService.resetToaster();
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}

