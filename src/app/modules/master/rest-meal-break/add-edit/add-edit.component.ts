import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestMealBreakService } from 'src/app/services/masters/rest-meal-break.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { HttpStatusCode } from '@angular/common/http';
import { Subject, forkJoin, of, switchMap, takeUntil } from 'rxjs';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { RestMealBreakConfigurationAddEdit } from '@xrm-core/models/rest-meal-break-configuration/add-Edit/rest-meal-break-configuration-add-edit';
import { MealBreakPenaltyConfigGrid } from '@xrm-core/models/rest-meal-break-configuration/add-Edit/rest-meal-break-configuration-Grid';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { ValidationResult } from '@xrm-core/models/rest-meal-break-configuration/add-Edit/rest-meal-break-config-validation-result';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CommonService } from '@xrm-shared/services/common.service';
import { getMealBreakPenaltyDefaultPrefilledData, getMealBreakPenaltyHoursColumnControlType, getMealBreakPenaltyHoursFirstColumnSettings, getMealBreakPenaltyHoursGridConfigSettings } from '../utils/list-view-grid-settings';
import { clearDependentData, isArrayNullOrEmpty, removeArrayOfJsonElements } from '../utils/helper';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';
import { DropdownModel } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	standalone: true,
	imports: [CommonModule, SharedModule],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, AfterViewInit, OnDestroy {
	public magicNumber = magicNumber;
	public copyFromExistingRestMealBreakText: string;
	public allowCustom: boolean = true;
	public labelLocalizeParam: DynamicParam[] = [{ Value: 'Rule', IsLocalizeKey: true }];
	public ruleNameLocalizeParam: DynamicParam[] = [{ Value: 'RuleName', IsLocalizeKey: true }];
	public isTooltipVisible: boolean = true;
	public isEditMode: boolean = false;
	public showMealBreakCard: boolean = false;
	public showRestBreakCard: boolean = false;
	public isAllowInOutTimeSheet: boolean = false;
	public isAllowInOutMealBreak: boolean = false;
	public AddEditMealBreakForm: FormGroup;
	public CopyExistingRestMealBreakForm: FormGroup;
	public MealBreakList: DropdownModel[] = [
		{ Text: '1', Value: '1' },
		{ Text: '2', Value: '2' },
		{ Text: '3', Value: '3' }
	];
	public restMealBreakCopyDropdown: DropdownModel[];
	public ukey: string;
	private restMealBreakByUkey: RestMealBreakConfigurationAddEdit;
	private restMealBreakOnCopy: RestMealBreakConfigurationAddEdit;
	private MintuesValidation: string = 'MealBreakPenaltyConfigMinutesWiseValidation';
	private ColumnValidation: string = 'MealBreakPenaltyConfigColumnWiseValidation';
	private RowValidation: string = 'MealBreakPenaltyConfigRowWiseValidation';
	private destroyAllSubscribtion$ = new Subject<void>();
	private MealBreakPenaltyFormArray: FormArray;
	private mealBreakPenaltyDefaultPrefilledData: MealBreakPenaltyConfigGrid[] = getMealBreakPenaltyDefaultPrefilledData();
	private rowName: string[] = ['FirstMealBreakIn', 'SecondMealBreakIn', 'ThirdMealBreakIn'];
	private timeOutIds: number[] = [];
	private onMealBreakGridChange: FormArray|null|undefined;
	private restMealBreakLabelTextParams: DynamicParam[] = [{ Value: 'RestOrMealBreakConfiguration', IsLocalizeKey: true }];

	public MealBreakPenaltyHoursPrefilledData: MealBreakPenaltyConfigGrid[] = this.mealBreakPenaltyDefaultPrefilledData;
	public MealBreakPenaltyHoursFirstColumn = getMealBreakPenaltyHoursFirstColumnSettings();
	public MealBreakPenaltyHoursColumns = getMealBreakPenaltyHoursColumnControlType(this.customvalidators, this.timeRangeValidation.bind(this));
	public MealBreakPenaltyHoursGridConfigs = getMealBreakPenaltyHoursGridConfigSettings();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private restMealBreakService: RestMealBreakService,
		private customvalidators: CustomValidators,
		private toasterService: ToasterService,
		private localizationService: LocalizationService,
		private activatedRoute: ActivatedRoute,
		private eventLog: EventLogService,
		private authGuardService: AuthGuardService,
		private cdr: ChangeDetectorRef,
		private commonService: CommonService
	) {
		this.createReactiveForm();
	}

	private createReactiveForm() {
		this.CopyExistingRestMealBreakForm = this.formBuilder.group({
			'IsCopyRestMealBreak': [null]
		});

		this.AddEditMealBreakForm = this.formBuilder.group({
			'RuleName': [null, [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'RuleName')]],
			'RuleDescription': [null],
			'AllowInOutTimeSheet': [false],
			'DefaultBreakDuration': [magicNumber.thirty],
			'AllowInOutMealBreak': [false],
			'NumberOfMealBreak': [{ Value: '2' }],
			'MealBreakPenalty': [false],
			'MealBreakPenaltyHours': [magicNumber.one],
			'MealBreakPenaltyConfigurations': this.formBuilder.array([]),
			'MealBreakPenaltyConfigurationsValidation': [null],
			'RestBreakPenalty': [false],
			'RestBreakMinimumHours': [magicNumber.threeDotFive],
			'RestBreakPenaltyHours': [magicNumber.one]
		});
	}

	private timeRangeValidation(fieldName: string, timeFormat: string, rangeData: { min:number, max:number } =
	{ min: 0.01, max: Number(magicNumber.twentyFour) }): ValidatorFn {
		return this.customvalidators.RangeValidator(rangeData.min, rangeData.max, 'ControlRangeShouldBeLessThanAndGreaterThan', [
			{ Value: fieldName, IsLocalizeKey: true },
			{ Value: '0', IsLocalizeKey: false },
			{ Value: rangeData.max.toString(), IsLocalizeKey: false },
			{ Value: timeFormat, IsLocalizeKey: true }
		]);
	}

	private addValidationsOnControl(controlName: string, validations: ValidatorFn | ValidatorFn[]) {
		this.AddEditMealBreakForm.controls[controlName].addValidators(validations);
	}

	private removeValidationsOnControl(controlName: string) {
		this.AddEditMealBreakForm.controls[controlName].clearValidators();
		this.AddEditMealBreakForm.controls[controlName].updateValueAndValidity();
	}

	ngOnInit(): void {
		this.MealBreakPenaltyFormArray = this.AddEditMealBreakForm.controls['MealBreakPenaltyConfigurations'] as FormArray;

		this.activatedRoute.params.pipe(
			switchMap((params) => {
				this.ukey = params['id'];
				this.isEditMode = Boolean(this.ukey);
				if (this.isEditMode) {
					return forkJoin({
						'copyDropdown': this.restMealBreakService.getRestMealBreakCopyDropdown(),
						'restMealBreakDetails': this.restMealBreakService.getRestMealBreakConfigurationByUkey(this.ukey)
					});
				} else {
					return forkJoin({
						'copyDropdown': this.restMealBreakService.getRestMealBreakCopyDropdown(),
						'restMealBreakDetails': of(null)
					});
				}
			}),
			takeUntil(this.destroyAllSubscribtion$)
		).subscribe(({ copyDropdown, restMealBreakDetails }) => {
			this.getCopyDropDown(copyDropdown);
			if(restMealBreakDetails)
				this.getRestMealBreakDetailsByUkey(restMealBreakDetails);
		});
		this.authGuardService.unsaved = false;
	}

	private getCopyDropDown(res: GenericResponseBase<DropdownModel[]>) {
		if (isSuccessfulResponse(res)) {
			this.restMealBreakCopyDropdown = res.Data;
			this.cdr.markForCheck();
		}
	}

	private getRestMealBreakDetailsByUkey(res: GenericResponseBase<RestMealBreakConfigurationAddEdit>) {
		this.isTooltipVisible = false;
		if (isSuccessfulResponse(res)) {
			this.restMealBreakByUkey = res.Data;
			this.createCommonHeader(this.restMealBreakByUkey);
			this.patchRestMealBreakReactiveForm(this.restMealBreakByUkey);
			this.cdr.markForCheck();
		}
	}

	private createCommonHeader(response: RestMealBreakConfigurationAddEdit) {
		this.restMealBreakService.holdData.next({'Disabled': response.Disabled, 'RuleCode': response.RuleCode, 'Id': response.Id});
	}

	ngAfterViewInit(): void {
		this.copyFromExistingRestMealBreakText = this.localizationService.GetLocalizeMessage('CopyFromExistingSector', this.labelLocalizeParam);
	}

	public AllowInOutTimeSheet(isAllowedInOutTimeSheet: boolean) {
		if (isAllowedInOutTimeSheet) {
			this.isAllowInOutTimeSheet = true;
			this.applyDefaultBreakValidations();
		} else {
			this.isAllowInOutTimeSheet = false;
			this.removeDefaultBreakValidations();
		}
		this.AddEditMealBreakForm.updateValueAndValidity();
		this.cdr.markForCheck();
	}

	private applyDefaultBreakValidations() {
		this.addValidationsOnControl('DefaultBreakDuration', [
			this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'DefaultBreakDurationField'),
			this.timeRangeValidation('DefaultBreakDurationField', 'MintuesInHours', { min: Number(magicNumber.one), max: Number(magicNumber.oneThousandFourHundredForty) })
		]);

		this.AllowInOutMealBreak(this.AddEditMealBreakForm.controls['AllowInOutMealBreak'].value);
	}

	private removeDefaultBreakValidations() {
		this.removeValidationsOnControl('DefaultBreakDuration');
		this.removeValidationsOnControl('NumberOfMealBreak');
		this.removeValidationsOnControl('MealBreakPenaltyHours');
		this.removeValidationsOnControl('RestBreakMinimumHours');
		this.removeValidationsOnControl('RestBreakPenaltyHours');
		this.MealBreakPenaltyFormArray.clear();
	}

	public AllowInOutMealBreak(isAllowInOutMealBreak: boolean) {
		if (isAllowInOutMealBreak) {
			this.isAllowInOutMealBreak = true;
			this.applyNoOfMealBreakAndPenaltyValidations();
		} else {
			this.isAllowInOutMealBreak = false;
			this.removeNoOfMealBreakAndPenaltyValidations();
		}
		this.cdr.markForCheck();
	}

	private applyNoOfMealBreakAndPenaltyValidations() {
		this.removeValidationsOnControl('DefaultBreakDuration');
		this.addValidationsOnControl('NumberOfMealBreak', this.customvalidators.requiredValidationsWithMessage('PleaseSelectData', 'NoofMealBreakInaDay'));
		this.onNumberOfMealBreakInADay(this.AddEditMealBreakForm.controls['NumberOfMealBreak'].value);
		this.MealBreakPenalty(this.AddEditMealBreakForm.controls['MealBreakPenalty'].value);
		this.RestBreakPenalty(this.AddEditMealBreakForm.controls['RestBreakPenalty'].value);
	}

	private removeNoOfMealBreakAndPenaltyValidations() {
		this.addValidationsOnControl('DefaultBreakDuration', [
			this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'DefaultBreakDurationField'),
			this.timeRangeValidation('DefaultBreakDurationField', 'MintuesInHours', { min: Number(magicNumber.one), max: Number(magicNumber.oneThousandFourHundredForty) })
		]);

		this.removeValidationsOnControl('NumberOfMealBreak');
		this.removeValidationsOnControl('MealBreakPenaltyHours');
		this.removeValidationsOnControl('RestBreakMinimumHours');
		this.removeValidationsOnControl('RestBreakPenaltyHours');
		this.MealBreakPenaltyFormArray.clear();
	}

	public onNumberOfMealBreakInADay(event: DropdownModel | undefined) {
		if (event?.Value !== undefined) {
			const numberOfMealBreak: number = this.MealBreakList.findIndex((item: DropdownModel) =>
				item.Value === event.Value);
			this.bindGrid(this.mealBreakPenaltyDefaultPrefilledData.slice(magicNumber.zero, numberOfMealBreak + magicNumber.one));
		}
		this.cdr.markForCheck();
	}

	public onSelectingExistingRule() {
		this.CopyExistingRestMealBreakForm.controls['IsCopyRestMealBreak'].clearValidators();
		this.CopyExistingRestMealBreakForm.controls['IsCopyRestMealBreak'].updateValueAndValidity();
		this.cdr.markForCheck();
	}

	private bindGrid(gridData: MealBreakPenaltyConfigGrid[]) {
		this.MealBreakPenaltyHoursPrefilledData = gridData;
	}

	public MealBreakPenalty(isMealBreakPenalty: boolean) {
		if (isMealBreakPenalty) {
			this.showMealBreakCard = true;
			this.addValidationsOnControl('MealBreakPenaltyHours', [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'PenaltyField'), this.timeRangeValidation('PenaltyField', 'hours')]);
		} else {
			this.showMealBreakCard = false;
			this.removeValidationsOnControl('MealBreakPenaltyHours');
			this.MealBreakPenaltyFormArray.clear();
		}
		this.cdr.markForCheck();
	}

	public RestBreakPenalty(isRestBreakPenalty: boolean) {
		if (isRestBreakPenalty) {
			this.showRestBreakCard = true;
			this.addValidationsOnControl('RestBreakMinimumHours', [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'MinimumHoursWorkedField'), this.timeRangeValidation('MinimumHoursWorkedField', 'hours')]);
			this.addValidationsOnControl('RestBreakPenaltyHours', [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'PenaltyField'), this.timeRangeValidation('PenaltyField', 'hours')]);
		} else {
			this.showRestBreakCard = false;
			this.removeValidationsOnControl('RestBreakMinimumHours');
			this.removeValidationsOnControl('RestBreakPenaltyHours');
		}
		this.cdr.markForCheck();
	}

	private MealBreakpenaltyConifgValidation(formArray: FormArray) {
		this.toasterService.resetToaster();

		for (let i = Number(magicNumber.zero); i <= (formArray.length - magicNumber.one); i++) {
			if (!this.isCellsValidOrNot(formArray.controls)) {
				break;
			}

			this.setFormArrayControlsToNull(formArray.controls[i] as FormGroup);

			const prevMinimumHours = formArray.value[i - magicNumber.one]?.MinimumHoursWorked ?? magicNumber.zero,
				minHoursLessThanMandatory = this.isMandatoryBreakLessThanMinHours(formArray.controls[i], prevMinimumHours);

			if (minHoursLessThanMandatory.error) {
				this.generateErrorWithToaster(formArray, 'MandatoryBreak', i, minHoursLessThanMandatory);
				break;
			}

			const minimumHoursLessThanRestrict: ValidationResult = this.isMinHoursLessThanWaiveOff(formArray.controls[i]);

			if (minimumHoursLessThanRestrict.error) {
				this.generateErrorWithToaster(formArray, 'RestrictWaiveOffHours', i, minimumHoursLessThanRestrict);
				break;
			}

			// Column Wise Validation will always comes after mandatory validaiton function.
			if (formArray.length > Number(magicNumber.one) && i > Number(magicNumber.zero)) {
				const columnResponse = this.columnWiseValidation(formArray, i);
				if (columnResponse.error) {
					this.generateErrorWithToaster(formArray, columnResponse.controlName ?? '', columnResponse.index ?? magicNumber.zero, columnResponse);
					break;
				}
			}
		}
	}

	private generateErrorWithToaster(formArray: FormArray, controlName:string, i: number, response: ValidationResult) {
		this.showToasterForGrid(response, i);
		formArray.controls[i].get(controlName)?.setErrors({ error: true });
		formArray.controls[i].get(controlName)?.markAsTouched();
	}

	private setFormArrayControlsToNull(row: FormGroup) {
		row.controls['MinimumHoursWorked'].setErrors(null);
		row.controls['MandatoryBreak'].setErrors(null);
		row.controls['RestrictWaiveOffHours'].setErrors(null);
	}

	private isCellsValidOrNot(controls: AbstractControl[]) {
		let isCellsValid: boolean = true;
		for (const row of controls) {
			const isErrorInMinimumHours = row.get('MinimumHoursWorked')?.errors?.['message'] || '',
				isErrorInMandatoryBreak: string = row.get('MandatoryBreak')?.errors?.['message'] || '',
				isErrorRestrictWaiveOffHours: string = row.get('RestrictWaiveOffHours')?.errors?.['message'] || '';

			if ((isErrorInMinimumHours.length > Number(magicNumber.zero))
				|| (isErrorInMandatoryBreak.length > Number(magicNumber.zero))
				|| (isErrorRestrictWaiveOffHours.length > Number(magicNumber.zero))) {
				isCellsValid = false;
				break;
			}
		}
		return isCellsValid;
	}

	private isMinHoursLessThanWaiveOff(row: AbstractControl): ValidationResult {
		if (row.value.MinimumHoursWorked < row.value.RestrictWaiveOffHours) {
			this.removeErrors('incorrect');
			return ({ error: false, message: '' });
		} else {
			this.AddEditMealBreakForm.controls['MealBreakPenaltyConfigurationsValidation'].setErrors({ 'incorrect': true });
			return ({ error: true, message: this.RowValidation, toasterPlaceholder1: 'MinimumHoursWorkedField', toasterPlaceholder2: 'RestrictWaiveOffField' });
		}
	}

	private isMandatoryBreakLessThanMinHours(row: AbstractControl, differenceRemove: number): ValidationResult {
		// Math abs will give me positive value always after sum of Minimum hours from current row to next row.
		if ((row.value.MandatoryBreak) <= (Math.abs(row.value.MinimumHoursWorked - differenceRemove) * magicNumber.sixty)) {
			this.removeErrors('IncorrectRow');
			return ({ error: false, message: '' });
		} else {
			this.AddEditMealBreakForm.controls['MealBreakPenaltyConfigurationsValidation'].setErrors({ 'IncorrectRow': true });
			return ({ error: true, message: this.MintuesValidation, toasterPlaceholder1: 'MinimumHoursWorkedField', toasterPlaceholder2: 'MandatoryBreakField' });
		}
	}

	private showToasterForGrid(response: ValidationResult, index: number) {
		this.toasterService.displayToaster(ToastOptions.Error, response.message, [
			{ Value: response.toasterPlaceholder1 ?? '', IsLocalizeKey: true },
			{ Value: this.rowName[index], IsLocalizeKey: true },
			{ Value: response.toasterPlaceholder2 ?? '', IsLocalizeKey: true }
		]);
	}

	private columnWiseValidation(gridData: FormArray, index: number) {
		const formData = gridData.value as MealBreakPenaltyConfigGrid [];
		let isColumnError: ValidationResult;

		isColumnError = this.isMinHoursWorkedValid(formData, index);

		if (!isColumnError.error) {
			isColumnError = this.isResWaiveOffHoursValid(formData, index);
		}
		return isColumnError;
	}

	private isMinHoursWorkedValid(formData: MealBreakPenaltyConfigGrid[], index: number): ValidationResult {
		const prevMinimumHoursWorked = formData[index - magicNumber.one].MinimumHoursWorked,
			currMinimumHoursWorked = formData[index].MinimumHoursWorked;

		let isColumnError: ValidationResult;

		if (this.commonService.notNullAndUndefined(prevMinimumHoursWorked) && this.commonService.notNullAndUndefined(currMinimumHoursWorked) &&
		prevMinimumHoursWorked < currMinimumHoursWorked) {
			this.removeErrors('IncorrectColumn');
			isColumnError = ({ error: false, message: '' });
		} else {
			this.AddEditMealBreakForm.controls['MealBreakPenaltyConfigurationsValidation'].setErrors({ 'IncorrectColumn': true });
			isColumnError = ({ error: true, message: this.ColumnValidation, toasterPlaceholder1: 'MinimumHoursWorkedField', toasterPlaceholder2: this.rowName[index - magicNumber.one], index: index, controlName: 'MinimumHoursWorked' });
		}
		return isColumnError;
	}

	private isResWaiveOffHoursValid(formData: MealBreakPenaltyConfigGrid[], index: number): ValidationResult {
		const prevRestrictWaiveOffHours = formData[index - magicNumber.one].RestrictWaiveOffHours,
			currRestrictWaiveOffHours = formData[index].MinimumHoursWorked;

		let isColumnError: ValidationResult;

		if (this.commonService.notNullAndUndefined(prevRestrictWaiveOffHours) && this.commonService.notNullAndUndefined(currRestrictWaiveOffHours)
				&& prevRestrictWaiveOffHours < currRestrictWaiveOffHours) {
			 this.removeErrors('IncorrectColumn1');
			 isColumnError = ({ error: false, message: '' });
		 } else {
			 // Error is Present in Restrict Waive Off Column.
			 this.AddEditMealBreakForm.controls['MealBreakPenaltyConfigurationsValidation'].setErrors({ 'IncorrectColumn1': true });
			 this.AddEditMealBreakForm.markAllAsTouched();
			 isColumnError = ({ error: true, message: this.ColumnValidation, toasterPlaceholder1: 'RestrictWaiveOffField', toasterPlaceholder2: this.rowName[index - magicNumber.one], index: index, controlName: 'RestrictWaiveOffHours' });
		 }
		 return isColumnError;
	}

	private removeErrors(errorName: string) {
		const currentErrors = this.AddEditMealBreakForm.controls['MealBreakPenaltyConfigurationsValidation'].errors;
		if (currentErrors) {
			delete currentErrors[errorName];
			this.AddEditMealBreakForm.controls['MealBreakPenaltyConfigurationsValidation'].setErrors(Object.keys(currentErrors).length > Number(magicNumber.zero)
				? currentErrors
				: null);
		}
	}

	public getFormStatus(formArray: FormArray) {
		if (this.AddEditMealBreakForm.controls['MealBreakPenalty'].value) {
			this.onAddMoreMealBreakPenalty(formArray.value);
			this.onMealBreakGridChange = formArray;

			formArray.value.forEach((row: MealBreakPenaltyConfigGrid, index: number) => {
				row.MealBreakTypeId = this.mealBreakPenaltyDefaultPrefilledData[index].MealBreakTypeId;
				if (row.WeekDayName !== undefined)
					delete row.WeekDayName;
				if (row.MealBreakPenaltyHours !== undefined)
					delete row.MealBreakPenaltyHours;

				this.mealBreakPenaltyDefaultPrefilledData[index] = row;
			});
		}

		if (!formArray.pristine) {
			this.MealBreakPenaltyFormArray.markAsDirty();
		}
		this.cdr.markForCheck();
	}

	private onAddMoreMealBreakPenalty(list: MealBreakPenaltyConfigGrid []) {
		this.MealBreakPenaltyFormArray.clear();

		list.forEach((row: MealBreakPenaltyConfigGrid, index: number) => {
			this.MealBreakPenaltyFormArray.push(this.formBuilder.group({
				'Id': [
					(list[index].Id == magicNumber.zero || list[index].Id == null) ?
						magicNumber.zero :
						list[index].Id
				],
				'MealBreakTypeId': [this.MealBreakPenaltyHoursPrefilledData[index].MealBreakTypeId],
				'MinimumHoursWorked': [row.MinimumHoursWorked, [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'MinimumHoursWorkedField'), this.timeRangeValidation('MinimumHoursWorkedField', 'hours')]],
				'MandatoryBreak': [row.MandatoryBreak, [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'MandatoryBreakField'), this.timeRangeValidation('MandatoryBreakField', 'MintuesInHours', { min: 0.01, max: Number(magicNumber.oneThousandFourHundredForty) })]],
				'RestrictWaiveOffHours': [row.RestrictWaiveOffHours, [this.customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'RestrictWaiveOffField'), this.timeRangeValidation('RestrictWaiveOffField', 'hours')]]
			}));
		});
	}

	public OnCopyExistingRuleName(selectedExistingRule: DropdownModel | null | undefined) {
		if (selectedExistingRule !== null && selectedExistingRule !== undefined) {
			const copyId = selectedExistingRule.Value;
			this.restMealBreakService.getRestMealBreakConfigurationById(parseInt(copyId)).pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((res: GenericResponseBase<RestMealBreakConfigurationAddEdit>) => {
					if (isSuccessfulResponse(res)) {
						res.Data.RuleName = null;
						this.restMealBreakOnCopy = res.Data;
						const {MealBreakPenalty, MealBreakPenaltyConfigurations} = res.Data;
						if (MealBreakPenalty)
							this.restMealBreakOnCopy.MealBreakPenaltyConfigurations = removeArrayOfJsonElements(MealBreakPenaltyConfigurations);
						this.patchRestMealBreakReactiveForm(res.Data);
						this.authGuardService.unsaved = true;
						this.cdr.markForCheck();
					}
				});
		} else {
			this.CopyExistingRestMealBreakForm.controls['IsCopyRestMealBreak'].addValidators(this.customvalidators.requiredValidationsWithMessage('PleaseSelectData', this.localizationService.GetLocalizeMessage('CopyFromSelectedSector', this.ruleNameLocalizeParam)));
			this.CopyExistingRestMealBreakForm.controls['IsCopyRestMealBreak'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
			this.CopyExistingRestMealBreakForm.controls['IsCopyRestMealBreak'].markAsTouched();
		}
		this.cdr.markForCheck();
	}

	private patchRestMealBreakReactiveForm(copiedData: RestMealBreakConfigurationAddEdit) {
		this.AddEditMealBreakForm.patchValue({
			'RuleName': copiedData.RuleName,
			'RuleDescription': copiedData.RuleDescription,
			'AllowInOutTimeSheet': copiedData.AllowInOutTimeSheet,
			'DefaultBreakDuration': (copiedData.DefaultBreakDuration ?? magicNumber.thirty),
			'AllowInOutMealBreak': copiedData.AllowInOutMealBreak,
			'NumberOfMealBreak': {
				Value: (copiedData.NumberOfMealBreak !== null && copiedData.NumberOfMealBreak !== undefined
					? copiedData.NumberOfMealBreak.toString()
					: magicNumber.two.toString())
			},
			'MealBreakPenalty': copiedData.MealBreakPenalty,
			'MealBreakPenaltyHours': (copiedData.MealBreakPenaltyHours ?? magicNumber.one),
			'RestBreakPenalty': copiedData.RestBreakPenalty,
			'RestBreakMinimumHours': (copiedData.RestBreakMinimumHours ?? magicNumber.threeDotFive),
			'RestBreakPenaltyHours': (copiedData.RestBreakPenaltyHours ?? magicNumber.one)
		});

		if(isArrayNullOrEmpty(copiedData.MealBreakPenaltyConfigurations, copiedData.MealBreakPenalty))
			this.fillDummyRows(copiedData.MealBreakPenaltyConfigurations);

		this.AllowInOutTimeSheet(copiedData.AllowInOutTimeSheet);
	}

	private fillDummyRows(list: MealBreakPenaltyConfigGrid[]): MealBreakPenaltyConfigGrid[] {
		list.forEach((row: MealBreakPenaltyConfigGrid, index: number) =>
			this.mealBreakPenaltyDefaultPrefilledData[index] = row);
		return this.mealBreakPenaltyDefaultPrefilledData;
	}

	public backToList() {
		return this.router.navigate(['xrm/master/rest-meal-break-configuration/list']);
	}

	public submitForm() {
		this.AddEditMealBreakForm.markAllAsTouched();

		this.CopyExistingRestMealBreakForm.controls['IsCopyRestMealBreak'].clearValidators();
		this.CopyExistingRestMealBreakForm.controls['IsCopyRestMealBreak'].updateValueAndValidity();

		const payload: RestMealBreakConfigurationAddEdit = new RestMealBreakConfigurationAddEdit(this.AddEditMealBreakForm.getRawValue());

		if (this.commonService.notNullAndUndefined(this.onMealBreakGridChange) && payload.MealBreakPenalty && payload.AllowInOutTimeSheet)
			this.MealBreakpenaltyConifgValidation(this.onMealBreakGridChange);

		this.scrollToError();
		this.finalizeMealBreakConfiguration(payload);
		this.cdr.markForCheck();
	}

	private scrollToError() {
		const parentTimeOutId = window.setTimeout(() => {
			const fieldWithError: NodeListOf<HTMLElement> | null = document.querySelectorAll('.ng-invalid');
			if (fieldWithError.length != Number(magicNumber.zero)) {
				let index = magicNumber.zero;
				for (let i = Number(magicNumber.zero); i < fieldWithError.length; i++) {
					if (fieldWithError[i].localName != "form" && fieldWithError[i].localName != "div" && fieldWithError[i].localName != "tr") {
						index = i;
						break;
					}
				}

				const error: HTMLElement | null = fieldWithError[index].querySelector('.k-input-inner');
				if (error != null) {
					const childTimeOutId = window.setTimeout(() => {
						error.scrollIntoView({ block: 'center' });
					}, magicNumber.hundred);
					this.timeOutIds.push(childTimeOutId);
					error.focus();
				} else {
					const childTimeOutId = window.setTimeout(() => {
						fieldWithError[index].scrollIntoView({ block: 'center' });
					}, magicNumber.hundred);
					this.timeOutIds.push(childTimeOutId);
					fieldWithError[index].focus();
				}
			}
		}, magicNumber.hundred);
		this.timeOutIds.push(parentTimeOutId);
	}

	private finalizeMealBreakConfiguration(payload: RestMealBreakConfigurationAddEdit) {
		if (this.AddEditMealBreakForm.valid) {
			clearDependentData(payload, this.AddEditMealBreakForm.getRawValue());
			if (this.isEditMode) {
				payload.UKey = this.ukey;
				this.eventLog.isUpdated.next(true);
				this.updateRestMealBreakConfiguration(payload);
			} else {
				this.addNewRestMealBreakConfiguration(payload);
			}
		}
	}

	private addNewRestMealBreakConfiguration(payload: RestMealBreakConfigurationAddEdit) {
		this.restMealBreakService.addNewRestMealBreakConfiguration(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if (isSuccessfulResponse(res)) {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.restMealBreakLabelTextParams);
				this.toasterService.displayToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
				this.authGuardService.unsaved = false;
				this.backToList();
				this.cdr.markForCheck();
			}
			else if (hasValidationMessages(res)) {
				ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
			}
			else if (res.StatusCode == Number(HttpStatusCode.Conflict)) {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.labelLocalizeParam);
				this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
			}
			else {
				this.toasterService.displayToaster(ToastOptions.Error, res.Message);
			}
		});
	}

	private updateRestMealBreakConfiguration(payload: RestMealBreakConfigurationAddEdit) {
		this.restMealBreakService.updateRestMealBreakConfiguration(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if (isSuccessfulResponse(res)) {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.restMealBreakLabelTextParams);
				this.toasterService.displayToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
				this.authGuardService.unsaved = false;
				this.AddEditMealBreakForm.markAsPristine();
				this.mealBreakPenaltyDefaultPrefilledData.forEach((row) => {
					row.Id = magicNumber.zero;
				});
				this.cdr.markForCheck();
			}
			else if (hasValidationMessages(res)) {
				ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
				this.AddEditMealBreakForm.markAsDirty();
			}
			else if (res.StatusCode == Number(HttpStatusCode.Conflict)) {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.labelLocalizeParam);
				this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
				this.AddEditMealBreakForm.markAsDirty();
			}
			else {
				this.toasterService.displayToaster(ToastOptions.Error, res.Message);
				this.AddEditMealBreakForm.markAsDirty();
			}
		});
	}

	ngOnDestroy(): void {
		if (this.isEditMode || this.toasterService.isRemovableToaster) {
			this.toasterService.resetToaster();
		}
		if(this.timeOutIds.length) {
			this.timeOutIds.forEach((id) => {
				clearTimeout(id);
			});
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
