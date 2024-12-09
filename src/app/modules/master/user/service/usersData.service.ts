import { Injectable } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { BasicDetailsUpdateClient, DropdownData, Sector, SectorDetailsUpdateClient, UserDetails, UserPreferenceUpdate, alternateContactDetails } from "../model/model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { LocalizationService } from "@xrm-shared/services/Localization/localization.service";
import { UserDataAccessRight, UserFormTab } from "../enum/enums";
import { IPreparedUdfPayloadData } from "@xrm-shared/common-components/udf-implementation/Interface/udf-common.model";
import { ApprovalConfig, ApprovalConfigs, ApproverLabel, ClientUserSectorAccess, DataItem, DropDownWithTextValue, LocationList, UserApprovalConfiguration } from "../interface/user";
import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";


@Injectable({providedIn: 'root'})

export class UsersDataService {
	constructor(
    private fb:FormBuilder,
    private customValidators: CustomValidators,
    private localizationService: LocalizationService
	){
	}
	private minLength: DynamicParam[] = [{ Value: magicNumber.six.toString(), IsLocalizeKey: false }];
	private maxLength: DynamicParam[] = [{ Value: magicNumber.fifty.toString(), IsLocalizeKey: false }];

	PrepareDataForBasicDetailsUpdateClient(form:FormGroup){
		const basicDetails = new BasicDetailsUpdateClient();
		basicDetails.CountryId = form.get('CountryId')?.value?.Value;
		basicDetails.Email = form.get('Email')?.value;
		basicDetails.LoginMethod = form.get('LoginMethod')?.value?.Value;
		basicDetails.PhoneNumber = form.get('phoneNumber')?.value;
		basicDetails.PhoneNumberExt = form.get('phoneNumberExt')?.value;
		basicDetails.RoleNo = form.get('RoleNo')?.value?.Value;
		basicDetails.UKey = form.get('UKey')?.value;
		basicDetails.UserDataAccessRight = form.get('UserDataAccessRight')?.value?.Value;
		basicDetails.UserFirstName = form.get('UserFirstName')?.value;
		basicDetails.UserLanguageId = form.get('UserLanguageId')?.value?.Value;
		basicDetails.UserLastName = form.get('UserLastName')?.value;
		basicDetails.UserMiddleName = form.get('UserMiddleName')?.value;
		basicDetails.UserNo = form.get('UserNo')?.value;
		basicDetails.UserTimezoneId = form.get('UserTimezoneId')?.value?.Value;

		return basicDetails;

	}
	public PrepareDataForSectorDetailsUpdateClient(form:FormGroup, udfData: IPreparedUdfPayloadData[][], isEditMode: boolean){
		const sectorDetails = new SectorDetailsUpdateClient();
		sectorDetails.ClientUserSectorAccessUpdateDtos = this.prepareDataForSector(form.get('SectorDetails')?.value, form, isEditMode);
		sectorDetails.UKey = form.get('UserDetails')?.value.UKey;
		sectorDetails.UserDataAccessRight = form.get('UserDetails')?.get('UserDataAccessRight')?.value?.Value;
		sectorDetails.UserNo = form.get('UserDetails')?.get('UserNo')?.value;
		(sectorDetails.ClientUserSectorAccessUpdateDtos as Sector[]).map((a: Sector, index: number) => {
			a.ClientUserSectorAccessId= a.ClientUserSectorAccessId??magicNumber.zero;
			a.udfFieldRecords = udfData[index]??[];
			if(isEditMode){
				a.userApprovalConfigurationDetailUpdateDtos = a.userApprovalConfigurationDetailAddDtos;
				delete a.userApprovalConfigurationDetailAddDtos;
			}
		});
		return sectorDetails;
	}

	public prepareDataForSector(sectorList:DropdownData[], form:FormGroup, isEditMode: boolean){
		const deleteKey = [
			'chargeList', 'org1List', 'org2List', 'org3List', 'org4List', 'isValidTreeDataSelected',
			'isorgLevel2Required', 'isorgLevel2Visible', 'isorgLevel3Required', 'isorgLevel3Visible',
			'isorgLevel4Required', 'isorgLevel4Visible', 'isshow', 'locationList', 'org3List', 'org4List',
			'orgLevel1Label', 'orgLevel2Label', 'orgLevel3Label', 'orgLevel4Label', 'primarysector', 'role',
			'sectorList', 'usercategory', 'nextLevelManagerList'
		];
		sectorList.forEach((sectoritem: any, index: number) => {
			for (const key in sectoritem) {

				if(deleteKey.findIndex((a:string) =>
					a== key) > Number(magicNumber.minusOne)){
					delete sectoritem[key];
				}
				if (sectoritem[key] && Object.prototype.hasOwnProperty.call(sectoritem[key], "Text") &&
				Object.prototype.hasOwnProperty.call(sectoritem[key], "Value")) {	sectoritem[key] = parseInt(sectoritem[key]?.Value);
				}
				else if (key === 'ClientUserSectorAccessId') {
					sectoritem[key]= sectoritem[key] ?? magicNumber.zero;
				}
				else if (key === 'userApprovalConfigurationDetail') {
					sectoritem.userApprovalConfigurationDetailAddDtos = this.PrepareApprovalDataForPost(form, index);
					delete sectoritem[key];
					delete sectoritem.userNo;
				}
				else if (key == 'selectedTree') {
					this.getUserDataAccessRight(form, sectoritem, key);
					delete sectoritem[key];
				}
				else if (sectoritem[key]?.length > magicNumber.zero && Array.isArray(sectoritem[key])) {
					const id: number[] = [];
					(sectoritem[key] as Sector[])?.forEach((a: Sector) => {

						if (a && Object.prototype.hasOwnProperty.call(a, "Text")) {
							id.push(parseInt(a.Value));
						}
					});
					sectoritem[key] = id;
				}
			}
		});
		return sectorList;
	}

	private getUserDataAccessRight(form: AbstractControl, sectoritem: any, key: any){
		const id: number[] = [];
		if (form.get('UserDetails')?.get('UserDataAccessRight')?.value?.Value == UserDataAccessRight.Org1View) {
			sectoritem[key].map((x: string) => {
				if (sectoritem.org1List[parseInt(x)]?.Value) {
					id.push(sectoritem.org1List[parseInt(x)]?.Value);
				}
			});
			sectoritem.clientUserOrgLevel1AccessList = id;
			sectoritem.clientUserLocationAccessList = [];
		}
		else {
			sectoritem[key].map((x: string) => {
				if (sectoritem.locationList[parseInt(x)]?.Value) {
					id.push(sectoritem.locationList[parseInt(x)]?.Value);
				}
			});
			sectoritem.clientUserLocationAccessList = id;
			sectoritem.clientUserOrgLevel1AccessList = [];
		}
	}

	private PrepareApprovalDataForPost(form:FormGroup, index: number) {
		const approval: ApprovalConfigs[] = (form.get('SectorDetails') as FormArray).controls[index].get('userApprovalConfigurationDetail')?.value,
			data: UserApprovalConfiguration[] = [];
		approval.forEach((a: ApprovalConfigs) => {
			a.ApprovalConfigs.forEach((b: ApprovalConfig) => {
				b.ApproverLabels.forEach((c: ApproverLabel) => {
					if (c.IsSelected) {
						data.push({
							entityId: a.XrmEntityId,
							userNo: form.get('UserNo')?.value,
							sectorId: (form.get('SectorDetails') as FormArray).controls[index].get('sectorId')?.value?.Value,
							approvalConfigId: c.Id,
							userSpecifiedForApprovalLevel: true,
							userPreIdendified: 0
						});
					}
				});
			});
		});
		return data;
	}

	public PrepareUserPreferenceData(form: FormGroup, userDetails:UserDetails):UserPreferenceUpdate {
		const notification = form.get('SystemNotification') as FormArray,
			selectedNotication: any = [],
			secQues = form.get('userSecQuestionsUpdateDtos') as FormArray,
			selectedQuestionAnswer: any = [],
			data = new UserPreferenceUpdate();
		notification.value?.forEach((x: any) => {
			if (x?.SelectedValue?.Value) {
				selectedNotication.push({
					emailTemplateMasterId: 0,
					notificationPreferenceOptionId: x?.SelectedValue?.Value
						? x?.SelectedValue?.Value
						: null,
					automatedNotificationOptionId: x?.AutomatedNotifications?.Value
				});
			}

		});

		secQues.value?.forEach((ques: any) => {
			selectedQuestionAnswer.push({
				secQuestionId: ques.secQuestionId?.Value,
				answer: ques.answer,
				userNo: form.get('UserDetails')?.get('UserNo')?.value
			});
		});

		data.DateFormat = form.get('DateFormat')?.value?.Value;
		data.LandingPage = form.get('LandingPageId')?.value?.Value;
		data.ProxyUserUpdateDtos = [];
		data.SystemNotificationAllowed = form.get('SystemNotificationAllowed')?.value;
		data.UKey = userDetails.UKey;
		data.UserLanguageId = form.get('UserLanguageIdPreference')?.value?.Value;
		data.UserName = form.get('IsUserNameChange')?.value
			? form.get('UserNameNew')?.value
			: userDetails.UserName;
		data.UserNotificationPreferenceUpdateDtos = selectedNotication;
		data.UserSecQuestionsUpdateDtos = selectedQuestionAnswer;
		data.UserTimezoneId = form.get('UserTimezoneIdPreference')?.value?.Value;
		data.UserNo = userDetails.UserNo;
		return data;
	}

	public PrepareAlternateContactDetailsData(form:FormGroup):alternateContactDetails{
		const data = new alternateContactDetails();
  		data.addressLine1 = form.controls['UserAddressLine1'].value;
  		data.addressLine2 = form.controls['UserAddressLine2'].value;
  		if(form.controls['alternateEmail'].value!=''){
			data.alternateEmail = form.controls['alternateEmail'].value;
		}
  		data.alternatePhoneNumber1 = form.controls['alternatePhoneNumber1'].value;
  		data.alternatePhoneNumber2 = form.controls['alternatePhoneNumber2'].value;
  		data.alternatePhoneNumberExt1 = form.controls['alternatePhoneNumberExt1'].value;
  		data.alternatePhoneNumberExt2 = form.controls['alternatePhoneNumberExt2'].value;
  		data.city = form.controls['UserCity'].value;
  		data.stateId = form.controls['UserStateId'].value?.Value;
  		data.zipCode = form.controls['UserZipCode'].value;
		return data;
	}

	public getUserDetailsFormControl(): FormGroup{
		return this.fb.group({
			UKey: [null],
			UserNo: [magicNumber.zero],
			UserStatus: [magicNumber.one],
			RoleGroupId: [null, [this.customValidators.RequiredValidator()]],
			StaffingAgencyId: [null],
			CountryId: [null, [this.customValidators.RequiredValidator('SelectValueForCountry')]],
			UserLastName: [null, [this.customValidators.RequiredValidator('PleaseEnterLastName')]],
			UserFirstName: [null, [this.customValidators.RequiredValidator('PleaseEnterFirstName')]],
			UserMiddleName: [null],
			UserLanguageId: [null, [this.customValidators.RequiredValidator('PleaseEnterValueForLanguage')]],
			Email: [null, [this.customValidators.RequiredValidator('PleaseEnterEmail'), this.customValidators.EmailValidator('PleaseEnterAValidEmailAddress')]],
			phoneNumber: [null, [this.customValidators.RequiredValidator('PleaseEnterContactNumber')]],
			phoneNumberExt: [null],
			UserAddressLine1: [null],
			UserAddressLine2: [null],
			UserCity: [null],
			UserStateId: [null],
			UserZipCode: [null],
			UserTimezoneId: [null, [this.customValidators.RequiredValidator('PleaseSelectDdlTimeZone')]],
			LoginMethod: [null, [this.customValidators.RequiredValidator('PleaseSelectValueForLoginMethod')]],
			UserName: [null, [this.customValidators.RequiredValidator('PleaseEnterLoginID'), this.customValidators.MinLengthValidator(magicNumber.six, 'MinimumCharacterslimitofLoginID', this.minLength), this.customValidators.MaxLengthValidator(magicNumber.fifty, 'MaximumCharacterslimitofLoginID', this.maxLength)]],
			UserDataAccessRight: [{ Text: this.localizationService.GetLocalizeMessage("ReportingCLPView"), Value: UserDataAccessRight.ReportingClpView }],
			RoleNo: [null, [this.customValidators.RequiredValidator('SelectUserRole')]],
			PasswordExpiryDate: [null],
			AcknowledgementAcceptedOnDate: [null],
			IsAllSectorAccessible: [true],
			IsAllLocationAccessible: [true],
			isInvalidSector: [false],
			isInvalidLocation: [false],
			SectorAccessList: [null],
			LocationAccessList: [[]],
			ApplicabilityForMultipleSectors: [false]
		});
	}

	public resetUserDetailsForm(currentObj: any, form:FormGroup | any){
		if (!currentObj?.userDetails) {
			return;
		}

		const userDetails = currentObj.userDetails,
		 formControls = [
				{ key: 'UKey', value: userDetails.UKey },
				{ key: 'UserNo', value: userDetails.UserNo },
				{ key: 'UserStatus', value: userDetails.UserStatus },
				{ key: 'StaffingAgencyId', value: { Text: userDetails.StaffingAgencyName, Value: userDetails.StaffingAgencyId?.toString() } },
				{ key: 'CountryId', value: { Text: userDetails.UserCountry, Value: userDetails.CountryId?.toString() } },
				{ key: 'UserLastName', value: userDetails.UserLastName },
				{ key: 'UserFirstName', value: userDetails.UserFirstName },
				{ key: 'UserMiddleName', value: userDetails.UserMiddleName },
				{ key: 'UserLanguageId', value: { Text: userDetails.UserLanguage, Value: userDetails.UserLanguageId?.toString() } },
				{ key: 'Email', value: userDetails.UserEmail },
				{ key: 'phoneNumber', value: userDetails.PhoneNumber },
				{ key: 'phoneNumberExt', value: userDetails.PhoneNumberExt },
				{ key: 'UserAddressLine1', value: userDetails.UserAddressLine1 },
				{ key: 'UserAddressLine2', value: userDetails.UserAddressLine2 },
				{ key: 'UserCity', value: userDetails.UserCity },
				{ key: 'UserStateId', value: { Text: userDetails.UserState, Value: userDetails.UserStateId } },
				{ key: 'UserZipCode', value: userDetails.UserZipCode },
				{ key: 'UserTimezoneId', value: { Text: userDetails.UserTimezone, Value: userDetails.UserTimezoneId.toString() } },
				{ key: 'LoginMethod', value: { Text: userDetails.LoginMethodName, Value: userDetails.LoginMethod.toString() } },
				{ key: 'UserName', value: userDetails.UserName },
				{ key: 'UserDataAccessRight', value: { Text: userDetails.DataAccessRightName, Value: userDetails.UserDataAccessRight } },
				{ key: 'RoleNo', value: { Text: userDetails.RoleName, Value: userDetails.RoleNo?.toString() } },
				{ key: 'PasswordExpiryDate', value: userDetails.PasswordExpiryDate },
				{ key: 'AcknowledgementAcceptedOnDate', value: userDetails.AcknowledgementAcceptedOnDate },
				{ key: 'IsAllSectorAccessible', value: userDetails.IsAllSectorAccessible },
				{ key: 'IsAllLocationAccessible', value: userDetails.IsAllLocationAccessible },
				{ key: 'ApplicabilityForMultipleSectors', value: userDetails.ApplicabilityForMultipleSectors }
			];

		formControls.forEach((control) => {
			const formControl = form.get(control.key);
			if (formControl) {
				formControl.setValue(control.value);
			}
		});
		currentObj.selectedLocationIndex = userDetails.UserLocationAccesses;
		currentObj.getSectorListData(userDetails.RoleGroupId);
		form.updateValueAndValidity();
		form.markAsPristine();
		form.markAsUntouched();
	}

	public getAlternateContactDetailsFormCOntrol(){
		return this.fb.group({
			UserAddressLine1: [null],
			UserAddressLine2: [null],
			UserCity: [null],
			UserStateId: [null],
			UserZipCode: [null],
			alternatePhoneNumber1: [null],
			alternatePhoneNumberExt1: [null],
			alternatePhoneNumber2: [null],
			alternatePhoneNumberExt2: [null],
			alternateEmail: [null, [this.customValidators.EmailValidator('PleaseEnterAValidAlternateEmailAddress')]]
		});
	}

	public resetAlternateContactDetailsForm(currentObj: any, form:FormGroup | any){
		if (!currentObj?.userDetails) {
			return;
		  }
		const userDetails = currentObj.userDetails,
		 formControls = [
				{ key: 'UserAddressLine1', value: userDetails.UserAddressLine1 },
				{ key: 'UserAddressLine2', value: userDetails.UserAddressLine2 },
				{ key: 'UserCity', value: userDetails.UserCity },
				{ key: 'UserStateId', value: { Text: userDetails.UserState, Value: userDetails.UserStateId.toString() } },
				{ key: 'UserZipCode', value: userDetails.UserZipCode },
				{ key: 'alternatePhoneNumber1', value: userDetails.AlternatePhoneNumber1 },
				{ key: 'alternatePhoneNumberExt1', value: userDetails.AlternatePhoneNumberExt1 },
				{ key: 'alternatePhoneNumber2', value: userDetails.AlternatePhoneNumber2 },
				{ key: 'alternatePhoneNumberExt2', value: userDetails.AlternatePhoneNumberExt2 },
				{ key: 'alternateEmail', value: userDetails.AlternateEmail }
		  ];
		formControls.forEach((control) => {
			const formControl = form.get(control.key);
			if (formControl) {
			  formControl.setValue(control.value);
			}
		  });
		form.updateValueAndValidity();
		form.markAsPristine();
		form.markAsUntouched();
	}


	public getPreferenceFormControl(){
		return this.fb.group({
			LandingPageId: [{Text: 'Home', Value: '/xrm/landing/home'}, [this.customValidators.RequiredValidator('SelectLandingPage')]],
			DateFormat: [null, [this.customValidators.RequiredValidator('PleaseSelectDateFormat')]],
			UserLanguageIdPreference: [null, [this.customValidators.RequiredValidator('PleaseEnterValueForLanguage')]],
			UserTimezoneIdPreference: [null, [this.customValidators.RequiredValidator('PleaseSelectDdlTimeZone')]],
			IsUserNameChange: [false],
			UserNameNew: [null],
			SystemNotification: new FormArray([]),
			SystemNotificationAllowed: [false],
			userSecQuestionsUpdateDtos: new FormArray([]),
			ProxyUserUpdateDtos: [],
			IsSelfRecord: [false]
		});
	}

	/* resetPreferenceForm(currentObj: any, form:FormGroup | any){
		if (!currentObj?.userDetails) {
			return;
		}
		const userDetails = currentObj.userDetails,
			formControls = [
				{ key: 'DateFormat', value: { Text: userDetails.DateFormat, Value: userDetails.DateFormat } },
				{ key: 'LandingPageId', value: { Text: userDetails.LandingPageName, Value: userDetails.LandingPageUrl } },
				{ key: 'UserLanguageIdPreference', value: { Text: userDetails.UserLanguage, Value: userDetails.UserLanguageId.toString() } },
				{ key: 'UserTimezoneIdPreference', value: { Text: userDetails.UserTimezone, Value: userDetails.UserTimezoneId.toString() } },
				{ key: 'SystemNotificationAllowed', value: userDetails.SystemNotificationAllowed },
				{ key: 'IsSelfRecord', value: userDetails.IsSelfRecord },
				{ key: 'UserNameNew', value: userDetails.UserName },
				{ key: 'IsUserNameChange', value: false },
				{ key: 'ProxyUserUpdateDtos', value: userDetails.ProxyUsers }
			];
		formControls.forEach((control) => {
			const formControl = form.get(control.key);
			if (formControl) {
				formControl.setValue(control.value);
			}
		});
		form.updateValueAndValidity();
		form.markAsPristine();
		form.markAsUntouched();

	}
		*/

	public getProxyUserForm(){
		return this.fb.group({
			ProxyOwnerNo: [null],
			ProxyUserNo: [null, [this.customValidators.RequiredValidator('SelectProxyUser')]],
			ProxyAuthorizationTypeIds: [null, [this.customValidators.RequiredValidator('SelectAuthorizedFor')]],
			StartDate: [null, [this.customValidators.RequiredValidator('EffectiveFromDateRequired')]],
			EndDate: [null, [this.customValidators.RequiredValidator('SelectToDate')]],
			Id: [magicNumber.zero],
			StatusId: [magicNumber.zero]
		});
	}


	// eslint-disable-next-line max-lines-per-function
	public createSectorControl(messageSector:string): FormGroup {
		return this.fb.group({
			ClientUserSectorAccessId: [magicNumber.zero],
			RecordUKey: [""],
			userNo: [magicNumber.zero],
			sectorId: [null, [this.customValidators.RequiredValidator(messageSector)]],
			sectorList: [[]],
			defaultLocationId: [null, [this.customValidators.RequiredValidator('PleaseSelectLocation')]],
			defaultOrgLevel1Id: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Organization Level 1', IsLocalizeKey: true }])]],
			orgLevel2Id: [null],
			orgLevel3Id: [null],
			orgLevel4Id: [null],
			NextLevelManagerId: [null],
			orgLevel1Label: ['OrgLevel1'],
			orgLevel2Label: ['OrgLevel2'],
			orgLevel3Label: ['OrgLevel3'],
			orgLevel4Label: ['OrgLevel4'],
			isorgLevel2Required: [false],
			isorgLevel3Required: [false],
			isorgLevel4Required: [false],
			isorgLevel2Visible: [false],
			isorgLevel3Visible: [false],
			isorgLevel4Visible: [false],
			defaultChargeId: [null],
			representativeTypeId: [null],
			staffingRepresentativeId: [null],
			reqPSRLiApprovalLimit: [null],
			rFxSowApprovalLimit: [null],
			isDefault: [false],
			primarysector: [null],
			role: [null],
			usercategory: [null],
			isshow: [false],
			userApprovalConfigurationDetailAddDtos: [[]],
			AppliesToAllOrgLevel1: [true],
			clientUserOrgLevel1AccessList: [[]],
			AppliesToAllLocation: [true],
			clientUserLocationAccessList: [[]],
			selectedTree: [[]],
			isValidTreeDataSelected: [true],
			userApprovalConfigurationDetail: new FormArray([]),
			org1List: [[]],
			org2List: [[]],
			org3List: [[]],
			org4List: [[]],
			locationList: [[]],
			chargeList: [[]],
			nextLevelManagerList: [[]],
			isRfxSowVisible: [null],
			udfFieldRecords: new FormGroup({})
		});
	}
	public createWorkflow(data: ApprovalConfigs) {
		return this.fb.group({
			XrmEntityId: [data.XrmEntityId],
			WorkflowName: [data.WorkflowName],
			ApprovalConfigs: new FormArray([])
		});
	}
	public createApproverConfig(data: ApprovalConfig) {
		return this.fb.group({
			ApproverConfigName: [data.ApproverConfigName],
			ApproverLabels: new FormArray([]),
			Id: [data.Id]
		});
	}
	public createApproverLabel(data: ApproverLabel) {
		return this.fb.group({
			ApproverLabel: [data.ApproverLabel],
			Id: [data.Id],
			IsSelected: [false]
		});
	}
	public createSecurityQuestionItems(id:number) {
		return this.fb.group({
			secQuestionId: [null, [this.customValidators.RequiredValidator('SelectSecurityQuestion')]],
			answer: [null, [this.customValidators.RequiredValidator('EnterAnswer'), this.customValidators.MinLengthValidator(magicNumber.three, 'MinimumCharactersLimit'), this.customValidators.MaxLengthValidator(magicNumber.forty, 'MaximumCharactersLimit')]],
			userNo: [null],
			isEyeClosed: [false],
			id: id
		});
	}
	/* createNotificationForm(data: any) {
		return this.fb.group({
			AutomatedNotifications: [{ Text: data?.Text, Value: data?.Value }],
			SelectedValue: [null]
		});
	}
		*/

	public userDetailsDataMapper(user:UserDetails, master:{usergroup:DropDownWithTextValue[], loginDetails:DataItem[], landingPage:LocationList[]}){

		const usergroup: DropDownWithTextValue = master.usergroup.filter((a: DropDownWithTextValue) =>
			a.Value == user.RoleGroupId)[0],
			loginDetails = master.loginDetails.filter((a: DataItem) =>
				parseInt(a.Value) == user.LoginMethod)[0],
			data = {
				UKey: user.UKey,
				UserFirstName: user.UserFirstName,
				UserLastName: user.UserLastName,
				UserMiddleName: user.UserMiddleName,
				UserAddressLine1: user.UserAddressLine1,
				UserAddressLine2: user.UserAddressLine2,
				UserZipCode: user.UserZipCode,
				UserCity: user.UserCity,
				UserNo: user.UserNo,
				UserStatus: user.UserStatus,
				IsAllSectorAccessible: user.IsAllSectorAccessible
					? true
					: false,
				IsSelfRecord: user.IsSelfRecord,
				IsAllLocationAccessible: user.IsAllLocationAccessible
					? true
					: false,
				ApplicabilityForMultipleSectors: user.ApplicabilityForMultipleSectors,
				phoneNumber: user.PhoneNumber,
				phoneNumberExt: user.PhoneNumberExt,
				RoleGroupId: { Text: usergroup?.Text, Value: usergroup?.Value?.toString() },
				CountryId: { Text: user.UserCountry, Value: user.CountryId?.toString() },
				UserStateId: { Text: user.UserState, Value: user.UserStateId?.toString() },
				UserTimezoneId: { Text: user.UserTimezone, Value: user.UserTimezoneId?.toString() },
				UserLanguageId: { Text: user.UserLanguage, Value: user.UserLanguageId?.toString() },
				LoginMethod: { Text: loginDetails?.Text, Value: loginDetails?.Value?.toString() },
				RoleNo: { Text: user.RoleName, Value: user.RoleNo?.toString() },
				PasswordExpiryDate: user?.PasswordExpiryDate,
				AcknowledgementAcceptedOnDate: user?.AcknowledgementAcceptedOnDate,
				UserDataAccessRight: { Text: user?.DataAccessRightName, Value: user?.UserDataAccessRight?.toString() }

			};

		return data;
	}

	public preferenceDataMapper(user:UserDetails){
		return {
			DateFormat: { Text: user.DateFormat, Value: user.DateFormat },
			UserTimezoneIdPreference: { Text: user.UserTimezone, Value: user.UserTimezoneId.toString() },
			LandingPageId: {Text: user.LandingPageName, Value: user.LandingPageUrl},
			UserLanguageIdPreference: { Text: user.UserLanguage, Value: user.UserLanguageId.toString() },
			SystemNotificationAllowed: user.SystemNotificationAllowed,
			ProxyUserUpdateDtos: user.ProxyUsers,
			IsSelfRecord: user.IsSelfRecord
		};
	}

	public sectorDetailsDataMapper(data:ClientUserSectorAccess){
		return {
			ClientUserSectorAccessId: data?.ClientUserSectorAccessId ?? magicNumber.zero,
			RecordUKey: data?.RecordUKey??"",
			sectorId: { Text: data?.SectorName, Value: data?.SectorId.toString() },
			defaultLocationId: { Text: data?.DefaultLocationName, Value: data?.DefaultLocationId.toString() },
			defaultChargeId: { Text: data?.DefaultCostAccountingCodeName, Value: data?.DefaultCostAccountingCodeId?.toString() },
			defaultOrgLevel1Id: { Text: data?.DefaultOrglevel1Name, Value: data?.DefaultOrgLevel1Id.toString() },
			orgLevel2Id: { Text: data?.OrgLevel2Name, Value: data?.OrgLevel2Id?.toString() },
			orgLevel3Id: { Text: data?.OrgLevel3Name, Value: data?.OrgLevel3Id?.toString() },
			orgLevel4Id: { Text: data?.OrgLevel4Name, Value: data?.OrgLevel4Id?.toString() },
			rFxSowApprovalLimit: data?.RFxSowApprovalLimit,
			reqPSRLiApprovalLimit: data?.ReqPSRLiApprovalLimit,
			isDefault: data?.IsDefault,
			NextLevelManagerId: { Text: data?.NextLevelManagerName, Value: data?.NextLevelManagerId?.toString() },
			AppliesToAllOrgLevel1: data?.AppliesToAllOrgLevel1
				? true
				: false,
			AppliesToAllLocation: data?.AppliesToAllLocation
				? true
				: false
		};
	}
	public alternateContactDetailsDataMapper(user:UserDetails){
		return {
			UserAddressLine1: user.UserAddressLine1,
			UserAddressLine2: user.UserAddressLine2,
			UserCity: user.UserCity,
			UserStateId: { Text: user.UserState, Value: user.UserStateId.toString() },
			UserZipCode: user.UserZipCode,
			alternateEmail: user.AlternateEmail,
			alternatePhoneNumber1: user.AlternatePhoneNumber1,
			alternatePhoneNumber2: user.AlternatePhoneNumber2,
			alternatePhoneNumberExt1: user.AlternatePhoneNumberExt1,
			alternatePhoneNumberExt2: user.AlternatePhoneNumberExt2
		};
	}

	public checkTabDirty(form: FormGroup, currentTab: string): boolean {
		if (currentTab === String(UserFormTab.UserDetails)) {
			const userDetailsForm = form.get('UserDetails') as FormGroup;
			if (
				userDetailsForm.dirty ||
        userDetailsForm.get('IsAllSectorAccessible')?.dirty ||
        userDetailsForm.get('IsAllLocationAccessible')?.dirty
			) {
				return false;
			}
			return true;
		}

		if (currentTab === String(UserFormTab.Sector)) {
			const sectorDetailsArray = form.get('SectorDetails') as FormArray;

			// eslint-disable-next-line one-var
			const isAnyControlDirty = sectorDetailsArray.controls.some((control: AbstractControl) =>
				control.dirty ||
        control.get('AppliesToAllOrgLevel1')?.dirty ||
        control.get('AppliesToAllLocation')?.dirty ||
        control.get('userApprovalConfigurationDetail')?.dirty ||
        control.get('udfFieldRecords')?.dirty);

			if (sectorDetailsArray.dirty || isAnyControlDirty) {
				return false;
			}
			return true;
		}
		return true;
	}


	public getcolumnOptionsProxy(){
		return [
			{
				columnHeader: "ProxyUser",
				fieldName: "ProxyUserName",
				visibleByDefault: true

			},
			{
				columnHeader: "AuthorizedFor",
				fieldName: "ProxyAuthorizationTypes",
				visibleByDefault: true

			},
			{
				columnHeader: "EffectiveDateRange",
				fieldName: "TimeFrame",
				visibleByDefault: true
			},
			{
				columnHeader: "Status",
				fieldName: "Status",
				visibleByDefault: true
			}
		];
	}
	public getTabOptionProxyGrid(){
		return {
			bindingField: 'Disabled',
			tabList: [
				{
					tabName: 'All',
					favourableValue: 'All',
					selected: true
				}
			]
		};
	}
}
