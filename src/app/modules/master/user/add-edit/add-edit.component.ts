/* eslint-disable indent */
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { TabItems, UsersService } from '../service/users.service';
import { Subject, debounceTime, forkJoin, of, takeUntil } from 'rxjs';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { OrgType, UserConstants, UserDataAccessRight, UserFormTab, UserRole, UserStatus } from '../enum/enums';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LoggedInUserDetails, UserDetails } from '../model/model';
import { UserActivationService } from 'src/app/auth/services/user-activation.service';
import { UsersDataService } from '../service/usersData.service';
import { HeaderService } from '@xrm-shared/services/header.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { StringConstant } from '@xrm-shared/services/common-constants/string-constant';
import { RoleGroupMessages } from '../enum/role-group-messages';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { IPerferenceForm } from '../interface/perference-form';
import { CommonService } from '@xrm-shared/services/common.service';
import { AllLocationList, DropDownWithTextValue, LocationList, OrganizationDetail, Record, UdfData, locationSectorGroupingList, TabItem, DropDownWithTextValueBoolean, ButtonSet, StatusData, RoleGroupId, DialogButton, DataItem, EventObject, ApprovalConfigs, ApprovalConfig, UserApprovalConfigurationDetail, ApproverLabel, ApprovalConfigChangeEvent, ApiResponseUpdate, ApiResponse, UserStatusChange, User, ClientUserSectorAccess, EventDetails, TreeCheckedRootObject, TreeChecked, UserLocationAccess, PreferenceUpdateData, UserStaffingAgencyDetails, UserOrgLevel1Accesses, IconDetail, tabValue, OrgLevelConfig, SectorControlData } from '../interface/user';
import { GenericResponseBase, GenericResponseBaseWithValidationMessage } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SecurityQuestion } from 'src/app/auth/user_activation/user_activation_interfaces';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AddEditComponent implements OnInit, OnDestroy {
	public addEditEventReasonForm: FormGroup;
	private isLocked: boolean = false;
	public isStaffingAgencyUserLogin: boolean = false;
	public isDublicateUserID: boolean = false;
	public isEditMode: boolean = false;
	public disableResendActivationLinkButton: boolean = false;
	public userDetails: UserDetails;
	public timezonelist: DataItem[] | null | undefined;
	public languageList: DataItem[];
	public homeCountrylist: DataItem[] | null | undefined;
	public userRoleList: DataItem[];
	public homeStatelist: DataItem[];
	public allSectorList: DataItem[];
	public staffingAgencyList: DataItem[];
	public dataAccessList: DataItem[] = [];
	public loginList: DataItem[];
	public proxyAuthorizationTypesList: DataItem[] = [];
	public dateFormatList: DataItem[];
	public userCategory: DataItem[];
	public securityQuestionList: SecurityQuestion[] = [];
	public proxyuserList: DataItem[] = [];
	public userRoleEnum = UserRole;
	public userFormTab = UserFormTab;
	public CurrentTab: string = UserFormTab.UserDetails;
	public entityId = XrmEntities.Users;
	public SectorLabel: string = UserConstants.SectorText;
	public uKey: string = '';
	public entityType = '';
	public recordId: string = '';
	public profilePic: string = 'assets/images/users/3.jpg';
	public udfData: IPreparedUdfPayloadData[][] = [];
	public zipLabel: string = StringConstant.zipCode;
	private timeoutId: number | null;
	public selectedLocationIndex: locationSectorGroupingList[] = [];
	public selectedKey: string[] = [];
	public selectedKeyLocation: string[] = [];
	public selectedActionList = [];
	public userTypeList: DropDownWithTextValue[];
	public allLocationList: AllLocationList[];
	public locationSectorGroupingList: locationSectorGroupingList[] = [];
	public landingPageList: LocationList[];
	public notificationoptiondropdownList: DropDownWithTextValue[];
	private orgLevelConfigurationList: OrganizationDetail[] = [];
	public tabList: TabItem[];
	public nextTab: IconDetail | undefined;
	public accessLocationRadioGroupList: DropDownWithTextValueBoolean[];
	public accessSectorRadioGroupList: DropDownWithTextValueBoolean[];
	public buttonSet: ButtonSet[] = [];
	public addEditUsersForm: FormGroup;
	public roleGroupId: number = magicNumber.four;
	private destroyAllSubscribtion$ = new Subject<void>();
	private isEmailValid: boolean = false;
	public statusData: StatusData = {
		items: []
	};
	private preferenceComponent: IPerferenceForm;
	public stateLabel: string = StringConstant.state;
	private updatedTablist: TabItem[] = [];

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		private route: Router,
		private headerService: HeaderService,
		public usersService: UsersService,
		private customValidators: CustomValidators,
		private activatedRoute: ActivatedRoute,
		private commonHeaderIcon: CommonHeaderActionService,
		private localizationService: LocalizationService,
		private eventLog: EventLogService,
		private toasterService: ToasterService,
		private userActivationService: UserActivationService,
		public usersDataService: UsersDataService,
		private dialogService: DialogPopupService,
		private sessionStorage: SessionStorageService,
		private cd: ChangeDetectorRef,
		private commonGridViewService: CommonService
	) { }


	ngOnInit(): void {
		this.usersService.resetAPICall();
		this.createForm();
		this.setHardCodedData();
		if (this.activatedRoute.snapshot.params['id']) {
			this.uKey = this.activatedRoute.snapshot.params['id'];
		}
		this.initiateSubscription();
		this.setValueChanges();
	}

	createForm() {
		this.addEditEventReasonForm = this.fb.group({
			status: [null]
		});
		this.addEditUsersForm = this.fb.group({
			UserDetails: this.usersDataService.getUserDetailsFormControl(),
			SectorDetails: new FormArray([]),
			AlternateContactDetails: this.usersDataService.getAlternateContactDetailsFormCOntrol()
		});
	}

	setHardCodedData() {
		this.dataAccessList = [];
		this.dateFormatList = this.usersService.getdateFormatListHardCoded();
		this.tabList = this.usersService.getTabListHardCoded();
		this.userCategory = this.usersService.getuserCategoryHardCoded();
		this.accessLocationRadioGroupList = this.usersService.getaccessLocationRadioGroupListHardCoded();
		this.accessSectorRadioGroupList = this.usersService.getaccessSectorRadioGroupListHardCoded();
		this.userTypeList = this.usersService.getUserTypeListHardCoded();
		this.userDetails = new UserDetails();
		this.usersService.resetAPICall();
	}

	OnAlternateContactSave(e: boolean) {
		if (e) {
			this.updateAlternateContactDetails();
		}
	}


	// eslint-disable-next-line max-lines-per-function
	private initiateSubscription() {
		this.usersService.getRolegroupId().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: RoleGroupId | null) => {
			if (data?.roleGroupId) {
				 this.roleGroupId = data.roleGroupId;
        this.sessionStorage.set("CurrentRoleGroupId", JSON.stringify(data));
        this.getUserType(data);
			}
		else {
        const storedData = this.sessionStorage.get("CurrentRoleGroupId");
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            this.roleGroupId = parsedData.roleGroupId;
            this.getUserType(parsedData);
        } else {
            this.roleGroupId = magicNumber.zero;
            this.getUserType({ roleGroupId: this.roleGroupId, staffingAgency: null });
        }
    }
			this.dropdownApiCall();
		});

		this.usersService.getAPICallObservable().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response: TabItems[]) => {
			const index = response.findIndex((x: TabItems) =>
				x.tab == this.CurrentTab);
			if (this.isEditMode) {
				const isDirty = this.checkAndUpdateUserDirtyState();
				if (isDirty == undefined) return;

			}
			if (response[index]?.value == Number(magicNumber.zero)) {
				if (response[index]?.tab == String(UserFormTab.Sector)) {
					this.getSectorDetails(this.userDetails.RoleGroupId);
				}
				if (response[index]?.tab == String(UserFormTab.AlternateContactDetails)) {
					this.getAlternateData();
				}
				if (response[index]?.tab == String(UserFormTab.Preferences)) {
					this.getPreferenceData();
				}
			}
		});

		this.dialogService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: DialogButton) => {
			if (data.value == Number(magicNumber.three)) {
				this.UpdateUser();
				this.addEditUsersForm.updateValueAndValidity();
				this.addEditUsersForm.markAsPristine();
				this.addEditUsersForm.markAsUntouched();
				if (this.nextTab) this.selectedTapEvent(this.nextTab);
			}
			else if (data.value == Number(magicNumber.four)) {
				this.addEditUsersForm.markAsUntouched();
				this.resetForm();
				if (this.nextTab) this.selectedTapEvent(this.nextTab);
			}
		});
	}

	resetForm() {
		if (this.CurrentTab == String(UserFormTab.UserDetails)) {
			this.usersDataService.resetUserDetailsForm(this, this.addEditUsersForm.get("UserDetails"));
			if (this.roleGroupId === Number(UserRole.StaffingAgency) || this.roleGroupId === Number(UserRole.MSP)) {
				this.selectedKey = [];
				this.selectedKeyLocation = [];
				this.locationSectorGroupingList = [];
				this.allSectorList = [];
				this.allLocationList = [];
				this.getSectorListData(this.userDetails.RoleGroupId);
			}
		}
		else if (this.CurrentTab == String(UserFormTab.Sector)) {
			this.getSectorDetails(this.userDetails.RoleGroupId);
			this.addEditUsersForm.get('SectorDetails')?.markAsPristine();
			this.addEditUsersForm.get('SectorDetails')?.markAsUntouched();
		}
		else if (this.CurrentTab == String(UserFormTab.AlternateContactDetails))
			this.usersDataService.resetAlternateContactDetailsForm(this, this.addEditUsersForm.get('AlternateContactDetails'));
		else if (this.CurrentTab == String(UserFormTab.Preferences)) {
			this.preferenceComponent.context.setOrResetDataInForm();
			this.preferenceComponent.formGroup.updateValueAndValidity();
			this.preferenceComponent.formGroup.markAsPristine();
			this.preferenceComponent.formGroup.markAsUntouched();
		}
	}

	setValueChanges() {
		this.addEditUsersForm.get('UserDetails')?.get('UserName')?.valueChanges.pipe(debounceTime(magicNumber.oneThousandTwentyFour)).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: string) => {
			if (data) {
				this.checkUseridDublicacy(data);
			}
		});

		this.addEditUsersForm.get('UserDetails')?.get('Email')?.valueChanges.pipe(debounceTime(magicNumber.oneThousandTwentyFour)).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: string) => {
			if (data) {
				this.onChangeEmail(data);
				if (this.roleGroupId != Number(UserRole.StaffingAgency)) {
					this.checkEmailDomain(data);
				}
        else
        this.isEmailValid=true;
			}
		});
	}


	private checkEmailDomain(email: string) {
		this.usersService.checkEmailDomain({ Email: email }).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<boolean>) => {
				this.isEmailValid = data.Succeeded;
			});
	}

	private dropdownApiCall() {
		if (this.addEditUsersForm.get('UserDetails')?.get('RoleGroupId')?.value === null && this.uKey == '') {
			this.route.navigate([`/xrm/master/user/list`]);
		}
		else
			forkJoin([
				this.usersService.getTimeZone(),
				this.usersService.getCountryList()
			]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<DataItem[]>[]) => {
				if (data.length > Number(magicNumber.zero)) {
					this.timezonelist = data[0]?.Data;
					this.homeCountrylist = data[1]?.Data;
					if (this.uKey) {
						this.getUserDetails(this.uKey);
					}
					else {
						this.onChangeUserGroup({ Value: this.addEditUsersForm.get('UserDetails')?.get('RoleGroupId')?.value?.Value });
					}
				}
			});
	}
	private getUserType(data: RoleGroupId) {
		if (this.roleGroupId == Number(UserRole.Client)) {
			this.addRequiredValidatorOnControl('UserDetails', 'UserDataAccessRight', 'SelectDataAccessRights');
		}

		if (this.roleGroupId == Number(UserRole.StaffingAgency)) {
			this.isEmailValid = true;
			this.addRequiredValidatorOnControl('UserDetails', 'StaffingAgencyId', 'SelectValueForStaffingAgency');
		}

		if (Number(window.sessionStorage.getItem('RoleGroupId')) == Number(UserRole.StaffingAgency)) {
			if(data){
				this.isStaffingAgencyUserLogin = true;
				this.usersService.getLoginUserInfo().pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((data1: GenericResponseBase<LoggedInUserDetails>) => {
				data.staffingAgency = {Text: data1?.Data?.StaffingAgencyName, Value: data1?.Data?.StaffingAgencyId};
				this.staffingAgencyList = [{Text: String(data?.staffingAgency?.Text), Value: String(data?.staffingAgency?.Value)}];
			this.addEditUsersForm.get('UserDetails')?.get('StaffingAgencyId')?.setValue(this.staffingAgencyList[0]);
			this.getSectorListData(Number(this.addEditUsersForm.get('UserDetails')?.get('RoleGroupId')?.value?.Value));
			});
			}
			this.onChangeStaffingAgency(data?.staffingAgency?.Value as string);
		}
		const ind = this.userTypeList.findIndex((x: DropDownWithTextValue) =>
			x.Value == data?.roleGroupId);
		if (ind > Number(magicNumber.minusOne)) {
			this.addEditUsersForm.get('UserDetails')?.get('RoleGroupId')?.setValue(this.userTypeList[ind]);
			this.showAllTab();
		}
	}

	private addRequiredValidatorOnControl(formGroupName: string, controlName: string, message: string) {
		this.addEditUsersForm.get(formGroupName)?.get(controlName)?.addValidators([this.customValidators.RequiredValidator(message)]);
		this.addEditUsersForm.get(formGroupName)?.get(controlName)?.updateValueAndValidity();
	}

	private clearValidator(controlName: FormControl) {
		controlName.clearValidators();
		controlName.updateValueAndValidity();
	}

	private onActivate = () => {
		this.updateRecord([
			{
				uKey: this.userDetails.UKey, Status: this.userDetails.UserStatus == Number(UserStatus.Inactive)
					? UserStatus.Active
					: UserStatus.Inactive, reasonForChange: ""
			}
		]);
	};


	onLock = () => {
		this.usersService.lockUser({ userNo: this.userDetails?.UserNo, locked: !this.isLocked }).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: ApiResponseUpdate) => {
				if (res.Succeeded) {
					this.isLocked = !this.isLocked;
					if (this.userDetails?.RoleGroupId == Number(UserRole.Client)) {
						this.toasterService.showToaster(ToastOptions.Success, this.isLocked
							? 'ClientUserHasBeenLockedSuccessfully'
							: 'ClientUserHasBeenUnlockedSuccessfully');
					}
					if (this.userDetails?.RoleGroupId == Number(UserRole.MSP)) {
						this.toasterService.showToaster(ToastOptions.Success, this.isLocked
							? 'MSPUserHasBeenLockedSuccessfully'
							: 'MSPUserHasBeenUnlockedSuccessfully');
					}
					if (this.userDetails?.RoleGroupId == Number(UserRole.StaffingAgency)) {
						this.toasterService.showToaster(ToastOptions.Success, this.isLocked
							? 'StaffingAgencyUserHasBeenLockedSuccessfully'
							: 'StaffingUserHasBeenUnlockedSuccessfully');
					};
					this.getActionSet();
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, this.localizationService.GetLocalizeMessage(res?.Message));
				}
				this.cd.markForCheck();
			});
	};


	getActionSet() {
		this.buttonSet = [
			{
				status: "Active",
				items: !this.isLocked
					? this.commonHeaderIcon.commonActionSetOnEditActive(this.onActivate, this.usersService.onLockObject(this))
					: this.commonHeaderIcon.commonActionSetOnEditActive(this.onActivate, this.usersService.onUnlockObject(this))
			},

			{
				status: "Inactive",
				items: !this.isLocked
					? this.commonHeaderIcon.commonActionSetOnDeactive(this.onActivate, this.usersService.onLockObject(this))
					: this.commonHeaderIcon.commonActionSetOnDeactive(this.onActivate, this.usersService.onUnlockObject(this))
			}
		];
	}


	private getapprovalconfigdata(sectorid: number, index: number) {
		this.usersService.getapprovalconfigdata(sectorid).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((data: GenericResponseBase<ApprovalConfigs[]>) => {
				const workflow: FormArray = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index]?.get('userApprovalConfigurationDetail') as FormArray;
				workflow.setValue([]);
				if (data.Data) {
					data.Data.forEach((a: ApprovalConfigs, i: number) => {
						workflow.push(this.usersDataService.createWorkflow(a));
						a.ApprovalConfigs.forEach((b: ApprovalConfig, j: number) => {
							const ApproverConfigName: FormArray = workflow?.controls[i]?.get('ApprovalConfigs') as FormArray;
							ApproverConfigName.push(this.usersDataService.createApproverConfig(b));
							this.getApproverLabel(b, j, ApproverConfigName);
						});
					});
				}

				if (this.userDetails.UserApprovalConfigurationDetails?.length > magicNumber.zero) {
					const sectorId = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index]?.get('sectorId')?.value?.Value,
						check = this.userDetails.UserApprovalConfigurationDetails.findIndex((x: UserApprovalConfigurationDetail) =>
							x.SectorId == sectorId),
						approvalData = this.userDetails.UserApprovalConfigurationDetails.filter((x: UserApprovalConfigurationDetail) =>
							x.SectorId == sectorId);
					if (check > magicNumber.minusOne && approvalData?.length > magicNumber.zero) {
						this.patchApprovalConfiguration(approvalData, index);
					}
				}
			});
	}

	private getApproverLabel(approverConfig: ApprovalConfig, index: number, approverConfigName: FormArray) {
		approverConfig.ApproverLabels.forEach((c: ApproverLabel) => {
			const ApprovalLabel = approverConfigName?.controls[index]?.get('ApproverLabels') as FormArray;
			ApprovalLabel.push(this.usersDataService.createApproverLabel(c));
		});
	}

	public onChangeApprovalConfiguration(data: ApprovalConfigChangeEvent) {
		(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[data.sectorindex].get('userApprovalConfigurationDetail')?.markAsDirty();
		const sector = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[data.sectorindex].get("userApprovalConfigurationDetail");
		(sector as FormArray).controls.map((a: AbstractControl) => {
			const approvalConfigs: FormArray = a.get('ApprovalConfigs') as FormArray;
			approvalConfigs.controls.map((b: AbstractControl) => {
				const ind = b.get('ApproverLabels') as FormArray,
					d = ind.controls.findIndex((c: AbstractControl) =>
						c.get('Id')?.value == data.data.Id);
				if (d > Number(magicNumber.minusOne)) {
					ind.controls[d].get('IsSelected')?.setValue((data.event));
				}
			});
		});
	}

	public onDisableResendActivationLinkButton(isClicked: boolean) {
		this.usersService.resendActivationLink(this.userDetails.UserId).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: ApiResponseUpdate) => {
				this.disableResendActivationLinkButton = true;
				if (data.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, 'AccountActivationEmailSent', [{ IsLocalizeKey: true, Value: this.userDetails.UserEmail }]);
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, data?.Message);
				}
        this.cd.markForCheck();
        this.cd.detectChanges();
			});
	}

	private enableAllSideTab() {
		this.updatedTablist = this.tabList.map((tab: TabItem) => {
			tab.isDisabled = false;
			return tab;
		});
		this.tabList = [...this.updatedTablist];
	}

	onAddNewSector() {
		if ((this.addEditUsersForm.get('SectorDetails') as FormArray).valid) {
			this.addNewSectorItem();
			this.sectortabClick(this.addEditUsersForm.get('SectorDetails')?.value?.length - magicNumber.one);
		}
		else {
			const me = `${this.localizationService.GetLocalizeMessage('PleaseSelect')} ${this.localizationService.GetLocalizeMessage(this.SectorLabel)}.`;
			(this.addEditUsersForm.get('SectorDetails') as FormArray).controls.map((x: AbstractControl) => {
				x.get('sectorId')?.setValidators(this.customValidators.RequiredValidator(me));
				x.get('sectorId')?.updateValueAndValidity();
			});
			(this.addEditUsersForm.get('SectorDetails') as FormArray).markAllAsTouched();
			this.showValidationMessageOfSectorOnToast();
		}
	}
	addNewSectorItem(): void {
		const me = `${this.localizationService.GetLocalizeMessage('PleaseSelect')} ${this.localizationService.GetLocalizeMessage(this.SectorLabel)}.`;
		(this.addEditUsersForm.get('SectorDetails') as FormArray).push(this.usersDataService.createSectorControl(me));
		if ((this.addEditUsersForm.get('SectorDetails') as FormArray).controls.length == Number(magicNumber.one)) {
			(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[0]?.get('isshow')?.setValue(true);
			if (!this.isEditMode) {
				(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[0]?.get('isDefault')?.setValue(true);
			}
		}
	}
	sectortabClick(i: number) {
		(this.addEditUsersForm.get('SectorDetails') as FormArray).controls.forEach((control: AbstractControl) => {
			control?.get('isshow')?.setValue(false);
		});
		(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[i].get('isshow')?.setValue(true);
	}

	onChangeSectorDropdown(x: EventObject) {
		if (Number(x?.event?.Value)) {
			this.sectorOrgConfig(x?.event?.Value, x?.index);
			this.getapprovalconfigdata(x?.event?.Value, x.index);
			(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[x?.index]?.get('selectedTree')?.setValue([]);
		}
		else {
			this.removeValidatorsOnSector();
			this.setDefaultSectorControlValue(x?.index);
		}

	}
	private setDefaultSectorControlValue(index: number) {

		const sectorControl = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index];
		sectorControl.get('org1List')?.setValue([]);
		sectorControl.get('orgLevel1Label')?.setValue('Organization Level 1');
		sectorControl.get('defaultOrgLevel1Id')?.setValue(null);
		sectorControl.get('defaultLocationId')?.setValue(null);
		sectorControl.get('locationList')?.setValue([]);
		sectorControl.get('isorgLevel2Visible')?.setValue(false);
		sectorControl.get('isorgLevel3Visible')?.setValue(false);
		sectorControl.get('isorgLevel4Visible')?.setValue(false);
		sectorControl.get('defaultChargeId')?.setValue(null);
		sectorControl.get('NextLevelManagerId')?.setValue(null);
		sectorControl.get('isRfxSowVisible')?.setValue(false);
	}

	private getDropdownRecordBySectorId(sectorId: number, index: number) {
		forkJoin([
			this.usersService.getorg1bySectorid(sectorId),
			this.usersService.getlocationbySectorid(sectorId),
			this.usersService.getchargeDropdown(sectorId),
			this.usersService.checkRfxSow(sectorId),
			this.usersService.getNextLevelManagerList(sectorId)
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((data: SectorControlData) => {
				if (data.length > 0 && data[0]?.Data) {
					if (data[0]?.Data?.length > 0) {
						data[0]?.Data?.map((x: DataItem, i: number) => {
							x.Index = i.toString();
						});
					}

					if (data[1]?.Data && data[1]?.Data?.length > Number(magicNumber.zero)) {
						data[1]?.Data?.map((x: DataItem, i: number) => {
							x.Index = i.toString();
						});
					}
					if (this.isEditMode) {
						data[4].Data = data[4].Data?.filter((a: DataItem) =>
							a.Value != String(this.userDetails.UserNo));
					}
					if (data[4].Data)
						this.proxyAuthorizationTypesList = data[4].Data;
					this.setSectorControlValues(index, data);
					this.bindSectorTabTree();
					this.cd.markForCheck();
				}
			});
	}


	private setSectorControlValues(index: number, data: SectorControlData) {
		const sectorControl = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index];
		sectorControl.get('org1List')?.setValue(data[0].Data);
		sectorControl.get('locationList')?.setValue(data[1].Data);
		sectorControl.get('chargeList')?.setValue(data[2].Data);
		sectorControl.get('isRfxSowVisible')?.setValue(data[3].Data);
		sectorControl.get('nextLevelManagerList')?.setValue(data[4].Data);
	}


	private updateRecord(data: UserStatusChange[]) {
		this.usersService.activateRoleAndDeactivate(data).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((a: GenericResponseBase<UserStatusChange>) => {
				if (a.Succeeded) {
					const status = data[0].Status;
					if (status == Number(UserStatus.Active) || status == Number(UserStatus.Inactive)) {
						this.userDetails.UserStatus = status;
						this.userDetails.NormalizedUserStatus = status === Number(UserStatus.Active) ?
							'Active' :
							'Inactive';
					}
					this.showStatusToaster(this.roleGroupId, status);
					this.getCommonHeaderData();
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, a?.Message);
				}
				this.cd.markForCheck();
			});
	}

	private showStatusToaster(roleGroupId: number, userStatus: UserStatus) {
		const message = RoleGroupMessages.getMessage(roleGroupId, userStatus);
		if (message) {
			this.toasterService.showToaster(ToastOptions.Success, message);
		}
	}

	getUserStatus() {
		return this.userDetails.NormalizedUserStatus == 'Active'
			? 'Active'
			: 'Inactive';
	}

	private updateEventLog() {
		this.eventLog.recordId.next(this.userDetails.UserNo);
		this.eventLog.entityId.next(XrmEntities.Users);
		this.eventLog.isUpdated.next(true);
	}

	private updateStateLabel(countryId: string) {
		this.stateLabel = this.localizationService.GetCulture(CultureFormat.StateLabel, countryId);
		this.zipLabel = this.localizationService.GetCulture(CultureFormat.ZipLabel, countryId);
	}

	private getUserDetails(id: string) {
		this.usersService.getUserDetailsbyUserNumber(id).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((data: GenericResponseBase<UserDetails>) => {
				if (data.Succeeded) {
					const userDetailsControl = this.addEditUsersForm.get("UserDetails") ?? null;
					if (userDetailsControl) {
						const userNameControl = userDetailsControl.get('UserName');
						if (userNameControl) {
							userNameControl.clearValidators();
							userNameControl.updateValueAndValidity();
						}
					}
					this.setDataForAllUsers(data, id);
					if (this.roleGroupId == Number(UserRole.StaffingAgency)) {
						this.setStaffingDetails(data);
					}
					if (this.roleGroupId == Number(UserRole.Client)) {
						this.setClientUserDetailsValidators();
					}
				}
			});
	}

	private setDataForAllUsers(data: GenericResponseBase<UserDetails>, id: string) {
		if (data.Data) {
			this.userDetails = data.Data;
			this.addEditUsersForm.get('UserDetails')?.get('RoleGroupId')?.setValue({ Value: this.userDetails.RoleGroupId.toString() });
			this.getCommonHeaderData();
			this.updateStateLabel(this.userDetails.CountryId);
			this.setLanguageList(this.userDetails.CountryId);
			this.roleGroupId = this.userDetails.RoleGroupId;
			this.getSectorListData(this.userDetails.RoleGroupId);
			this.selectedLocationIndex = this.userDetails.UserLocationAccesses;
			this.isLocked = this.userDetails.IsLocked;
			this.getActionSet();
			this.entityType = this.userDetails.RoleGroupId.toString();
			this.isEditMode = true;
			this.onChangeUserGroup({ Value: this.userDetails.RoleGroupId });
			this.recordId = this.userDetails.UserCode;
			this.isEmailValid = true;
			this.addEditUsersForm.get('UserDetails')?.get('LoginMethod')?.setValue({ Text: this.userDetails.LoginMethodName, Value: this.userDetails.LoginMethod.toString() });
			this.OnChangeCountry({ Value: this.userDetails.CountryId });
			this.addEditUsersForm.get('UserDetails')?.markAsUntouched();
			this.getUserProfilePicture(data.Data.ProfileDmsId);
			this.addEditUsersForm.get('UserDetails')?.get("UserNo")?.setValue(id);
			this.updateEventLog();
		}
	}

	setOrResetBasicDetails() {
	}

	getSectorDetails(data: number) {
		this.getSectorListData(data);
		this.userDetails.ClientUserSectorAccesses?.forEach((dataSecAcc: ClientUserSectorAccess, index: number) => {
			if ((this.addEditUsersForm.get('SectorDetails') as FormArray).length < this.userDetails.ClientUserSectorAccesses.length) {
				this.addNewSectorItem();
				this.getapprovalconfigdata(dataSecAcc?.SectorId, index);
			}
			this.onChangeSectorDropdown({ event: { Text: dataSecAcc?.SectorName, Value: dataSecAcc?.SectorId }, index: index, isEvent: false });
			(this.addEditUsersForm.get("SectorDetails") as FormArray).controls[index]?.patchValue(this.usersDataService.sectorDetailsDataMapper(dataSecAcc));
		});
		// this.getSectorListData(data);
	}

	getAlternateData() {
		this.usersService.getStatebyCountryID(this.userDetails.CountryId).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((res: GenericResponseBase<DataItem[]>) => {
				if (res.Succeeded && res.Data) {
					this.homeStatelist = res.Data;
				}
			});
		this.addEditUsersForm.get('AlternateContactDetails')?.patchValue(this.usersDataService.alternateContactDetailsDataMapper(this.userDetails));
	}

	getPreferenceData() {
		this.setLandingPageList();
		this.usersService.getProxyAuthorizationTypesDropdown().pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((res: GenericResponseBase<DataItem[]>) => {
				if (res.Succeeded && res.Data) {
					this.proxyAuthorizationTypesList = res.Data;
				}
			});

		if (this.userDetails.IsSelfRecord) {
			this.userActivationService.getAllSecurityQuestions().pipe(takeUntil(this.destroyAllSubscribtion$)).
				subscribe((res: GenericResponseBase<SecurityQuestion[]>) => {
					if (res.Succeeded && res.Data) {
						this.securityQuestionList = res.Data;
					}
					this.securityQuestionList.forEach((ques: SecurityQuestion) => {
						ques.Text = this.localizationService.GetLocalizeMessage(ques.Text);
					});
				});
		}
		this.getClientUser();
	}

	setClientUserDetailsValidators() {
		this.addRequiredValidatorOnControl('UserDetails', 'UserDataAccessRight', 'SelectDataAccessRights');
	}

	setStaffingDetails(data: GenericResponseBase<UserDetails>) {
		if (data.Data) {
			this.addEditUsersForm.get('UserDetails')?.get('StaffingAgencyId')?.setValue({ Text: data?.Data.StaffingAgencyName, Value: data?.Data.StaffingAgencyId?.toString() });
			this.addRequiredValidatorOnControl('UserDetails', 'StaffingAgencyId', 'SelectValueForStaffingAgency');
			this.getSectorDetails(data?.Data?.RoleGroupId);
		}
	}

	setLanguageList(countryId: string) {
		this.usersService.getLanguageList(parseInt(countryId)).subscribe((res: GenericResponseBase<DataItem[]>) => {
			if (res.Succeeded && res?.Data) {
				this.languageList = res?.Data;
			}
		});
	}
	getUserProfilePicture(data: string) {
		if (data) {
			this.headerService.getClientProfilePicture(data)
				.subscribe((res: GenericResponseBase<string>) => {
					if (res.Data) {
						this.profilePic = res.Data;
					}
				});
		}
		else {
			this.profilePic = 'assets/images/users/3.jpg';
		}
	}

	ngOnDestroy(): void {
		this.usersService.resetAPICall();
		this.userDetails = new UserDetails();
		this.isEditMode = false;
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.toasterService.resetToaster();
		this.usersService.resetAPICall();
		this.sessionStorage.remove("CurrentRoleGroupId");
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
	}

	private checkUseridDublicacy(username: string) {
		if (!this.isEditMode) {
			this.usersService.checkDublicateUserName(username?.trim()).
				pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBaseWithValidationMessage<boolean>) => {
					if (data.Data) {
						this.isDublicateUserID = data.Data;
					}
					else if (!data.Data) {
						this.toasterService.resetToaster();
						this.isDublicateUserID = false;
					}
				});
		}
	}

	private getPadding(length: number): string {
		let padding = '';
		for (let i = 0; i < Number(magicNumber.six) - length; i++) {
			padding += i + Number(magicNumber.one);
		}
		return padding;
	}

	private formatEmail(email: string, loginMethod: number): string {
		if (loginMethod === Number(magicNumber.one)) {
			email = email.substring(Number(magicNumber.zero), email.search('@'));
			if (email.length < Number(magicNumber.six)) {
				email += this.getPadding(email.length);
			}
			return email;
		}
		return '';
	}

	private isValidEmail(email: string): boolean {
		return email !== '' && (this.addEditUsersForm.get('UserDetails')?.get('Email')?.valid ?? false);
	}

	public onChangeLoginMethod(x: EventDetails) {
		if (!this.isEditMode) {
			this.addEditUsersForm.get('UserDetails')?.get('UserName')?.setValue(null);
			this.isDublicateUserID = false;
			const email = (this.addEditUsersForm.get('UserDetails')?.get('Email')?.value ?? '');
			if (this.isValidEmail(email)) {
				const formattedEmail = this.formatEmail(email, Number(x.Value));
				if (formattedEmail != '')
					this.setnCheckDublicateUserId(formattedEmail);
			}
			else
				this.addEditUsersForm.get('UserDetails')?.get('UserName')?.setValue('');
		}
	}
	private onChangeEmail(data: string) {
		if (data && !this.isEditMode) {
			if (data.includes(UserConstants.AcroDomain) && this.roleGroupId === UserRole.MSP) {
				this.addEditUsersForm.get('UserDetails')?.get('LoginMethod')?.setValue(this.loginList[1]);
			}
			const email = (this.addEditUsersForm.get('UserDetails')?.get('Email')?.value ?? '');
			if (this.isValidEmail(email) && this.addEditUsersForm.get('UserDetails')?.get('LoginMethod')?.value) {
				const login = Number(this.addEditUsersForm.get('UserDetails')?.get('LoginMethod')?.value.Value),
					formattedEmail = this.formatEmail(data, login);
				if (login && formattedEmail) {
					if (formattedEmail != '')
						this.setnCheckDublicateUserId(formattedEmail);
				}
			}
			else
				this.addEditUsersForm.get('UserDetails')?.get('UserName')?.setValue('');
		}
	}

	private setnCheckDublicateUserId(userId: string) {
		this.usersService.checkDublicateUserName(userId?.trim()).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBaseWithValidationMessage<boolean>) => {
				if (!res.Data) {
					this.isDublicateUserID = false;
					this.toasterService.resetToaster();
					this.addEditUsersForm.get('UserDetails')?.get('UserName')?.setValue(userId);
				}
				else if (res.Data) {
					this.isDublicateUserID = true;
					this.addEditUsersForm.get('UserDetails')?.get('UserName')?.setValue(userId);
				}
			});
	}

	onselectConfiguredTreeItems(data: TreeCheckedRootObject) {
		(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[data.index].get('AppliesToAllOrgLevel1')?.markAsDirty();
		(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[data.index].get('selectedTree')?.setValue(data.data.checkedKey);
		this.checkTreeSelectedDataValid(data.index);
	}

	private checkTreeSelectedDataValid(index: number) {
		const id: string[] = [],
			treeData = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('selectedTree')?.value;
		if (this.addEditUsersForm.get('UserDetails')?.get('UserDataAccessRight')?.value?.Value == UserDataAccessRight.Org1View) {
			const org1List = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('org1List')?.value;
			treeData.map((x: string) => {
				if (org1List[parseInt(x)]?.Value) {
					id.push(x);
				}
			});
			if (id?.length === org1List?.length) {
				(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('AppliesToAllOrgLevel1')?.setValue(true);
				(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('selectedTree')?.setValue([]);
			}
		}
		else if (this.addEditUsersForm.get('UserDetails')?.get('UserDataAccessRight')?.value?.Value == UserDataAccessRight.LocationView) {
			const locationList = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('locationList')?.value;
			treeData.map((x: string) => {
				if (locationList[parseInt(x)]?.Value) {
					id.push(x);
				}
			});
			if (id?.length === locationList?.length) {
				(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('AppliesToAllLocation')?.setValue(true);
				(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('selectedTree')?.setValue([]);
			}
		}
		if (id?.length > Number(magicNumber.zero)) {
			(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('isValidTreeDataSelected')?.setValue(true);
		}
		else {
			(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('isValidTreeDataSelected')?.setValue(false);
		}
	}

	onChangeSectorTree(data: TreeChecked) {
		this.addEditUsersForm.get('UserDetails')?.get('IsAllSectorAccessible')?.markAsDirty();
		this.selectedActionList = data?.selected;
		this.selectedKey = data?.checkedKey;
		const sectorIds: string[] = [];
		this.selectedKeyLocation = [];
		if (this.selectedKey.length > Number(magicNumber.zero) && (this.allSectorList.length !== this.selectedKey.length)) {
			this.selectedKey.forEach((a: string) => {
				sectorIds.push(this.allSectorList[Number(a)].Value);
			});
			this.addEditUsersForm.get('UserDetails')?.get('SectorAccessList')?.setValue(sectorIds);

			this.prepareLocationTreeData(this.selectedKey);
		}
		else if (this.selectedKey.length > Number(magicNumber.zero) && (this.allSectorList.length === this.selectedKey.length)) {
			this.selectedLocationIndex = [];
			this.addEditUsersForm.get('UserDetails')?.get('SectorAccessList')?.setValue(null);
			if (this.addEditUsersForm.get('UserDetails')?.get('IsAllSectorAccessible')?.value == false) {
				this.addEditUsersForm.get('UserDetails')?.get('IsAllSectorAccessible')?.setValue(true);
				this.OnChangeLocationRadio({ event: this.addEditUsersForm.get('UserDetails')?.get('IsAllLocationAccessible')?.value, selectedKeysector: this.selectedKey });
			}
		}
		else {
			this.selectedLocationIndex = [];
			this.addEditUsersForm.get('UserDetails')?.get('SectorAccessList')?.setValue(null);
			if (this.addEditUsersForm.get('UserDetails')?.get('IsAllSectorAccessible')?.value == false) {
				this.addEditUsersForm.get('UserDetails')?.get('IsAllLocationAccessible')?.setValue(true);
			}
		}
    this.cd.markForCheck();
    this.cd.detectChanges();
	}


	private prepareLocationTreeData(checkedKey: string[]) {
		this.selectedKeyLocation = [];
		this.locationSectorGroupingList = [];
		const selectedLocation: locationSectorGroupingList[] = [];
		this.selectedLocationIndex?.map((location: locationSectorGroupingList, ind: number) => {
			const check = checkedKey.findIndex((a: string) =>
				this.allSectorList[Number(a)]?.Value == location?.SectorId);
			if (check > Number(magicNumber.minusOne)) {
				selectedLocation.push(location);
			}
		});
		this.selectedLocationIndex = [];
		this.selectedLocationIndex = selectedLocation;
		checkedKey?.forEach((x: string, index: number) => {
			this.getLocationList(Number(x), index);
		});

		this.locationSectorGroupingList.sort((a: locationSectorGroupingList, b: locationSectorGroupingList) => {
			const fa = a.Text.toLowerCase(),
				fb = b.Text.toLowerCase();

			return fa.localeCompare(fb);
		});
		this.locationSectorGroupingList.map((data: locationSectorGroupingList, index: number) => {
			data.Index = index.toString();
			data.location.map((loc: locationSectorGroupingList, locIndex: number) => {
				loc.Index = `${index}_${locIndex}`;
			});
		});

		this.selectedLocationIndex.map((data: locationSectorGroupingList) => {
			this.getLocationSectorDetails(data);
		});

		if (this.selectedLocationIndex.length > Number(magicNumber.zero)) {
			const locId: number[] = [];
			this.selectedLocationIndex.map((loc: locationSectorGroupingList) => {
				locId.push(Number(loc.LocationId));
			});
			this.addEditUsersForm.get('UserDetails')?.get('LocationAccessList')?.setValue(locId);
			this.addEditUsersForm.get('UserDetails')?.get('isInvalidLocation')?.setValue(false);
		}
		if (this.selectedKeyLocation.length < Number(magicNumber.one)) {
			this.addEditUsersForm.get('UserDetails')?.get('LocationAccessList')?.setValue(null);
		}
		if (this.locationSectorGroupingList.length > Number(magicNumber.zero)) {
			this.addEditUsersForm.get('UserDetails')?.get('IsAllLocationAccessible')?.enable();
		}
	}

	getLocationList(element: number, index: number) {
		const location = this.allLocationList?.filter((a: AllLocationList) =>
			a.Text == this.allSectorList[element].Text)[0]?.LocationList,
			locationText: DropDownWithTextValue[] = [];
		if (location && location.length > Number(magicNumber.zero)) {
			location?.forEach((loc: LocationList) => {
				locationText.push({
					Text: loc.Text,
					Value: loc.Value
				});
			});
		}
		this.locationSectorGroupingList.push({
			Index: index.toString(),
			location: locationText,
			Text: this.allSectorList[element].Text,
			SectorId: this.allSectorList[element].Value
		});
	}

	getLocationSectorDetails(data: locationSectorGroupingList) {
		const sectorIndex = this.locationSectorGroupingList.findIndex((sec: locationSectorGroupingList) =>
			sec.SectorId == data.SectorId),
			locIndex = this.locationSectorGroupingList[sectorIndex].location.findIndex((sec: DropDownWithTextValue) =>
				sec.Value == data.LocationId);
		if (sectorIndex > Number(magicNumber.minusOne) && locIndex > Number(magicNumber.minusOne)) {
			this.selectedKeyLocation.push(`${sectorIndex}_${locIndex}`);
		}
	}

	OnChangeLocationRadio(eventData: { event: DropDownWithTextValue, selectedKeysector: string[] }) {
		if (!eventData.event) {
			this.selectedLocationIndex = [];
			if (this.addEditUsersForm.get('UserDetails')?.get('IsAllSectorAccessible')?.value) {
				this.selectedKey = [];
				this.selectedActionList = [];
				this.allSectorList.forEach((x: DataItem, i: number) => {
					this.selectedKey.push(i.toString());
				});
				this.prepareLocationTreeData(this.selectedKey);
			}
			else {
				const sectorIds: string[] = [];
				if (this.selectedKey.length > Number(magicNumber.zero)) {
					this.selectedKey.forEach((a: string) => {
						sectorIds.push(this.allSectorList[Number(a)].Value);
					});
					this.addEditUsersForm.get('UserDetails')?.get('SectorAccessList')?.setValue(sectorIds);
					this.prepareLocationTreeData(this.selectedKey);
				}
				else {
					this.prepareLocationTreeData(sectorIds);
				}
			}

		}
	}
	OnChangeLocationTree(data: TreeChecked) {
		this.addEditUsersForm.get('UserDetails')?.get('IsAllLocationAccessible')?.markAsDirty();
		this.subOnCategoryChecked(this.locationSectorGroupingList, data);
		const sectors = this.allSectorList?.length - Number(magicNumber.one),
			sectorRange = Array.from({ length: sectors + Number(magicNumber.one) }, (_, i) =>
				i),
			isAllSectorsSelected = sectorRange.every((sector) =>
				data.checkedKey.includes(sector.toString()));
      	let result=false;
		if (isAllSectorsSelected) {
			this.addEditUsersForm.get('UserDetails')?.get('IsAllLocationAccessible')?.setValue(true);
		}
    result = this.singleSelectionToAll(this.locationSectorGroupingList, data.checkedKey);
    if(result){
      this.addEditUsersForm.get('UserDetails')?.get('IsAllLocationAccessible')?.setValue(true);
    }
	}
  singleSelectionToAll(sectors:locationSectorGroupingList[], checkedKey:string[]){
      for (const sector of sectors) {
          if (!checkedKey.includes(String(sector.Index))) {
              return false;
          }
      }
      return true;
  }
	private subOnCategoryChecked(data: locationSectorGroupingList[], checkedData: TreeChecked) {

		const selectedLocation: number[] = [];
		this.selectedLocationIndex = [];
		data = data.map((val: locationSectorGroupingList, index: number) => {
			if (this.checkIndexNext(data, val.Index, index)) {
				val.Index = -1;
			}
			return val;
		});
		data.map((val: locationSectorGroupingList) => {
			val.location.map((value: locationSectorGroupingList) => {
				const parentIndex = (value.Index as string)?.split('_'),
					indexValue = checkedData.checkedKey.findIndex((newValue: string) =>
						newValue == value.Index) > -magicNumber.one;
				value.IsSelected = false;
				if (indexValue && (parentIndex[0] == val?.Index)) {
					value.IsSelected = indexValue;
					selectedLocation.push(Number(value?.Value));
					if (value.IsSelected) {
						const indexKey = this.selectedLocationIndex.
							findIndex((i: locationSectorGroupingList) =>
								Number(i.SectorId) == Number(val.SectorId) && Number(i.Value) == Number(value.Value));
						if (indexKey < Number(magicNumber.zero)) {
							value.SectorId = Number(val.SectorId);
							value.LocationId = Number(value.Value);
							this.selectedLocationIndex.push(value);
						}
					}
				}
			});
		});
		if (selectedLocation?.length > Number(magicNumber.zero)) {
			this.addEditUsersForm.get('UserDetails')?.get('LocationAccessList')?.setValue(selectedLocation);
			this.addEditUsersForm?.controls['isInvalidLocation']?.setValue(false);
		}
		else {
			this.addEditUsersForm.get('UserDetails')?.get('LocationAccessList')?.setValue(null);
		}

	}
	private checkIndexNext(data: locationSectorGroupingList[], value: string | number, index: number) {
		let indexExist = false;
		const labLengthValue = data.length;
		for (let i = (index + magicNumber.one); i < labLengthValue; i++) {
			if (value == (data[i]?.Index ?? -magicNumber.one)) {
				indexExist = true;
			}
		}
		return indexExist;
	}
	getUserServiceCall(roleGroupId: number) {
		let serviceCall;

		if (roleGroupId == Number(UserRole.MSP)) {
			serviceCall = this.usersService.getAllSectorMSP();
		} else if (Number(this.addEditUsersForm.get('UserDetails')?.get('RoleGroupId')?.value?.Value) == Number(UserRole.Client)) {
			serviceCall = this.usersService.getAllSectorClient();
		} else if (this.addEditUsersForm.get('UserDetails')?.get('StaffingAgencyId')?.value?.Value) {
			const staffingAgencyId = this.addEditUsersForm.get('UserDetails')?.get('StaffingAgencyId')?.value?.Value;
			serviceCall = this.usersService.getAllSectorStaffing(staffingAgencyId);
		} else {
			serviceCall = of({ Data: [] });
		}
		return serviceCall;
	}

	resetStaffingSectorAndLocation() {
		this.selectedKey = [];
		this.allSectorList = [];
		this.selectedActionList = [];
		this.allLocationList = [];
		this.selectedKeyLocation = [];
		// this.selectedLocationIndex=[];
		this.locationSectorGroupingList = [];
	}

	public getSectorListData(roleGroupId: number) {
		forkJoin([this.getUserServiceCall(roleGroupId)]).
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
				if (data && data.length > Number(magicNumber.zero)) {
					this.resetStaffingSectorAndLocation();
					if (roleGroupId == Number(UserRole.StaffingAgency)) {
						if (data[0].Data.length == Number(magicNumber.zero))
							return;
						data[0]?.Data.map((res: DataItem) => {
							this.allSectorList.push({ Text: res?.Text, Value: res?.Value });
						});
						this.allLocationList = data[0]?.Data;
					}
					else {
						this.allSectorList = data[0]?.Data;
					}
					this.allSectorList.sort((a: DataItem, b: DataItem) => {
						const fa = a.Text.toLowerCase(),
							fb = b.Text.toLowerCase();

						return fa.localeCompare(fb);
					});
					this.allSectorList.map((y: DataItem, i: number) => {
						y.Index = i.toString();
					});

					if (this.isEditMode) {
						this.getSectorListDataEditMOde();
					}
				}
			});
	}

	getSectorListDataEditMOde() {
		if (!this.userDetails.IsAllSectorAccessible) {
			this.selectedActionList = this.userDetails.SectorAccessList;
		}
		const sectorIds: string[] = [],
			locationIds: number[] = [];
		this.selectedActionList.forEach((element: DataItem) => {
			if (Object.prototype.hasOwnProperty.call(element, "Value")) {
				sectorIds.push(element.Value);
			}
		});
		this.addEditUsersForm.get('UserDetails')?.get('SectorAccessList')?.setValue(sectorIds);
		if (this.selectedActionList.length > Number(magicNumber.zero)) {
			this.selectedActionList.forEach((a: DataItem) => {
				const ind = this.allSectorList.findIndex((x: DataItem) =>
					x.Value == a.Value);
				if (ind > Number(magicNumber.minusOne)) {
					this.selectedKey.push(ind.toString());
				}
			});
			this.cd.markForCheck();
		}
		else {
			const sectorIndex: string[] = [];
			this.allSectorList.forEach((x: DataItem, i: number) => {
				sectorIndex.push(i.toString());
			});
			this.prepareLocationTreeData(sectorIndex);
			this.cd.markForCheck();
		}

		this.userDetails.UserLocationAccesses?.forEach((element: UserLocationAccess) => {
			// locationIds.push(element.LocationId);
			if (Object.prototype.hasOwnProperty.call(element, 'Value')) {
				locationIds.push(element.LocationId);
			}
		});
		if (this.selectedKey.length > Number(magicNumber.zero)) {
			this.selectedKey = this.selectedKey.filter((value, index, self) =>
				self.indexOf(value) === index);
			this.prepareLocationTreeData(this.selectedKey);
		}
		// this.addEditUsersForm.get('UserDetails')?.get('LocationAccessList')?.setValue(locationIds);

	}
	private showAllTab() {
		if (this.roleGroupId == Number(UserRole.Client)) {
			this.tabList[1].isVisible = true;
			this.tabList[2].isVisible = true;
			this.updatedTablist = this.tabList;
			this.tabList = [...this.updatedTablist];
		}
	}

	udfDataGet({ data, index }: { data: UdfData, index: number }) {
		if (!this.udfData[index]) {
			this.udfData[index] = [];
		}
		data.data.forEach((x: IPreparedUdfPayloadData) => {
			const index1 = this.udfData[index].findIndex((a: IPreparedUdfPayloadData) =>
				a.udfConfigId == x.udfConfigId);
			if (index1 > Number(magicNumber.minusOne)) {
				this.udfData[index][index1] = x;
			}
			else {
				this.udfData[index].push(x);
			}
		});
		((this.addEditUsersForm.get('SectorDetails') as FormArray).at(index) as FormGroup).setControl('udfFieldRecords', data.formGroup);
	}

	private patchValueInToForm(user: UserDetails) {
		this.showAllTab();
		this.enableAllSideTab();
		this.addEditUsersForm.get('UserDetails')?.patchValue(this.usersDataService.userDetailsDataMapper(user, { usergroup: this.userTypeList, loginDetails: this.loginList, landingPage: this.landingPageList }));
		this.addEditUsersForm.get('UserDetails')?.get('UserName')?.setValue(user.UserName, { emitEvent: false });
		this.addEditUsersForm.get('UserDetails')?.get('Email')?.setValue(user.UserEmail, { emitEvent: false });
	}

	getOrgLevel2(sectorId: string, index: number) {
		this.usersService.getorg2bySectorid(sectorId).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<DataItem[]>) => {
				if (data?.Succeeded) {
					(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('org2List')?.setValue(data?.Data);
				}
			});
	}
	getOrgLevel3(sectorId: string, index: number) {
		this.usersService.getorg3bySectorid(sectorId).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<DataItem[]>) => {
				if (data?.Succeeded) {
					(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('org3List')?.setValue(data?.Data);
				}
			});

	}
	getOrgLevel4(sectorId: string, index: number) {
		this.usersService.getorg4bySectorid(sectorId).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<DataItem[]>) => {
				if (data?.Succeeded) {
					(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('org4List')?.setValue(data?.Data);
				}
			});

	}


	setConfigurationOfOrgLevel(config: OrgLevelConfig) {
		const { controlVisibility, controlLabel, controlRequired, control, data } = config;
		if (data.IsVisible) {
			const messageOrg = `${this.localizationService.GetLocalizeMessage('PleaseSelect')} ${data.OrgName}.`;
			controlVisibility.setValue(data.IsVisible);
			controlLabel.setValue(data.OrgName);
			if (data.IsMandatory) {
				controlRequired.setValue(true);
				control.setValidators(this.customValidators.RequiredValidator(messageOrg));
				control.markAsUntouched();
				control.updateValueAndValidity();
			}
			else {
				controlRequired.setValue(false);
				this.clearValidator(control as FormControl);
			}
		}
		else {
			controlVisibility.setValue(false);
			this.clearValidator(control as FormControl);
		}
	}


	private sectorOrgConfig(sectorid: number, index: number) {
		this.usersService.getSectorOrgLevelConfigs(sectorid).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<OrganizationDetail[]>) => {
				if (data?.Succeeded && data.Data) {
					this.getDropdownRecordBySectorId(sectorid, index);
					this.orgLevelConfigurationList = data.Data;
					this.getOrgLogic(sectorid);
				}
				else {
					const index1 = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls.findIndex((a: AbstractControl) =>
						a.get('sectorId')?.value?.Value == sectorid),
						control = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index1];
					control.get('orgLevel1Label')?.setValue('Organization Level 1');
					control.get('isorgLevel2Visible')?.setValue(false);
					this.clearValidator(control.get('orgLevel2Id') as FormControl);
					control.get('isorgLevel3Visible')?.setValue(false);
					this.clearValidator(control.get('orgLevel3Id') as FormControl);
					control.get('isorgLevel4Visible')?.setValue(false);
					this.clearValidator(control.get('orgLevel4Id') as FormControl);
				}
			});
	}

	getOrgLogic(sectorid: number | string) {
		this.orgLevelConfigurationList.forEach((x: OrganizationDetail) => {
			const index = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls.findIndex((a: AbstractControl) =>
				a.get('sectorId')?.value?.Value == sectorid),
				control = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index],
				messageSec = `${this.localizationService.GetLocalizeMessage('PleaseSelect')} ${this.SectorLabel}.`;
			control.get('sectorId')?.setValidators(this.customValidators.RequiredValidator(messageSec));
			control.get('sectorId')?.markAsUntouched();
			control.get('sectorId')?.updateValueAndValidity();
			control.get('defaultLocationId')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectLocation'));
			control.get('defaultLocationId')?.markAsUntouched();
			control.get('defaultLocationId')?.updateValueAndValidity();
			if (x.OrgType == Number(OrgType.OrgType1)) {
				this.getOrg1Logic(x, control);
			}
			else if (x.OrgType == Number(OrgType.OrgType2)) {

				this.setConfigurationOfOrgLevel({
					controlVisibility: control.get('isorgLevel2Visible') as FormControl,
					controlLabel: control.get('orgLevel2Label') as FormControl,
					controlRequired: control.get('isorgLevel2Required') as FormControl,
					control: control.get('orgLevel2Id') as FormControl, data: x
				});
				if (x.IsVisible) {
					this.getOrgLevel2(sectorid as string, index);
				}

			}
			else if (x.OrgType == Number(OrgType.OrgType3)) {
				this.setConfigurationOfOrgLevel({
					controlVisibility: control.get('isorgLevel3Visible') as FormControl,
					controlLabel: control.get('orgLevel3Label') as FormControl,
					controlRequired: control.get('isorgLevel3Required') as FormControl,
					control: control.get('orgLevel3Id') as FormControl, data: x
				});
				if (x.IsVisible) {
					this.getOrgLevel3(sectorid as string, index);
				}
			}
			else if (x.OrgType == Number(OrgType.OrgType4)) {

				this.setConfigurationOfOrgLevel({
					controlVisibility: control.get('isorgLevel4Visible') as FormControl,
					controlLabel: control.get('orgLevel4Label') as FormControl,
					controlRequired: control.get('isorgLevel4Required') as FormControl,
					control: control.get('orgLevel4Id') as FormControl, data: x
				});
				if (x.IsVisible) {
					this.getOrgLevel4(sectorid as string, index);
				}
			}
		});
	}

	getOrg1Logic(org: OrganizationDetail, control: AbstractControl) {
		const messageOrg = `${this.localizationService.GetLocalizeMessage('PleaseSelect')} ${org.OrgName}.`;
		control.get('orgLevel1Label')?.setValue(org.OrgName);
		control.get('defaultOrgLevel1Id')?.setValidators(this.customValidators.RequiredValidator(messageOrg));
		control.get('defaultOrgLevel1Id')?.markAsUntouched();
		control.get('defaultOrgLevel1Id')?.updateValueAndValidity();
	}

	getPreferenceForm(event: IPerferenceForm) {
		this.preferenceComponent = event;
	}

	selectedTapEvent(tab: IconDetail) {
		if (!this.nextTab)
			this.nextTab = tab;

		if (this.isEditMode) {
			const isDirty = this.checkAndUpdateUserDirtyState();
			if (isDirty == undefined)
				return;

			if (isDirty) {
				this.dialogService.showConfirmation('DoYouWantToSaveChanges', PopupDialogButtons.SaveWithCancel);
				return;
			}
		}

		if (this.isEditMode || (this.roleGroupId == Number(UserRole.Client) && this.addEditUsersForm.get('UserDetails')?.valid)) {
			this.CurrentTab = tab.label;
			this.tabList.forEach((x: TabItem) => {
				x.isSelected = false;
			});
			const ind = this.tabList.findIndex((a: TabItem) =>
				a.label == tab.label),
				index = this.usersService.apiCallTabBasis.value.findIndex((x: tabValue) =>
					x.tab == this.CurrentTab),
				result: tabValue = this.usersService.apiCallTabBasis.value[index];
			this.tabList.map((tab1: TabItem) => {
				tab1.isSelected = false;
			});


			if (result?.value == Number(magicNumber.minusOne)) {
				result.value = magicNumber.zero;
				this.usersService.apiCallTabBasis.value[index] = result;
				this.usersService.apiCallTabBasis.next(this.usersService.apiCallTabBasis.value);
			}
			this.tabList[ind].isSelected = true;
			this.tabList[ind].isDisabled = false;
			this.removeToaster();
			this.nextTab = undefined;
		}
		this.updatedTablist = this.tabList;
		this.tabList = [...this.updatedTablist];

	}

	private bindSectorTabTree() {
		if (this.userDetails.UserLocationAccesses?.length > magicNumber.zero) {
			const data: string[] = [];
			this.userDetails.UserLocationAccesses.forEach((x: UserLocationAccess) => {
				const ind = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls.findIndex((a: AbstractControl) =>
					a.get('sectorId')?.value?.Value == x.SectorId);

				if (ind > Number(magicNumber.minusOne)) {
					const ind2 = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[ind].get('locationList')?.value?.findIndex((y: EventDetails) =>
						y.Value == x.LocationId);
					if (ind2 > magicNumber.minusOne) {
						data.push(ind2.toString());
						(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[ind]?.get('selectedTree')?.setValue(data);
					}
				}
			});
		}
		else if (this.userDetails.UserOrgLevel1Accesses?.length > magicNumber.zero) {
			const data: string[] = [];
			this.userDetails.UserOrgLevel1Accesses.forEach((x: UserOrgLevel1Accesses) => {
				const ind = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls.findIndex((a: AbstractControl) =>
					a.get('sectorId')?.value?.Value == x.SectorId);

				if (ind > Number(magicNumber.minusOne)) {
					const ind2 = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[ind].get('org1List')?.value?.findIndex((y: EventDetails) =>
						y.Value == x.OrgLevel1Id);
					if (ind2 > magicNumber.minusOne) {
						data.push(ind2.toString());
						(this.addEditUsersForm.get('SectorDetails') as FormArray).controls[ind].get('selectedTree')?.setValue(data);
					}
				}
			});
		}
	}
	private patchApprovalConfiguration(approvaldata: UserApprovalConfigurationDetail[], index: number) {
		approvaldata.forEach((x: UserApprovalConfigurationDetail) => {
			if (x.UserSpecifiedForApprovalLevel) {
				const approval = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls[index].get('userApprovalConfigurationDetail'),
					ind = (approval as FormArray).controls.findIndex((a: AbstractControl) =>
						a.get('XrmEntityId')?.value == x.EntityId);

				if (ind > Number(magicNumber.minusOne)) {
					(approval as FormArray).controls[ind]?.get('XrmEntityId')?.setValue(x.XrmEntityId);
					const ApprovalConfigsCtrl = (approval as FormArray).controls[ind]?.get('ApprovalConfigs') as FormArray;
					ApprovalConfigsCtrl.controls.forEach((b: AbstractControl) => {
						const ind1 = (b.get('ApproverLabels') as FormArray).controls.findIndex((c: AbstractControl) =>
							c.get('Id')?.value == x.ApprovalConfigId);

						if (ind1 > Number(magicNumber.minusOne)) {
							(b.get('ApproverLabels') as FormArray).controls[ind1]?.get('IsSelected')?.setValue(true);
						}
					});
				}
			}
		});
	}

	private addValidatorsOnTreeOfSectorTab() {
		(this.addEditUsersForm.get('SectorDetails') as FormArray).controls.map((control: AbstractControl) => {
			if (!control?.get('AppliesToAllOrgLevel1')?.value
				&& !control?.get('AppliesToAllLocation')?.value
				&& (this.addEditUsersForm.get('UserDetails')?.get('UserDataAccessRight')?.value?.Value == UserDataAccessRight.Org1View
					|| this.addEditUsersForm.get('UserDetails')?.get('UserDataAccessRight')?.value?.Value == UserDataAccessRight.LocationView)
				&& (control?.get('selectedTree')?.value == null || control?.get('selectedTree')?.value?.length == magicNumber.zero)) {
				control?.get('isValidTreeDataSelected')?.setValue(null);
				control?.get('isValidTreeDataSelected')?.setValidators(this.customValidators.RequiredValidator('SelectValueForStaffingAgency'));
				control?.get('isValidTreeDataSelected')?.updateValueAndValidity();
			}
		});
	}

	private removeValidatorsOnSector() {
		(this.addEditUsersForm.get('SectorDetails') as FormArray).controls.map((control: AbstractControl) => {
			this.clearValidator(control.get('defaultOrgLevel1Id') as FormControl);
			this.clearValidator(control.get('defaultLocationId') as FormControl);
			control?.get('isValidTreeDataSelected')?.setValue(true);
			this.clearValidator(control.get('isValidTreeDataSelected') as FormControl);
			const checkorg2Required = this.orgLevelConfigurationList.filter((x: OrganizationDetail) =>
				x.OrgType == Number(OrgType.OrgType2))[0]?.IsMandatory,
				checkorg3Required = this.orgLevelConfigurationList.filter((x: OrganizationDetail) =>
					x.OrgType == Number(OrgType.OrgType3))[0]?.IsMandatory,
				checkorg4Required = this.orgLevelConfigurationList.filter((x: OrganizationDetail) =>
					x.OrgType == Number(OrgType.OrgType4))[0]?.IsMandatory;
			if (checkorg2Required) {
				this.clearValidator(control.get('orgLevel2Id') as FormControl);
			}
			if (checkorg3Required) {
				this.clearValidator(control.get('orgLevel3Id') as FormControl);
			}
			if (checkorg4Required) {
				this.clearValidator(control.get('orgLevel4Id') as FormControl);
			}
		});
	}

	onChangeUserGroup(data: { Value: number }) {
		if (data) {
			forkJoin([
				this.usersService.getRolebyRoleGroupID(data.Value),
				this.usersService.getLoginMethodList(data.Value),

				this.roleGroupId == Number(UserRole.StaffingAgency)
					? this.usersService.getStaffingAgencyDropdown()
					: of({ Data: [] }),

				this.roleGroupId == Number(UserRole.MSP)
					? this.usersService.getAllSectorMSP()
					: of({ Data: [] }),

				this.roleGroupId == Number(UserRole.Client)
					? this.usersService.getDataAccessRight()
					: of({ Data: [] })

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((x: any) => {
				if (x.length > magicNumber.zero) {
					this.userRoleList = x[0].Data;
					this.loginList = x[1].Data;
					this.staffingAgencyList = x[2].Data;
					if (this.roleGroupId != Number(UserRole.StaffingAgency)) {
						this.allSectorList = x[3]?.Data;
						this.allSectorList.sort((a: DataItem, b: DataItem) => {
							const fa = a.Text.toLowerCase(),
								fb = b.Text.toLowerCase();
							return fa.localeCompare(fb);
						});
						this.allSectorList.map((y: DataItem, i: number) => {
							y.Index = i.toString();
						});
					}
					this.dataAccessList = x[4].Data;
					this.dataAccessList.map((z: DataItem) => {
						z.Text = this.localizationService.GetLocalizeMessage(z.Text);
					});
					if (this.isEditMode) {
						this.patchValueInToForm(this.userDetails);
					}
				}
				this.cd.markForCheck();
			});
		}
	}

	onChangeDefaultSectorSwitch(event: boolean) {
		if (event) {
			this.getClientUser();
		}
	}

	private getClientUser() {
		if (this.userDetails.UserNo) {
			this.usersService.getproxyuserdropdownlist(this.userDetails.UserNo)
				.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<DataItem[]>) => {
					if (data.Succeeded && data.Data) {
						this.proxyuserList = data?.Data;
					}
				});
			this.usersService.getproxyuserdropdownlist(this.userDetails.UserNo)
				.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<DataItem[]>) => {
					if (data.Succeeded && data.Data) {
						this.proxyuserList = data?.Data;
					}
				});
		}
	}

	setDefaultTreeData() {
		const dar = this.addEditUsersForm.get('UserDetails')?.get('UserDataAccessRight')?.value?.Value;
		if (dar == UserDataAccessRight.Org1View) {
			(this.addEditUsersForm.get('SectorDetails') as FormArray).controls.map((item: AbstractControl) => {
				item?.get('AppliesToAllOrgLevel1')?.setValue(true);
				const org1 = item.get('defaultOrgLevel1Id')?.value;
				if (org1) {
					const index = item.get('org1List')?.value.findIndex((org: DropDownWithTextValue) =>
						org?.Value == org1?.Value);
					if (index > magicNumber.minusOne) {
						// item.get('selectedTree')?.setValue([index.toString()]);
					}
				}
			});
			(this.addEditUsersForm.get('SectorDetails') as FormArray).markAsDirty();

		}
		else if (dar == UserDataAccessRight.LocationView) {
			(this.addEditUsersForm.get('SectorDetails') as FormArray).controls.map((item: AbstractControl) => {
				item?.get('AppliesToAllLocation')?.setValue(true);
				const org1 = item.get('defaultLocationId')?.value;
				if (org1) {
					const index = item.get('locationList')?.value.findIndex((org: DropDownWithTextValue) =>
						org?.Value == org1?.Value);
					if (index > magicNumber.minusOne) {
						// item.get('selectedTree')?.setValue([index.toString()]);
					}
				}
			});
			// if(this.CurrentTab == UserFormTab.Sector)
			(this.addEditUsersForm.get('SectorDetails') as FormArray).markAsDirty();
		}
	}

	OnChangeCountry(data: DropDownWithTextValue) {
		if (data?.Value) {
			this.updateStateLabel(data?.Value as string);
			this.setLanguageList(data?.Value as string);
			this.addEditUsersForm.get('UserDetails')?.get('CountryId')?.setValue({ Value: data.Value, Text: data?.Text });
			this.addEditUsersForm.get('UserDetails')?.get('UserStateId')?.setValue(null);
			this.addEditUsersForm.get('UserDetails')?.get('UserZipCode')?.setValue(null);
			this.clearValidator(this.addEditUsersForm.get('UserDetails')?.get('phoneNumber') as FormControl);
			this.addEditUsersForm.get('UserDetails')?.get('phoneNumber')?.addValidators([this.customValidators.RequiredValidator('Please enter Contact Number.'), this.customValidators.FormatValidator('Please enter a valid Contact Number.')]);
			this.addEditUsersForm.get('UserDetails')?.get('phoneNumber')?.updateValueAndValidity();
			this.addCountrySpecificFormatValidator();
			this.usersService.getStatebyCountryID((data?.Value) as string).
				pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<DataItem[]>) => {
					if (res.Succeeded && res.Data) {
						this.homeStatelist = res.Data;
					}
				});
		}
	}

	private addCountrySpecificFormatValidator() {
		const countryId = this.addEditUsersForm.get('UserDetails')?.get('CountryId')?.value?.Value;

		if (this.roleGroupId == Number(UserRole.StaffingAgency)) {
			this.clearValidator(this.addEditUsersForm.get('UserDetails')?.get('UserZipCode') as FormControl);
			this.addEditUsersForm.get('UserDetails')?.get('UserZipCode')?.addValidators(this.customValidators.PostCodeValidator(countryId));
			this.addEditUsersForm.get('UserDetails')?.get('UserZipCode')?.updateValueAndValidity();
		}

		else if (this.roleGroupId == Number(UserRole.Client)) {
			this.clearValidator(this.addEditUsersForm.get('AlternateContactDetails')?.get('UserZipCode') as FormControl);
			this.addEditUsersForm.get('AlternateContactDetails')?.get('UserZipCode')?.addValidators(this.customValidators.PostCodeValidator(countryId));
			this.addEditUsersForm.get('AlternateContactDetails')?.get('UserZipCode')?.markAllAsTouched();
			this.addEditUsersForm.get('AlternateContactDetails')?.get('UserZipCode')?.updateValueAndValidity();

			this.clearValidator(this.addEditUsersForm.get('AlternateContactDetails')?.get('alternatePhoneNumber1') as FormControl);
			this.addEditUsersForm.get('UserDetails')?.get('alternatePhoneNumber1')?.addValidators(this.customValidators.FormatValidator('Please enter a valid Alternate Phone 1.'));
			this.addEditUsersForm.get('UserDetails')?.get('alternatePhoneNumber1')?.updateValueAndValidity();

			this.clearValidator(this.addEditUsersForm.get('AlternateContactDetails')?.get('alternatePhoneNumber2') as FormControl);
			this.addEditUsersForm.get('UserDetails')?.get('alternatePhoneNumber2')?.addValidators(this.customValidators.FormatValidator('Please enter a valid Alternate Phone 2.'));
			this.addEditUsersForm.get('UserDetails')?.get('alternatePhoneNumber2')?.updateValueAndValidity();

		}
	}

	onChangeStaffingAgency(id: string) {
		if (id) {
			this.getSectorListData(Number(this.addEditUsersForm.get('UserDetails')?.get('RoleGroupId')?.value?.Value));
			this.usersService.getStaffingAgencyById(id).
				pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<UserStaffingAgencyDetails>) => {
					if (data?.Succeeded && data.Data) {
						this.addEditUsersForm.get('UserDetails')?.get('CountryId')?.setValue({ Text: data.Data?.Country, Value: data.Data?.CountryId?.toString() });
						this.addEditUsersForm.get('UserDetails')?.get('UserLanguageId')?.setValue({ Text: data.Data?.Language, Value: data.Data?.LanguageId?.toString() });
						this.addEditUsersForm.get('UserDetails')?.get('UserLanguageIdPreference')?.setValue({ Text: data.Data?.Language, Value: data.Data?.LanguageId?.toString() });
						this.addEditUsersForm.get('UserDetails')?.get('UserTimezoneId')?.setValue({ Text: data.Data?.Timezone, Value: data.Data?.TimezoneId?.toString() });
						this.addEditUsersForm.get('UserDetails')?.get('UserTimezoneIdPreference')?.setValue({ Text: data.Data?.Timezone, Value: data.Data?.TimezoneId?.toString() });
						this.OnChangeCountry({ Text: data.Data?.Country, Value: data.Data?.CountryId?.toString() });
					}
				});
		}
	}

	removeToaster() {
		const lastToaster = this.toasterService.data[this.toasterService.data.length - magicNumber.one];
		if (lastToaster && (lastToaster.cssClass === 'alert__danger' || lastToaster.cssClass === 'alert__success')) {
			// Reset the toaster with the specified toasterId
			this.toasterService.resetToaster(lastToaster.toasterId);
		}
	}

	getCurrentObject() {
		return this;
	}

	private checkAndUpdateUserDirtyState(): boolean | undefined {
		let isFormDirty: boolean = false;
		if (this.CurrentTab == String(UserFormTab.UserDetails)) {
      if (this.addEditUsersForm.get('UserDetails')?.invalid || this.isDublicateUserID || !this.isEmailValid)
			{
        if (!this.isEmailValid) {
          this.toasterService.showToaster(ToastOptions.Error, 'ValidEmailDomainMessage');
          return;
        }
        if (this.isDublicateUserID) {
          this.toasterService.showToaster(ToastOptions.Error, 'LoginIdExistsUserDifferentLoginId');
          return;
        }
        return;
      }
			if (this.roleGroupId != Number(UserRole.Client) && !this.checkRequiredTreeviewIsSelected())
				return;
			isFormDirty = this.addEditUsersForm.get('UserDetails')?.dirty ?? false;
		}
		else if (this.CurrentTab == String(UserFormTab.Sector)) {
			if (this.addEditUsersForm.get('SectorDetails')?.invalid)
				return;
			isFormDirty = this.addEditUsersForm.get('SectorDetails')?.dirty ?? false;
		}
		else if (this.CurrentTab == String(UserFormTab.AlternateContactDetails)) {
			if (this.addEditUsersForm.get('AlternateContactDetails')?.invalid)
				return;
			isFormDirty = this.addEditUsersForm.get('AlternateContactDetails')?.dirty ?? false;
		}
		else if (this.CurrentTab == String(UserFormTab.Preferences)) {
			if (this.preferenceComponent.formGroup != undefined) {
				if (this.preferenceComponent.formGroup.invalid)
					return;
				isFormDirty = this.preferenceComponent.formGroup.dirty;
			}
			else
				isFormDirty = false;
		}
		return isFormDirty;
	}

	NoSpecialCharacterOrSpaceInNames(): boolean {
		const userDetailsForm = this.addEditUsersForm.get('UserDetails'),
			// eslint-disable-next-line no-unsafe-optional-chaining
			{ UserFirstName, UserLastName, UserMiddleName } = userDetailsForm?.value,
			hasForbiddenCharacter =
				(UserFirstName && /^[\s!@#$%^&*(),.?":{}|<>]/.test(UserFirstName)) ||
				(UserLastName && /^[\s!@#$%^&*(),.?":{}|<>]/.test(UserLastName)) ||
				(UserMiddleName && /^[\s!@#$%^&*(),.?":{}|<>]/.test(UserMiddleName));

		return !hasForbiddenCharacter;
	}

	SaveUser() {
		if (this.isEditMode) {
			this.UpdateUser();
			return;
		}
		if (!this.addEditUsersForm.get('UserDetails')?.valid) {
			return this.addEditUsersForm.markAllAsTouched();
		}
		if (!this.NoSpecialCharacterOrSpaceInNames()) {
			return this.toasterService.showToaster(ToastOptions.Error, 'SpecialCharacterCannotBeFirstLetter');
		}
		if (!this.isEmailValid) {
			this.toasterService.showToaster(ToastOptions.Error, 'ValidEmailDomainMessage');
			return;
		}
		if (this.isDublicateUserID) {
			this.toasterService.showToaster(ToastOptions.Error, 'LoginIdExistsUserDifferentLoginId');
			return;
		}
		if (this.roleGroupId == Number(UserRole.Client)) {
			if (this.CurrentTab == String(this.userFormTab.UserDetails)) {
				this.checkUserToast().then((isValid: boolean) => {
					if (isValid) {
						if ((this.addEditUsersForm.get('SectorDetails') as FormArray).value?.length == magicNumber.zero) {
							this.removeToaster();
							this.addNewSectorItem();
						}
						this.switchToSectorTab();
						this.cd.detectChanges();
					} else {
						this.toasterService.showToaster(ToastOptions.Error, 'User email or last name is invalid or already exists.');
					}
					return;
				});
				return;
			}
		}

		if (!this.isSectorAccessibleValid()) {
			this.toasterService.showToaster(ToastOptions.Error, 'UserAllSectorAccessibility');
			return;
		}
		if (this.roleGroupId == Number(magicNumber.three) && !this.isLocationAccessibleValid()) {
			this.toasterService.showToaster(ToastOptions.Error, 'UserAllLocationAccessibility');
			return;
		}
		this.CreateUser();
	}

	checkUserToast(): Promise<boolean> {
		return new Promise((resolve) => {
			const userLastname = this.addEditUsersForm.get('UserDetails')?.get('UserLastName')?.value,
				email = this.addEditUsersForm.get('UserDetails')?.get('Email')?.value,
				userNumber = this.addEditUsersForm.get('UserDetails')?.get('UserNo')?.value;
			this.usersService.checkLastNameEmailValidation({ Email: String(email), LastName: String(userLastname), UserNo: Number(userNumber) })
				.pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe({
					next: (data) => {
						if (data.Succeeded) {
							resolve(true);
						} else {
							this.toasterService.showToaster(ToastOptions.Error, 'User email or last name is invalid or already exists.');
							resolve(false);
						}
					},
					error: (error) => {
						this.toasterService.showToaster(ToastOptions.Error, 'Error while validating user information.');
						resolve(false);
					}
				});
		});
	}


	switchToSectorTab() {
		this.removeToaster();
		this.tabList[0].isSelected = false;
		this.tabList[1].isSelected = true;
		this.tabList[1].isDisabled = false;
		this.CurrentTab = UserFormTab.Sector;
		this.updatedTablist = this.tabList;
		this.tabList = [...this.updatedTablist];
		this.scrolltotop();

		const index = this.usersService.apiCallTabBasis.value.findIndex((x: tabValue) =>
			x.tab == String(UserFormTab.Sector));
		if (this.usersService.apiCallTabBasis.value[index]?.value == Number(magicNumber.minusOne)) {
			const data = this.usersService.apiCallTabBasis.value;
			data[index].value = magicNumber.zero;
			this.usersService.apiCallTabBasis.next(data);
		}
	}


	showErrorWithReturn(options: ToastOptions, error: string) {
		this.toasterService.showToaster(options, error);
		return;
	}


	updateBasicDetailsMSPStaffing() {
		const data = this.addEditUsersForm.get('UserDetails')?.value;
		for (const key in data) {
			if (data[key]?.Text === '' && data[key]?.Value === undefined) {
				data[key] = null;
			}
			else if (data[key]?.Text && data[key]?.Value) {
				data[key] = data[key].Value;
			}
		}

		data.UserDataAccessRight = null;
		if (!this.isSectorAccessibleValid()) {
			this.toasterService.showToaster(ToastOptions.Error, 'UserAllSectorAccessibility');
			return;
		}

		if (this.roleGroupId === Number(UserRole.MSP)) {
			this.UpdateBasicDetails(data);
			return;
		}

		if (this.roleGroupId === Number(UserRole.StaffingAgency)) {
			if (!this.isLocationAccessibleValid()) {
				this.toasterService.showToaster(ToastOptions.Error, 'UserAllLocationAccessibility');
				return;
			}
			this.UpdateBasicDetails(data);
		}
	}


	checkRequiredTreeviewIsSelected(): boolean {
		if (!this.isSectorAccessibleValid()) {
			this.toasterService.showToaster(ToastOptions.Error, 'UserAllSectorAccessibility');
			return false;
		}

		switch (this.roleGroupId) {
			case UserRole.MSP:
				return true;
			case UserRole.StaffingAgency:
				if (this.isLocationAccessibleValid()) {
					return true;
				} else {
					this.toasterService.showToaster(ToastOptions.Error, 'UserAllLocationAccessibility');
					return false;
				}
			default:
				return false;
		}
	}


	UpdateBasicDetails(data: UserDetails) {
		this.usersService.updateBasicDetailsCommon(data).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response: GenericResponseBaseWithValidationMessage<string>) => {
				if (response?.Succeeded) {
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.addEditUsersForm.get('UserDetails')?.markAsPristine();
					this.addEditUsersForm.get('UserDetails')?.markAsUntouched();
					// this.userDetails = data.Data;
					this.userDetails.UserEmail = data.Email;
					this.onUpdateBasicDetail(data);
					this.toasterService.showToaster(ToastOptions.Success, this.roleGroupId == Number(UserRole.StaffingAgency)
						? 'StaffingAgencyUserSavedSuccessfully'
						: 'MSPUserSavedSuccessfully');
					this.updateEventLog();
				}
				else if (response?.ValidationMessages != undefined && response.ValidationMessages.length > magicNumber.zero) {
					this.toasterService.showToaster(ToastOptions.Error, response?.ValidationMessages[0]?.ErrorMessage ?? response?.Message);
				}
				else
					this.toasterService.showToaster(ToastOptions.Error, response?.Message);
			});
	}

	UpdateUser() {
		switch (this.CurrentTab) {
			case this.userFormTab.UserDetails:
				this.updateUserDetails();
				break;
			case UserFormTab.Sector:
				this.updateSectorDetails();
				break;
			case UserFormTab.AlternateContactDetails:
				this.updateAlternateContactDetails();
				break;
			case UserFormTab.Preferences:
				this.preferenceComponent.context.updatePreference();
				break;
		}
	}

	private updateUserDetails() {
		const userDetailsForm = this.addEditUsersForm.get('UserDetails');
		if (userDetailsForm?.valid) {
			if (!this.NoSpecialCharacterOrSpaceInNames()) {
				return this.toasterService.showToaster(ToastOptions.Error, 'SpecialCharacterCannotBeFirstLetter');
			}
			if (this.isEmailValid) {
				if (this.roleGroupId == Number(UserRole.Client)) {
					this.checkUserToast().then((isValid: boolean) => {
						if (isValid) {
							this.updateBasicDetailsClientUser();
							this.cd.detectChanges();
						} else {
							this.toasterService.showToaster(ToastOptions.Error, 'User email or last name is invalid or already exists.');
						}
						return;
					});
				} else {
					this.updateBasicDetailsMSPStaffing();
				}
			} else {
				this.toasterService.showToaster(ToastOptions.Error, 'ValidEmailDomainMessage');
			}
		}
	}

	private updateSectorDetails() {
		this.addValidatorsOnTreeOfSectorTab();
		const sectorDetailsForm = this.addEditUsersForm.get('SectorDetails');
		if (sectorDetailsForm?.valid) {
			this.updateSectorDetailsClientUser();
		} else {
			this.showValidationMessageOfSectorOnToast();
			sectorDetailsForm?.markAllAsTouched();
		}
	}

	updateAlternateContactDetails() {
		const alternateContactDetails = this.addEditUsersForm.get('AlternateContactDetails');
		if (alternateContactDetails) {
			const controls = [
				'alternateEmail',
				'alternatePhoneNumber1',
				'alternatePhoneNumberExt1',
				'alternatePhoneNumber2',
				'alternatePhoneNumberExt2',
				'UserZipCode'
			],
				allValid = controls.every((control) =>
					alternateContactDetails.get(control)?.valid);
			if (allValid) {
				const data = this.usersDataService.PrepareAlternateContactDetailsData(this.addEditUsersForm.get('AlternateContactDetails') as FormGroup);
				data.userNo = Number(this.addEditUsersForm.get('UserDetails')?.get('UserNo')?.value);
				this.usersService.updateClientAlternateContactDetails(data).
					pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBaseWithValidationMessage<null>) => {
						if (res.Succeeded) {
							this.commonGridViewService.resetAdvDropdown(this.entityId);
							this.addEditUsersForm.get('AlternateContactDetails')?.markAsPristine();
							this.toasterService.showToaster(ToastOptions.Success, 'AlternateContactDetailsSavedSuccessfully');
							this.updateEventLog();
						}
						else if (res?.ValidationMessages != undefined && res.ValidationMessages.length > magicNumber.zero) {
							this.toasterService.showToaster(ToastOptions.Error, res?.ValidationMessages[0]?.ErrorMessage ?? res?.Message);
						}
						else
							this.toasterService.showToaster(ToastOptions.Error, res?.Message);
					});
			}
		}
	}

	CreateUser() {
		const data = this.addEditUsersForm.get('UserDetails')?.value;
		for (const key in data) {
			if (key && data[key]) {
				if (Object.prototype.hasOwnProperty.call(data[key], "Text") && Object.prototype.hasOwnProperty.call(data[key], "Value")) {
					data[key] = data[key]?.Value;
				}
			}
		}
		if (this.roleGroupId == Number(UserRole.Client)) {
			if (this.addEditUsersForm.get('SectorDetails')?.invalid) {
				this.addEditUsersForm.get('SectorDetails')?.markAllAsTouched();
				return;
			}
			const sector = this.usersDataService.PrepareDataForSectorDetailsUpdateClient(this.addEditUsersForm, this.udfData, this.isEditMode);
			data.ClientUserSectorAccessAddDtos = sector.ClientUserSectorAccessUpdateDtos;
		}
		else {
			data.UserDataAccessRight = null;
      data.SectorAccessList = data.SectorAccessList ?? []
		}
		this.usersService.submitUsers(data).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBaseWithValidationMessage<UserDetails>) => {
				if (res?.Succeeded) {
					this.handleSuccessfulResponse(res);
				}
				else if (res?.ValidationMessages != undefined && res.ValidationMessages.length > magicNumber.zero) {
					this.toasterService.showToaster(ToastOptions.Error, res?.ValidationMessages[0]?.ErrorMessage ?? res?.Message);
				}
				else
					this.toasterService.showToaster(ToastOptions.Error, res?.Message);
			});
	}

	handleSuccessfulResponse(res: GenericResponseBaseWithValidationMessage<UserDetails>) {
		if (res.Data) {
			this.toasterService.showToaster(ToastOptions.Success, this.usersService.getCreateMessage(res.Data.RoleGroupId));
			this.isEditMode = true;
			this.sessionStorage.remove("CurrentRoleGroupId");
			this.userDetails = res.Data;
			this.getCommonHeaderData();
			this.getActionSet();
			this.setLandingPageList();
			this.setLanguageList(this.userDetails?.CountryId);
			this.recordId = this.userDetails.UserCode;
			this.patchValueInToForm(res.Data);
			if (this.roleGroupId === Number(UserRole.StaffingAgency) || this.roleGroupId === Number(UserRole.MSP)) {
				this.markUserDetailsAsPristine();
			}
			if (this.roleGroupId === Number(UserRole.Client)) {
				this.markUserDetailsAsPristine();
				this.markSectorDetailsAsPristine();
			}
			this.updateEventLog();
		}
	}

	markUserDetailsAsPristine() {
		this.addEditUsersForm.get('UserDetails')?.markAsPristine();
		this.addEditUsersForm.get('UserDetails')?.markAsUntouched();
	}

	markSectorDetailsAsPristine() {
		this.addEditUsersForm.get('SectorDetails')?.markAsPristine();
		this.addEditUsersForm.get('SectorDetails')?.markAsUntouched();
	}

	setLandingPageList() {
		this.usersService.getlandingPageList(this.userDetails.UserNo).subscribe((res: GenericResponseBase<LocationList[]>) => {
			if (res.Succeeded && res.Data) {
				this.landingPageList = res.Data;
        this.landingPageList.map((e) =>
          e.Text = this.localizationService.GetLocalizeMessage(e.TextLocalizedKey) ?? e.Text);
			}
			this.cd.markForCheck();
		});
	}

	isSectorAccessibleValid() {
		return this.isAccessibleValid('IsAllSectorAccessible', 'SectorAccessList');
	}

	isLocationAccessibleValid() {
		return this.isAccessibleValid('IsAllLocationAccessible', 'LocationAccessList');
	}

	private isAccessibleValid(accessibleField: string, accessListField: string): boolean {
		const userDetails = this.addEditUsersForm.get('UserDetails');
		return userDetails?.get(accessibleField)?.value || userDetails?.get(accessListField)?.value?.length > magicNumber.zero;
	}

	public ShowSectorName(name: string, index: number) {
		if (name) {
			return `${this.SectorLabel}-${name}`;
		}
		else {
			return `${this.SectorLabel}-${this.SectorLabel} ${index + magicNumber.one}`;
		}
	}

	private showValidationMessageOfSectorOnToast() {
		const sectorList = (this.addEditUsersForm.get('SectorDetails') as FormArray).controls;

		sectorList.forEach((item: AbstractControl, index: number) => {
			const isSectorVisible = item.get('isshow')?.value,
				accessRightValue = this.addEditUsersForm.get('UserDetails')?.get('UserDataAccessRight')?.value?.Value;

			if (isSectorVisible) {
				if (item.get('isValidTreeDataSelected')?.invalid) {
					this.handleInvalidTreeData(item, accessRightValue);
				}
			} else {
				this.handleHiddenSectorValidation(item, index);
			}
		});
	}

	private handleInvalidTreeData(item: AbstractControl, accessRightValue: number | string) {
		const orgLevel1Label = item.get('orgLevel1Label')?.value;
		let configure: string,
			message: string = "";

		if (accessRightValue === UserDataAccessRight.Org1View) {
			configure = this.localizationService.GetLocalizeMessage('ConfigurePlaceholder', [{ Value: orgLevel1Label, IsLocalizeKey: false }]);
			message = this.localizationService.GetLocalizeMessage('SelectValueUnderPlaceholder', [{ Value: configure, IsLocalizeKey: true }]);
		} else if (accessRightValue === UserDataAccessRight.LocationView) {
			configure = this.localizationService.GetLocalizeMessage('ConfigurePlaceholder', [{ Value: 'Location', IsLocalizeKey: false }]);
			message = this.localizationService.GetLocalizeMessage('SelectValueUnderPlaceholder', [{ Value: configure, IsLocalizeKey: true }]);
		}

		this.toasterService.showToaster(ToastOptions.Error, message);
	}

	private handleHiddenSectorValidation(item: AbstractControl, index: number) {
		const sectorId = item.get('sectorId')?.value?.Text,
			sectorLabel = this.SectorLabel;

		if (item.get('sectorId')?.invalid) {
			const message = `${this.localizationService.GetLocalizeMessage('PleaseSelect')} ${sectorLabel} of ${this.ShowSectorName(sectorId, index)}.`;
			this.toasterService.showToaster(ToastOptions.Error, message);
		} else if (item.get('defaultLocationId')?.invalid) {
			this.showToasterForInvalidField('Location', sectorLabel, sectorId);
		} else if (item.get('defaultOrgLevel1Id')?.invalid) {
			this.showToasterForInvalidField(item.get('orgLevel1Label')?.value, sectorLabel, sectorId);
		} else if (item.get('orgLevel2Id')?.invalid) {
			this.showToasterForInvalidField(item.get('orgLevel2Label')?.value, sectorLabel, sectorId);
		} else if (item.get('orgLevel3Id')?.invalid) {
			this.showToasterForInvalidField(item.get('orgLevel3Label')?.value, sectorLabel, sectorId);
		} else if (item.get('orgLevel4Id')?.invalid) {
			this.showToasterForInvalidField(item.get('orgLevel4Label')?.value, sectorLabel, sectorId);
		} else if (item.get('isValidTreeDataSelected')?.invalid) {
			this.showToasterForInvalidTreeData(item, index);
		}
	}

	private showToasterForInvalidField(fieldLabel: string, sectorLabel: string, sectorId: string) {
		const message = this.localizationService.GetLocalizeMessage('SelectPlaceholderOfPlaceholder', [
			{ Value: fieldLabel, IsLocalizeKey: false },
			{ Value: sectorLabel, IsLocalizeKey: false },
			{ Value: sectorId, IsLocalizeKey: false }
		]);
		this.toasterService.showToaster(ToastOptions.Error, message);
	}

	private showToasterForInvalidTreeData(item: AbstractControl, index: number) {
		const accessRightValue = this.addEditUsersForm.get('UserDetails')?.get('UserDataAccessRight')?.value?.Value,
			sectorName = this.ShowSectorName(item.get('sectorId')?.value?.Text, index);
		let configure: string,
			message: string = "";

		if (accessRightValue === UserDataAccessRight.Org1View) {
			configure = this.localizationService.GetLocalizeMessage('ConfigurePlaceholder', [{ Value: item.get('orgLevel1Label')?.value, IsLocalizeKey: false }]);
			message = this.localizationService.GetLocalizeMessage('SelectValueForConfigureOrgLevelLocation', [
				{ Value: configure, IsLocalizeKey: true },
				{ Value: sectorName, IsLocalizeKey: false }
			]);
		} else if (accessRightValue === UserDataAccessRight.LocationView) {
			configure = this.localizationService.GetLocalizeMessage('ConfigurePlaceholder', [{ Value: 'Location', IsLocalizeKey: false }]);
			message = this.localizationService.GetLocalizeMessage('SelectValueForConfigureOrgLevelLocation', [
				{ Value: configure, IsLocalizeKey: true },
				{ Value: sectorName, IsLocalizeKey: false }
			]);
		}

		this.toasterService.showToaster(ToastOptions.Error, message);
	}


	private updateBasicDetailsClientUser() {
		const data = this.addEditUsersForm.get('UserDetails')?.value;
		for (const key in data) {
			if (data[key] && Object.prototype.hasOwnProperty.call(data[key], 'Text') && Object.prototype.hasOwnProperty.call(data[key], 'Value')) {
				data[key] = data[key]?.Value;
			}
		}
		this.usersService.updateBasicDetailsCommon(data).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response: GenericResponseBaseWithValidationMessage<string>) => {
				if (response.Succeeded) {
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.addEditUsersForm.get('UserDetails')?.markAsPristine();
					this.addEditUsersForm.get('SectorDetails')?.markAsPristine();
					this.addEditUsersForm.get('SectorDetails')?.markAsUntouched();
					this.userDetails.UserEmail = data.Email;
					this.onUpdateBasicDetail(data);
					this.toasterService.resetToaster();
					this.timeoutId = window.setTimeout(() => {
						this.toasterService.showToaster(ToastOptions.Success, 'ClientUserSavedSuccessfully');
					});
					this.updateEventLog();
				}
				else if (response?.ValidationMessages != undefined && response.ValidationMessages.length > Number(magicNumber.zero)) {
					this.toasterService.showToaster(ToastOptions.Error, response?.ValidationMessages[0]?.ErrorMessage ?? response?.Message);
				}
				else
					this.toasterService.showToaster(ToastOptions.Error, response?.Message);
			});
	}

	private updateSectorDetailsClientUser() {
		const data = this.usersDataService.PrepareDataForSectorDetailsUpdateClient(this.addEditUsersForm, this.udfData, this.isEditMode);
		// data.UdfFieldRecords = this.udfData;
		this.usersService.updateSectorDetailsClient(data).
			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response: GenericResponseBaseWithValidationMessage<UserDetails>) => {
				if (response.Succeeded) {
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.addEditUsersForm.get('SectorDetails')?.markAsPristine();
					this.userDetails.ClientUserSectorAccesses = response.Data?.ClientUserSectorAccesses;
					this.toasterService.showToaster(ToastOptions.Success, 'ClientUserSavedSuccessfully');
					this.updateEventLog();
				}
				else if (response?.ValidationMessages != undefined && response.ValidationMessages.length > magicNumber.zero) {
					this.toasterService.showToaster(ToastOptions.Error, response?.ValidationMessages[0]?.ErrorMessage ?? response?.Message);
				}
				else
					this.toasterService.showToaster(ToastOptions.Error, response?.Message);
			});
	}

	onUpdatePreference(data: PreferenceUpdateData) {
		if (data) {
			this.commonGridViewService.resetAdvDropdown(this.entityId);
			this.addEditUsersForm.get('UserDetails')?.get('UserName')?.setValue(data?.UserName);
			this.addEditUsersForm.get('UserDetails')?.get('UserTimezoneId')?.setValue(data?.UserTimezone);
			this.addEditUsersForm.get('UserDetails')?.get('UserLanguageId')?.setValue(data?.UserLanguageId);
		}
		this.updateEventLog();
	}

	onUpdateBasicDetail(data: UserDetails) {
		if (data) {
			if (this.preferenceComponent?.formGroup) {
				this.commonGridViewService.resetAdvDropdown(this.entityId);
				this.userDetails.UserLanguageId = data.UserLanguageId;
				this.userDetails.UserLanguage = this.addEditUsersForm.get('UserDetails')?.get('UserLanguageId')?.value.Text;
				this.userDetails.UserTimezoneId = data.UserTimezoneId;
				this.userDetails.UserTimezone = this.addEditUsersForm.get('UserDetails')?.get('UserTimezoneId')?.value.Text;
				this.preferenceComponent.formGroup.get('UserTimezoneIdPreference')?.setValue(this.addEditUsersForm.get('UserDetails')?.get('UserTimezoneId')?.value);
				this.preferenceComponent.formGroup.get('UserLanguageIdPreference')?.setValue(this.addEditUsersForm.get('UserDetails')?.get('UserLanguageId')?.value);
			}
		}
	}

	private scrolltotop() {
		const top = document.querySelector('.app-content__header');
		if (top != null) {
			this.timeoutId = window.setTimeout(() =>
				top.scrollIntoView({ block: 'center' }), magicNumber.one);
		}
	}
	public cancel() {
		this.route.navigate([`/xrm/master/user/`]);
	}

	getCommonHeaderData() {
		this.statusData.items = [
			{
        title: 'UserId',
				titleDynamicParam: [],
				item: this.userDetails.UserCode,
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: '',
				linkParams: ''
			},
			{
				title: 'Status',
				titleDynamicParam: [],
				item: this.getUserStatus(),
				itemDynamicParam: [],
				cssClass: [this.getUserStatus().toLowerCase()],
				isLinkable: false,
				link: '',
				linkParams: ''
			}
		];
	}
}
