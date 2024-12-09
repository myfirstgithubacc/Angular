import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SVGIcon, eyeIcon } from '@progress/kendo-svg-icons';
import { GenericResponseBase, GenericResponseBaseWithValidationMessage } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ProxyUserStatuses, RoleGroup, Status, UserRole, UserStatus } from '@xrm-master/user/enum/enums';
import { IPerferenceForm } from '@xrm-master/user/interface/perference-form';
import { ActionSet, ColumnOption, DataItem, DropDownWithTextValue, LocationList, PreferenceUpdate, PreferenceUpdateData, ProxyAuthorizationType, ProxyUser } from '@xrm-master/user/interface/user';
import { DropdownData, LoggedInUserDetails, ProxyAuthorization, ProxyGrid, UserDetails, UserPreferenceUpdate, UserSecQuestionsUpdateDtos } from '@xrm-master/user/model/model';
import { UsersService } from '@xrm-master/user/service/users.service';
import { UsersDataService } from '@xrm-master/user/service/usersData.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { SecurityQuestion } from 'src/app/auth/user_activation/user_activation_interfaces';


@Component({
	selector: 'app-preference',
	templateUrl: './preference.component.html',
	styleUrls: ['./preference.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class PreferenceComponent implements OnInit, OnChanges {
	proxyUserForm: FormGroup;
	public userDefinedFieldData: ProxyUser[] | null | undefined = [];
	public userProxyGrid: ProxyGrid[] | null | undefined = [];
	private roleGroupId = sessionStorage.getItem('roleGroupId');
	public loggedInUserCode: string = '';
	@Input() inputProperties: {
		proxyuserList: DataItem[];
		userDetails: UserDetails;
		proxyAuthorizationTypesList: DataItem[];
		notificationoptionList: unknown[];
		notificationoptiondropdownList: DropDownWithTextValue[];
		securityQuestionList: SecurityQuestion[];
		landingPageList: LocationList[];
		timezonelist: DataItem[] | null | undefined;
		languageList: DataItem[];
		dateFormatList: DropdownData[];
		cancelNavigationUrl: string;
		isFromProfile: boolean;
	};
	@Output() onUpdatePreference: EventEmitter<PreferenceUpdateData>;
	// @Output() onChangeUserid: EventEmitter<any>;
	@Output() onChangeForm: EventEmitter<IPerferenceForm> = new EventEmitter<IPerferenceForm>();
	public preferenceForm: FormGroup;
	public isProxyEditMode: boolean = false;
	public userRole = UserRole;
	public eyeIcon: SVGIcon = eyeIcon;
	private isLoaded: boolean = false;
	private destroyAllSubscribtion$ = new Subject<void>();
	private isDublicateUserId: boolean = false;
	public pageSize = magicNumber.five;
	public tabOptions = this.usersDataService.getTabOptionProxyGrid();
	public columnOptions: ColumnOption[] = this.usersDataService.getcolumnOptionsProxy();
	public minStartDate = ((d: Date) =>
		new Date(d.setDate(d.getDate() - magicNumber.one)))(new Date());
	public minEndDate = ((d: Date) =>
		new Date(d.setDate(d.getDate() - magicNumber.one)))(new Date());


	private onEdit = (dataItem: ProxyUser) => {
		this.editProxySetup(dataItem);
	};

	public isAccessibleForMSPOrClient(): boolean {
		const { isFromProfile, userDetails } = this.inputProperties,
			{ RoleGroupId, UserCode } = userDetails || {};

		if (RoleGroupId === UserRole.Client) {
			if (isFromProfile) {
				return true;
			}
			if (this.roleGroupId === RoleGroup.MSP)
				return true;
			return UserCode === this.loggedInUserCode;
		}
		if (this.roleGroupId === RoleGroup.MSP) {
			if (isFromProfile) {
				return false;
			}
			return RoleGroupId === UserRole.Client;
		}

		if (this.roleGroupId === RoleGroup.StaffingAgency) {
			return false;
		}
		return false;
	}


	private onActiveChange = (dataItem: ProxyUser, action: string) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		if (action === Status.Cancel || action === Status.Activate) {
			const proxy = this.userDefinedFieldData?.find((user: ProxyUser) =>
				user.Id === dataItem.Id);
			if (proxy) {
				const statusId = action === Status.Cancel
					? ProxyUserStatuses.Cancelled
					: ProxyUserStatuses.Active,

					proxyUser: ProxyAuthorization = {
						StartDate: proxy.StartDate,
						EndDate: proxy.EndDate,
						Id: proxy.Id,
						ProxyOwnerNo: proxy.ProxyOwnerNo as number,
						ProxyUserNo: proxy.ProxyUserNo,
						StatusId: statusId,
						ProxyAuthorizationTypeIds: (proxy.ProxyAuthorizationTypes as ProxyAuthorizationType[])
							.map((a: ProxyAuthorizationType) =>
								Number(a.ProxyAuthorizationTypeId))
					};
				this.saveOrUpdateProxyUser(proxyUser, true);
			}
		}
	};


	public actionSet: ActionSet[] = [
		{
			Status: ProxyUserStatuses.Active,
			Items: [
				{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit },
				{
					icon: 'x',
					title: 'Cancel',
					color: 'red-color',
					fn: this.onActiveChange
				}
			]
		},
		{
			Status: ProxyUserStatuses.Upcoming,
			Items: [
				{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit },
				{
					icon: 'x',
					title: 'Cancel',
					color: 'red-color',
					fn: this.onActiveChange
				}
			]
		},
		{
			Status: ProxyUserStatuses.CancelledWithCurrentDate,
			Items: [
				{
					icon: 'check',
					title: 'Activate',
					color: 'green-color',
					fn: this.onActiveChange
				}
			]
		}
	];
	// eslint-disable-next-line max-params
	constructor(
		public route: Router,
		private cd: ChangeDetectorRef,
		private customValidators: CustomValidators,
		private usersService: UsersService,
		private localizationService: LocalizationService,
		private toasterService: ToasterService,
		public usersDataService: UsersDataService
	) {
		this.preferenceForm = this.usersDataService.getPreferenceFormControl();
		this.onUpdatePreference = new EventEmitter<PreferenceUpdateData>();
		this.proxyUserForm = this.usersDataService.getProxyUserForm();
	}

	ngOnInit(): void {
		this.preferenceForm.get('UserNameNew')?.valueChanges.pipe(debounceTime(magicNumber.oneThousandTwentyFour)).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: string) => {
			if (data) {
				this.setnCheckDublicateUserId(data);
			}
		});
		this.usersService.getLoginUserInfo()
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<LoggedInUserDetails>) => {
				if (response.Succeeded && response.Data) {
					this.loggedInUserCode = response.Data.Code;
					this.cd.detectChanges();
				}
			});

	}

	ngOnChanges(changes: SimpleChanges) {
		const userDetails = changes['inputProperties']?.currentValue?.userDetails,
			previousUserDetails = changes['inputProperties']?.previousValue?.userDetails;

		if (userDetails?.RoleGroupId > magicNumber.zero && !this.isUserDetailsUnchanged(userDetails, previousUserDetails)) {
			this.setOrResetDataInForm();
			this.onChangeForm.emit({ formGroup: this.preferenceForm, context: this });
		}
	}
	private isUserDetailsUnchanged(current: any, previous: any): boolean {
		return current?.RoleGroupId === previous?.RoleGroupId
			&& current?.IsSelfRecord === previous?.IsSelfRecord;
	}

	public setOrResetDataInForm(): void {
		const userDetails = this.inputProperties?.userDetails;
		this.preferenceForm.patchValue(this.usersDataService.preferenceDataMapper(userDetails));
		if (userDetails?.IsSelfRecord) {
			this.patchSecuritiesQuestion(userDetails.SecurityQuestionList);
		}
		if (userDetails?.RoleGroupId === Number(UserRole.Client) && !this.userDefinedFieldData?.length) {
			this.fetchProxyUserData(userDetails.UserNo);
		}
	}

	private fetchProxyUserData(userNo: number): void {
		if (!userNo) return;
		this.usersService.getProxyUserListByUserNo(userNo)
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<ProxyUser[]>) => {
				if (response?.Succeeded && response.Data) {
					this.userDefinedFieldData = response.Data;
					this.reShaperProxyUser(response.Data);
					this.getClientUser(userNo);
				}
			});
	}

	private getClientUser(userNo: number): void {
		if (!userNo) return;
		this.usersService.getproxyuserdropdownlist(userNo)
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<DataItem[]>) => {
				if (response.Succeeded && response.Data) {
					this.inputProperties.proxyuserList = response.Data;
				}
			});
	}


	private setnCheckDublicateUserId(userId: string) {
		this.usersService.checkDublicateUserName(userId).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBaseWithValidationMessage<boolean>) => {
				if (res.Succeeded && res.Data != null) {
					this.isDublicateUserId = res.Data;
				}
				this.cd.markForCheck();
			});
	}

	public addmoreSecurityQuestion(isAddCase: boolean, index: number) {
		const ques = this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray;
		if (isAddCase) {
			if ((this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).valid) {
				this.isLoaded = false;
				(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).push(this.usersDataService.createSecurityQuestionItems(ques.length));
				(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).markAsDirty();
			}
			else {
				(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).markAllAsTouched();

			}
		}
		else {
			(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).removeAt(index);
			(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).markAsDirty();
		}
	}

	public formGroup(a: AbstractControl): FormGroup {
		return a as FormGroup;
	}

	public get userSecQuestionsUpdateDtos() {
		return this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray;
	}

	public getSecurityQuestionUnique(id: string) {
		const SelectedQuestindex: number[] = [];
		(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).controls.forEach((x: AbstractControl) => {
			if (x.get('secQuestionId')?.value?.Value && x.get('secQuestionId')?.value?.Value != id) {
				const ind = this.inputProperties.securityQuestionList.findIndex((a: SecurityQuestion) =>
					a.Value == x.get('secQuestionId')?.value?.Value);
				SelectedQuestindex.push(ind);
			}
		});
		if (SelectedQuestindex.length > Number(magicNumber.zero)) {
			return this.inputProperties.securityQuestionList.filter((a: SecurityQuestion, ind: number) => {
				return SelectedQuestindex.indexOf(ind) == Number(magicNumber.minusOne);
			});
		}
		else {
			return this.inputProperties.securityQuestionList;
		}
	}
	private patchSecuritiesQuestion(SecurityQuestionSelected: SecurityQuestion[]) {
		this.preferenceForm.get('userSecQuestionsUpdateDtos')?.setValue([]);
		if (SecurityQuestionSelected?.length > Number(magicNumber.zero)) {
			SecurityQuestionSelected.forEach((data: SecurityQuestion, index: number) => {
				(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).push(this.usersDataService.createSecurityQuestionItems(index));
				const length = (this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).length,
					quesText = this.inputProperties.securityQuestionList.filter((a: SecurityQuestion) =>
						a.Value == data.QuestionId)[0]?.Text;
				(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).controls[length - magicNumber.one].get('secQuestionId')?.setValue({ Text: quesText, Value: data.QuestionId });
				(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).controls[length - magicNumber.one].get('answer')?.setValue(data.Answer);
			});
		}
		else {
			(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).push(this.usersDataService.createSecurityQuestionItems((this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).length));
			(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).push(this.usersDataService.createSecurityQuestionItems((this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).length));
		}
	}

	private editProxySetup(dataItem: ProxyUser) {
		const proxyUserNo = this.userDefinedFieldData
			?.find((user: ProxyUser) =>
				user?.Id === dataItem?.Id)
			?.ProxyUserNo ?? Number(magicNumber.minusOne);
		if (proxyUserNo !== Number(magicNumber.minusOne)) {
			const isProxyUserValid = this.inputProperties?.proxyuserList.some((user: DataItem) =>
				Number(user?.Value) === proxyUserNo) ?? false;

			if (!isProxyUserValid) {
				const proxyusername: DynamicParam[] = [
					{ Value: dataItem.ProxyUserName, IsLocalizeKey: false },
					{ Value: dataItem.ProxyUserName, IsLocalizeKey: false }
				];
				this.toasterService.showToaster(ToastOptions.Error, this.localizationService.GetLocalizeMessage('ErrorProxyUserRoleMismatch', proxyusername));
				return;
			}
		}

		this.proxyUserForm.markAsUntouched();
		// eslint-disable-next-line one-var
		const proxy = this.userDefinedFieldData?.find((user: ProxyUser) =>
			user.Id === dataItem.Id),
			ind = this.userDefinedFieldData?.findIndex((user: ProxyUser) =>
				user.Id === dataItem.Id) ?? Number(magicNumber.minusOne),
			endDateControl = this.proxyUserForm.get('EndDate');
		endDateControl?.clearValidators();
		endDateControl?.setValidators([this.customValidators.RequiredValidator('SelectToDate')]);
		endDateControl?.updateValueAndValidity();

		if (ind >= Number(magicNumber.zero) && proxy) {
			this.proxyUserForm.patchValue({
				ProxyUserNo: { Text: proxy.ProxyUserName, Value: proxy.ProxyUserNo.toString() },
				ProxyOwnerNo: proxy.ProxyOwnerNo,
				Id: proxy.Id,
				StatusId: proxy.StatusId,
				ProxyAuthorizationTypeIds: (proxy.ProxyAuthorizationTypes as ProxyAuthorizationType[]).map((type: ProxyAuthorizationType) =>
				({
					Value: type.ProxyAuthorizationTypeId.toString(),
					Text: this.localizationService.GetLocalizeMessage(type.ProxyAuthorizationType)
				})),
				StartDate: new Date(proxy.StartDate),
				EndDate: new Date(proxy.EndDate)
			});

			if (proxy.Id > Number(magicNumber.zero) && proxy.StatusId !== ProxyUserStatuses.Upcoming) {
				this.disableProxyUserFields();
				this.setMinEndDate(this.proxyUserForm.get('StartDate')?.value);
			}
		}

		this.isProxyEditMode = true;
	}

	private disableProxyUserFields(): void {
		this.proxyUserForm.get('StartDate')?.disable();
		this.proxyUserForm.get('ProxyUserNo')?.disable();
	}

	private setMinEndDate(startDate: Date): void {
		if (startDate) {
			this.minEndDate = new Date(startDate);
		}
	}


	public addValidationStartEndDate(control: string) {
		const start = new Date(this.proxyUserForm.get('StartDate')?.value)?.getTime(),
			end = new Date(this.proxyUserForm.get('EndDate')?.value)?.getTime(),
			startDate = this.proxyUserForm.get('StartDate')?.value;

		// If either start or end is null, clear validators on the changed control
		if (!start || !end) {
			this.proxyUserForm.get(control)?.clearValidators();
			this.proxyUserForm.get(control)?.updateValueAndValidity();
			return;
		}

		if (start == end) {
			this.proxyUserForm.get(control)?.clearValidators();
		}
		else if (start > end) {
			if (control === 'StartDate') {
				this.proxyUserForm.get('StartDate')?.addValidators([this.customValidators.RangeValidator(start, end, this.localizationService.GetLocalizeMessage('StartDateCannotGreaterThanEndDate'))]);
			} else if (control === 'EndDate') {
				this.proxyUserForm.get('EndDate')?.addValidators([this.customValidators.RangeValidator(start, end, this.localizationService.GetLocalizeMessage('EndDateCannotEarlierThanStartDate'))]);
			}
		} else {
			this.proxyUserForm.get(control)?.clearValidators();
		}

		// Update validity for the changed control
		this.proxyUserForm.get(control)?.updateValueAndValidity();

		// Set minimum end date if the start date has changed
		if (control === 'StartDate') {
			this.minEndDate = new Date(startDate);
			this.minEndDate.setDate(startDate.getDate() - magicNumber.one);
		}

	}


	public onchangeAuthorizationTypes(event: DataItem[]) {
		if (event) {
			const ind = event.findIndex((a: DataItem) =>
				a.Text == 'All');

			if (ind > Number(magicNumber.minusOne)) {
				this.proxyUserForm.get('ProxyAuthorizationTypeIds')?.setValue([event[ind]]);
			}
		}
		this.cd.detectChanges();
	}

	ngOnDestroy() {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.toasterService.resetToaster();
	}

	public onChangeUserIDSwitch(event: boolean) {
		if (event) {
			const minLength: DynamicParam[] = [{ Value: magicNumber.six.toString(), IsLocalizeKey: false }],
				maxLength: DynamicParam[] = [{ Value: magicNumber.fifty.toString(), IsLocalizeKey: false }];
			this.preferenceForm.get('UserNameNew')?.markAsPristine();
			this.preferenceForm.get('UserNameNew')?.addValidators([this.customValidators.RequiredValidator('EnterNewUserID'), this.customValidators.MinLengthValidator(magicNumber.six, 'MinimumCharacterslimitofLoginID', minLength), this.customValidators.MaxLengthValidator(magicNumber.fifty, 'MaximumCharacterslimitofLoginID', maxLength)]);
			this.preferenceForm.get('UserNameNew')?.updateValueAndValidity();
		}
		else {
			this.preferenceForm.get('UserNameNew')?.setValue(null);
			this.preferenceForm.get('UserNameNew')?.markAsUntouched();
			this.preferenceForm.get('UserNameNew')?.clearValidators();
			this.preferenceForm.get('UserNameNew')?.updateValueAndValidity();
			this.isDublicateUserId = false;
		}
	}

	private reShaperProxyUser(proxyUser: ProxyUser[] | null | undefined): void {
		this.userProxyGrid = proxyUser?.map((a: ProxyUser) => {
			const proxyAuthorizationTypesArray = (a.ProxyAuthorizationTypes as ProxyAuthorizationType[]).map((x: ProxyAuthorizationType) =>
			({
				Value: x.ProxyAuthorizationTypeId,
				Text: this.localizationService.GetLocalizeMessage(x.ProxyAuthorizationType)
			})),

				proxyAuthorizationTypesString = proxyAuthorizationTypesArray
					.map((v: { Text: string, Value: number }) =>
						this.localizationService.GetLocalizeMessage(v.Text))
					.filter(Boolean)
					.join(', '),

				reshapedProxyUser: ProxyGrid = {
					Id: a.Id,
					ProxyUserName: a.ProxyUserName,
					ProxyAuthorizationTypes: proxyAuthorizationTypesString || '',
					TimeFrame: `${this.localizationService.TransformDate(a.StartDate)} - ${this.localizationService.TransformDate(a.EndDate)}`,
					Status: a.Status,
					StatusId: a.StatusId
				};
			return reshapedProxyUser;
		});
		this.cd.detectChanges();
	}


	public addProxy() {
		this.proxyUserForm.get('StartDate')?.addValidators([this.customValidators.RequiredValidator('SelectFromDate')]);
		this.proxyUserForm.get('StartDate')?.updateValueAndValidity();
		if (this.proxyUserForm.valid) {
			const proxyUser = this.getProxyRecord();
			this.saveOrUpdateProxyUser(proxyUser, this.isProxyEditMode);
		}
		else {
			this.proxyUserForm.markAllAsTouched();
		}
	}

	private getProxyRecord(): ProxyAuthorization {
		const data = this.proxyUserForm.controls,
			proxyUser: ProxyAuthorization = {
				StartDate: data['StartDate'].value,
				EndDate: data['EndDate'].value,
				Id: this.isProxyEditMode ?
					Number(data['Id'].value) :
					Number(magicNumber.zero),
				ProxyOwnerNo: this.inputProperties.userDetails.UserNo,
				ProxyUserNo: Number(data['ProxyUserNo'].value.Value),
				StatusId: Number(data['StatusId'].value),
				ProxyAuthorizationTypeIds: data['ProxyAuthorizationTypeIds'].value?.map((a: { Text: string, Value: string }) =>
					Number(a.Value))
			};
		return proxyUser;
	}

	private saveOrUpdateProxyUser(proxyUser: ProxyAuthorization, isUpdate: boolean): void {
		this.usersService.saveOrUpdateProxyUser(proxyUser, isUpdate).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBaseWithValidationMessage<ProxyUser[]>) => {
				if (res.Succeeded) {
					this.userDefinedFieldData = res.Data;
					this.isProxyEditMode = false;
					this.proxyUserForm.enable();
					this.proxyUserForm.reset();
					this.reShaperProxyUser(res.Data);
				}
				else
					this.toasterService.showToaster(
						ToastOptions.Error,
						this.localizationService.GetLocalizeMessage((res.ValidationMessages ?? []).length > Number(magicNumber.zero)
							? (res.ValidationMessages ?? [])[0].ErrorMessage
							: res.Message)
					);
			});
	}

	public changePassword() {
		this.route.navigate(['/xrm/master/user/change-password']);
	}

	public Reset() {
		this.proxyUserForm.reset();
		this.proxyUserForm.enable();
		this.isProxyEditMode = false;
		this.minEndDate = ((d: Date) =>
			new Date(d.setDate(d.getDate() - magicNumber.one)))(new Date());
	}

	private formatDate(date: Date) {
		return `${new Date(date).getFullYear()}-${new Date(date).getMonth() + magicNumber.one > Number(magicNumber.nine)
			? new Date(date).getMonth() + magicNumber.one
			: `0${new Date(date).getMonth() + magicNumber.one}`

			}-${new Date(date).getDate() > Number(magicNumber.nine)
				? new Date(date).getDate()
				: `0${new Date(date).getDate()}`
			}T00:00:00`;
	}

	public onChangeSecurityQuestion(index: number) {
		(this.preferenceForm.get('userSecQuestionsUpdateDtos') as FormArray).controls[index]?.get('answer')?.setValue(null);
		this.preferenceForm.get('userSecQuestionsUpdateDtos')?.markAsDirty();
	}
	public onChangeSwitch(event: boolean) {
		this.cd.detectChanges();
		if (!event) {
			const notification = this.preferenceForm.get('SystemNotification') as FormArray;
			notification.controls.forEach((x: AbstractControl) => {
				x.get('SelectedValue')?.setValue({ Text: 'DoNotSendReminder', Value: '3' });
			});
		}
	}
	public updatePreference() {
		const data: UserPreferenceUpdate = this.usersDataService.PrepareUserPreferenceData(this.preferenceForm, this.inputProperties.userDetails);
		if (this.preferenceForm.valid) {
			if (!this.isDublicateUserId) {
				if (this.inputProperties.userDetails.IsSelfRecord) {
					const answer: string[] = [];
					data.UserSecQuestionsUpdateDtos?.map((a: UserSecQuestionsUpdateDtos) =>
						answer.push(a.answer.toLowerCase()));
					if (this.checkDuplicate(answer)) {
						this.toasterService.showToaster(ToastOptions.Error, "UniqueAnswerForQuestions");
					}
					else {
						this.preferenceForm.updateValueAndValidity();
						this.preferenceForm.markAsPristine();
						this.preferenceForm.markAsUntouched();
						this.updatePreferences(data);
					}
				}
				else {
					this.preferenceForm.updateValueAndValidity();
					this.preferenceForm.markAsPristine();
					this.preferenceForm.markAsUntouched();
					this.updatePreferences(data);
				}
			}
			else {
				this.toasterService.showToaster(ToastOptions.Error, 'LoginIdExistsUserDifferentLoginId');
			}
		}
		else {
			this.preferenceForm.markAllAsTouched();
		}
	}
	private updatePreferences(data: UserPreferenceUpdate) {
		this.usersService.updateuserpreference(data).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<PreferenceUpdate>) => {
				if (res?.Succeeded) {
					this.preferenceForm.markAsPristine();
					this.onUpdatePreference.emit(this.getPreferenceData(res));
					if (res.Data?.UserName) {
						this.inputProperties.userDetails.UserName = res.Data?.UserName;
					}
					this.toasterService.showToaster(ToastOptions.Success, 'PreferencesUpdatedSuccessfully');
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, res?.Message);
				}
			});
	}

	public getPreferenceData(res: GenericResponseBase<PreferenceUpdate>) {
		const userName = res.Data?.UserName ?? '',
			userTimezoneText = res.Data?.UserTimezone ?? '',
			userTimezoneValue = res.Data?.UserTimezoneId?.toString() ?? '',
			userLanguageText = res.Data?.UserLanguage ?? '',
			userLanguageValue = res.Data?.UserLanguageId?.toString() ?? '';

		return {
			UserName: userName,
			UserTimezone: {
				Text: userTimezoneText,
				Value: userTimezoneValue
			},
			UserLanguageId: {
				Text: userLanguageText,
				Value: userLanguageValue
			}
		};
	}

	public removeToaster() {
		const lastToaster = this.toasterService.data[this.toasterService.data.length - magicNumber.one];
		if (lastToaster && (lastToaster.cssClass === 'alert__danger' || lastToaster.cssClass === 'alert__success')) {
			// Reset the toaster with the specified toasterId
			this.toasterService.resetToaster(lastToaster.toasterId);
		}
	}
	public Cancel() {
		this.removeToaster();
		this.route.navigate([this.inputProperties.cancelNavigationUrl]);
	}

	public ShowButtonEnableDisable() {
		const form = this.preferenceForm as FormGroup;
		if (form.get('LandingPageId')?.dirty || form.get('UserLanguageIdPreference')?.dirty ||
			form.get('UserTimezoneIdPreference')?.dirty || form.get('DateFormat')?.dirty
			|| form.get('SystemNotificationAllowed')?.dirty || form.get('IsUserNameChange')?.dirty
			|| form.get('UserNameNew')?.dirty || form.get('userSecQuestionsUpdateDtos')?.dirty
			|| form.get('ProxyUserUpdateDtos')?.dirty
		) {
			return false;
		}
		else {
			return true;
		}
	}
	private checkDuplicate(arr: string[]): boolean {
		for (let i = 0; i < arr.length; i++) {
			for (let j = i + magicNumber.one; j < arr.length; j++) {
				if (arr[i] == arr[j]) {
					return true;
				}
			}
		}
		return false;
	}

}
