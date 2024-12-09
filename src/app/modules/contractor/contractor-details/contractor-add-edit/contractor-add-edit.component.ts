import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { StateService } from 'src/app/services/masters/state.service';
import { ContractorService } from 'src/app/services/masters/contractor.service ';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { HttpStatusCode } from '@angular/common/http';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ContractorLocKeys, NavigationPaths } from '../constant/routes-constant';
import { EMPTY, Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { AssingmentDetailsService } from '../../assignment-details/service/assingmentDetails.service';
import { MenuService } from '@xrm-shared/services/menu.service';
import { Column, ContractorData, DuplicateData, LocOfficerData, NavigationData, PoData, TenureData } from '../constant/contractor-interface';
import { CoreServService } from '../core-serv.service';
import { UdfData } from '@xrm-master/requisition-library/constant/rate-enum';
import { navigationUrls } from '../../assignment-details/constants/const-routes';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CustomResponse } from 'src/app/auth/user_activation/user_activation_interfaces';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({
	selector: 'app-contractor-add-edit',
	templateUrl: './contractor-add-edit.component.html',
	styleUrls: ['./contractor-add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ContractorAddEditComponent implements OnInit, OnDestroy {
	public contractordata: ContractorData;
	public entityId: number = XrmEntities.Contractor;
	public recordStatus: string;
	public isEditMode: boolean = false;
	public isEdit: boolean = true;
	public sectorId: number = magicNumber.zero;
	public AddContractorForm: FormGroup;
	public AddUdFForm: FormGroup;
	public TenureForm: FormGroup;
	public isTenureChange: boolean = true;
	public ukey: string;
	public recordId: number;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.Add;
	public disableSwitch: boolean = false;
	public isEmailRequird: boolean = false;
	public udfData: UdfData;
	public userIdEnabled: boolean = false;
	public poBreakdownData: PoData | null;
	public isContractorInformationTabSelected: boolean = true;
	public tenureInforPrefilledData: LocOfficerData;
	private ngUnsubscribe$: Subject<void> = new Subject<void>();
	@Output() onCancel: EventEmitter<boolean> = new EventEmitter<boolean>();
	public disableReActivation: boolean = true;
	public isWorkerAUser: boolean = false;
	private minLength: DynamicParam[] = [{ Value: magicNumber.six.toString(), IsLocalizeKey: false }];
	// eslint-disable-next-line max-params
	constructor(
		public sector: SectorService,
		public State: StateService,
		public contractorService: ContractorService,
		public udfCommonMethods: UdfCommonMethods,
		public cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		private route: Router,
		private activatedRoute: ActivatedRoute,
		private customValidators: CustomValidators,
		private toasterServc: ToasterService,
		private eventLog: EventLogService,
		private localizationService: LocalizationService,
		private assingmentDetailsService: AssingmentDetailsService,
		private menuService: MenuService,
		private coreServ: CoreServService
	) {
	}

	ngOnInit(): void {
		this.formInitialization();
		this.AddUdFForm = this.fb.group({});
		this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.Assingments);
		this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.ContractorEvent);
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((param) => {
			if (param['id']) {
				this.getContractorById();
				this.ukey = param["id"];
			}
		});
		this.assingmentDetailsService.navigationUrlCancel.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: NavigationData | null) => {
			if (data?.url && data.url.length > Number(magicNumber.zero)) {
				if (data.isAssignDetailsTabSelected) {
					this.isContractorInformationTabSelected = false;
				} else {
					this.isContractorInformationTabSelected = true;
				}
			}
		});
		this.assingmentDetailsService.navigationUrlCancel.next(null);
		this.callEmailAndUserChange();
	}

	private getContractorById() {
		this.activatedRoute.params.pipe(
			takeUntil(this.ngUnsubscribe$),
			switchMap((param) => {
				if (param['id']) {
					this.ukey = param["id"];
					return this.contractorService.getContractorById(param["id"]).pipe(takeUntil(this.ngUnsubscribe$));
				} else {
					return EMPTY;
				}
			})
		).subscribe((res: GenericResponseBase<ContractorData>) => {
			if (res.Data) {
				this.contractordata = res.Data;
				this.coreServ.Contract.next(this.contractordata);
				this.recordUKey = this.contractordata.UKey;
				this.recordId = this.contractordata.Id;
				this.actionTypeId = ActionType.Edit;
				this.userIdEnabled = this.contractordata.RequireLoginforTE;
				this.disableReActivation = this.contractordata.EmailConfirmed;
				if (this.contractordata.UserLogInId && this.contractordata.UserLogInId != ContractorLocKeys.NA.toString())
					this.isWorkerAUser = true;
				this.patchData(this.contractordata);
			}
		});
	}

	get ConCtrl() {
		return this.AddContractorForm.controls;
	}

	private getPOHoursBraekdownSummary(id: number) {
		this.contractorService.getHoursBreakdownData(id).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: GenericResponseBase<PoData>) => {
			if (res.Data) {
				this.poBreakdownData = res.Data;
				this.cdr.markForCheck();
			}
		});
	}

	public openPOCard(): void {
		this.getPOHoursBraekdownSummary(this.recordId);
	}


	public callEmailAndUserChange() {
		this.AddContractorForm.get('EmailAddress')?.valueChanges.pipe(debounceTime(magicNumber.oneThousandTwentyFour), takeUntil(this.ngUnsubscribe$)).subscribe((data: string) => {
			if (data && this.ConCtrl['EmailAddress'].valid) {
				if(this.contractordata.RequireLoginforTE){
					this.ConCtrl['UserName'].setValue(this.contractordata.UserLogInId);
					this.cdr.markForCheck();
				}
				if (this.contractordata.RequireLoginforTE && this.ConCtrl['RequireLoginforTE'].value) {
					return;
				} else {
					this.onChangeEmail(data);
				}
			}
		  	if(this.ConCtrl['EmailAddress'].invalid && (this.contractordata.RequireLoginforTE || this.ConCtrl['RequireLoginforTE'].value)){
				this.ConCtrl['UserName'].setValue(null);
				this.cdr.markForCheck();
			}
		});

		this.AddContractorForm.get('UserName')?.valueChanges.pipe(debounceTime(magicNumber.oneThousandTwentyFour), takeUntil(this.ngUnsubscribe$)).subscribe((data: string) => {
			if (data) {
				if (this.contractordata.RequireLoginforTE && this.ConCtrl['RequireLoginforTE'].value) {
					return;
				}
			}
		});
	}


	private onChangeLoginMethod() {
		if (!this.isEditMode) {
			this.ConCtrl['UserName'].setValue(null);
			let email = this.ConCtrl['EmailAddress'].value;
			if (this.ConCtrl['EmailAddress'].valid) {
				email = email.substring(magicNumber.zero, email.search('@'));
				this.setnCheckDublicateUserId(email);
			}
		}
	}

	private onChangeEmail(data: string) {
		if (data && !this.isEditMode) {
			const login = this.ConCtrl['RequireLoginforTE'].value;
			if (login && this.ConCtrl['EmailAddress'].valid) {
				data = data.substring(magicNumber.zero, data.search('@'));
				data = this.padString(data);
			}
			if (login && data) {
				this.setnCheckDublicateUserId(data);
				this.userIdEnabled = true;
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


	private setnCheckDublicateUserId(userId: string) {
		this.ConCtrl['UserName'].setValue(userId);
	}

	public onReqSwitchChange(event: boolean) {
		if (event) {
			this.userIdEnabled = true;
			this.isEmailRequird = true;
			this.ConCtrl['UserName'].setValidators([this.customValidators.RequiredValidator("PleaseEnterUserLogind"), this.customValidators.MinLengthValidator(magicNumber.six, 'MinimumCharacterslimitofUserLoginID', this.minLength)]);
			this.ConCtrl['EmailAddress'].setValidators([
				this.customValidators.RequiredValidator("PleaseEnterEmail"),
				this.customValidators.EmailValidator('PleaseEnterAValidEmailAddress')
			]);
			this.ConCtrl['EmailAddress'].updateValueAndValidity();
			this.onChangeLoginMethod();
		} else {
			this.userIdEnabled = false;
			this.isEmailRequird = false;
			this.ConCtrl['UserName'].setValue('N/A');
			this.ConCtrl['RequireLoginforTE'].setValue(event);
			this.ConCtrl['EmailAddress'].clearValidators();
			this.ConCtrl['EmailAddress'].setValidators(this.customValidators.EmailValidator('PleaseEnterAValidEmailAddress'));
			this.ConCtrl['EmailAddress'].updateValueAndValidity();
		}
	}

	getUdfData(data: UdfData) {
		this.AddUdFForm = data.formGroup;
		this.AddContractorForm.get("UdfFieldRecords")?.setValue(data.data);
	}

	formInitialization() {
		this.AddContractorForm = this.fb.group({
			UKey: [null],
			FirstName: [null, [this.customValidators.RequiredValidator('PleaseEnterFirstName'), this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			LastName: [null, [this.customValidators.RequiredValidator('PleaseEnterLastName'), this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')]],
			MiddleName: [null, this.customValidators.NoSpecialCharacterOrSpaceFirst('SpecialCharacterCannotBeFirstLetter')],
			PhoneNoExtension: [null],
			EmailAddress: [null, this.customValidators.EmailValidator('PleaseEnterAValidEmailAddress')],
			AddedToDNR: [null],
			RequireLoginforTE: [null],
			ContactPhone: [null, this.customValidators.FormatValidator('PleaseEnterValidContactPh')],
			UserName: [null],
			UdfFieldRecords: [null],
			FullName: [null],
			TenureDetails: [],
			ContractorUId: [null],
			RecentWeekEnding: [null],
			Comments: [null]

		});
	}

	public patchData(contractorData: ContractorData) {
		this.AddContractorForm.patchValue({
			UKey: contractorData.UKey,
			FirstName: contractorData.FirstName,
			LastName: contractorData.LastName,
			MiddleName: contractorData.MiddleName,
			ContactPhone: contractorData.WorkPhoneNo,
			EmailAddress: contractorData.Email,
			AddedToDNR: contractorData.AddedToDNR,
			RequireLoginforTE: contractorData.RequireLoginforTE,
			ContractorUId: contractorData.SSN,
			PhoneNoExtension: contractorData.PhoneNoExtension,
			UserName: contractorData.RequireLoginforTE
				? contractorData.UserLogInId
				: 'N/A',
			UdfFieldRecords: contractorData.UdfFieldRecords.length > Number(magicNumber.zero)
				? contractorData.UdfFieldRecords
				: null,
			RecentWeekEnding: contractorData.RecentWeekEnding
				? contractorData.RecentWeekEnding
				: 'N/A',
			TenureDetails: contractorData.TenureDetails.length > Number(magicNumber.zero)
				? contractorData.TenureDetails
				: [],
			Comments: contractorData.Comments
		});

		if (this.ConCtrl['RequireLoginforTE'].value) {
			this.AddContractorForm.get('RequireLoginforTE')?.disable();
			this.userIdEnabled = false;
			this.isEmailRequird = true;
			this.ConCtrl['UserName'].setValue(this.contractordata.UserLogInId);
			this.ConCtrl['EmailAddress'].setValidators([
				this.customValidators.RequiredValidator("PleaseEnterEmail"),
				this.customValidators.EmailValidator('PleaseEnterAValidEmailAddress')
			]);
			this.AddContractorForm.updateValueAndValidity();
		}

		this.tenureInforPrefilledData = this.AddContractorForm.get('TenureDetails')?.value;
	}

	private prepareAndValidateForms(): boolean {
		this.AddContractorForm.markAllAsTouched();
		this.AddUdFForm.markAllAsTouched();
		const emailAddressControl = this.AddContractorForm.get('EmailAddress');
		if (emailAddressControl?.value === "") {
			emailAddressControl.setValue(null);
		}
		
		return this.AddContractorForm.valid && this.AddUdFForm.valid;
	}

	public submitForm() {
		if (this.prepareAndValidateForms()) {
			const formData = this.AddContractorForm.getRawValue();
			if (!this.NoSpecialCharacterOrSpaceInNames(formData.FirstName, formData.MiddleName, formData.LastName)) {
				return this.toasterServc.showToaster(ToastOptions.Error, 'SpecialCharacterWorker');
			}
			if (!this.isEditMode) {
				this.contractorService.updateContractor(formData).pipe(takeUntil(this.ngUnsubscribe$)).
					subscribe((res: CustomResponse) => {
						this.cdr.markForCheck();
						this.eventLog.isUpdated.next(true);
						this.eventLog.entityId.next(this.entityId);

						if (res.StatusCode === Number(HttpStatusCode.Ok)) {
							this.toasterServc.showToaster(ToastOptions.Success, 'ContractorAddedSuccessfully');
							this.isTenureChange = true;
							this.getContractorById();
							if (this.ConCtrl['RequireLoginforTE'].value) {
								this.AddContractorForm.get('RequireLoginforTE')?.disable();
							}
						} else if (res.ValidationMessages) {
							this.toasterServc.showToaster(ToastOptions.Error, res.ValidationMessages[magicNumber.zero].ErrorMessage);
							this.isEdit = false;
						} else {
							this.toasterServc.showToaster(ToastOptions.Error, res.Message);
							this.isEdit = false;
						}

						this.isEdit = true;
						this.AddContractorForm.markAsPristine();
						this.AddUdFForm.markAsPristine();
					});
			}
		}
	}

	public tenureLimitChange(data: TenureData) {
		this.AddContractorForm.markAsPristine();
		this.isTenureChange = false;
		const tenureLimit = data.data.get(data.control)?.value,
			tenureLimitType = this.contractordata.TenureDetails[data.index].TenureLimitType,
			days = this.getNoOfDays(tenureLimitType, tenureLimit);
		if (tenureLimit) {
			this.contractordata.TenureDetails[data.index].TenureLimit = tenureLimit;
		} else {
			this.contractordata.TenureDetails[data.index].TenureLimit = magicNumber.zero;
		}
		this.contractordata.TenureDetails[data.index].TenureEndDate =
			this.addDaysToDate(this.contractordata.TenureDetails[data.index].TenureStartDate, days);
		data.data.get('TenureEndDate')?.setValue(this.contractordata.TenureDetails[data.index].TenureEndDate);
	}

	private addDaysToDate(initialDate: Date | string | null, daysToAdd: number): Date {
		const newDate = this.localizationService.GetDate(initialDate);
		newDate.setDate(newDate.getDate() + daysToAdd);
		return newDate;
	}

	private getNoOfDays(tenureLimitType: number, tenureLimit: number) {
		let days = magicNumber.zero;
		if (tenureLimitType == Number(magicNumber.thirtySix)) {
			const hoursDays = tenureLimit / magicNumber.eight;
			days = hoursDays;
			if (hoursDays > Number(days)) {
				days++;
			}
		}
		else if (tenureLimitType == Number(magicNumber.thirtySeven)) {
			days = Math.round((tenureLimit * magicNumber.threeSixtyFive) / magicNumber.tweleve);

		}
		days = Math.max(days, magicNumber.one);
		return Math.ceil(days);
	}

	public tenureInfoColumn: Column[] = [
		{
			colSpan: magicNumber.two,
			columnName: 'Sector',
			controls: [
				{
					controlType: 'text',
					controlId: 'SectorName',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'TenureLimit',
			asterik: true,
			controls: [
				{
					controlType: 'number',
					controlId: 'TenureLimit',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					format: 'n0',
					min: magicNumber.one,
					maxlength: magicNumber.four,
					decimals: '0',
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.customValidators.RequiredValidator('PleaseEnterTenureLimit')]
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'TenureType',
			controls: [
				{
					controlType: 'text',
					controlId: 'TenureLimitTypeName',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'TenureStartDate',
			controls: [
				{
					controlType: 'date',
					controlId: 'TenureStartDate',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'TenureEndDate',
			controls: [
				{
					controlType: 'date',
					controlId: 'TenureEndDate',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.five,
			columnName: 'TenureCompleted',
			controls: [
				{
					controlType: 'text',
					controlId: 'TenureCompleted',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.five,
			columnName: 'AssignmentsCounts',
			controls: [
				{
					controlType: 'text',
					controlId: 'AssignmentCount',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		}
	];

	public tenureLimitColumnConfiguration = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: true,
		Id: true,
		firstColumnName: '',
		secondColumnName: '',
		deleteButtonName: '',
		noOfRows: magicNumber.zero,
		itemSr: false,
		itemLabelName: '',
		firstColumnColSpan: magicNumber.zero,
		lastColumnColSpan: magicNumber.zero,
		isAddMoreValidation: false
	};

	public getTenureInfoFormStatus(data: FormGroup) {
		this.TenureForm = data;
	}

	public cancel() {
		if (this.route.url.includes('global-search')) {
			this.route.navigate([navigationUrls.globalSearchList]);
		}
		else {
			this.route.navigate([`${NavigationPaths.list}`]);
		}
	}

	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}

	public reSendActivationLink(): void {
		this.contractorService.resendActivationLink(this.contractordata.UserId).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((data: ApiResponseBase) => {
				this.disableReActivation = true;
				if (data.Succeeded) {
					this.toasterServc.showToaster(
						ToastOptions.Success,
						ContractorLocKeys.AccountActivationEmailSent,
						[{ IsLocalizeKey: true, Value: this.contractordata.Email ?? ContractorLocKeys.EmptyString }]
					);
				}
				else {
					this.toasterServc.showToaster(ToastOptions.Error, data.Message ?? ContractorLocKeys.Somethingwentwrong);
				}
			});
	}

	NoSpecialCharacterOrSpaceInNames(firstName : string, middleName :string, lastName : string): boolean {

		const hasForbiddenCharacter =
				(firstName && /^[\s!@#$%^&*(),.?":{}|<>]/.test(firstName)) ||
				(lastName && /^[\s!@#$%^&*(),.?":{}|<>]/.test(lastName)) ||
				(middleName && /^[\s!@#$%^&*(),.?":{}|<>]/.test(middleName));

		return !hasForbiddenCharacter;
	}
}

