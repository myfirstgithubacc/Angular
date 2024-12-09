
import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { LocationModel } from '@xrm-core/models/location/location.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { NavigationPaths } from '../constant/routes-constant';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LocationService } from '../services/location.service';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { DatePipe } from '@angular/common';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { BenefitAdderConfigurationsComponent } from './benefit-adder-configurations/benefit-adder-configurations.component';
import { BackgroundChecksComponent } from './background-checks/background-checks.component';
import { TimeAndExpenseConfigurationsComponent } from './time-and-expense-configurations/time-and-expense-configurations.component';
import { CommonService } from '@xrm-shared/services/common.service';
import { Subject, takeUntil } from 'rxjs';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { RequisitionConfigurationsComponent } from './requisition-configurations/requisition-configurations.component';
import { EventLogService } from '@xrm-shared/services/event-log.service';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, OnDestroy {

	@ViewChildren(ListViewComponent) listOfViewComponent: QueryList<ListViewComponent>;
	@ViewChild(BenefitAdderConfigurationsComponent) benefitAdderComponent: BenefitAdderConfigurationsComponent;
	@ViewChild(BackgroundChecksComponent) backgroundChecksComponent: BackgroundChecksComponent;
	@ViewChild(TimeAndExpenseConfigurationsComponent) timeAndExpenseComponent: TimeAndExpenseConfigurationsComponent;
	@ViewChild(RequisitionConfigurationsComponent) requisitionConfigurationsComponent: RequisitionConfigurationsComponent;
	// status strip
	public recordStatusForm: FormGroup;
	public onActivateDeactivateConfirm$: any;
	// end status strip

	public isEditMode: boolean = false;
	public addEditLocationForm: FormGroup;
	public sectorList: any[] = [];
	public locationDetails: any;

	public navigationPaths: any = NavigationPaths;
	public specialCharsNotAllowed: any[] = ["&", "<", ">", "/", "'"];

	private locationUKey: string;

	// udf property
	public entityId: number = XrmEntities.Location;
	public sectorIdUDF: number = magicNumber.zero;
	public udfRecordID: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.Add;
	public udfData: any;
	// end udf property

	public isSubmitted: boolean = false;

	// used for focus on first field of form (send first child from parent form)
	public basicDetails: FormGroup;

	public entityID = XrmEntities.Location;

	// gets the dropdown data and send these to the applicable child components
	public timeZoneList: object;
	public mealBreakList: object;
	public timeClockDropdownList: object;
	public showRecordName: boolean = false;
	public statusCardREcord: string;

	public sectorDetails: any;
	public dropdownListDataBySectorId: any;

	// flag used for resetting toaster after location submit
	public isAdded = false;
	public reloadData: boolean = false;

	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		public sectorService: SectorService,
		public locationService: LocationService,
		private customValidators: CustomValidators,
		private activatedRoute: ActivatedRoute,
		private datePipe: DatePipe,
		public udfCommonMethods: UdfCommonMethods,
		private toasterService: ToasterService,
		private commonService: CommonService,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef,
		private eventLogService: EventLogService

	) {
		this.locationFormInitialization();
	}

	ngOnInit(): void {
		this.getLocationAggregateDropdownList();
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			if (param['ukey']) {
				this.isEditMode = true;
				this.locationUKey = param['ukey'];
				this.getLocationById(this.locationUKey);
				this.removeValidationFromFormInUpdate();
			}
		});
		this.getSectorListData();
	}

	// reactive form initialization
	private locationFormInitialization() {
		this.addEditLocationForm = this.formBuilder.group({
			'basicDetails': this.createBasicDetailsFormGroup(),
			'locationOfficer': this.formBuilder.group({
				locationOfficerArray: this.formBuilder.array([])
			}),
			'timeAndExpenseConfigurations': this.createTimeAndExpenseConfigurationsFormGroup(),
			'xrmTimeClock': this.createXrmTimeClockFormGroup(),
			'requisitionConfiguration': this.createRequisitionConfigurationFormGroup(),
			'benefitAdderConfigurations': this.createBenefitAdderConfigurationsFormGroup(),
			'configureMSPProcessActivity': this.createConfigureMSPProcessActivityFormGroup(),
			'backgroundChecks': this.createBackgroundChecksFormGroup()
		});

		this.recordStatusForm = this.formBuilder.group({
			status: [null]
		});

		this.basicDetails = this.addEditLocationForm.get('basicDetails') as FormGroup;
	}

	private createBasicDetailsFormGroup(): FormGroup {
		return this.formBuilder.group({
			sectorId: [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])],
			// Basic Details
			locationName: [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'LocationName', IsLocalizeKey: true }]), this.customValidators.MaxLengthValidator(magicNumber.hundred)]],
			addressOne: [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'AddressLine1', IsLocalizeKey: true }]), this.customValidators.MaxLengthValidator(magicNumber.hundred)]],
			addressTwo: [null, this.customValidators.MaxLengthValidator(magicNumber.hundred)],
			state: [null],
			cityName: [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'City', IsLocalizeKey: true }]), this.customValidators.MaxLengthValidator(magicNumber.fifty)]],
			postalPinCode: [null, [this.customValidators.MaxLengthValidator(magicNumber.nine)]],
			timeZone: [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'TimeZoneId', IsLocalizeKey: true }])],
			phoneNo: [null, this.MobileNumberValidator],
			phoneNoExt: [null],
			// Billing Details
			billingAddressOne: [null, this.customValidators.MaxLengthValidator(magicNumber.hundred)],
			billingAddressTwo: [null, this.customValidators.MaxLengthValidator(magicNumber.hundred)],
			billingCityName: [null, this.customValidators.MaxLengthValidator(magicNumber.fifty)],
			billingStateCode: [null],
			billingPostalCode: [null],
			billingAttention: [null, this.customValidators.MaxLengthValidator(magicNumber.threeHundred)],
			billingEmail: [null, [this.customValidators.MaxLengthValidator(magicNumber.fifty), this.customValidators.EmailValidator()]],
			mileageRate: [
				null,
				[
					this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'MileageRate', IsLocalizeKey: true }]),
					this.customValidators.RangeValidator(magicNumber.zeroDotZeroZeroOne, magicNumber.tripleNineWithThreeDecPlaces, "ValueGreaterAndLessThan", this.validatorsParams(magicNumber.zero, magicNumber.oneThousand)),
					this.customValidators.DecimalValidator(magicNumber.three, 'PleaseEnterNumericValuesUpto3Decimal')
				]
			],
			poDepletionPercentageForNotification: [
				null,
				[
					this.customValidators.RangeValidator(magicNumber.zero, magicNumber.hundred, "NumericValueGreater0AndLessThan100", this.validatorsParams(magicNumber.zero, magicNumber.hundred)),
					this.customValidators.DecimalValidator(magicNumber.two, 'PleaseEnterNumericValuesUpto2Decimal')
				]
			],
			mspProgramMgr: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'MSPProgramManager', IsLocalizeKey: true }])]],
			salesTaxRequired: [false],
			stateSalesTaxRate: [null],
			taxablePercentOfBillRate: [null]
		});
	}

	private createTimeAndExpenseConfigurationsFormGroup(): FormGroup {
		return this.formBuilder.group({
			nineEightyWeekOne: [null],

			allowExpenseEntry: [true],
			alternateTimeAndExpenseConfigurations: [false],
			clpJobRotationAllowed: [false],
			allTimeAdjustmentsApprovalRequired: [false],
			allowTimeUploadWithSTOTDT: [false],
			validateApprovedAmountWithTimeRecords: [false],
			displayStaffingAgencyInTandEApproval: [false],
			sendPODepletionNoticeToPrimaryManager: [false],
			sendPODepletionNoticeToPOOwner: [false],
			timeUploadAsApprovedHours: [false],
			autoApproveHoursAdjustmentAllowed: [false],


			hourDistributionRules: [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'HourDistributionRule', IsLocalizeKey: true }])],
			allowContractorToAddHolidaysHours: [false],
			applicableRestMealBreaksConfiguration: [null, this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'ApplicableRestMealBreaksConfiguration', IsLocalizeKey: true }])]
		});
	}

	private createXrmTimeClockFormGroup(): FormGroup {
		return this.formBuilder.group({
			alternateTimeClockConfigurations: [false],
			enableXRMTimeClock: [false],
			dailyPunchApprovalNeeded: [false],
			autoLunchDeductionAllowed: [false],
			lunchTimeDeducted: [null],
			minimumHourWorkedBeforeLunchDeduction: [null],
			allowManagerAdjustPunchInOut: [false],
			effectiveDateForLunchConfiguration: [null],
			accrueHoursFromActualPunchIn: [false],

			isAllowManualCharge: [false],
			isAllowManualShift: [false],
			isAllowManualJobCategory: [false],

			xrmUseEmployeeIDTimeClockID: [null],
			punchRoundingNeeded: [false],
			punchInTimeIncrementRounding: [null],
			punchOutTimeIncrementRounding: [null],
			punchInTimeRounding: [null],
			punchOutTimeRounding: [null],

			clockBufferToSetReportingDate: [null],
			ClockBufferForShiftStart: [null]
		});
	}

	private createRequisitionConfigurationFormGroup(): FormGroup {
		return this.formBuilder.group({
			alternateRequisitionConfigurations: [false],
			showExtendedWorkLocationAddress: [true],
			positionDetailsEditable: [false],
			assignmentTypes: this.formBuilder.array([])
		});
	}

	private createBenefitAdderConfigurationsFormGroup(): FormGroup {
		return this.formBuilder.group({
			alternateBenefitAdderConfigurations: [false],
			requireBenefitAdders: [false],
			benefitAdder: this.formBuilder.array([])
		});
	}

	private createConfigureMSPProcessActivityFormGroup(): FormGroup {
		return this.formBuilder.group({
			alternateConfigureMspProcessActivity: [false],
			skipProcessSubmittalByMsp: [false],
			hideNTERateFromRequisitionLibrary: [false],
			skipLIRequestProcessbyMSP: [false],
			autoBroadcastForLIRequest: [false]
		});
	}

	private createBackgroundChecksFormGroup(): FormGroup {
		return this.formBuilder.group({
			AlternateDrugsAndBackgroundChecksConfigurations: [false],
			Id: [magicNumber.zero],
			allowToFillCandidateWithPendingCompliance: [false],
			allowAttachPreEmploymentDocToClientEmail: [false],
			activeClearanceOptionRequired: [false],
			isDrugResultVisible: [false],
			isDrugScreenItemEditable: [false],
			defaultDrugResultValue: [false],

			isBackGroundCheckVisible: [false],
			isBackGroundItemEditable: [false],
			defaultBackGroundCheckValue: [false],

			SectorBackgrounds: this.formBuilder.array([]),
			SectorOnboardings: this.formBuilder.array([])
		});
	}
	// end reactive form initialization


	// get sector list
	private getSectorListData() {
		this.sectorService.getSectorDropDownList().pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
			if (res.Succeeded) {
				this.sectorList = res.Data;
			} else {
				this.sectorList = [];
			}
		});
	}

	// get time zone list, meal break list and time clock dropdown list
	private getLocationAggregateDropdownList() {
		this.locationService.locationAggregate().pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((x: any) => {
			this.timeZoneList = x.ddlTimezone;
			this.mealBreakList = x.ddlmealbreak;
			this.timeClockDropdownList = x;
		});
	}

	public getLocationAllDropdownListBySectorId(id: any) {
		if (id == undefined) {
			this.resetSectorDependentData();
			if (!this.isEditMode) {
				this.timeAndExpenseComponent.disabledDates = [];
			}
			this.sectorDetails = null;
			this.locationDetails = null;
			this.dropdownListDataBySectorId = null;
		}
		this.getAllDropdownBySectorId(id.Value);
		this.getSectorbyId(id.Value);
		this.sendDataforUdfCreation(id.Value);
	}

	private resetSectorDependentData() {
		const basicDetails = this.addEditLocationForm.controls['basicDetails'] as FormGroup;
		basicDetails.controls['poDepletionPercentageForNotification'].reset();

		this.resetConfigureMSPProcessActivityData();
		this.resetTimeAndExpenseData();
		this.resetTimeClockData();
		this.resetRequisitionConfigData();
		this.resetBenefitAdderData();
		this.resetBackgroundChecksData();
	}

	private resetConfigureMSPProcessActivityData() {
		const configureMSPProcessActivity = this.addEditLocationForm.controls['configureMSPProcessActivity'] as FormGroup;
		configureMSPProcessActivity.reset();
	}

	private resetBackgroundChecksData() {
		const backgroundChecks = this.addEditLocationForm.controls['backgroundChecks'] as FormGroup;
		backgroundChecks.reset();
	}

	private resetBenefitAdderData() {
		const benefitAdderConfigurations = this.addEditLocationForm.controls['benefitAdderConfigurations'] as FormGroup;
		benefitAdderConfigurations.reset();
	}

	private resetTimeAndExpenseData() {
		const timeAndExpenseConfigurations = this.addEditLocationForm.controls['timeAndExpenseConfigurations'] as FormGroup,
			allTimeAndExpenseControls = Object.keys(timeAndExpenseConfigurations.controls),
			controlNotToReset = [
				"nineEightyWeekOne",
				"allowExpenseEntry",
				"allowContractorToAddHolidaysHours",
				"applicableRestMealBreaksConfiguration",
				"hourDistributionRules"
			],
			controlsToReset = allTimeAndExpenseControls.filter((controlName) =>
				!controlNotToReset.includes(controlName));

		controlsToReset.forEach((controlName) =>
			timeAndExpenseConfigurations.controls[controlName].reset());
	}

	private resetRequisitionConfigData() {
		const requisitionConfiguration = this.addEditLocationForm.controls['requisitionConfiguration'] as FormGroup;
		requisitionConfiguration.reset();
	}

	private resetTimeClockData() {
		const xrmTimeClock = this.addEditLocationForm.controls['xrmTimeClock'] as FormGroup;
		xrmTimeClock.reset();
	}

	// udf method to get data and form
	private sendDataforUdfCreation(id: any) {
		this.sectorIdUDF = parseInt(id);
		this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, this.sectorIdUDF);
	}

	public getUdfData(data: any) {
		this.udfData = data.data;
		this.addEditLocationForm.addControl('udf', data.formGroup);
	}
	// end udf

	private removeValidationFromFormInUpdate() {
		const ctrl1 = this.addEditLocationForm.controls['sectorId'],
			ctrl2 = this.addEditLocationForm.controls['locationName'],
			abstractControl: AbstractControl[] = [ctrl1, ctrl2];
		this.customValidators.RemoveCascadeRequiredValidator(abstractControl);
	}


	private getAllDropdownBySectorId(id: any) {
		this.locationService.getLocationAllDropdownListBySectorId(id).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
			if (res.Succeeded) {
				this.dropdownListDataBySectorId = res.Data;
				this.cdr.markForCheck();
				this.addEditLocationForm.markAsPristine();
			} else {
				this.dropdownListDataBySectorId = [];
			}
		});
	}

	public getSectorbyId(id: any) {
		this.locationService.getSectorDetailsBySectorId(id).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
			if (res.Succeeded) {
				this.sectorDetails = res.Data;
				this.cdr.markForCheck();
			} else {
				this.sectorDetails = [];
			}
		});
	}

	private getLocationById(id: any) {
		this.locationService.getLocationById(id).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
			if (res.Succeeded) {
				this.locationDetails = res.Data;
				this.patchLocationOtherDetails(this.locationDetails);
				this.locationService.sharedDataSubject.next({
					Disabled: this.locationDetails.Disabled,
					LocationConfigId: this.locationDetails.LocationId,
					LocationConfigCode: this.locationDetails.LocationCode
				});
				this.cdr.markForCheck();
			};
		});
	}

	private patchLocationOtherDetails(data: any) {
		if (this.isEditMode) {
			// get all dropdown list by sector id and patch the data
			this.getAllDropdownBySectorId(data.SectorId);
			this.sendDataforUdfCreation(data.SectorId);
		}
		this.actionTypeId = ActionType.Edit;
		this.sectorIdUDF = data.SectorId;
		this.recordUKey = data.UKey;
		this.udfRecordID = data.LocationId;
	}

	private invalidOnboardingData(): boolean {
		const sectorBackgroundsArray = this.backgroundChecksComponent.sectorBackgroundsArray.value;
		for (let index = 0; index < sectorBackgroundsArray.length; index++) {
			const control = sectorBackgroundsArray[index];
			if (control.IsVisibleToClient && !(control.IsApplicableForProfessional || control.IsApplicableForLi || control.IsApplicableForSow)) {
				this.toasterService.showToaster(ToastOptions.Error, 'OnboardingProfLIICSOWValidation', [{ Value: (index + magicNumber.one).toString(), IsLocalizeKey: false }]);
				return true;
			}
		}
		return false;
	}

	// submit form
	public submitForm() {
		this.addEditLocationForm.markAllAsTouched();
		this.benefitAdderComponent.submitBenefit();
		this.requisitionConfigurationsComponent.submitRequisitionConfigurations();
		this.backgroundChecksComponent.submitBackgroundChecks();
		this.listOfViewComponent.forEach((e: any) => {
			e.checkTouched();
		});
		this.isSubmitted = true;
		if (this.addEditLocationForm.valid) {
			if (!this.invalidOnboardingData()) {
				this.submitFormConfirmation();
			}

		}
		else {
			this.findInvalidControls();
		}
	}

	private submitFormConfirmation(reasonforupdate: string = '') {
		const locationData = this.constructLocationData();
		this.handleFormSubmission(locationData, reasonforupdate);
	}

	private constructLocationData() {
		const basicDetailsData = this.constructBasicDetailsData(),
			locationOfficerData = this.constructLocationOfficerData(),
			timeAndExpenseData = this.constructTimeAndExpenseData(),
			xrmTimeClockData = this.constructXrmTimeClockData(),
			requisitionConfigurationData = this.constructRequisitionConfigurationData(),
			benefitAdderConfigurationData = this.constructBenefitAdderConfigurationData(),
			configureMSPProcessActivityData = this.constructMSPProcessActivityData(),
			backgroundChecksData = this.constructBackgroundChecksData(),
			hourDistributionRules = this.constructHourDistributionRules(),

			locationData: LocationModel = {
				...basicDetailsData,
				...locationOfficerData,
				...timeAndExpenseData,
				...xrmTimeClockData,
				...requisitionConfigurationData,
				...benefitAdderConfigurationData,
				...configureMSPProcessActivityData,
				...backgroundChecksData,
				locHourDistributionRule: hourDistributionRules,
				UdfFieldRecords: this.udfData
			};

		return locationData;
	}

	private constructBasicDetailsData() {
		const basicDetails = this.addEditLocationForm.controls['basicDetails'] as FormGroup;
		return {
			"sectorId": Number(basicDetails.controls['sectorId'].value?.Value),
			"locationName": (basicDetails.controls['locationName'].value).trim(),
			"addressLine1": basicDetails.controls['addressOne'].value,
			"addressLine2": basicDetails.controls['addressTwo'].value || null,
			"cityName": basicDetails.controls['cityName'].value,
			"stateId": this.locationService.parseNullableInt(basicDetails.controls['state'].value?.Value),
			"postalCode": (basicDetails.controls['postalPinCode'].value).trim(),
			"timeZoneId": this.locationService.parseNullableInt(basicDetails.controls['timeZone'].value?.Value),
			"phoneNo": basicDetails.controls['phoneNo'].value || null,
			"phoneExtension": basicDetails.controls['phoneNoExt'].value || null,
			"billingAddressOne": basicDetails.controls['billingAddressOne'].value || null,
			"billingAddressTwo": basicDetails.controls['billingAddressTwo'].value || null,
			"billingCityName": basicDetails.controls['billingCityName'].value || null,
			"BillingStateId": this.locationService.parseNullableInt(basicDetails.controls['billingStateCode'].value?.Value),
			"billingPostalCode": basicDetails.controls['billingPostalCode'].value
				? (basicDetails.controls['billingPostalCode'].value).trim()
				: null,
			"billingAttention": basicDetails.controls['billingAttention'].value || null,
			"billingEmail": basicDetails.controls['billingEmail'].value
				? (basicDetails.controls['billingEmail'].value).toLowerCase()
				: null,
			"mileageRate": basicDetails.controls['mileageRate'].value || null,
			"poDepletionPercentage": basicDetails.controls['poDepletionPercentageForNotification'].value ?? null,
			"mspProgramMgrId": this.locationService.parseNullableInt(basicDetails.controls['mspProgramMgr'].value?.Value),
			"salesTaxRequired": basicDetails.controls['salesTaxRequired'].value,
			"stateSalesTaxRate": basicDetails.controls['stateSalesTaxRate'].value,
			"taxablePercentOfBillRate": basicDetails.controls['taxablePercentOfBillRate'].value
		};
	}

	private constructLocationOfficerData() {
		const locationOfficer = this.addEditLocationForm.controls['locationOfficer'] as FormGroup;
		return {
			"locationOfficers": locationOfficer.controls['locationOfficerArray'].value
		};
	}

	private constructTimeAndExpenseData() {
		const timeAndExpenseConfigurations = this.addEditLocationForm.controls['timeAndExpenseConfigurations'] as FormGroup;
		return {
			"nineEightyWeekOne": timeAndExpenseConfigurations.controls['nineEightyWeekOne'].value ?? null,
			"allowToAddHolidayHours": timeAndExpenseConfigurations.controls['allowContractorToAddHolidaysHours'].value,
			"restMealBreakConfigId": timeAndExpenseConfigurations.controls['applicableRestMealBreaksConfiguration'].value ?
				timeAndExpenseConfigurations.controls['applicableRestMealBreaksConfiguration'].value?.Value :
				null,
			"locHourDistributionRule": [],
			"allowExpenseEntry": timeAndExpenseConfigurations.controls['allowExpenseEntry'].value,

			"alternateTAndEConfigurations": timeAndExpenseConfigurations.controls['alternateTimeAndExpenseConfigurations'].value,
			"isClpJobRotationAllowed": timeAndExpenseConfigurations.controls['clpJobRotationAllowed'].value,
			"isTimeAdjustApprovalRequired": timeAndExpenseConfigurations.controls['allTimeAdjustmentsApprovalRequired'].value,
			"allowTimeUploadWithStOtDt": timeAndExpenseConfigurations.controls['allowTimeUploadWithSTOTDT'].value,
			"validateApprovedAmtTimeRecords": timeAndExpenseConfigurations.controls['validateApprovedAmountWithTimeRecords'].value,
			"displayStaffingInTandEApproval": timeAndExpenseConfigurations.controls['displayStaffingAgencyInTandEApproval'].value,
			"sendPODeplNoticeToPrimaryMgr": timeAndExpenseConfigurations.controls['sendPODepletionNoticeToPrimaryManager'].value,
			"sendPODeplNoticeToPOOwner": timeAndExpenseConfigurations.controls['sendPODepletionNoticeToPOOwner'].value,
			"timeUploadAsApprovedHours": timeAndExpenseConfigurations.controls['timeUploadAsApprovedHours'].value,
			"autoApproveHrsAdjAllowed": timeAndExpenseConfigurations.controls['autoApproveHoursAdjustmentAllowed'].value
		};
	}

	private constructXrmTimeClockData() {
		const xrmTimeClock = this.addEditLocationForm.controls['xrmTimeClock'] as FormGroup;
		return {
			"altTimeClockConfigurations": xrmTimeClock.controls['alternateTimeClockConfigurations'].value,
			"enableXRMTimeClock": xrmTimeClock.controls['enableXRMTimeClock'].value,
			"dailyPunchApprovalNeeded": xrmTimeClock.controls['dailyPunchApprovalNeeded'].value,
			"autoLunchDeductionAllowed": xrmTimeClock.controls['autoLunchDeductionAllowed'].value,
			"lunchTimeDeducted": xrmTimeClock.controls['lunchTimeDeducted'].value
				? Number(xrmTimeClock.controls['lunchTimeDeducted'].value)
				: null,
			"minHourWrkBeforeLunchDeduction": xrmTimeClock.controls['minimumHourWorkedBeforeLunchDeduction'].value
				? Number(xrmTimeClock.controls['minimumHourWorkedBeforeLunchDeduction'].value)
				: null,
			"allowManagerAdjustPunchInOut": xrmTimeClock.controls['allowManagerAdjustPunchInOut'].value,
			"effectiveDateForLunchConfig": xrmTimeClock.controls['effectiveDateForLunchConfiguration'].value ?? null,
			"accrueHoursFromActualPunchIn": xrmTimeClock.controls['accrueHoursFromActualPunchIn'].value,
			"isAllowManualCharge": xrmTimeClock.controls['isAllowManualCharge'].value,
			"isAllowManualShift": xrmTimeClock.controls['isAllowManualShift'].value,
			"isAllowManualJobCategory": xrmTimeClock.controls['isAllowManualJobCategory'].value,
			"xrmEmpIDTimeClockID": xrmTimeClock.controls['xrmUseEmployeeIDTimeClockID'].value
				? Number(xrmTimeClock.controls['xrmUseEmployeeIDTimeClockID'].value)
				: magicNumber.fortyThree,
			"punchRoundingNeeded": xrmTimeClock.controls['punchRoundingNeeded'].value,
			"punchInTimeIncrRoundingId": xrmTimeClock.controls['punchInTimeIncrementRounding'].value?.Value
				? Number(xrmTimeClock.controls['punchInTimeIncrementRounding'].value?.Value)
				: null,
			"punchOutTimeIncrRoundingId": xrmTimeClock.controls['punchOutTimeIncrementRounding'].value?.Value
				? Number(xrmTimeClock.controls['punchOutTimeIncrementRounding'].value?.Value)
				: null,
			"punchInTimeRoundingId": xrmTimeClock.controls['punchInTimeRounding'].value?.Value
				? Number(xrmTimeClock.controls['punchInTimeRounding'].value?.Value)
				: null,
			"punchOutTimeRoundingId": xrmTimeClock.controls['punchOutTimeRounding'].value?.Value
				? Number(xrmTimeClock.controls['punchOutTimeRounding'].value?.Value)
				: null,
			"clockBufferToSetReportingDate": xrmTimeClock.controls['clockBufferToSetReportingDate'].value
				? this.datePipe.transform(xrmTimeClock.controls['clockBufferToSetReportingDate'].value, 'HH:mm:ss')
				: null,
			"clockBufferForEarlyShiftStart": xrmTimeClock.controls['ClockBufferForShiftStart'].value
				? this.datePipe.transform(xrmTimeClock.controls['ClockBufferForShiftStart'].value, 'HH:mm:ss')
				: null
		};
	}

	private constructRequisitionConfigurationData() {
		const requisitionConfiguration = this.addEditLocationForm.controls['requisitionConfiguration'] as FormGroup;
		return {
			"altRequisitionConfigurations": requisitionConfiguration.controls['alternateRequisitionConfigurations'].value,
			"isShowExtendedWorkLocAddress": requisitionConfiguration.controls['showExtendedWorkLocationAddress'].value,
			"positionDetailsEditable": requisitionConfiguration.controls['positionDetailsEditable'].value,
			"assignmentTypes": requisitionConfiguration.controls['assignmentTypes'].value
		};
	}

	private constructBenefitAdderConfigurationData() {
		const benefitAdderConfigurations = this.addEditLocationForm.controls['benefitAdderConfigurations'] as FormGroup;
		return {
			"altBenefitAdderConfigurations": benefitAdderConfigurations.controls['alternateBenefitAdderConfigurations'].value,
			"requireBenefitAdders": benefitAdderConfigurations.controls['requireBenefitAdders'].value,
			"sectBenefitAdderConfig": benefitAdderConfigurations.controls['benefitAdder'].value
		};
	}

	private constructMSPProcessActivityData() {
		const configureMSPProcessActivity = this.addEditLocationForm.controls['configureMSPProcessActivity'] as FormGroup;
		return {
			"altMSPProcessActivityConfigs": configureMSPProcessActivity.controls['alternateConfigureMspProcessActivity'].value,
			"skipProcessSubmittalByMsp": configureMSPProcessActivity.controls['skipProcessSubmittalByMsp'].value,
			"hideNTERateFromReqLib": configureMSPProcessActivity.controls['hideNTERateFromRequisitionLibrary'].value,
			"skipLIRequestProcessbyMSP": configureMSPProcessActivity.controls['skipLIRequestProcessbyMSP'].value,
			"autoBroadcastForLIRequest": configureMSPProcessActivity.controls['autoBroadcastForLIRequest'].value
		};
	}

	private constructBackgroundChecksData() {
		const backgroundChecks = this.addEditLocationForm.controls['backgroundChecks'] as FormGroup;
		return {
			"altDandBChecksConfigurations": backgroundChecks.controls['AlternateDrugsAndBackgroundChecksConfigurations'].value,
			"sectorBackgroundCheck": {
				"id": backgroundChecks.controls['Id'].value,
				"fillWithPendingCompliance": backgroundChecks.controls['allowToFillCandidateWithPendingCompliance'].value,
				"attachPreEmpDocToClientEmail": backgroundChecks.controls['allowAttachPreEmploymentDocToClientEmail'].value,
				"isDrugResultVisible": backgroundChecks.controls['isDrugResultVisible'].value,
				"defaultDrugResultValue": backgroundChecks.controls['defaultDrugResultValue'].value,
				"isBackGroundCheckVisible": backgroundChecks.controls['isBackGroundCheckVisible'].value,
				"defaultBackGroundCheckValue": backgroundChecks.controls['defaultBackGroundCheckValue'].value,
				"isDrugScreenItemEditable": backgroundChecks.controls['isDrugScreenItemEditable'].value,
				"isBackGroundItemEditable": backgroundChecks.controls['isBackGroundItemEditable'].value,
				"sectorBackgrounds": backgroundChecks.controls['SectorBackgrounds'].value,
				"isActiveClearance": false
			}
		};
	}

	private constructHourDistributionRules() {
		const timeAndExpenseConfigurations = this.addEditLocationForm.controls['timeAndExpenseConfigurations'] as FormGroup,
			hourDistributionRules = timeAndExpenseConfigurations.controls['hourDistributionRules'].value;
		if (hourDistributionRules) {
			return hourDistributionRules.map((rule: any) =>
				({
					id: rule.Id ?? magicNumber.zero,
					hourDistributionRuleId: Number(rule.Value)
				}));
		}
		return [];
	}

	private handleFormSubmission(locationData: any, reasonforupdate: string) {
		if (this.isEditMode) {
			this.handleEditModeSubmission(locationData, reasonforupdate);
		} else {
			this.handleAddModeSubmission(locationData);
		}
	}

	private handleEditModeSubmission(locationData: any, reasonforupdate: string) {
		this.toasterService.resetToaster();
		this.addEditLocationForm.markAllAsTouched();
		delete locationData.locationName;
		locationData.locationId = this.locationDetails.LocationId
			? Number(this.locationDetails.LocationId)
			: null;
		locationData.UKey = this.locationDetails.UKey
			? this.locationDetails.UKey
			: null;
		locationData.reasonForChange = reasonforupdate;

		this.locationService.updateLocation(locationData).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
			if (res.StatusCode == HttpStatusCode.Conflict) {
				this.toasterService.resetToaster();
				this.toasterService.showToaster(ToastOptions.Error, 'LocationDuplicateValidation');
			} else if (res.StatusCode == HttpStatusCode.Ok) {
				this.showRecordName = true;
				this.statusCardREcord = res.Data?.LocationName;
				this.commonService.resetAdvDropdown(this.entityID);
				this.toasterService.resetToaster();
				this.localizationService.Refresh();
				this.toasterService.showToaster(ToastOptions.Success, 'LocationUpdatedSuccessfully');
				this.reloadData = true;
				this.getLocationById(this.locationUKey);
				this.addEditLocationForm.markAsPristine();
				this.cdr.markForCheck();
				this.eventLogService.isUpdated.next(true);
			} else {
				this.toasterService.resetToaster();
				this.toasterService.showToaster(ToastOptions.Error, res.Message);
			}
		});
	}

	private handleAddModeSubmission(locationData: any) {
		this.addEditLocationForm.markAllAsTouched();

		this.locationService.addLocation(locationData).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
			if (res.StatusCode == HttpStatusCode.Conflict) {
				this.toasterService.resetToaster();
				this.toasterService.showToaster(ToastOptions.Error, 'LocationDuplicateValidation');
			} else if (res.StatusCode == HttpStatusCode.Ok) {
				this.commonService.resetAdvDropdown(this.entityID);
				this.toasterService.resetToaster();
				this.isAdded = true;
				this.localizationService.Refresh();
				this.toasterService.showToaster(ToastOptions.Success, 'LocationAddedSuccessully');
				setTimeout(() => {
					this.toasterService.resetToaster();
				}, magicNumber.fiveThousand);
				this.router.navigate([this.navigationPaths.list]);
			} else {
				this.toasterService.resetToaster();
				this.toasterService.showToaster(ToastOptions.Error, res.Message);
			}
		});
	}

	private validatorsParams(startingValue: number, endingValue: number) {
		return [
			{ Value: startingValue.toString(), IsLocalizeKey: false },
			{ Value: endingValue.toString(), IsLocalizeKey: false }
		];
	}

	private MobileNumberValidator(control: AbstractControl) {
		if (control.value == null) return null;
		if (control.value.trim().length == magicNumber.zero) return null;
		const mobileRegularExpression = '^(?=.*?[1-9])[0-9()-+-]+$',
			domains = control.value;
		if (!domains.match(new RegExp(mobileRegularExpression))) {
			return { error: true, message: 'PleaseEnterValidPhone' };
		}
		return null;
	}


	public findInvalidControls() {
		const invalid = [],
			controls = this.addEditLocationForm.controls;
		for (const name in controls) {
			if (controls[name].invalid) {
				invalid.push(name);
			}
		}
		return invalid;
	}

	public ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		this.addEditLocationForm.reset();
		if (!this.isAdded) {
			this.toasterService.resetToaster();
		}
	}

}

