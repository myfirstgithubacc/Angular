import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { LocationService } from '@xrm-master/location/services/location.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { Subject, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';
@Component({
	selector: 'app-basic-details',
	templateUrl: './basic-details.component.html',
	styleUrls: ['./basic-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDetailsComponent implements OnInit, OnDestroy {
	// get whole location parant form
	@Input() childFormGroup: FormGroup;

	// get sector dropdown list used in the basic details child section
	@Input() sectorDropdownList: any[];
	@Input() isEditMode: boolean;
	@Input() timeZoneDropdown: any;
	public basicDetailsForm: FormGroup;

	// triggle function for sector details to be bind in all dropdown list on sector select/deselect
	@Output() handleSectorSelectDeselect = new EventEmitter<{ Value: any }>();

	// get all dropdown value trigger from parent component
	@Input() public dropdownListDataBySectorId: any;

	@Input() public locationDetails: any;
	private unsubscribe$ = new Subject<void>();

	@Input() public sectorDetails: any;
	public countryid: number = this.localizationService.GetCulture(CultureFormat.CountryId);

	// dropdown list variable
	public stateDropDownList: any = [];
	public mspProgramManagerDropdownList: any = [];

	// labels for state and zip code
	public stateLabel: string = this.localizationService.GetCulture(CultureFormat.StateLabel, this.countryid);
	public zipLabel: string = this.localizationService.GetCulture(CultureFormat.ZipLabel, this.countryid);
	public stateLabelEdit: string = '';
	public zipLabelEdit: string = '';
	public badgeLength: any = "10 (Characters)";
	public localizeParamZip: DynamicParam[] = [{ Value: this.zipLabel, IsLocalizeKey: false }];
	public localizeParamState: DynamicParam[] = [{ Value: this.stateLabel, IsLocalizeKey: false }];
	public localizeParamZipEdit: DynamicParam[] = [{ Value: this.zipLabel, IsLocalizeKey: false }];
	public localizeParamStateEdit: DynamicParam[] = [{ Value: this.stateLabel, IsLocalizeKey: false }];
	public zipLenSeries: any;
	public zipFormat: any;
	public countryName: any;

	// eslint-disable-next-line max-params
	constructor(
		private customValidators: CustomValidators,
		private configureClientService: ConfigureClientService,
		private locationService: LocationService,
		private localizationService: LocalizationService
	) { }

	// ng on change life cycle hook for change in input properties dropdown list data by sector id
	ngOnChanges(changes: SimpleChanges): void {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (changes['dropdownListDataBySectorId']) {
			const data = changes['dropdownListDataBySectorId'].currentValue;
			this.getDropdownListDataBySectorId(data);
		}
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (changes['sectorDetails']) {
			const data = changes['sectorDetails'].currentValue;
			this.getSectorDetailsById(data);
		}
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (changes['locationDetails']) {
			const data = changes['locationDetails'].currentValue;
			this.getLocationDetailsById(data);
		}
	}

	private getDropdownListDataBySectorId(data: any) {
		this.dropdownListDataBySectorId = data;
		this.countryName = this.dropdownListDataBySectorId?.CountryName;
		this.patchStatesAndResetOnSectorChange();
	}

	private getSectorDetailsById(data: any) {
		this.sectorDetails = data;
		this.patchBasicDetails(data);
		this.countryid = this.sectorDetails?.BasicDetail?.CountryId;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (this.countryid === undefined || this.countryid === null) {
			this.handleLocalizationAdd(this.localizationService.GetCulture(CultureFormat.CountryId));
			return;
		}
		this.handleLocalizationAdd(this.countryid);
		this.zipLenSeries = this.localizationService.GetCulture(CultureFormat.ZipLengthSeries, this.countryid);
		this.zipLenSeries = this.zipLenSeries.replace(',', ' or ');
		this.zipFormat = this.localizationService.GetCulture(CultureFormat.ZipFormat, this.countryid);

		this.basicDetailsForm.controls['postalPinCode'].setValidators([this.customValidators.PostCodeValidator(this.countryid), this.customValidators.RequiredValidator('PleaseEnterData', this.localizeParamZip)]);
		this.basicDetailsForm.controls['postalPinCode'].updateValueAndValidity();
		this.basicDetailsForm.controls['billingPostalCode'].setValidators(this.customValidators.PostCodeValidator(this.countryid, 'BillingZip') as ValidatorFn);
		this.basicDetailsForm.controls['billingPostalCode'].updateValueAndValidity();
	}

	private getLocationDetailsById(data: any) {
		this.locationDetails = data;
		if (data) {
			this.patchBasicDetails(data);
			this.handleLocalizationEdit();

			this.basicDetailsForm.controls['postalPinCode'].setValidators([this.customValidators.PostCodeValidator(this.countryid), this.customValidators.RequiredValidator('PleaseEnterData', this.localizeParamZip)]);
			this.basicDetailsForm.controls['postalPinCode'].updateValueAndValidity();
			this.basicDetailsForm.controls['billingPostalCode'].setValidators(this.customValidators.PostCodeValidator(this.countryid, 'BillingZip') as ValidatorFn);
			this.basicDetailsForm.controls['billingPostalCode'].updateValueAndValidity();
		}
	}

	// eslint-disable-next-line max-lines-per-function
	ngOnInit(): void {
		// get only location details formgroup from parent form and bind that in child form
		this.basicDetailsForm = this.childFormGroup.get('basicDetails') as FormGroup;
		// only used for verifying domain name in email as in configure client
		this.getConfigureClientBasicDetail();

		if (this.isEditMode) {
			this.basicDetailsForm.controls['state'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', this.localizeParamStateEdit));
			this.basicDetailsForm.controls['postalPinCode'].addValidators(this.customValidators.RequiredValidator('PleaseEnterData', this.localizeParamZipEdit));
		}
		else {
			this.basicDetailsForm.controls['state'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', this.localizeParamState));
			this.basicDetailsForm.controls['postalPinCode'].addValidators(this.customValidators.RequiredValidator('PleaseEnterData', this.localizeParamZip));
		}
		this.locationService.userDetail('2', '1').pipe(takeUntil(this.unsubscribe$)).subscribe((x: any) => {
			this.getMspProgramManagerListDropdown(x.Data);
		});
	}

	private handleLocalizationAdd(countryId: any) {
		this.stateLabel = this.localizationService.GetCulture(CultureFormat.StateLabel, countryId);
		this.zipLabel = this.localizationService.GetCulture(CultureFormat.ZipLabel, countryId);
		this.localizeParamZip.splice(Number(magicNumber.zero));
		this.localizeParamState.splice(Number(magicNumber.zero));
		this.localizeParamZip.push({ Value: this.zipLabel, IsLocalizeKey: false });
		this.localizeParamState.push({ Value: this.stateLabel, IsLocalizeKey: false });
	}
	private handleLocalizationEdit() {
		this.stateLabelEdit = this.localizationService.GetCulture(CultureFormat.StateLabel, this.locationDetails.CountryId);
		this.zipLabelEdit = this.localizationService.GetCulture(CultureFormat.ZipLabel, this.locationDetails.CountryId);
		this.localizeParamZipEdit.push({ Value: this.zipLabelEdit, IsLocalizeKey: false });
		this.localizeParamStateEdit.push({ Value: this.stateLabelEdit, IsLocalizeKey: false });
		this.zipLenSeries = this.localizationService.GetCulture(CultureFormat.ZipLengthSeries, this.locationDetails.CountryId);
		this.zipLenSeries = this.zipLenSeries.replace(',', ' or ');
		this.zipFormat = this.localizationService.GetCulture(CultureFormat.ZipFormat, this.locationDetails.CountryId);
	}

	private patchBasicDetails(data: any) {
		if (this.isEditMode) {
			this.patchBasicDetailsEditMode(data);
		} else {
			this.patchBasicDetailsAddMode();
		}
	}

	private patchBasicDetailsEditMode(data: any) {
		const patchValueAsObject = (value: any) =>
				this.locationService.patchValueAsObject(value),
			defaultToNull = (value: any) =>
				value || null;

		this.basicDetailsForm.patchValue({
			sectorId: patchValueAsObject(data.SectorId),
			locationName: data?.LocationName,
			addressOne: defaultToNull(data?.AddressLine1),
			addressTwo: defaultToNull(data?.AddressLine2),
			state: patchValueAsObject(data.StateId),
			cityName: defaultToNull(data?.City),
			postalPinCode: defaultToNull(data?.PostalCode),
			timeZone: patchValueAsObject(data.TimeZoneId),
			phoneNo: defaultToNull(data?.PhoneNo),
			phoneNoExt: defaultToNull(data?.PhoneExtension),
			billingAddressOne: defaultToNull(data?.BillingAddressOne),
			billingAddressTwo: defaultToNull(data?.BillingAddressTwo),
			billingCityName: defaultToNull(data?.BillingCityName),
			billingStateCode: patchValueAsObject(data.BillingStateId),
			billingPostalCode: defaultToNull(data?.BillingPostalCode),
			billingAttention: defaultToNull(data?.BillingAttention),
			billingEmail: defaultToNull(data?.BillingEmail),
			mileageRate: defaultToNull(data?.MileageRate),
			poDepletionPercentageForNotification: data?.PODepletionPercentage,
			mspProgramMgr: patchValueAsObject(data.MSPProgramMgrId),
			salesTaxRequired: data?.SalesTaxRequired || false
		});
		if (this.basicDetailsForm.controls['salesTaxRequired'].value && this.locationDetails?.SalesTaxRequired) {
			this.onSalesTaxRequiredChange(true);
		}
	}

	private patchBasicDetailsAddMode() {
		const defaultPoDepletionPercentage = this.sectorDetails?.TimeAndExpenseConfiguration?.DefaultPoDepletionForNewLocations || null;
		this.basicDetailsForm.patchValue({
			poDepletionPercentageForNotification: defaultPoDepletionPercentage
		});
	}


	// make fields required based on switch toggle
	public onSalesTaxRequiredChange(dataItem: any) {
		const ctrl1 = this.basicDetailsForm.controls['stateSalesTaxRate'],
			ctrl2 = this.basicDetailsForm.controls['taxablePercentOfBillRate'];
		ctrl1.setValue(null);
		ctrl2.setValue(magicNumber.hundred);
		const controlList: AbstractControl[] = [ctrl1, ctrl2];
		if (dataItem) {
			ctrl1.addValidators([
				this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'StateSalesTaxRate', IsLocalizeKey: true }]),
				this.customValidators.RangeValidator(.01, 100.00, "NumericValueGreater0AndLessThan100", this.validatorsParams(magicNumber.zero, magicNumber.hundred))
			]);
			ctrl2.addValidators([
				this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'TaxableBillRate', IsLocalizeKey: true }]),
				this.customValidators.RangeValidator(.01, 100.00, "NumericValueGreater0AndLessThan100", this.validatorsParams(magicNumber.zero, magicNumber.hundred))
			]);
		} else {
			this.customValidators.RemoveCascadeRequiredValidator(controlList);
		}
		this.basicDetailsForm.updateValueAndValidity();

		ctrl1.reset();

		// patch location prefilled data only

		if (this.isEditMode) {
			this.patchSalesTaxRequired();
		}
	}

	private patchSalesTaxRequired() {
		this.basicDetailsForm.patchValue({
			stateSalesTaxRate: (this.locationDetails?.StateSalesTaxRate
				? this.locationDetails?.StateSalesTaxRate
				: null),
			taxablePercentOfBillRate: (this.locationDetails?.TaxablePercentOfBillRate
				? this.locationDetails?.TaxablePercentOfBillRate
				: null)
		});
	}


	public getLocationAllDropdownListBySectorId(id: any) {
		if (id == undefined) {
			this.countryName = '';
		}
		this.handleSectorSelectDeselect.emit(id);
		this.basicDetailsForm.controls['postalPinCode'].reset();
	}

	private patchStatesAndResetOnSectorChange() {
		if (!this.isEditMode) {
			this.basicDetailsForm.controls['state'].setValue(null);
			this.basicDetailsForm.controls['billingStateCode'].setValue(null);
		}
		this.getStateListDropdown();
	}
	private getStateListDropdown() {
		if (this.dropdownListDataBySectorId?.States) {
			this.stateDropDownList = this.dropdownListDataBySectorId?.States;
		} else {
			this.stateDropDownList = [];
		}
	}

	private getMspProgramManagerListDropdown(mspManager: any) {
		if (mspManager) {
			this.mspProgramManagerDropdownList = mspManager;
		}
		else {
			this.mspProgramManagerDropdownList = [];
		}

	}

	private validatorsParams(startingValue: number, endingValue: number) {
		return [
			{ Value: startingValue.toString(), IsLocalizeKey: false },
			{ Value: endingValue.toString(), IsLocalizeKey: false }
		];
	}

	public oneTimeSettingForToggleSwitchToMakeDisable(controlFieldName: any) {
		if (this.isEditMode && this.locationDetails?.[controlFieldName]) {
			return true;
		} else {
			return false;
		}
	}


	private configureClientEmailDomainWithoutAtTheRate: any;
	public configureClientEmailDomain: any;
	public configureClientBasicDetails!: any;

	private getConfigureClientBasicDetail() {
		this.configureClientService.getBasicDetails().pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
			this.locationService.configureClientDetails.next(data);
			this.configureClientBasicDetails = data.Data;
			this.configureClientEmailDomain = this.configureClientBasicDetails.EmailDomain.replace(/,/g, ", ");
			this.configureClientEmailDomainWithoutAtTheRate = (this.configureClientBasicDetails.EmailDomain.replace(/@/g, "")).split(',');

			// call when domin name got from configure client api
			this.updateBillingEmail();
		});
	}


	private updateBillingEmail() {
		const ctrl1: any = this.basicDetailsForm.controls['billingEmail'];
		if (this.configureClientEmailDomainWithoutAtTheRate) {
			ctrl1.addValidators([
				this.customValidators.MaxLengthValidator(magicNumber.eightThousand),
				this.customValidators.EmailValidator('Enter a valid email from suggested domain(s).', [], this.configureClientEmailDomainWithoutAtTheRate)
			]);
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
