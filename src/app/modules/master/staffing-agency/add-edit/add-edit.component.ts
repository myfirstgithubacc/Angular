
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { EMPTY, Subject, debounceTime, forkJoin, switchMap, takeUntil } from 'rxjs';
import { StaffingAgency } from '@xrm-core/models/staffing-agency/staffing-agency-add.model';
import { HttpStatusCode } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { NavigationPaths } from '../constant/routes-constant';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { ClientConfiguration, DropdownOptionList, DrpResponse, IUdfData, LabCheck, SecValue, SectorDetails, StaffingAgencyData, Status, UserDetail, ValidationParams, laborCategoryValues } from '../constant/status-enum';
import { OffCanvasService } from '@xrm-master/approval-configuration/services/off-canvas.service';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { StaffingAgencyGatewayService } from 'src/app/services/masters/staffing-agency-gateway.service';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { IDropdown, DropdownModel, IDropdownItem, ValidationError } from '@xrm-shared/models/common.model';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';
@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [PermissionsService]
})
export class AddEditComponent implements OnInit, OnDestroy {
	public isEditMode: boolean = false;
	public AddstaffingagencyForm: FormGroup;
	public stateRulesList: DropdownOptionList[];
	public timezonelist: DropdownOptionList[];
	public countrylist: DropdownModel[];
	public languageList: DropdownModel[] = [];
	public staffingAgencyTierList: DropdownOptionList[] = [];
	public businessClassificationList: DropdownOptionList[] = [];
	public securityClearanceList: DropdownOptionList[] = [];
	public paymentTypeList: IDropdown[] = [];
	public statusList: IDropdown[] = [];
	public roleList: DropdownOptionList[] = [];
	public recordId: string;
	public statusForm: FormGroup;
	public recordStatus: string;
	public ukey: string;
	public isRequired: boolean = false;
	public isRequiredAccounting: boolean = false;
	public statusError: boolean = true;
	public countryIdVal: number;
	public countryVal: number;
	public stateLabel: string = '';
	public zipLabel: string = '';
	public stateLabelEdit: string = '';
	public zipLabelEdit: string = '';
	public primaryValue:boolean = false;
	public alternateValue:boolean = false;
	public accountingValue:boolean = false;
	public pcUkey: string;
	public acctcUkey: string;
	public altcUkey: string;
	public disableSwitch: boolean = false;
	public staffingAgencyDetails: StaffingAgencyData;
	public existingUkey: string;
	public entityId: number = XrmEntities.StaffingAgency;
	public sectorId: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.Add;
	public udfData: IPreparedUdfPayloadData[] = [];
	public pcEmail: string;
	public primaryContactRole: string;
	public primaryUserId: string;
	public primaryPhone: string;
	public primaryPhoneExt: string;
	public alternateUserContactName: string;
	public AccountingUserId: string;
	public alternateContactRole: string;
	public altcEmail: string;
	public alternateUserId: string;
	public alternatePhone: string;
	public alternatePhoneExt: string;
	public accountingUserContactName: string;
	public accountingContactRole: string;
	public acctcEmail: string;
	public accountingPhone: string;
	public accountingPhoneExt:string;
	public staffingAgencyStatus: boolean = true;
	public staffingReuired: boolean = true;
	public primaryUserNumber: number;
	public alternateUserNumber: number;
	public accountingUserNumber: number;
	public primaryUserContactName: string;
	public alternateContactMiddleName: string;
	public staffingAgencyStatusIdData: number = Status.Active;
	public labourKey: string[] = [];
	public disabledLabourKey: string[] = [];
	public sowKeyClicked: boolean = false;
	public openRightPanel: boolean= false;
	public isEdit: boolean = true;
	public primaryExt:boolean = true;
	public acctExt:boolean = true;
	public altExt:boolean = true;
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }, { Value: 'LaborCategory', IsLocalizeKey: true }];
	public laborCategory: laborCategoryValues[]=[];
	public primaryVal: DropdownOptionList | DropdownOptionList[];
	public alternateVal: DropdownOptionList | DropdownOptionList[];
	public primaryContactList: DropdownOptionList[] = [];
	public alternateContactList: DropdownOptionList[] = [];
	public accContactList: DropdownOptionList[] = [];
	private statusType: string = 'StaffingAgencyStatus';
	private localizeParamZip: DynamicParam[] = [];
	private contactUserList: DropdownOptionList[] = [];
	private localizeParamState: DynamicParam[] = [];
	private localizeParamZipEdit: DynamicParam[] = [];
	private localizeParamStateEdit: DynamicParam[] = [];
	private statustypeList: DropdownOptionList[] = [];
	private allSowDataFetched: boolean = false;
	private reasonForChange: string;
	private pcFName: string;
	private pcLName: string;
	private pcMName: string;
	private altcFName: string;
	private altcLName: string;
	private acctcFName: string;
	private acctcLName: string;
	private acctcMName: string;
	private labCategoryVals:number[];
	private allSowDataLaborCategory:SectorDetails[];
	private laborCategoryValues: laborCategoryValues[] | number[];
	private staffingAgencyStatusText: string;
	private zipLabelTextParams: DynamicParam[] = [];
	private stateLabelTextParams: DynamicParam[] = [];
	private conflictData: boolean = false;
	private ngUnsubscribe$ = new Subject<void>();
	private isDuplicateUserID:boolean = false;
	private altDuplicateUserId:boolean = false;
	private accDuplicateUserId:boolean = false;
	private primaryFList: DropdownOptionList[] = [];
	private altFilterList: DropdownOptionList[] = [];
	private accFilterList: DropdownOptionList[] = [];
	private isUserData:boolean = false;
	private editSowData: SectorDetails[];
	private minLength: DynamicParam[] = [{ Value: magicNumber.six.toString(), IsLocalizeKey: false }];

	// eslint-disable-next-line max-params, max-lines-per-function
	constructor(
		public udfCommonMethods: UdfCommonMethods,
		public offcanvasServc: OffCanvasService,
		private formBuilder: FormBuilder,
		private route: Router,
		private loaderService: LoaderService,
		private customValidators: CustomValidators,
		private translate: TranslateService,
		private configureClientService: ConfigureClientService,
		private activatedRoute: ActivatedRoute,
		private eventLog: EventLogService,
		private cd: ChangeDetectorRef,
		private formBuilderStatus: FormBuilder,
		private toasterServc: ToasterService,
		private localizationService: LocalizationService,
		private staffingGatewayServc: StaffingAgencyGatewayService
	) {
		this.AddstaffingagencyForm = this.formBuilder.group({
			staffingAgencyName: [null],
			staffingAgencyStatusId: [null, this.customValidators.RequiredValidator('PleaseSelectStatus')],
			countryId: [null],
			staffingAgencyEin: [null],
			addressLine1: [null],
			addressLine2: [null],
			city: [null],
			stateId: [null],
			zipCode: [null],
			timeZoneId: [null],
			cultureId: [null],
			staffingAgencyTypeId: [null],
			homePageUrl: [null],
			securityClearanceId: [null],
			businessClassificationId: [null],
			comments: [null],
			paymentType: [null],
			contactPrimaryUserList: [null],
			contactAlternateUserList: [null],
			contactAcountingUserList: [null],
			preferenceNteRateMultiplier: [
				magicNumber.one, this.customValidators.
					RangeValidator(
						magicNumber.minusNinetyNineDotTripleNine,
						magicNumber.NinetyNineDotTripleNine, 'PrefrenceNteRateMultiplierRange'
					)
			],
			primaryContactLastName: [null, [this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			primaryContactFirstName: [null, [this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			primaryContactMiddleName: [null, [this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			primaryContactEmail: [null, [this.customValidators.EmailValidator('PleaseEnterValidPrimaryEmail')]],
			primaryRoleNo: [null],
			accountingRoleNo: [null],
			alternateRoleNo: [null],
			primaryContactPhoneNumber: [
				null,
				[this.customValidators.FormatValidator('PleaseEnterValidPrimaryPhNo')]
			],
			primaryPhoneExtension: [null],
			isPrimaryUserCreated: [true],
			isAlternateUserCreated: [false],
			isAccountingUserCreated: [false],
			primaryUserId: [null],
			alternateUserId: [null],
			accountingUserId: [null, this.customValidators.MaxLengthValidator(magicNumber.fifty)],
			alternateContactEmail: [null, [this.customValidators.EmailValidator('PleaseEnterValidAlternateEmail')]],
			alternateContactPhoneNumber: [
				null,
				[this.customValidators.FormatValidator('PleaseEnterValidAlternatePhNo')]
			],
			alternatePhoneExtension: [null],
			accountingContactEmail: [null, [this.customValidators.EmailValidator('PleaseEnterValidAccountingEmail')]],
			accountingContactPhoneNumber: [
				null,
				[this.customValidators.FormatValidator('PleaseEnterValidAccountingPhNo')]
			],
			accountingPhoneExtension: [null],
			isAllowedForPayroll: [false],
			isAllowedForIc: [false],
			icMarkup: [null],
			isAllowedForLi: [false],
			isMspAfiiliated: [false],
			isAllowedForRfxSow: [false],
			sowIcMspFee: [null, [this.customValidators.RangeValidator(magicNumber.zero, magicNumber.ninetyNineDotDoubleNine, 'SowIcMspFeeRangeValidation')]],
			canReceiveCandidateFromAts: [false],
			accountingContactFirstName: [null, [this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			accountingContactLastName: [null, [this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			accountingContactMiddleName: [null, [this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			alternateContactFirstName: [null, [this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			alternateContactLastName: [null, [this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			alternateContactMiddleName: [null, [this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			ChangePrimaryUser: [null],
			ChangeAlternateUser: [null],
			ChangeAccountingUser: [null],
			primaryUserNumber: [null],
			alternateUserNumber: [null],
			accountingUserNumber: [null],
			sowLaborCategories: [],
			cageCode: [null]
		});

		this.statusForm = this.formBuilderStatus.group({
			status: [null]
		});
		this.staffingGatewayServc.openRightPanel.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((dt: boolean) => {
			this.openRightPanel = dt;
		});
	}

	public openRightSidePanel(existingUkey: string) {
		this.existingUkey = existingUkey;
		this.staffingGatewayServc.openRightPanel.next(true);
	}

	public closeOpenPanel(){
	   		this.openRightPanel = false;
	  }

	public getUdfData(data: IUdfData) {
		this.udfData = data.data;
		this.AddstaffingagencyForm.addControl('udf', data.formGroup);
	}

	ngOnInit(): void {
		this.getCountryData();
		this.getIdFromRoute();
		this.getDataForUserId();
		forkJoin({
			'RoleDropdown': this.staffingGatewayServc.getRoleDropdown(),
			'AllDropdownData1': this.staffingGatewayServc.getAllDropdownData(),
			'AllDropdownData2': this.staffingGatewayServc.getAllDropdownData1(),
			'ConfigureClientDetails': this.staffingGatewayServc.getBasicDetails()
		}).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((Result) => {
			this.getRoleDropdownRecords(Result.RoleDropdown);
			this.allDropdownData1(Result.AllDropdownData1);
			this.allDropdownData2(Result.AllDropdownData2);
			this.getConfigureClientDeatils(Result.ConfigureClientDetails);
		});


	}

	getCountryData(){
		this.configureClientService.getCountry().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
			if(res.Data){
				this.countrylist = res.Data;
			}
		});
	}

	public getDataForUserId(){

		this.AddstaffingagencyForm.get('primaryContactEmail')?.valueChanges.pipe(debounceTime(magicNumber.oneThousandTwentyFour)).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data:string) => {
			if(data && this.AddstaffingagencyForm.controls['primaryContactEmail'].valid){
				this.onChangeEmail(data, 'isPrimaryUserCreated', 'primaryUserId');
			}
			else{
				this.AddstaffingagencyForm.get('primaryUserId')?.setValue(null);
				this.cd.markForCheck();
			}
		});

		this.AddstaffingagencyForm.get('alternateContactEmail')?.valueChanges.pipe(debounceTime(magicNumber.oneThousandTwentyFour)).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data:string) => {
			if(data && this.AddstaffingagencyForm.controls['alternateContactEmail'].valid){
				this.onChangeEmail(data, 'isAlternateUserCreated', 'alternateUserId');
			}
			else{
				this.AddstaffingagencyForm.get('alternateUserId')?.setValue(null);
				this.cd.markForCheck();
			}
		});

		this.AddstaffingagencyForm.get('accountingContactEmail')?.valueChanges.pipe(debounceTime(magicNumber.oneThousandTwentyFour)).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data:string) => {
			if(data && this.AddstaffingagencyForm.controls['accountingContactEmail'].valid){
				this.onChangeEmail(data, 'isAccountingUserCreated', 'accountingUserId');
			}
			else{
				this.AddstaffingagencyForm.get('accountingUserId')?.setValue(null);
				this.cd.markForCheck();
			}
		});

	}

	private setnCheckDublicateUserId(userData: string, userId:string) {
		this.AddstaffingagencyForm.controls[userId].setValue(userData);
		this.validateuserID();
	}

	private onChangeLoginMethod(userId:string, emailControl:string, createUserAccout:string) {
		if (!this.isEditMode) {
			this.AddstaffingagencyForm.controls[userId].setValue(null);
			let email = this.AddstaffingagencyForm.controls[emailControl].value;
			if (this.AddstaffingagencyForm.controls[emailControl].valid) {
				email = email.substring(magicNumber.zero, email.search('@'));
				this.setnCheckDublicateUserId(email, createUserAccout);
			}
		}
	}

	private onChangeEmail(data: string, createUserAccout:string, userId:string) {
		if (data && !this.isEditMode) {
			const login = this.AddstaffingagencyForm.controls[createUserAccout].value;
			if (login) {
				data = data.substring(magicNumber.zero, data.search('@'));
				data = this.padString(data);
			}
			if (login && data) {
				this.setnCheckDublicateUserId(data, userId);
			}
		}
	}

	public padString(input: string): string {
		const targetLength = 6,
		 padValue = '123456';

		if (input.length < targetLength) {
		  const remainingLength = targetLength - input.length;
		  return input + padValue.slice(Number(magicNumber.zero), remainingLength);
		}

		return input;
	  }

	private allDropdownData1(data:DrpResponse) {
		if (data) {
			this.timezonelist = data.ddlTimezone?.Data.sort((a: IDropdownItem, b: IDropdownItem) => {
				const textA = a.Text.toLowerCase(),
					textB = b.Text.toLowerCase();
				return textA.localeCompare(textB);
			}) ?? [];
			this.staffingAgencyTierList = data.ddlStaffingType?.Data ?? [];
			this.securityClearanceList = data.ddlSecClrnc?.Data ?? [];
		}
	}

	private allDropdownData2(data:DrpResponse) {
		if (data) {
			this.businessClassificationList = data.ddlBsnsClsfn?.Data ?? [];
			const paymentList = data.ddlPaymentType?.Data ?? [];
			if(!this.isEditMode){
				const allSectorsHaveBlankCategories = data.icsowlcat?.Data.every((sector) =>
					sector.LaborCategories?.length === Number(magicNumber.zero));
				if (allSectorsHaveBlankCategories) {
					this.disableSwitch = false;
					this.AddstaffingagencyForm.controls['isAllowedForRfxSow'].setValue(false);
				}
			}
			paymentList.map((dt: DropdownModel) => {
				let dataptype = null;
				this.translate.stream(dt.Text).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: string) => {
					dataptype = res;
					this.paymentTypeList.push({ Text: dataptype, Value: dt.Value });
				});
			});
		}
	}

	hideLeftPannel() {
		this.offcanvasServc.offcanvasElement = false;
	}

	public switchforEnabledRFx(value: boolean) {
		if (value && !this.isEditMode) {
			this.getSowLaborCategories();
		}
		if (value && this.isEditMode) {
			this.getNewSowLaborCategories();
			this.labourKey = [];
			this.laborCategoryValues = [];
			this.allSowDataFetched = true;
		}else{
			this.labCategoryVals = [];
			this.laborCategoryValues = [];
		}
		this.cd.markForCheck();
	}

	private getSowLaborCategories() {
		if (this.isEditMode) {
			this.getEditSowLaborCategories();
		} else {
			this.getNewSowLaborCategories();
		}
	}

	private getEditSowLaborCategories() {
		this.editSowData = this.sortSowLaborCategories(this.staffingAgencyDetails.sowLaborCategories);
		const selectedIndices: string[] = [],
			selectedSectorIndices: string[] = [],
			sectors = this.editSowData.map((sector: SectorDetails, sectorIndex: number) => {
				const sectorId = sector.SectorId,
					laborCategories = sector.NewLaborCategories.map((category: IDropdownItem, categoryIndex: number) => {
						const categoryId = category.Value,
							isSelected = this.isCategorySelected(sectorId, categoryId, this.editSowData),
							index = `${sectorIndex}_${categoryIndex}`;
						if (isSelected) {
							selectedIndices.push(index);
						}
						return {
							Text: category.Text,
							Value: categoryId,
							Index: index,
							selected: isSelected
						};
					});

				if (laborCategories.length > Number(magicNumber.zero)) {
					const allLaborCategoriesSelected = laborCategories.every((category) =>
						category.selected);
					if (allLaborCategoriesSelected) {
						selectedSectorIndices.push(sectorIndex.toString());
					}
				}
				if (laborCategories.length === Number(magicNumber.zero)) {
					this.disabledLabourKey.push(sectorIndex.toString());
				}
				return {
					Text: sector.Text,
					Value: sectorId,
					Index: sectorIndex.toString(),
					items: laborCategories,
					selected: false
				};
			});

		this.laborCategory = sectors;
		this.laborCategoryValues = this.laborCategory;
		this.labCategoryVals = this.getLaborCategoryValues(selectedIndices.concat(selectedSectorIndices), sectors);
		this.labourKey = selectedIndices.concat(selectedSectorIndices);

	}

	public getLaborCategoryValues(selectedIndices: string[], sectors: SecValue): number[] {
		return selectedIndices
			.map((index: string) => {
				const [sectorIndex, categoryIndex] = index.split('_'),
				 sector: laborCategoryValues = sectors[Number(sectorIndex)];
				if (sector.items) {
					const category = sector.items[Number(categoryIndex)];
					if (category) {
						return Number(category.Value);
					}
				}
				return null;
			})
			.filter((value): value is number =>
				value !== null);
	}


	private getNewSowLaborCategories() {
		const sectorsWithItems:laborCategoryValues[] = [],
			sectorsWithoutItems:laborCategoryValues[] = [];
		this.staffingGatewayServc.getIcSowSectorWiseLaborCategories().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: ApiResponse) => {
			if (res.Succeeded) {
				this.allSowDataLaborCategory = this.sortSowLaborCategories(res.Data);
				this.allSowDataLaborCategory.forEach((sector: SectorDetails, sectorIndex: number) => {
					const laborCategories = sector.LaborCategories?.map((category: IDropdownItem, categoryIndex: number) => {
							return {
								Text: category.Text,
								Value: category.Value,
								Index: `${sectorIndex}_${categoryIndex}`,
								selected: false
							};
						}),
						sectorItem:laborCategoryValues = {
							Text: sector.Text,
							Value: sector.SectorId,
							Index: sectorIndex.toString(),
							items: laborCategories,
							selected: false
						};
					if (laborCategories && laborCategories.length > Number(magicNumber.zero)) {
						sectorsWithItems.push(sectorItem);
					} else {
						sectorsWithoutItems.push(sectorItem);
						this.disabledLabourKey.push(sectorIndex.toString());
					}
				});
				this.laborCategory = [...sectorsWithItems, ...sectorsWithoutItems];
				this.cd.markForCheck();
			}
		});
	}

	public isCategorySelected(sectorId: number, categoryId: string, editData: SectorDetails[]): boolean {
		const sector = editData.find((secId: SectorDetails) =>
			secId.SectorId === sectorId);
		if (sector) {
			const category = sector.NewLaborCategories.find((catId: IDropdown) =>
				catId.Value === categoryId);
			if(category){
				return category.IsSelected;
			}
			else{
				return false;
			}
		}
		return false;
	}

	public isSectorSelected(sectorId: number, editData: SectorDetails[]): boolean {
		return editData.some((sector: SectorDetails) =>
			sector.SectorId === sectorId);
	}

	private sortSowLaborCategories(data: SectorDetails[]) {
		return data.sort((a: SectorDetails, b: SectorDetails) => {
			const aHasItems = (a.LaborCategories && a.LaborCategories.length > Number(magicNumber.zero)) ||
			(a.NewLaborCategories && a.NewLaborCategories.length > Number(magicNumber.zero)),

			 bHasItems = (b.LaborCategories && b.LaborCategories.length > Number(magicNumber.zero)) ||
			(b.NewLaborCategories && b.NewLaborCategories.length > Number(magicNumber.zero));

			if (aHasItems && !bHasItems) {
				return magicNumber.minusOne;
			} else if (!aHasItems && bHasItems) {
				return magicNumber.one;
			} else {
				return magicNumber.zero;
			}
		});
	}

	public onLaborCategoryChecked(e: LabCheck) {
		if(this.AddstaffingagencyForm.controls['isAllowedForRfxSow'].value){

			this.sowKeyClicked = true;
			if (this.isEditMode) {
				if (this.allSowDataFetched) {
					this.labCategoryVals = this.getMatchedLaborCategoryIds(e.checkedKey, this.allSowDataLaborCategory);
				} else {
					this.labCategoryVals = this.getMatchedLaborCategoryIdsForSowData(this.staffingAgencyDetails.sowLaborCategories, e.checkedKey);
				}
			} else {
				this.labCategoryVals = this.getMatchedLaborCategoryIds(e.checkedKey, this.allSowDataLaborCategory);
			}
			this.laborCategoryValues = this.labCategoryVals;
		}else{
			this.labCategoryVals = [];
			this.laborCategoryValues = [];
		}
	}

	public getMatchedLaborCategoryIds(checkedKeys: string[], sowData:SectorDetails[]){
		const matchedLaborCategoryIds: number[] = [];
		checkedKeys.forEach((checkedKey: string) => {
			if (!checkedKey.includes("_")) {
				const sector = sowData[Number(checkedKey)];
				sector.LaborCategories?.forEach((labs: IDropdownItem) => {
					matchedLaborCategoryIds.push(Number(labs.Value));
				});

			}
			const [sectorIndex, laborIndex] = checkedKey.split('_'),
				sector = sowData[Number(sectorIndex)];
			if (sector.LaborCategories && sector.LaborCategories[Number(laborIndex)]) {
				const laborCategory = sector.LaborCategories[Number(laborIndex)];
				matchedLaborCategoryIds.push(Number(laborCategory.Value));
			}
		});
		return Array.from(new Set(matchedLaborCategoryIds));
	}

	public getMatchedLaborCategoryIdsForSowData(sowLaborCategories: SectorDetails[], checkedKeys: string[]) {
		const matchedLaborCategoryIds: number[] = [];
		checkedKeys.forEach((checkedKey: string) => {
			if (!checkedKey.includes("_")) {
				const sectorIndex = Number(checkedKey),
					sector = sowLaborCategories[sectorIndex];
				if (sector.NewLaborCategories) {
					sector.NewLaborCategories.forEach((category: IDropdownItem) => {
						if (category.IsSelected) {
							matchedLaborCategoryIds.push(Number(category.Value));
						}
					});
				}
			} else {
				const [sectorIndex, laborIndex] = checkedKey.split('_'),
					sector = sowLaborCategories[Number(sectorIndex)];

				if (sector.NewLaborCategories && sector.NewLaborCategories[Number(laborIndex)]) {
					const laborCategory = sector.NewLaborCategories[Number(laborIndex)];
					matchedLaborCategoryIds.push(Number(laborCategory.Value));
				}
			}
		});
		return Array.from(new Set(matchedLaborCategoryIds));
	}

	public getConfigureClientDeatils(data:ApiResponse) {
		if (!this.isEditMode) {
			const storedDetails = sessionStorage.getItem('configureClientDetails');
			if (storedDetails) {
				const response = JSON.parse(storedDetails);
				this.patchCofigClientValues(response);
			} else {
				const response = data.Data;
				sessionStorage.setItem('configureClientDetails', JSON.stringify(response));
				this.patchCofigClientValues(response);
			}
		}
	}

	private patchCofigClientValues(response: ClientConfiguration) {
		this.AddstaffingagencyForm.patchValue({
			countryId: { Text: response.HomeCountry, Value: String(response.CountryId) },
			timeZoneId: { Text: response.TimeZone, Value: String(response.TimezoneId) },
			cultureId: {
				Text: response.DefaultCultureName,
				Value: String(response.DefaultCultureId)
			}
		});
		this.onCountryChange({Text: response.HomeCountry, Value: response.CountryId.toString()});
		this.getStateDropdown(response.CountryId.toString());
		this.countryVal = response.CountryId;
		this.countryIdVal = response.CountryId;
		this.handleLocalizationAdd(this.countryVal);
		this.handleStatusBasedFormControls(this.staffingAgencyStatusIdData);
	}

	private getRoleDropdownRecords(data: ApiResponse) {
		this.loaderService.setState(true);
		if (data.Succeeded) {
			this.roleList = data.Data;
		}
		this.loaderService.setState(false);
	}

	private getUserDropdown(staffingId: number) {
		this.staffingGatewayServc.getUserDropdownRecords(staffingId).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: ApiResponse) => {
			if (data.Succeeded) {
				this.contactUserList = data.Data;
				const plist = this.staffingAgencyDetails.PrimaryUserNumber,
					alist = this.staffingAgencyDetails.AlternateUserNumber,
					accList = this.staffingAgencyDetails.AccountingUserNumber;
				if (typeof plist === 'number') {
					this.primaryFList = this.contactUserList.filter((contact: IDropdownItem) =>
						parseFloat(contact.Value) !== plist);
					this.primaryContactList = this.primaryFList;
				}else{
					this.primaryFList = this.contactUserList;
					this.primaryContactList =this.contactUserList;
				}
				if (typeof alist === 'number') {
					this.altFilterList = this.contactUserList.filter((contact: IDropdownItem) =>
						parseFloat(contact.Value)!== alist);
					this.alternateContactList = this.altFilterList;
				}else{
					this.altFilterList= this.contactUserList;
					this.alternateContactList =this.contactUserList;
				}
				if (typeof accList === 'number') {
					this.accFilterList = this.contactUserList.filter((contact: IDropdownItem) =>
						parseFloat(contact.Value) !== accList);
					this.accContactList = this.accFilterList;
				}else{
					this.accContactList =this.contactUserList;
				}
			}else{
				this.isUserData = true;
			}
		});
	}

	private getStatusListDropDown() {
		this.staffingGatewayServc.GetStaticDataTypeListforDropdownAsync(this.statusType).pipe(takeUntil(this.ngUnsubscribe$)).
			subscribe((data: ApiResponse) => {
				if (data.Succeeded) {
					this.statustypeList = data.Data;
					this.statustypeList.forEach((dt: IDropdownItem) => {
						this.translate.stream(dt.Text).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: string) => {
							this.processStatusListItem(res, dt);
						});
					});
					if (this.isEditMode) {
						this.getStaffingAgencyById();
					}
				}
			});
	}

	private processStatusListItem(res: string, dt: IDropdownItem){
		const datastatustype = res;
		if (this.isEditMode) {
			if (this.staffingAgencyDetails.StaffingAgencyStatusId != Number(Status.Potential)) {
				if (dt.Value != Status.Potential.toString()) {
					this.statusList.push({ Text: datastatustype, Value: dt.Value });
				}
			}
			else {
				this.statusList.push({ Text: datastatustype, Value: dt.Value });
			}
		} else if (dt.Value == Status.Active.toString() || dt.Value == Status.Potential.toString()) {
			this.statusList.push({ Text: datastatustype, Value: dt.Value });
			this.byDefaultStatus(this.statusList);
		}
	}

	private byDefaultStatus(data: IDropdown[]) {
		this.AddstaffingagencyForm.get('staffingAgencyStatusId')?.
			setValue({
				"Text": data[magicNumber.zero].Text,
				"Value": String(data[magicNumber.zero].Value)
			});
		this.staffingAgencyStatus = true;
		this.validationsOnActiveStatus();
		this.updateFormControlValidity();
	}

	public onCountryChange(val:DropdownModel) {
		if (val.Value != '' && val.Value != undefined) {
			this.countryVal = Number(val.Value);
			this.countryIdVal = Number(val.Value);
			this.getStateDropdown(String(val.Value));
			this.handleLocalizationAdd(this.countryVal);
			this.configureClientService.getLanguageByCountry(val.Value).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
				if(res.Data){
					this.languageList = res.Data;
				}
			});
			if (this.isEditMode) {
				this.handleEditMode();
				this.handleLocalizationEdit(this.countryVal);
				this.AddstaffingagencyForm.controls['stateId'].setValue(null);
				this.getStateDropdown(String(val.Value));
			}
			else {
				this.handleStatusBasedFormControls(this.staffingAgencyStatusIdData);
			}
		}
		else {
			this.stateRulesList = [];
			this.AddstaffingagencyForm.controls['stateId'].setValue(null);
		}
	}

	public handleStatusBasedFormControls(statusId: number) {
		if (statusId == Number(Status.Active) || statusId == Number(Status.InActive) || statusId == Number(Status.Probation)) {
			this.AddstaffingagencyForm.controls['zipCode'].setValidators([this.customValidators.RequiredValidator('PleaseEnterData', this.zipLabelTextParams), this.customValidators.PostCodeValidator(this.countryVal)]);
			this.AddstaffingagencyForm.controls['zipCode'].updateValueAndValidity();
			this.AddstaffingagencyForm.controls['stateId'].setValidators(this.customValidators.RequiredValidator('PleaseSelectData', this.stateLabelTextParams));
			this.AddstaffingagencyForm.controls['stateId'].updateValueAndValidity();
			this.AddstaffingagencyForm.controls['stateId'].setValue(null);
		} else {
			this.AddstaffingagencyForm.controls['zipCode'].clearValidators();
			this.AddstaffingagencyForm.controls['zipCode'].updateValueAndValidity();
			this.AddstaffingagencyForm.controls['stateId'].clearValidators();
			this.AddstaffingagencyForm.controls['stateId'].updateValueAndValidity();
			this.AddstaffingagencyForm.controls['stateId'].setValue(null);
		}
	}

	public createZipLabelTextParams(zipLabel: string): DynamicParam[] {
		return [{ Value: zipLabel, IsLocalizeKey: true }];
	}

	public createStateLabelTextParams(stateLabel: string): DynamicParam[] {
		return [{ Value: stateLabel, IsLocalizeKey: true }];
	}

	public handleLocalizationAdd(countryId: number | null) {
		if(countryId == null){
			this.zipLabel ='ZipLabel';
			this.stateLabel ='State';
			this.zipLabelTextParams = this.createZipLabelTextParams(this.zipLabel);
			this.stateLabelTextParams = this.createStateLabelTextParams(this.stateLabel);
		}else{
			this.stateLabel = this.localizationService.GetCulture(CultureFormat.StateLabel, countryId);
			this.zipLabel = this.localizationService.GetCulture(CultureFormat.ZipLabel, countryId);
			this.localizeParamZip.splice(magicNumber.zero);
			this.localizeParamState.splice(magicNumber.zero);
			this.localizeParamZip.push({ Value: this.zipLabel, IsLocalizeKey: false });
			this.localizeParamState.push({ Value: this.stateLabel, IsLocalizeKey: false });
			this.zipLabelTextParams = this.createZipLabelTextParams(this.zipLabel);
			this.stateLabelTextParams = this.createStateLabelTextParams(this.stateLabel);
		}
	}

	public handleLocalizationEdit(countryId: number | null) {
		if(countryId == null){
			this.zipLabelEdit ='ZipLabel';
			this.stateLabelEdit ='State';
			this.zipLabelTextParams = this.createZipLabelTextParams(this.zipLabelEdit);
			this.stateLabelTextParams = this.createStateLabelTextParams(this.stateLabelEdit);
		}else{
			this.stateLabelEdit = this.localizationService.GetCulture(CultureFormat.StateLabel, countryId);
			this.zipLabelEdit = this.localizationService.GetCulture(CultureFormat.ZipLabel, countryId);
			this.localizeParamZipEdit.push({ Value: this.zipLabelEdit, IsLocalizeKey: false });
			this.localizeParamStateEdit.push({ Value: this.stateLabelEdit, IsLocalizeKey: false });
			this.zipLabelTextParams = this.createZipLabelTextParams(this.zipLabelEdit);
			this.stateLabelTextParams = this.createStateLabelTextParams(this.stateLabelEdit);
		}
	}

	public onChnageSecurityClearenceId(event: IDropdownItem) {
		const securityClearanceId = event.Text,
			cageCodeControl = this.AddstaffingagencyForm.controls['cageCode'];
		if (securityClearanceId == 'None') {
			cageCodeControl.disable();
		} else {
			cageCodeControl.enable();
		}
		cageCodeControl.setValue(null);
	}

	public onChangePrimaryUserSwitchChange(value: boolean): void {
	
		if (value) {
			const trimmedPrimaryUserName = this.primaryUserNumber,
		  alternate = this.AddstaffingagencyForm.get('contactAlternateUserList')?.value;
			 if(alternate != null){
				this.primaryContactList = this.contactUserList.filter((item: DropdownOptionList) =>
			 item !== this.alternateVal && parseFloat(item.Value )!== trimmedPrimaryUserName); }
			this.AddstaffingagencyForm.controls['contactPrimaryUserList'].setValidators(this.customValidators.RequiredValidator('PleaseSelectPrimaryUser'));
		} 
		else{
			const alternate = this.AddstaffingagencyForm.get('contactAlternateUserList')?.value;
			if(alternate != null){
				this.primaryContactList= [];
				this.alternateContactList =[...this.altFilterList];
				this.primaryVal = [];
			}
			else if(alternate == null && this.isUserData){
				this.alternateContactList= [];
			}
			else{
				this.alternateContactList = [...this.altFilterList];
			}
			this.defaultPrimaryUser();
		}
		this.AddstaffingagencyForm.controls['contactPrimaryUserList'].updateValueAndValidity();
	}

	private defaultPrimaryUser(){
		this.AddstaffingagencyForm.controls['contactPrimaryUserList'].setValue(null);
		this.AddstaffingagencyForm.controls['contactPrimaryUserList'].clearValidators();
		this.primaryUserContactName = this.staffingAgencyDetails.PrimaryContactName;
		this.pcEmail = this.staffingAgencyDetails.PrimaryContactEmail;
		this.primaryPhone = this.staffingAgencyDetails.PrimaryContactPhoneNumber?.trim();
	  this.primaryPhoneExt = this.staffingAgencyDetails.PrimaryPhoneExtension?.trim();
		if(this.primaryPhone && this.primaryPhone !== 'null'){
			this.AddstaffingagencyForm.controls['primaryContactPhoneNumber'].setValue(this.primaryPhone);
			if(this.primaryPhoneExt && this.primaryPhoneExt !== 'null'){
				this.primaryExt = true;
				this.AddstaffingagencyForm.controls['primaryPhoneExtension'].setValue(this.primaryPhoneExt);
			}else {
				this.primaryExt = false;
				this.AddstaffingagencyForm.controls['primaryPhoneExtension'].setValue('');
			}
		}
		else{
			this.AddstaffingagencyForm.controls['primaryContactPhoneNumber'].setValue('');
			this.primaryExt = false;
			this.AddstaffingagencyForm.controls['primaryPhoneExtension'].setValue('');
		}
		this.AddstaffingagencyForm.controls['isPrimaryUserCreated'].setValue(this.staffingAgencyDetails.IsPrimaryUserCreated);
		this.primaryUserId = this.staffingAgencyDetails.PrimaryUserId;
		this.primaryContactRole = this.staffingAgencyDetails.PrimaryContactRole;
		this.primaryUserNumber = this.staffingAgencyDetails.PrimaryUserNumber;
		this.pcFName = this.staffingAgencyDetails.PrimaryContactFirstName;
		this.pcLName = this.staffingAgencyDetails.PrimaryContactLastName;
		this.pcMName = this.staffingAgencyDetails.PrimaryContactMiddleName;
		this.pcUkey = this.staffingAgencyDetails.PrimaryUkey;
		this.primaryValue = false;
	 }

	public onChangeAccountingUserSwitchChange(value: boolean): void {
		if (value) {
			this.AddstaffingagencyForm.controls['contactAcountingUserList'].setValidators(this.customValidators.RequiredValidator('PleaseSelectAccountingUser'));
		} else {
			this.defaultAccountingUser();
		}
		this.AddstaffingagencyForm.controls['contactAcountingUserList'].updateValueAndValidity();
	}

	private defaultAccountingUser(){
		this.AddstaffingagencyForm.controls['contactAcountingUserList'].setValue(null);
		this.AddstaffingagencyForm.controls['contactAcountingUserList'].clearValidators();
		this.accountingUserContactName = this.staffingAgencyDetails.AccountingContactName;
		this.acctcEmail = this.staffingAgencyDetails.AccountingContactEmail;
		this.accountingPhone = this.staffingAgencyDetails.AccountingContactPhoneNumber?.trim();
		this.accountingPhoneExt = this.staffingAgencyDetails.AccountingPhoneExtension?.trim();
		if(this.accountingPhone){
			this.AddstaffingagencyForm.controls['accountingContactPhoneNumber'].setValue(this.accountingPhone);
			if(this.accountingPhoneExt){
				this.acctExt = true;
				this.AddstaffingagencyForm.controls['accountingPhoneExtension'].setValue(this.accountingPhoneExt);
			}else {
				this.acctExt = false;
				this.AddstaffingagencyForm.controls['accountingPhoneExtension'].setValue('');
			}
		}else{
			this.AddstaffingagencyForm.controls['accountingContactPhoneNumber'].setValue('');
			this.acctExt = false;
			this.AddstaffingagencyForm.controls['accountingPhoneExtension'].setValue('');
		}
		this.AddstaffingagencyForm.controls['isAccountingUserCreated'].setValue(this.staffingAgencyDetails.IsAccountingUserCreated);
		this.accountingContactRole = this.staffingAgencyDetails.AccountingContactRole;
		this.AccountingUserId = this.staffingAgencyDetails.AccountingUserId;
		this.accountingUserNumber = this.staffingAgencyDetails.AccountingUserNumber;
		this.acctcFName = this.staffingAgencyDetails.AccountingContactFirstName;
		this.acctcLName = this.staffingAgencyDetails.AccountingContactLastName;
		this.acctcMName = this.staffingAgencyDetails.AccountingContactMiddleName;
		this.acctcUkey = this.staffingAgencyDetails.AccountingUkey;
		this.accountingValue = false;
	}

	public onChangeAlternateUserSwitchChange(value: boolean): void {
		console.log("alternatevalue",value)
		if (value) {
			const trimmedAlternateUserName = this.alternateUserNumber,
			 primary = this.AddstaffingagencyForm.get('contactPrimaryUserList')?.value;
			if(primary != null){
				this.alternateContactList = this.contactUserList.filter((item: DropdownOptionList) =>
									 item !== this.primaryVal && parseFloat(item.Value) !== trimmedAlternateUserName);
			}
			this.AddstaffingagencyForm.controls['contactAlternateUserList'].setValidators(this.customValidators.RequiredValidator('PleaseSelectAlternateUser'));
		}
		else{
			const primary = this.AddstaffingagencyForm.get('contactPrimaryUserList')?.value;
			if(primary != null){
				this.alternateContactList = [];
				this.primaryContactList = [...this.primaryFList];
				this.alternateVal = [];
			}
			else if(primary == null && this.isUserData){
				this.alternateContactList = [];
			}else{
				this.primaryContactList = [...this.primaryFList];
			}
			this.defaultAlternateUser();
		}
		this.AddstaffingagencyForm.controls['contactAlternateUserList'].updateValueAndValidity();
	}


	private defaultAlternateUser(){
		this.AddstaffingagencyForm.controls['contactAlternateUserList'].setValue(null);
		this.AddstaffingagencyForm.controls['contactAlternateUserList'].clearValidators();
		this.alternateUserContactName = this.staffingAgencyDetails.AlternateContactName;
		this.altcEmail = this.staffingAgencyDetails.AlternateContactEmail;
		this.alternatePhone = this.staffingAgencyDetails.AlternateContactPhoneNumber?.trim();
	         this.alternatePhoneExt = this.staffingAgencyDetails.AlternatePhoneExtension?.trim();
		if(this.alternatePhone != undefined){
			this.AddstaffingagencyForm.controls['alternateContactPhoneNumber'].setValue(this.alternatePhone);
			if(this.alternatePhoneExt){
				this.altExt = true;
				this.AddstaffingagencyForm.controls['alternatePhoneExtension'].setValue(this.alternatePhoneExt);
			}else {
				this.altExt = false;
				this.AddstaffingagencyForm.controls['alternatePhoneExtension'].setValue('');
			}
		}
		else{
			this.AddstaffingagencyForm.controls['alternateContactPhoneNumber'].setValue('');
			this.altExt = false;
			this.AddstaffingagencyForm.controls['alternatePhoneExtension'].setValue('');
		}
		this.AddstaffingagencyForm.controls['isAlternateUserCreated'].setValue(this.staffingAgencyDetails.IsAlternateUserCreated);
		this.alternateContactRole = this.staffingAgencyDetails.AlternateContactRole;
		this.alternateUserId = this.staffingAgencyDetails.AlternateUserId;
		this.alternateUserNumber = this.staffingAgencyDetails.AlternateUserNumber;
		this.altcFName = this.staffingAgencyDetails.AlternateContactFirstName;
		this.altcLName = this.staffingAgencyDetails.AlternateContactLastName;
		this.alternateContactMiddleName = this.staffingAgencyDetails.AlternateContactMiddleName;
		this.altcUkey = this.staffingAgencyDetails.AlternateUkey;
		this.alternateValue = false;
	}

	public onChangePrimaryUser(val: IDropdownItem) {
		const trimmedAlternateUserName = this.alternateUserNumber;
		this.primaryVal = val;
		if (val) {
			this.alternateContactList = this.contactUserList.filter((item:DropdownOptionList) =>
				item !== val && parseFloat(item.Value) !== trimmedAlternateUserName);
			this.staffingGatewayServc.getUserDetailsByUserID(val.Value).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
				next: (res: GenericResponseBase<UserDetail>) => {
					this.handlePrimaryUserDetails(res);
				}
			});
		}
		else{
			this.defaultPrimaryUser();
			const trimmedPrimaryUserName = this.primaryUserNumber;
			if (this.alternateVal && this.alternateVal != null && this.alternateVal != undefined ){
				this.primaryContactList = this.contactUserList.filter((item: DropdownOptionList) =>
					item !== this.alternateVal && parseFloat(item.Value) !== trimmedPrimaryUserName);
			} else {
				this.primaryContactList = [...this.primaryFList];
				this.alternateContactList = [...this.altFilterList];
			}
		}
		this.validateUsers();
	}

	private handlePrimaryUserDetails(res:ApiResponse){
		if (res.Succeeded && res.Data) {
			const userDetailsData = res.Data;
			this.primaryUserContactName = userDetailsData.UserFullName;
			if(this.primaryUserContactName){
				this.AddstaffingagencyForm.controls['isPrimaryUserCreated'].setValue(true);
			}
			this.primaryValue = Boolean(userDetailsData.UserFullName);
			this.pcEmail = userDetailsData.UserEmail;
			this.primaryPhone = userDetailsData.PhoneNumber?.trim();
			this.primaryPhoneExt = userDetailsData.PhoneNumberExt?.trim();

			if(this.primaryPhone && this.primaryPhone !== 'null'){
				this.AddstaffingagencyForm.controls['primaryContactPhoneNumber'].setValue(this.primaryPhone);
				if(this.primaryPhoneExt && this.primaryPhoneExt !== 'null' ){
					this.primaryExt = true;
					this.AddstaffingagencyForm.controls['primaryPhoneExtension'].setValue(this.primaryPhoneExt);
				}else {
					this.primaryExt = false;
					this.AddstaffingagencyForm.controls['primaryPhoneExtension'].setValue('');
				}
			}
			else{
				this.AddstaffingagencyForm.controls['primaryContactPhoneNumber'].setValue('');
				this.primaryExt = false;
				this.AddstaffingagencyForm.controls['primaryPhoneExtension'].setValue('');
			}
			this.primaryUserId = userDetailsData.UserName;
			this.primaryContactRole = userDetailsData.RoleName;
			this.primaryUserNumber = userDetailsData.UserNo;
			this.pcFName = userDetailsData.UserFirstName;
			this.pcLName = userDetailsData.UserLastName;
			this.pcMName = userDetailsData.UserMiddleName;
			this.pcUkey = userDetailsData.UKey;
			if(this.primaryUserContactName){
				this.AddstaffingagencyForm.controls['isPrimaryUserCreated'].setValue(true);
			}
			this.cd.detectChanges();
		}
	}

	public onChangeAlternateUser(val: IDropdownItem) {
		const trimmedPrimaryUserName = this.primaryUserNumber;
		this.alternateVal = val;
		if (val) {
			this.primaryContactList = this.contactUserList.filter((item:IDropdownItem) =>
				item !== val && parseFloat(item.Value) !== trimmedPrimaryUserName);
			this.staffingGatewayServc.getUserDetailsByUserID(val.Value).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
				next: (res: GenericResponseBase<UserDetail>) => {
					this.handleAlternateUserDetails(res);
				}
			});
		}
		else{
			this.defaultAlternateUser();
			const trimmedAlternateUserName = this.alternateUserNumber;
			if (this.primaryVal && this.primaryVal != null && this.primaryVal != undefined) {
				this.alternateContactList = this.contactUserList.filter((item: IDropdownItem) =>
					item !== this.primaryVal && parseFloat(item.Value) !== trimmedAlternateUserName);
			} else {
				this.alternateContactList = [...this.altFilterList];
				this.primaryContactList = [...this.primaryFList];
			}
		}
		this.validateUsers();
	}

	private handleAlternateUserDetails(res:ApiResponse){
		if (res.Succeeded && res.Data) {
			const userDetailsData = res.Data;
			this.alternateUserContactName = userDetailsData.UserFullName;
			this.alternateValue = Boolean(userDetailsData.UserFullName);
			this.altcEmail = userDetailsData.UserEmail;
			this.alternatePhone = userDetailsData.PhoneNumber?.trim();
			this.alternatePhoneExt = userDetailsData.PhoneNumberExt?.trim();
			if(this.alternateUserContactName){
				this.AddstaffingagencyForm.controls['isAlternateUserCreated'].setValue(true);
			}
			if(this.alternatePhone){
				this.AddstaffingagencyForm.controls['alternateContactPhoneNumber'].setValue(this.alternatePhone);
				if(this.alternatePhoneExt){
					this.altExt = true;
					this.AddstaffingagencyForm.controls['alternatePhoneExtension'].setValue(this.alternatePhoneExt);
				}else {
					this.altExt = false;
					this.AddstaffingagencyForm.controls['alternatePhoneExtension'].setValue('');
				}
			}
			else{
				this.AddstaffingagencyForm.controls['alternateContactPhoneNumber'].setValue('');
				this.altExt = false;
				this.AddstaffingagencyForm.controls['alternatePhoneExtension'].setValue('');
			}
			this.alternateUserId = userDetailsData.UserName;
			this.alternateContactRole = userDetailsData.RoleName;
			this.alternateUserNumber = userDetailsData.UserNo;
			this.altcFName = userDetailsData.UserFirstName;
			this.altcLName = userDetailsData.UserLastName;
			this.alternateContactMiddleName = userDetailsData.UserMiddleName;
			this.altcUkey = userDetailsData.UKey;
			this.cd.detectChanges();
		}
	}

	public onChangeAccountingUser(val: IDropdownItem) {
		if (val) {
			this.staffingGatewayServc.getUserDetailsByUserID(val.Value).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
				next: (res: GenericResponseBase<UserDetail>) => {
					if (res.Succeeded && res.Data) {
						const userDetailsData = res.Data;
						this.accountingUserContactName = userDetailsData.UserFullName;
						if(this.accountingUserContactName && this.accountingUserContactName != undefined){
							this.AddstaffingagencyForm.controls['isAccountingUserCreated'].setValue(true);
						}
						this.accountingValue = Boolean(userDetailsData.UserFullName);
						this.acctcEmail = userDetailsData.UserEmail;
						this.accountingPhone = userDetailsData.PhoneNumber?.trim();
						this.accountingPhoneExt = userDetailsData.PhoneNumberExt?.trim();
						this.updateAccountingContactDetails();
						this.AccountingUserId = userDetailsData.UserName;
						this.accountingContactRole = userDetailsData.RoleName;
						this.accountingUserNumber = userDetailsData.UserNo;
						this.acctcFName = userDetailsData.UserFirstName;
						this.acctcLName = userDetailsData.UserLastName;
						this.acctcMName = userDetailsData.UserMiddleName;
						this.acctcUkey = userDetailsData.UKey;
						this.cd.detectChanges();
					}
				}
			});
		}
		else{
			this.defaultAccountingUser();
		}
		this.validateUsers();
	}

	private updateAccountingContactDetails(){
		if(this.accountingPhone){
			this.AddstaffingagencyForm.controls['accountingContactPhoneNumber'].setValue(this.accountingPhone);
			if(this.accountingPhoneExt){
				this.acctExt = true;
				this.AddstaffingagencyForm.controls['accountingPhoneExtension'].setValue(this.accountingPhoneExt);
			}else {
				this.acctExt = false;
				this.AddstaffingagencyForm.controls['accountingPhoneExtension'].setValue('');
			}
		}else{
			this.AddstaffingagencyForm.controls['accountingContactPhoneNumber'].setValue('');
			this.acctExt = false;
			this.AddstaffingagencyForm.controls['accountingPhoneExtension'].setValue('');
		}
	}

	private setPrimaryCreateUserAccoutValidator() {
		this.AddstaffingagencyForm.controls['primaryContactPhoneNumber'].setValidators([this.customValidators.RequiredValidator('PleaseEnterPrimaryPhoneNumber'), this.customValidators.FormatValidator('PleaseEnterValidPrimaryPhNo')]);
		this.AddstaffingagencyForm.controls['primaryRoleNo'].setValidators(this.customValidators.RequiredValidator('PleaseSelectRole'));
		this.AddstaffingagencyForm.controls['primaryUserId'].setValidators([this.customValidators.RequiredValidator('PleaseEnterLoginID'), this.customValidators.MaxLengthValidator(magicNumber.fifty) as ValidatorFn]);
	}

	private setContactDetailsPrimaryContactValidators() {
		this.AddstaffingagencyForm.controls['primaryContactFirstName'].setValidators([this.customValidators.RequiredValidator('PleaseEnterFirstName'), this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]);
		this.AddstaffingagencyForm.controls['primaryContactLastName'].setValidators([this.customValidators.RequiredValidator('PleaseEnterLastName'), this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]);
		this.AddstaffingagencyForm.controls['primaryContactEmail'].setValidators([
			this.customValidators.RequiredValidator('PleaseEnterPrimaryContactEmailAddress'),
			this.customValidators.EmailValidator('PleaseEnterValidPrimaryEmail')
		]);
	}

	private setBasicDetailsValidators() {
		this.AddstaffingagencyForm.controls['staffingAgencyName'].setValidators([this.customValidators.RequiredValidator('PleaseEnterStaffingAgencyName')]);
		this.AddstaffingagencyForm.controls['countryId'].setValidators(this.customValidators.RequiredValidator('PleaseSelectHomeCountry'));
		this.AddstaffingagencyForm.controls['addressLine1'].setValidators([this.customValidators.RequiredValidator('PleaseEnterAddressLineOne')]);
		this.AddstaffingagencyForm.controls['city'].setValidators([this.customValidators.RequiredValidator('PleaseEnterCity')]);
		this.AddstaffingagencyForm.controls['stateId'].setValidators(this.customValidators.RequiredValidator('PleaseSelectData', this.stateLabelTextParams));
		this.AddstaffingagencyForm.controls['zipCode'].setValidators([this.customValidators.RequiredValidator('PleaseEnterData', this.zipLabelTextParams), this.customValidators.PostCodeValidator(this.countryVal)]);
		this.AddstaffingagencyForm.controls['timeZoneId'].setValidators(this.customValidators.RequiredValidator('PleaseSelectDdlTimeZone'));
		this.AddstaffingagencyForm.controls['cultureId'].setValidators(this.customValidators.RequiredValidator('PleaseSelectXrmPreferredLanguage'));
		this.AddstaffingagencyForm.controls['staffingAgencyTypeId'].setValidators(this.customValidators.RequiredValidator('PleaseSelectStaffingAgencyTierLevel'));
		this.AddstaffingagencyForm.controls['securityClearanceId'].setValidators(this.customValidators.RequiredValidator('PleaseSelectSecurityClearance'));
		this.AddstaffingagencyForm.controls['businessClassificationId'].setValidators(this.customValidators.RequiredValidator('PleaseSelectBusinessClassification'));
		this.AddstaffingagencyForm.controls['preferenceNteRateMultiplier'].setValidators([this.customValidators.RequiredValidator('PleaseEnterPreferenceNteRateMultiplier'), this.customValidators.RangeValidator(magicNumber.minusNinetyNineDotTripleNine, magicNumber.NinetyNineDotTripleNine, 'PrefrenceNteRateMultiplierRange')]);
	}

	private setAltContactValidatorsForPotential() {
		this.AddstaffingagencyForm.controls['alternateContactPhoneNumber'].setValidators(this.customValidators.FormatValidator('PleaseEnterValidAlternatePhNo'));
		this.AddstaffingagencyForm.controls['alternateContactEmail'].setValidators([this.customValidators.EmailValidator('PleaseEnterValidAlternateEmail')]);
	}

	private setAccContactValidatorForPotentail() {
		this.AddstaffingagencyForm.controls['accountingContactPhoneNumber'].setValidators(this.customValidators.FormatValidator('PleaseEnterValidAccountingPhNo'));
		this.AddstaffingagencyForm.controls['accountingContactEmail'].setValidators([this.customValidators.EmailValidator('PleaseEnterValidAccountingEmail')]);
	}

	public setIcMarkupValidationOnEdit() {
		if (this.staffingAgencyDetails.IsAllowedForIc) {
			if (this.AddstaffingagencyForm.controls['icMarkup'].value == null) {
				this.AddstaffingagencyForm.controls['icMarkup'].addValidators([
					this.customValidators.RequiredValidator('PleaseEnterIcMarkup'),
					this.customValidators.RangeValidator(magicNumber.zero, magicNumber.ninetyNineDotDoubleNine, 'IcMarkUpRangeValidation')
				]);
			} else {
				this.AddstaffingagencyForm.controls['icMarkup'].clearValidators();
			}
		}
	}

	public validationsOnActiveStatus() {
		this.setContactDetailsPrimaryContactValidators();
		this.setPrimaryCreateUserAccoutValidator();
		this.setBasicDetailsValidators();
		this.AddstaffingagencyForm.updateValueAndValidity();
	}

	public validationOnPotentialStatus() {
		this.staffingAgencyStatus = false;
		this.AddstaffingagencyForm.controls['staffingAgencyName'].setValidators([this.customValidators.RequiredValidator('PleaseEnterStaffingAgencyName')]);
		this.setContactDetailsPrimaryContactValidators();
		this.clearValidatorsExcept([
			'staffingAgencyStatusId', 'staffingAgencyName', 'primaryContactFirstName', 'primaryContactLastName', 'primaryContactEmail',
			'sowIcMspFee'
		]);
		this.clearErrorsForControls(['accountingRoleNo', 'accountingUserId', 'alternateRoleNo', 'alternateUserId', 'primaryRoleNo', 'primaryUserId']);
		this.AddstaffingagencyForm.controls['preferenceNteRateMultiplier'].setValidators(this.customValidators.RangeValidator(
			magicNumber.minusNinetyNineDotTripleNine, magicNumber.NinetyNineDotTripleNine,
			'PrefrenceNteRateMultiplierRange'
		));
		this.AddstaffingagencyForm.controls['primaryContactPhoneNumber'].setValidators(this.customValidators.FormatValidator('PleaseEnterValidPrimaryPhNo'));
		this.AddstaffingagencyForm.controls['zipCode'].setValidators(this.customValidators.PostCodeValidator(this.countryVal));
		this.setAltContactValidatorsForPotential();
		this.setAccContactValidatorForPotentail();
	}

	private clearValidatorsForControls(controlNames: string | string[]) {
		const controlNamesArray = Array.isArray(controlNames)
			? controlNames
			: [controlNames];
		Object.keys(this.AddstaffingagencyForm.controls).forEach((controlName) => {
			if (controlNamesArray.includes(controlName)) {
				const control = this.AddstaffingagencyForm.controls[controlName];
				control.clearValidators();
				control.updateValueAndValidity();
			}
		});
	}

	public validationOnEditBasedOnStatus() {
		if (this.staffingAgencyStatusIdData == Number(Status.InActive) || this.staffingAgencyStatusIdData == Number(Status.Active)
			|| this.staffingAgencyStatusIdData == Number(Status.Probation)) {
			this.staffingAgencyStatus = true;
			this.staffingReuired = true;
			this.validationsOnActiveStatus();
			this.setIcMarkupValidationOnEdit();
			this.clearValidatorsForControls([
				'primaryContactEmail', 'primaryRoleNo', 'staffingAgencyName', 'primaryUserId',
				'primaryContactFirstName', 'primaryContactLastName', 'primaryContactPhoneNumber'
			]);
			this.updateFormControlValidity();
		} else if (this.staffingAgencyStatusIdData == Number(Status.Potential)) {
			this.staffingAgencyStatus = false;
			this.staffingReuired = true;
			this.validationOnPotentialStatus();
			this.setIcMarkupValidationOnEdit();
			this.clearValidatorsForControls(['primaryContactEmail', 'staffingAgencyName', 'primaryContactFirstName', 'primaryContactLastName']);
			this.updateFormControlValidity();
		}
	}

	public onStatusChange(val: {Text: string, Value: string}) {
		this.staffingAgencyStatusIdData = Number(val.Value);
		this.staffingAgencyStatusText = val.Text;
		if (Number(val.Value) == Number(Status.InActive) || Number(val.Value) == Number(Status.Active)
			|| Number(val.Value) == Number(Status.Probation)) {
			this.handleActiveStatus();
		} else if (Number(val.Value) == Number(Status.Potential)) {
			this.handlePotentialStatus();
			this.resetCreateUserAccountSwitch();
		}
		if (this.isEditMode) {
			this.handleEditMode();
		}
		this.updateFormControlValidity();
	}

	private resetCreateUserAccountSwitch() {
		this.AddstaffingagencyForm.controls['isPrimaryUserCreated'].setValue(false);
		this.AddstaffingagencyForm.controls['isAlternateUserCreated'].setValue(false);
		this.AddstaffingagencyForm.controls['isAccountingUserCreated'].setValue(false);
	}

	private handleActiveStatus() {
		this.staffingAgencyStatus = true;
		this.validationsOnActiveStatus();
	}

	private handlePotentialStatus() {
		this.isRequiredAccounting = false;
		this.staffingAgencyStatus = false;
		this.isRequired = false;
		this.validationOnPotentialStatus();
	}

	private handleEditMode() {
		this.validationOnEditBasedOnStatus();
		this.getUserDropdown(this.staffingAgencyDetails.Id);
	}

	private clearValidatorsExcept(controlNames: string[]) {
		Object.keys(this.AddstaffingagencyForm.controls).forEach((controlName) => {
			if (!controlNames.includes(controlName)) {
				const control = this.AddstaffingagencyForm.controls[controlName];
				control.clearValidators();
				control.updateValueAndValidity();
			}
		});
	}

	private updateFormControlValidity(controlNames?: string[]) {
		if (controlNames && controlNames.length > (magicNumber.zero as number)) {
			controlNames.forEach((controlName) => {
				const control = this.AddstaffingagencyForm.get(controlName);
				if (control) {
					control.updateValueAndValidity();
				}
			});
		} else {
			Object.values(this.AddstaffingagencyForm.controls).forEach((control) => {
				control.updateValueAndValidity();
			});
		}
	}


	public submitForm() {
		this.AddstaffingagencyForm.markAllAsTouched();
		if (this.AddstaffingagencyForm.valid) {
			this.save();}
	}

	private getIdFromRoute() {
		this.activatedRoute.params.pipe(
			takeUntil(this.ngUnsubscribe$),
		  switchMap((param) => {
				if (param['id']) {
					this.isEditMode = true;
					this.isEdit = false;
			  this.ukey = param['id'];
			  return 	this.staffingGatewayServc.getStaffingAgencyByUkey(this.ukey).pipe(takeUntil(this.ngUnsubscribe$));
				} else {
					this.getStatusListDropDown();
					return EMPTY;
				}
		  })
		).subscribe((dt: GenericResponseBase<StaffingAgencyData>) => {
		  if (dt.Succeeded) {
				this.loaderService.setState(false);
				if(dt.Data){
					this.staffingAgencyDetails = dt.Data;
					this.pcUkey = this.staffingAgencyDetails.PrimaryUkey;
					this.getStatusListDropDown();
					this.getUserDropdown(this.staffingAgencyDetails.Id);
					this.getStateDropdown(this.staffingAgencyDetails.CountryId.toString());
					this.getSowLaborCategories();
					this.handleLocalizationEdit(this.staffingAgencyDetails.CountryId);
					this.countryVal = this.staffingAgencyDetails.CountryId;
					this.onCountryChange({Text: this.staffingAgencyDetails.CountryId.toString(),
						Value: this.staffingAgencyDetails.CountryId.toString()});
				}
				this.loaderService.setState(false);
			}
		  });

	}


	private disableRfxSow(){
		const allSectorsHaveBlankCategories = this.staffingAgencyDetails.sowLaborCategories.every((len: SectorDetails) =>
			len.NewLaborCategories.length == Number(magicNumber.zero));
		if (allSectorsHaveBlankCategories) {
			this.AddstaffingagencyForm.controls["isAllowedForRfxSow"].setValue(false);
			this.AddstaffingagencyForm.get("isAllowedForRfxSow")?.disable();
		}
	}

	private getStateDropdown(id: string) {
		this.staffingGatewayServc.getStateDropDownByCountryId(id).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: ApiResponse) => {
				if (res.Succeeded) {
					this.stateRulesList = res.Data;
				}
				else {
					this.stateRulesList = [];
					this.AddstaffingagencyForm.controls['stateId'].setValue(null);
				}
			}
		});
	}

	private getValuesToBePatchedOnEdit() {
		this.AddstaffingagencyForm.patchValue({
			primaryContactFirstName: this.staffingAgencyDetails.PrimaryContactFirstName,
			primaryContactLastName: this.staffingAgencyDetails.PrimaryContactLastName,
			primaryContactMiddleName: this.staffingAgencyDetails.PrimaryContactMiddleName,

			accountingContactFirstName: this.staffingAgencyDetails.AccountingContactFirstName,
			accountingContactLastName: this.staffingAgencyDetails.AccountingContactLastName,
			accountingContactMiddleName: this.staffingAgencyDetails.AccountingContactMiddleName,

			alternateContactFirstName: this.staffingAgencyDetails.AlternateContactFirstName,
			alternateContactLastName: this.staffingAgencyDetails.AlternateContactLastName,
			alternateContactMiddleName: this.staffingAgencyDetails.AlternateContactMiddleName,
			staffingAgencyStatusId: this.getPatchValue('StaffingAgencyStatusId', 'StaffingAgencyStatus'),
			countryId: this.getPatchValue('CountryId', 'HomeCountry'),
			  stateId: this.getPatchValue('StateId', 'State'),
			staffingAgencyTypeId: this.staffingAgencyDetails.StaffingAgencyTypeId
				? { Value: String(this.staffingAgencyDetails.StaffingAgencyTypeId) }
				: null,
			cultureId: this.staffingAgencyDetails.CultureId
				? { Value: String(this.staffingAgencyDetails.CultureId) }
				: null,
			timeZoneId: this.getPatchValue('TimeZoneId', 'TimeZone'),
			businessClassificationId: this.getPatchValue('BusinessClassificationId', 'BusinessClassification'),
			paymentType: this.getPatchValue('PaymentTypeId', 'PaymentTypeName'),
			securityClearanceId: this.getPatchValue('SecurityClearanceId', 'SecurityClearance'),
			staffingAgencyEin: this.staffingAgencyDetails.StaffingAgencyEin,
			addressLine1: this.staffingAgencyDetails.AddressLine1,
			addressLine2: this.staffingAgencyDetails.AddressLine2,
			city: this.staffingAgencyDetails.City,
			homePageUrl: this.staffingAgencyDetails.HomePageUrl,
			zipCode: this.staffingAgencyDetails.ZipCode,
			preferenceNteRateMultiplier: this.staffingAgencyDetails.PreferenceNteRateMultiplier,
			isAllowedForPayroll: this.staffingAgencyDetails.IsAllowedForPayroll,
			isAllowedForIc: this.staffingAgencyDetails.IsAllowedForIc,
			icMarkup: this.staffingAgencyDetails.IcMarkup,
			sowIcMspFee: this.staffingAgencyDetails.SowIcMspFee,
			isAllowedForLi: this.staffingAgencyDetails.IsAllowedForLi,
			canReceiveCandidateFromAts: this.staffingAgencyDetails.CanReceiveCandidateFromAts,
			isMspAfiiliated: this.staffingAgencyDetails.IsMspAfiiliated,
			isAllowedForRfxSow: this.staffingAgencyDetails.IsAllowedForRfxSow,
			comments: this.staffingAgencyDetails.Comments,
			cageCode: this.staffingAgencyDetails.CageCode
		});
		this.disableRfxSow();
	}

	private getPatchValue(detailKey: string, textKey: string) {
		if (this.staffingAgencyDetails[detailKey]) {
			const text = textKey
				? this.staffingAgencyDetails[textKey]
				: null;
			return { Text: text, Value: String(this.staffingAgencyDetails[detailKey]) };
		} else {
			return null;
		}
	}

	private getPrimaryUserEditData() {
		this.primaryUserContactName = this.staffingAgencyDetails.PrimaryContactName;
		this.pcEmail = this.staffingAgencyDetails.PrimaryContactEmail;
		this.primaryUserId = this.staffingAgencyDetails.PrimaryUserId;
		this.primaryContactRole = this.staffingAgencyDetails.PrimaryContactRole;
		this.primaryPhone = this.staffingAgencyDetails.PrimaryContactPhoneNumber?.trim();
		this.primaryPhoneExt = this.staffingAgencyDetails.PrimaryPhoneExtension?.trim();
		if(this.primaryPhone && this.primaryPhone !== 'null'){
			this.AddstaffingagencyForm.controls['primaryContactPhoneNumber'].setValue(this.primaryPhone);
			if(this.primaryPhoneExt && this.primaryPhoneExt !== 'null'){
				this.primaryExt = true;
				this.AddstaffingagencyForm.controls['primaryPhoneExtension'].setValue(this.primaryPhoneExt);
			}else {
				this.primaryExt = false;
				this.AddstaffingagencyForm.controls['primaryPhoneExtension'].setValue('');
			}
		}
		else{
			this.AddstaffingagencyForm.controls['primaryContactPhoneNumber'].setValue('');
			this.primaryExt = false;
			this.AddstaffingagencyForm.controls['primaryPhoneExtension'].setValue('');
		}

		this.pcFName = this.staffingAgencyDetails.PrimaryContactFirstName;
		this.pcLName = this.staffingAgencyDetails.PrimaryContactLastName;
		this.pcMName = this.staffingAgencyDetails.PrimaryContactMiddleName;
		this.primaryUserNumber = this.staffingAgencyDetails.PrimaryUserNumber;
		this.pcUkey = this.staffingAgencyDetails.PrimaryUkey;
	}

	private getAccountingUserEditData() {
		this.accountingContactRole = this.staffingAgencyDetails.AccountingContactRole;
		this.AccountingUserId = this.staffingAgencyDetails.AccountingUserId;
		this.accountingUserContactName = this.staffingAgencyDetails.AccountingContactName;
		this.acctcEmail = this.staffingAgencyDetails.AccountingContactEmail;
		this.accountingPhone = this.staffingAgencyDetails.AccountingContactPhoneNumber?.trim();
	  this.accountingPhoneExt = this.staffingAgencyDetails.AccountingPhoneExtension?.trim();
		if(this.accountingPhone){
			this.AddstaffingagencyForm.controls['accountingContactPhoneNumber'].setValue(this.accountingPhone);
			if(this.accountingPhoneExt){
				this.acctExt = true;
				this.AddstaffingagencyForm.controls['accountingPhoneExtension'].setValue(this.accountingPhoneExt);
			}else {
				this.acctExt = false;
				this.AddstaffingagencyForm.controls['accountingPhoneExtension'].setValue('');
			}
		}else{
			this.AddstaffingagencyForm.controls['accountingContactPhoneNumber'].setValue('');
			this.acctExt = false;
			this.AddstaffingagencyForm.controls['accountingPhoneExtension'].setValue('');
		}
		this.acctcFName = this.staffingAgencyDetails.AccountingContactFirstName;
		this.acctcLName = this.staffingAgencyDetails.AccountingContactLastName;
		this.acctcMName = this.staffingAgencyDetails.AccountingContactMiddleName;
		this.accountingUserNumber = this.staffingAgencyDetails.AccountingUserNumber;
		this.acctcUkey = this.staffingAgencyDetails.AccountingUkey;
		this.AddstaffingagencyForm.controls['isAccountingUserCreated'].setValue(this.staffingAgencyDetails.IsAccountingUserCreated);
	}

	private getAlternateUserEditData() {
		this.altcEmail = this.staffingAgencyDetails.AlternateContactEmail;
		this.alternateContactRole = this.staffingAgencyDetails.AlternateContactRole;
		this.alternateUserId = this.staffingAgencyDetails.AlternateUserId;
		this.alternatePhone = this.staffingAgencyDetails.AlternateContactPhoneNumber?.trim();
	  this.alternatePhoneExt = this.staffingAgencyDetails.AlternatePhoneExtension?.trim();
		if(this.alternatePhone){
			this.AddstaffingagencyForm.controls['alternateContactPhoneNumber'].setValue(this.alternatePhone);
			if(this.alternatePhoneExt){
				this.altExt = true;
				this.AddstaffingagencyForm.controls['alternatePhoneExtension'].setValue(this.alternatePhoneExt);
			}else {
				this.altExt = false;
				this.AddstaffingagencyForm.controls['alternatePhoneExtension'].setValue('');
			}
		}
		else{
			this.AddstaffingagencyForm.controls['alternateContactPhoneNumber'].setValue('');
			this.altExt = false;
			this.AddstaffingagencyForm.controls['alternatePhoneExtension'].setValue('');
		}
		this.alternateUserContactName = this.staffingAgencyDetails.AlternateContactName;
		this.altcFName = this.staffingAgencyDetails.AlternateContactFirstName;
		this.altcLName = this.staffingAgencyDetails.AlternateContactLastName;
		this.alternateContactMiddleName = this.staffingAgencyDetails.AlternateContactMiddleName;
		this.alternateUserNumber = this.staffingAgencyDetails.AlternateUserNumber;
		this.altcUkey = this.staffingAgencyDetails.AlternateUkey;
		this.AddstaffingagencyForm.controls['isAlternateUserCreated'].setValue(this.staffingAgencyDetails.IsAlternateUserCreated);
	}

	private getStausFormStripData() {
		this.recordId = this.staffingAgencyDetails.Code;
		this.recordStatus = this.staffingAgencyDetails.StaffingAgencyStatus;
		this.staffingGatewayServc.Staffing.next(this.staffingAgencyDetails);
	}

	private getUdfDataForEdit() {
		this.actionTypeId = ActionType.Edit;
		this.recordUKey = this.staffingAgencyDetails.UKey;

	}
	// get by ukey
	private getStaffingAgencyById() {
		this.isEditMode = true;
		this.staffingAgencyStatusIdData = this.staffingAgencyDetails.StaffingAgencyStatusId;
		this.staffingGatewayServc.Staffing.next(this.staffingAgencyDetails);
		this.getValuesToBePatchedOnEdit();
		this.validationOnEditBasedOnStatus();
		this.getUdfDataForEdit();
		this.getStausFormStripData();
		this.getPrimaryUserEditData();
		this.getAccountingUserEditData();
		this.getAlternateUserEditData();
		this.AddstaffingagencyForm.get('staffingAgencyStatusId')?.setValue({
			"Text": this.staffingAgencyDetails.StaffingAgencyStatus, "Value": String(this.staffingAgencyDetails.StaffingAgencyStatusId)
		});
		this.clearValidatorsForControls([
			'primaryContactEmail', 'primaryRoleNo', 'staffingAgencyName', 'primaryUserId',
			'primaryContactFirstName', 'primaryContactLastName', 'primaryContactPhoneNumber'
		]);
		this.updateFormControlValidity();
		this.cd.detectChanges();
	}

	private setContactInformation(payload: StaffingAgency): void {
		payload.primaryContactFirstName = this.pcFName;
		payload.primaryContactLastName = this.pcLName;
		payload.primaryContactMiddleName = this.pcMName;
		payload.primaryContactEmail = this.pcEmail;
		payload.primaryContactPhoneNumber = this.primaryPhone;
		payload.alternateContactFirstName = this.altcFName;
		payload.alternateContactLastName = this.altcLName;
		payload.alternateContactMiddleName = this.alternateContactMiddleName;
		payload.alternateContactEmail = this.altcEmail;
		payload.alternateContactPhoneNumber = this.alternatePhone;
		payload.accountingContactFirstName = this.acctcFName;
		payload.accountingContactLastName = this.acctcLName;
		payload.accountingContactMiddleName = this.acctcMName;
		payload.accountingContactEmail = this.acctcEmail;
		payload.accountingContactPhoneNumber = this.accountingPhone;
	}

	private getBasicDetailsEditData(payload: StaffingAgency): void {
		payload.UKey = this.staffingAgencyDetails.UKey;
		payload.countryId = parseInt(this.AddstaffingagencyForm.controls['countryId'].value?.Value);
		payload.stateId = parseInt(this.AddstaffingagencyForm.controls['stateId'].value?.Value);
		payload.timeZoneId = parseInt(this.AddstaffingagencyForm.controls['timeZoneId'].value?.Value);
		payload.cultureId = parseInt(this.AddstaffingagencyForm.controls['cultureId'].value?.Value);
		payload.staffingAgencyTypeId = parseInt(this.AddstaffingagencyForm.controls['staffingAgencyTypeId'].value?.Value);
		payload.securityClearanceId = parseInt(this.AddstaffingagencyForm.controls['securityClearanceId'].value?.Value);
		payload.businessClassificationId = parseInt(this.AddstaffingagencyForm.controls['businessClassificationId'].value?.Value);
		payload.countryId = parseInt(this.AddstaffingagencyForm.controls['countryId'].value?.Value);
		payload.paymentTypeId = this.AddstaffingagencyForm.controls['paymentType'].value?.Value;
		payload.staffingAgencyStatusId = parseInt(this.AddstaffingagencyForm.controls['staffingAgencyStatusId'].value?.Value);
		payload.staffingAgencyName = this.staffingAgencyDetails.StaffingAgencyName;
	}

	private getbasicDetailsAddData(addPayload: StaffingAgency): void {
		addPayload.countryId = parseInt(this.AddstaffingagencyForm.controls['countryId'].value?.Value);
		addPayload.stateId = parseInt(this.AddstaffingagencyForm.controls['stateId'].value?.Value);
		addPayload.timeZoneId = parseInt(this.AddstaffingagencyForm.controls['timeZoneId'].value?.Value);
		addPayload.cultureId = parseInt(this.AddstaffingagencyForm.controls['cultureId'].value?.Value);
		addPayload.staffingAgencyTypeId = parseInt(this.AddstaffingagencyForm.controls['staffingAgencyTypeId'].value?.Value);
		addPayload.securityClearanceId = parseInt(this.AddstaffingagencyForm.controls['securityClearanceId'].value?.Value);
		addPayload.businessClassificationId = parseInt(this.AddstaffingagencyForm.controls['businessClassificationId'].value?.Value);
		addPayload.countryId = parseInt(this.AddstaffingagencyForm.controls['countryId'].value?.Value);
		addPayload.paymentTypeId = parseInt(this.AddstaffingagencyForm.controls['paymentType'].value?.Value);
		addPayload.staffingAgencyStatusId = parseInt(this.AddstaffingagencyForm.controls['staffingAgencyStatusId'].value?.Value);
		addPayload.primaryRoleNo = parseInt(this.AddstaffingagencyForm.controls['primaryRoleNo'].value?.Value);
		addPayload.alternateRoleNo = parseInt(this.AddstaffingagencyForm.controls['alternateRoleNo'].value?.Value);
		addPayload.accountingRoleNo = parseInt(this.AddstaffingagencyForm.controls['accountingRoleNo'].value?.Value);
	}

	private handlePopupUpdateStaffingAgency(data: GenericResponseBase<StaffingAgencyData>): void {
		if (data.StatusCode === Number(HttpStatusCode.Ok)) {
			setTimeout(() => {
				this.toasterServc.showToaster(ToastOptions.Success, "StaffingAgencyAddedSuccessfully");
			});
			this.sowKeyClicked = false;
			this.statusError = false;
			this.AddstaffingagencyForm.markAsPristine();
			const newRecordStatus = this.staffingAgencyStatusText ?
				this.staffingAgencyStatusText
				: this.staffingAgencyDetails.StaffingAgencyStatus;
			this.recordStatus = newRecordStatus;
			this.statusList=[];
			this.cd.detectChanges();
			this.AddstaffingagencyForm.controls['ChangePrimaryUser'].setValue(false);
			this.AddstaffingagencyForm.controls['ChangeAlternateUser'].setValue(false);
			this.AddstaffingagencyForm.controls['ChangeAccountingUser'].setValue(false);
			this.AddstaffingagencyForm.controls['contactPrimaryUserList'].setValue('');
			this.AddstaffingagencyForm.controls['contactAlternateUserList'].setValue('');
			this.AddstaffingagencyForm.controls['contactAcountingUserList'].setValue('');
			this.getIdFromRoute();
		}
		else if (data.ValidationMessages && data.ValidationMessages.length != Number(magicNumber.zero)) {
			const valMessage: ValidationError[] = data.ValidationMessages;
			this.toasterServc.showToaster(ToastOptions.Error, this.localizationService
				.GetLocalizeMessage(valMessage[magicNumber.zero].ErrorMessage));
		}
		else {
			this.conflictData = true;
			this.loaderService.setState(false);
			this.toasterServc.showToaster(
				ToastOptions.Error,
				data.Message
			);
		}
		this.eventLog.isUpdated.next(true);
	}

	private getEditPayload() {
		if(this.staffingAgencyDetails.StaffingAgencyStatusId == Number(magicNumber.eightyThree)){
			this.AddstaffingagencyForm.controls['isPrimaryUserCreated'].setValue(false);
		}
		const payload: StaffingAgency = new StaffingAgency(this.AddstaffingagencyForm.value);
		this.getBasicDetailsEditData(payload);
		this.setContactInformation(payload);
		if (this.AddstaffingagencyForm.controls['staffingAgencyStatusId'].value.Value === String(magicNumber.three)) {
			payload.primaryUserNumber = null;
			payload.alternateUserNumber = null;
			payload.accountingUserNumber = null;
		} else {
			payload.primaryUserNumber = this.primaryUserNumber;
			payload.alternateUserNumber = this.alternateUserNumber;
			payload.accountingUserNumber = this.accountingUserNumber;
		}
		payload.staffingAgencyEin = this.AddstaffingagencyForm.controls['staffingAgencyEin'].value == ''
			? null
			: this.AddstaffingagencyForm.controls['staffingAgencyEin'].value;
		payload.UdfFieldRecords = this.udfData;
		payload.sowLaborCategories = this.labCategoryVals
			? this.labCategoryVals.flat()
			: [];

		payload.primaryContactFirstName = this.AddstaffingagencyForm.controls['primaryContactFirstName'].value;
		payload.primaryContactLastName = this.AddstaffingagencyForm.controls['primaryContactLastName'].value;
		payload.primaryContactMiddleName = this.AddstaffingagencyForm.controls['primaryContactMiddleName'].value;
		payload.alternateContactFirstName = this.AddstaffingagencyForm.controls['alternateContactFirstName'].value;
		payload.alternateContactLastName = this.AddstaffingagencyForm.controls['alternateContactLastName'].value;
		payload.alternateContactMiddleName = this.AddstaffingagencyForm.controls['alternateContactMiddleName'].value;
		payload.accountingContactFirstName = this.AddstaffingagencyForm.controls['accountingContactFirstName'].value;
		payload.accountingContactLastName = this.AddstaffingagencyForm.controls['accountingContactLastName'].value;
		payload.accountingContactMiddleName = this.AddstaffingagencyForm.controls['accountingContactMiddleName'].value;

		payload.reasonForChange = this.reasonForChange;
		payload.isAllowedForRfxSow = this.AddstaffingagencyForm.get('isAllowedForRfxSow')?.value;
		payload.cageCode = this.AddstaffingagencyForm.get('cageCode')?.value
			? this.AddstaffingagencyForm.get('cageCode')?.value
			: null;
		this.staffingGatewayServc.updateStaffingAgency(payload).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: GenericResponseBase<StaffingAgencyData>) => {
				this.toasterServc.resetToaster();
				this.handlePopupUpdateStaffingAgency(data);
			}
		});
	}

	private getAddPayload() {
		const addPayload: StaffingAgency = new StaffingAgency(this.AddstaffingagencyForm.value);
		this.getbasicDetailsAddData(addPayload);
		addPayload.staffingAgencyEin = this.AddstaffingagencyForm.controls['staffingAgencyEin'].value == ''
			? null
			: this.AddstaffingagencyForm.controls['staffingAgencyEin'].value;
		addPayload.sowLaborCategories = this.labCategoryVals
			? this.labCategoryVals.flat()
			: [];
		addPayload.UdfFieldRecords = this.udfData;

		this.staffingGatewayServc.addStaffingAgency(addPayload).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: GenericResponseBase<StaffingAgencyData>) => {
				this.handlePopUpAddStaffingAgency(data);
			}
		});
	}

	public save() {
		if (this.isEditMode) {
			this.getEditPayload();
		} else {
			this.getAddPayload();
		}
	}

	public navigate() {
		this.route.navigate([NavigationPaths.list]);
	}

	private handlePopUpAddStaffingAgency(data: GenericResponseBase<StaffingAgencyData>): void {
		if (data.StatusCode === Number(HttpStatusCode.Ok)) {
			this.conflictData = false;
			this.toasterServc.resetToaster();
			this.toasterServc.showToaster(ToastOptions.Success, "StaffingAgencyAddedSuccessfully");
			this.route.navigate([NavigationPaths.list]);
		}
		else if (data.ValidationMessages && data.ValidationMessages.length != Number(magicNumber.zero)) {
			this.conflictData = true;
			const valMessage: ValidationError[] = data.ValidationMessages;
			this.toasterServc.showToaster(ToastOptions.Error, this.localizationService
				.GetLocalizeMessage(valMessage[magicNumber.zero].ErrorMessage));
		}
		else {
			this.conflictData = true;
			this.toasterServc.resetToaster();
			this.toasterServc.showToaster(
				ToastOptions.Error,
				data.Message
			);
		}
	}

	public onAbletoAdministerIcChange(event: boolean) {
		const ic = this.AddstaffingagencyForm.get('isAllowedForIc')?.value;
		if (ic) {
			this.AddstaffingagencyForm.controls['icMarkup'].addValidators([
				this.customValidators.RequiredValidator('PleaseEnterIcMarkup'),
				this.customValidators.RangeValidator(magicNumber.zero, magicNumber.ninetyNineDotDoubleNine, 'IcMarkUpRangeValidation')
			]);
			this.AddstaffingagencyForm.controls['icMarkup'].updateValueAndValidity();
		} else {
			this.AddstaffingagencyForm.controls['icMarkup'].markAsUntouched();
			this.AddstaffingagencyForm.controls['icMarkup'].markAsPristine();
			this.AddstaffingagencyForm.controls['sowIcMspFee'].setValue(null);
			this.AddstaffingagencyForm.controls['icMarkup'].clearValidators();
			this.AddstaffingagencyForm.controls['icMarkup'].setValue(null);
		}
		this.AddstaffingagencyForm.controls['icMarkup'].updateValueAndValidity();
	}

	public onChangeLiSwitch(event:boolean){
		const li = this.AddstaffingagencyForm.get('isAllowedForLi')?.value;
		if(!li){
			this.AddstaffingagencyForm.controls['canReceiveCandidateFromAts'].setValue(false);
		}
	}

	public onPrimaryCreateUserAccountChange(event: boolean) {
		if (event) {
			this.AddstaffingagencyForm.controls['primaryRoleNo'].addValidators(this.customValidators.RequiredValidator('PleaseSelectRole'));
			this.AddstaffingagencyForm.controls['primaryUserId'].setValidators([
				this.customValidators.RequiredValidator('PleaseEnterLoginID'),
				this.customValidators.MaxLengthValidator(magicNumber.fifty) as ValidatorFn
			]);
			this.onChangeLoginMethod('primaryUserId', 'primaryContactEmail', 'primaryUserId');
		} else {
			this.AddstaffingagencyForm.controls['primaryRoleNo'].setValue(null);
			this.AddstaffingagencyForm.controls["primaryUserId"].setValue(null);
			this.AddstaffingagencyForm.controls['primaryRoleNo'].clearValidators();
			this.AddstaffingagencyForm.controls['primaryUserId'].clearValidators();
			this.AddstaffingagencyForm.controls['primaryRoleNo'].markAsPristine();
			this.AddstaffingagencyForm.controls['primaryUserId'].markAsPristine();
		}
		this.updateFormControlValidity(['primaryRoleNo', 'primaryUserId']);
		this.validateUserId();
	}

	private clearValidatorsForSpecificControls(controlNames: string[]) {
		controlNames.forEach((controlName) => {
			const control = this.AddstaffingagencyForm.controls[controlName];
			control.clearValidators();
			control.updateValueAndValidity();
		});
	}

	private setAlternateRequiredValidators() {
		this.AddstaffingagencyForm.controls['alternateContactFirstName'].setValidators([this.customValidators.RequiredValidator('PleaseEnterFirstName')]);
		this.AddstaffingagencyForm.controls['alternateContactLastName'].setValidators([this.customValidators.RequiredValidator('PleaseEnterLastName')]);
		this.AddstaffingagencyForm.controls['alternateContactEmail'].setValidators([this.customValidators.EmailValidator('PleaseEnterValidAlternateEmail'), this.customValidators.RequiredValidator('PleaseEnterAlternateContactEmailAddress')]);
		this.AddstaffingagencyForm.controls['alternateContactPhoneNumber'].setValidators([this.customValidators.RequiredValidator('PleaseEnterAlternatePhoneNumber'), this.customValidators.FormatValidator('PleaseEnterValidAlternatePhNo')]);
		this.AddstaffingagencyForm.controls['alternateRoleNo'].setValidators(this.customValidators.RequiredValidator('PleaseSelectRole'));
		this.AddstaffingagencyForm.controls["alternateUserId"].setValidators([
			this.customValidators.RequiredValidator('PleaseEnterLoginID'),
			this.customValidators.MaxLengthValidator(magicNumber.fifty) as ValidatorFn
		]);
	}

	public onAlternateCreateUserAccountChange(event: boolean) {
		if (event) {
			this.isRequired = !this.isRequired;
			this.clearErrorsForControls(['alternateRoleNo', 'alternateUserId']);
			this.setAlternateRequiredValidators();
			this.onChangeLoginMethod('alternateUserId', 'alternateContactEmail', 'alternateUserId');
		} else {
			this.isRequired = false;
			this.clearErrorsForControls(['alternateRoleNo', 'alternateUserId']);
			this.clearValidatorsForSpecificControls([
				'alternateRoleNo',
				'alternateUserId',
				'alternateContactFirstName',
				'alternateContactLastName',
				'alternateContactEmail',
				'alternateContactPhoneNumber'
			]);
			this.AddstaffingagencyForm.controls['alternateRoleNo'].setValue(null);
			this.AddstaffingagencyForm.controls["alternateUserId"].setValue(null);
			this.AddstaffingagencyForm.controls['alternateRoleNo'].markAsPristine();
			this.AddstaffingagencyForm.controls['alternateUserId'].markAsPristine();
			this.AddstaffingagencyForm.controls['alternateContactEmail'].setValidators([this.customValidators.EmailValidator('PleaseEnterValidAlternateEmail')]);
			this.AddstaffingagencyForm.controls['alternateContactPhoneNumber'].setValidators(this.customValidators.FormatValidator('PleaseEnterValidAlternatePhNo'));
		}
		this.updateFormControlValidity([
			'alternateRoleNo', 'alternateUserId', 'alternateContactFirstName',
			'alternateContactLastName', 'alternateContactEmail', 'alternateContactPhoneNumber'
		]);
		this.validateUserId();
	}

	private setAccountingReqValidatros() {
		this.AddstaffingagencyForm.controls['accountingRoleNo'].setValidators(this.customValidators.RequiredValidator('PleaseSelectRole'));
		this.AddstaffingagencyForm.controls['accountingUserId'].setValidators([
			this.customValidators.RequiredValidator('PleaseEnterLoginID'),
			this.customValidators.MaxLengthValidator(magicNumber.fifty) as ValidatorFn
		]);
		this.AddstaffingagencyForm.controls['accountingContactFirstName'].setValidators([this.customValidators.RequiredValidator('PleaseEnterFirstName')]);
		this.AddstaffingagencyForm.controls['accountingContactLastName'].setValidators([this.customValidators.RequiredValidator('PleaseEnterLastName')]);
		this.AddstaffingagencyForm.controls['accountingContactEmail'].setValidators([this.customValidators.EmailValidator('PleaseEnterValidAccountingEmail'), this.customValidators.RequiredValidator('PleaseEnterAccountingContactEmailAddress')]);
		this.AddstaffingagencyForm.controls['accountingContactPhoneNumber'].setValidators([
			this.customValidators.RequiredValidator('PleaseEnterAccountingPhoneNumber'),
			this.customValidators.FormatValidator('PleaseEnterValidAccountingPhNo')
		]);
	}

	public onAccountingCreateUserAccountChange(event: boolean) {
		if (event) {
			this.isRequiredAccounting = true;
			this.clearErrorsForControls(['accountingRoleNo', 'accountingUserId']);
			this.setAccountingReqValidatros();
			this.onChangeLoginMethod('accountingUserId', 'accountingContactEmail', 'accountingUserId');
		} else {
			this.isRequiredAccounting = false;
			this.clearErrorsForControls(['accountingRoleNo', 'accountingUserId']);
			this.clearValidatorsForSpecificControls([
				'accountingRoleNo',
				'accountingUserId',
				'accountingContactFirstName',
				'accountingContactLastName',
				'accountingContactEmail',
				'accountingContactPhoneNumber'
			]);
			this.AddstaffingagencyForm.controls['accountingRoleNo'].setValue(null);
			this.AddstaffingagencyForm.controls["accountingUserId"].setValue(null);
			this.AddstaffingagencyForm.controls['accountingRoleNo'].markAsPristine();
			this.AddstaffingagencyForm.controls['accountingUserId'].markAsPristine();
			this.AddstaffingagencyForm.controls['accountingContactEmail'].setValidators([this.customValidators.EmailValidator('PleaseEnterValidAccountingEmail')]);
			this.AddstaffingagencyForm.controls['accountingContactPhoneNumber'].setValidators(this.customValidators.FormatValidator('PleaseEnterValidAccountingPhNo'));
		}
		this.updateFormControlValidity([
			'accountingRoleNo', 'accountingUserId', 'accountingContactFirstName', 'accountingContactLastName',
			'accountingContactEmail', 'accountingContactPhoneNumber'
		]);
		this.validateUserId();

	}

	public validateUserId(controlName?:string) {
		if(controlName){
			const value = this.AddstaffingagencyForm.controls[controlName].value;
			if(!value){
				this.validateRequired(true, value, this.AddstaffingagencyForm.controls[controlName]);
				return;
			}
			else if(value.length< Number(magicNumber.six)){
				this.checkForLength(controlName);
				return;
			}
			else{
				this.validateuserID();
			}
		}


	}

	validateuserID(){
		const primaryUserId = this.AddstaffingagencyForm.controls['primaryUserId'],
			alternateUserId = this.AddstaffingagencyForm.controls['alternateUserId'],
			accountingUserId = this.AddstaffingagencyForm.controls['accountingUserId'],
			primaryValue = primaryUserId.value?.toString().trim()?.toLowerCase(),
			alternateValue = alternateUserId.value?.toString().trim()?.toLowerCase(),
			accountingValue = accountingUserId.value?.toString().trim()?.toLowerCase(),
			isPrimaryEnabled = this.AddstaffingagencyForm.controls['isPrimaryUserCreated'].value,
			isAlternateEnabled = this.AddstaffingagencyForm.controls['isAlternateUserCreated'].value,
			isAccountingEnabled = this.AddstaffingagencyForm.controls['isAccountingUserCreated'].value,
			validateUserPrimary: ValidationParams = {
				enabled: isPrimaryEnabled,
				value: primaryValue,
				control: primaryUserId,
				userId: 'primaryUserId'
			},
			validateUserAlternate: ValidationParams = {
				enabled: isAlternateEnabled,
				value: alternateValue,
				control: alternateUserId,
				userId: 'alternateUserId'
			},
			validateUserAccounting: ValidationParams = {
				enabled: isAccountingEnabled,
				value: accountingValue,
				control: accountingUserId,
				userId: 'accountingUserId'
			};
		this.clearErrorsForControls(['primaryUserId', 'alternateUserId', 'accountingUserId']);
		if (isPrimaryEnabled && isAlternateEnabled && isAccountingEnabled &&
			primaryValue === alternateValue && primaryValue === accountingValue) {
			this.setUserIdError(['primaryUserId', 'alternateUserId', 'accountingUserId'], 'UserIdCantBeSame');
		}
		else if (isPrimaryEnabled && isAlternateEnabled && primaryValue === alternateValue) {
			this.setUserIdError(['primaryUserId', 'alternateUserId'], 'UserIdCantBeSame');
		} else if (isPrimaryEnabled && isAccountingEnabled && primaryValue === accountingValue) {
			this.setUserIdError(['primaryUserId', 'accountingUserId'], 'UserIdCantBeSame');
		} else if (isAlternateEnabled && isAccountingEnabled &&
			alternateValue === accountingValue) {
			this.setUserIdError(['alternateUserId', 'accountingUserId'], 'UserIdCantBeSame');
		}
		this.validateUserIdField(validateUserPrimary);
		this.validateUserIdField(validateUserAlternate);
		this.validateUserIdField(validateUserAccounting);
	}
	private setUserIdError(controlNames: string[], errorMessage: string) {
		controlNames.forEach((controlName) => {
			const userIdControl = this.AddstaffingagencyForm.controls[controlName];
			userIdControl.setErrors({ error: true, message: errorMessage });
			userIdControl.markAsTouched();
		});
	}

	private validateUserIdField(params: ValidationParams) {
		const { enabled, value, control, userId } = params;
		if (enabled) {
			if (!value) {
				this.validateRequired(true, value, control);
			}
		} else {
			control.setErrors(null);
		}
	}

	private checkForLength(controlNames: string) {
		this.AddstaffingagencyForm.controls[controlNames].setValidators(this.customValidators.MinLengthValidator(magicNumber.six, 'MinimumCharacterslimitofUserID', this.minLength));
		this.AddstaffingagencyForm.controls[controlNames].markAsTouched();
	}

	private validateRequired(enabled: boolean, value: string, control: AbstractControl) {
		if (enabled && !value) {
			control.setErrors({ error: true, message: 'PleaseEnterLoginID' });
		}
	}

	private clearErrorsForControls(controlNames: string | string[]) {
		const controlNamesArray = Array.isArray(controlNames)
			? controlNames
			: [controlNames];
		controlNamesArray.forEach((controlName) => {
			const control = this.AddstaffingagencyForm.controls[controlName];
			control.setErrors(null);
			control.updateValueAndValidity({onlySelf: false, emitEvent: true});

		});
	}

	public validateUsers() {
		this.clearErrors();
		this.checkUserIds();
		this.checkUserDropdownValues();
	}

	private clearErrors() {
		this.clearErrorsForControls(['contactPrimaryUserList', 'contactAlternateUserList', 'contactAcountingUserList']);
	}

	private checkUserIds() {
		const isPrimaryEnabled = this.AddstaffingagencyForm.controls['ChangePrimaryUser'].value,
			isAlternateEnabled = this.AddstaffingagencyForm.controls['ChangeAlternateUser'].value,
			primaryUserId = this.AddstaffingagencyForm.controls['contactPrimaryUserList'],
			alternateUserId = this.AddstaffingagencyForm.controls['contactAlternateUserList'],
			primaryValue = primaryUserId.value?.Value,
			alternateValue = alternateUserId.value?.Value;
		if (isPrimaryEnabled && isAlternateEnabled && primaryValue == alternateValue) {
			primaryUserId.setErrors({ error: true, message: 'PrimaryAlternateCannotBeSame' });
			alternateUserId.setErrors({ error: true, message: 'PrimaryAlternateCannotBeSame' });
		}
	}

	private checkUserDropdownValues() {
		const isPrimaryEnabled = this.AddstaffingagencyForm.controls['ChangePrimaryUser'].value,
			isAlternateEnabled = this.AddstaffingagencyForm.controls['ChangeAlternateUser'].value,
			isAccountingEnabled = this.AddstaffingagencyForm.controls['ChangeAccountingUser'].value,
			primaryUserId = this.AddstaffingagencyForm.controls['contactPrimaryUserList'],
			alternateUserId = this.AddstaffingagencyForm.controls['contactAlternateUserList'],
			accountingUserId = this.AddstaffingagencyForm.controls['contactAcountingUserList'],
			primaryValue = primaryUserId.value?.Value,
			alternateValue = alternateUserId.value?.Value,
			accountingValue = accountingUserId.value?.Value;
		if (isPrimaryEnabled && !primaryValue) {
			primaryUserId.setErrors({ error: true, message: 'PleaseSelectPrimaryUser' });
		}
		if (isAlternateEnabled && !alternateValue) {
			alternateUserId.setErrors({ error: true, message: 'PleaseSelectAlternateUser' });
		}
		if (isAccountingEnabled && !accountingValue) {
			accountingUserId.setErrors({ error: true, message: 'PleaseSelectAccountingUser' });
		}

	}

	ngOnDestroy(): void {
		if (this.isEditMode || this.conflictData) {
			this.toasterServc.resetToaster();
		}
		this.conflictData = false;
		this.isEditMode = false;
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.staffingGatewayServc.openRightPanel.next(false);
	}
}

