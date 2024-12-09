import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CostAccountingCodeList } from '@xrm-core/models/cost-accounting-code.model';
import { CostAccountingCodeService } from 'src/app/services/masters/cost-accounting-code.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DatePipe, CommonModule } from '@angular/common';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { NavigationPaths } from '../route-constants/route-constants';
import { SectorService } from 'src/app/services/masters/sector.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { Subject, forkJoin, map, of, switchMap, takeUntil } from 'rxjs';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CommonService } from '@xrm-shared/services/common.service';
import { CostAccountingCodeSubmit } from '@xrm-core/models/cost-accounting-code/cost-accounting-code.add-edit';
import { CostAccountingCodeApproverConfig } from '@xrm-core/models/cost-accounting-code/cost-accounting-code-approver-config.model';
import { UsersService } from '@xrm-master/user/service/users.service';
import { SectorChargeNumberConfig } from '@xrm-core/models/Sector/sector-charge-number-configuration.model';
import { SectorCostCenterConfig } from '@xrm-core/models/Sector/sector-cost-center-configs.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { getColumnOption, getTabOptions, getUsersWithFilter } from '../utils/cost-accounting-code-utility';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { SharedModule } from '@xrm-shared/shared.module';
import { DropdownModel, IDropdownWithExtras } from '@xrm-shared/models/common.model';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	standalone: true,
	imports: [SharedModule, CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AddEditComponent implements OnInit, OnDestroy {
	public magicNumber = magicNumber;
	public isAssigned:boolean=false;
	public AddEditEventReasonForm: FormGroup;
	public AddApproverForm: FormGroup;
	public costCodingAccountObj = new CostAccountingCodeList();
	public gridData: CostAccountingCodeApproverConfig[] = [];
	public pageSize: number = magicNumber.zero;
	public recordId: string | undefined | null;
	public entityId: number = XrmEntities.CostAccountingCode;
	public columnOptions: { fieldName: string, columnHeader: string, visibleByDefault: boolean }[] = [];
	public isEditMode: boolean = false;
	public shiftDropdownList: DropdownModel[] = [];
	public primaryapproverList: DropdownModel[] = [];
	public alternateApproverList: DropdownModel[] = [];
	public dataAfterChangedSector: SectorChargeNumberConfig;
	public isSectorValue: boolean = false;
	public allSegmentList: SectorCostCenterConfig[] = [];
	public isEdit: boolean = false;
	public getDropDownList: DropdownModel[];
	public isApproval: boolean = false;
	public tabOptions = {};
	public actionSet: IActionSetModel[] = [];

	private gridItems: CostAccountingCodeApproverConfig | undefined;
	private costAccountCodeLabelTextParams: DynamicParam[] = [{ Value: 'CostAccountingCode', IsLocalizeKey: true }];
	private errorToasterEnable: boolean = false;
	private ukey: string;
	private costAccountingCodeDetails: CostAccountingCodeSubmit;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private route: Router,
		private activatedRoute: ActivatedRoute,
		private sectorService: SectorService,
		private costService: CostAccountingCodeService,
		private gridViewService: GridViewService,
		private customValidators: CustomValidators,
		private toasterService: ToasterService,
		private localizationService: LocalizationService,
		private datePipe: DatePipe,
		private eventLogService: EventLogService,
		private commonService: CommonService,
		private usersService: UsersService,
		private cdr: ChangeDetectorRef,
		private commonHeaderService: CommonHeaderActionService,
		private gridConfiguration: GridConfiguration
	) {
		this.columnOptions = getColumnOption();
		this.tabOptions = getTabOptions();
		this.createActionSets();

		this.AddEditEventReasonForm = this.formBuilder.group({
			'Sector': [null, this.customValidators.requiredValidationsWithMessage('PleaseSelectData', 'Sector')],
			'EffectiveStartDate': [null],
			'EffectiveEndDate': [null],
			'Description': [null]
		});

		this.AddApproverForm = this.formBuilder.group({
			'PrimaryApprover': [null, this.customValidators.requiredValidationsWithMessage('PleaseSelectData', 'PrimaryApprover')],
			'Shift': [null, this.customValidators.requiredValidationsWithMessage('PleaseSelectData', 'Shift')],
			'AlternateApprover': [null],
			'CostAccountingCodeApproverId': [magicNumber.zero]
		});
	}

	private createActionSets() {
		this.actionSet = [
			{
				Status: true,
				Items: this.gridConfiguration.showEditDeactive(this.onEditItem, this.onDeleteItem, true)
			},
			{
				Status: false,
				Items: this.gridConfiguration.showEditOnly(this.onEditItem)
			}
		];
	}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(
			switchMap((param: Params) => {
				if (param['id']) {
					this.ukey = param['id'];
					this.isEditMode = true;
					return forkJoin({
						'pageSize': this.gridViewService.getPageSizeforGrid(this.entityId),
						'sectorDropDown': this.costService.getDropDownDataOfSector(),
						'costAccCodeDetails': this.costService.getAllCostAccountingCodeByUkey(this.ukey)
					});
				} else {
					return forkJoin({
						'pageSize': this.gridViewService.getPageSizeforGrid(this.entityId),
						'sectorDropDown': this.costService.getDropDownDataOfSector(),
						'costAccCodeDetails': of(null)
					});
				}
			})
			, takeUntil(this.destroyAllSubscribtion$)
		).subscribe(({pageSize, sectorDropDown, costAccCodeDetails}) => {
			this.getPageSize(pageSize);
			this.getSectorDropDownList(sectorDropDown);
			if(costAccCodeDetails)
				this.getDataByUkey(costAccCodeDetails);

			this.cdr.markForCheck();
		});
	}

	private getDataByUkey(response: GenericResponseBase<CostAccountingCodeSubmit>) {
		if(isSuccessfulResponse(response)) {
			this.costAccountingCodeDetails = response.Data;
			this.isAssigned = this.costAccountingCodeDetails.IsAssigned;
			this.createCommonHeader(this.costAccountingCodeDetails);
			this.validateMinEffectiveDate(this.costAccountingCodeDetails.MinEffectiveEndDate ?? null);
			this.onChangeSectorDrodpdown({ 'Text': this.costAccountingCodeDetails.SectorName ?? '', 'Value': this.costAccountingCodeDetails.SectorId.toString() });
			this.gridData = this.costAccountingCodeDetails.CostAccountingCodeApproverConfiguration.
				map((item: CostAccountingCodeApproverConfig) => {
					item.Disabled = false;
					return item;
				});
			this.gridData = Object.assign([], this.gridData);
		}
	}

	private validateMinEffectiveDate(minEffectiveDate: string|null) {
		if (minEffectiveDate) {
			this.AddEditEventReasonForm.controls['EffectiveEndDate'].clearValidators();
			const datemsg = this.localizationService.TransformDate(minEffectiveDate);
			this.AddEditEventReasonForm.controls['EffectiveEndDate'].
				addValidators([
					this.costService.effectiveEndDateValidation(
						minEffectiveDate,
						this.localizationService.GetLocalizeMessage('EffectiveEndDateTimesheetExpenseAlreadyExist', [{'Value': datemsg, 'IsLocalizeKey': true}])
					)
				]);
			this.AddEditEventReasonForm.controls['EffectiveEndDate'].updateValueAndValidity();
		}
	}

	private createCommonHeader({Disabled, CostCode, Id}: CostAccountingCodeSubmit) {
		this.commonHeaderService.holdData.next({'Disabled': Disabled, 'RuleCode': CostCode, 'Id': Id});
	}

	private processDialogResponse(data: {value:number}) {
		this.toasterService.resetToaster();
		if (data.value === Number(magicNumber.one) || data.value === Number(magicNumber.three)) {
			this.save();
		}
		if (data.value === Number(magicNumber.zero)) {
			this.backToList();
		}
	}

	public backToList = () => {
		this.route.navigateByUrl(NavigationPaths.list);
	};

	private getPageSize(response: GenericResponseBase<{PageSize:number}>) {
		if(isSuccessfulResponse(response)) {
			this.pageSize = response.Data.PageSize;
		}
	}

	private resetAllTheDropDown() {
		this.AddApproverForm.reset();
	}

	public onChangeSectorDrodpdown({Value}: DropdownModel) {
		if (Value) {
			this.isSectorValue = true;
			const sectorId:number = parseInt(Value),
				payload = getUsersWithFilter(sectorId);
			this.resetAllTheData();
			forkJoin({
				'sectorData': this.sectorService.getSectorById(sectorId).pipe(map((res) => {
					return res.Data.ChargeNumberConfiguration;
				})),
				'shiftData': this.costService.getDropDownDataOfShift(sectorId),
				'userData': this.usersService.getUsersWithFilter(payload)
			}).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(({sectorData, shiftData, userData}) => {
				this.handleSectorResponse(sectorData);
				this.getShiftDropDownData(shiftData);
				this.getUsersByRoleGroupData(userData);
				this.cdr.detectChanges();
			}, (() => {
				this.showToaster(ToastOptions.Error, 'Somethingwentwrong');
			}));
		} else {
			this.isSectorValue = false;
		}
	}

	private handleSectorResponse(chargeNumber: SectorChargeNumberConfig | null): void {
		if (chargeNumber) {
			this.dataAfterChangedSector = chargeNumber;
			this.isApproval = this.dataAfterChangedSector.IsMultipleTimeApprovalNeeded ?? false;
			this.allSegmentList = this.createSegmentList(this.dataAfterChangedSector.SectorCostCenterConfigs);

			this.allSegmentList.forEach((el: SectorCostCenterConfig) => {
				this.AddEditEventReasonForm.addControl(el.controlName ?? '', new FormControl(''));
			});

			if(this.dataAfterChangedSector.HasChargeEffectiveDate) {
				this.AddEditEventReasonForm.controls['EffectiveStartDate'].addValidators([
					this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'EffectiveStartDate'),
					this.customValidators.DateGreaterThanWithEqualValidator('EffectiveEndDate', 'FieldSpecificValueLessEqual', [{ Value: 'EffectiveStartDate', IsLocalizeKey: true }, { Value: 'EffectiveEndDate', IsLocalizeKey: true }]) as ValidatorFn
				]);
				this.AddEditEventReasonForm.controls['EffectiveEndDate'].addValidators([
					this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'EffectiveEndDate'),
					this.customValidators.DateLessThanWithEqualValidator('EffectiveStartDate', 'FieldSpecificValueGreaterEqual', [{ Value: 'EffectiveEndDate', IsLocalizeKey: true }, { Value: 'EffectiveStartDate', IsLocalizeKey: true }]) as ValidatorFn
				]);
			}

			if (!this.isEditMode) {
				this.AddValidatorAndUpdateSegment(this.allSegmentList);
			}
			if (this.isEditMode) {
				this.patchSegmentVal();
				this.segmentSetValidation();
			}
		}
	}

	private createSegmentList(sectorCostCenterConfigs: SectorCostCenterConfig[]|null) {
		return (sectorCostCenterConfigs ?? []).map((e, index: number) => {
			e.controlName = `Segment${index + magicNumber.one}`;
			e.localizeName = this.localizationService.GetLocalizeMessage(e.LocalizedKey);
			return e;
		});
	}

	private patchSegmentVal() {
		this.AddEditEventReasonForm.patchValue({
			'Description': this.costAccountingCodeDetails.Description,
			'Sector': { Text: this.costAccountingCodeDetails.SectorName, Value: this.costAccountingCodeDetails.SectorId.toString() },
			'Segment1': this.costAccountingCodeDetails.Segment1,
			'Segment2': this.costAccountingCodeDetails.Segment2,
			'Segment3': this.costAccountingCodeDetails.Segment3,
			'Segment4': this.costAccountingCodeDetails.Segment4,
			'Segment5': this.costAccountingCodeDetails.Segment5,
			'EffectiveStartDate': this.costAccountingCodeDetails.EffectiveStartDate
				? new Date(this.costAccountingCodeDetails.EffectiveStartDate)
				: null,
			'EffectiveEndDate': this.costAccountingCodeDetails.EffectiveEndDate
				? new Date(this.costAccountingCodeDetails.EffectiveEndDate)
				: null
		});
	}

	private resetAllTheData() {
		this.AddValidatorAndUpdate();
		if(!this.isEditMode)
			this.resetAllTheFormBasedOnSector();
		this.resetAllcodeApproverConfig();
	}

	private clearValidatorsAndUpdate(form: FormGroup, controlName: string) {
		const control = form.get(controlName);
		control?.clearValidators();
		control?.updateValueAndValidity();
	}

	private AddValidatorAndUpdate() {
		const controlsToValidate = ['EffectiveStartDate', 'EffectiveEndDate'];
		controlsToValidate.forEach((control: string, index: number) => {
			const controlName = this.AddEditEventReasonForm.get(control);
			controlName?.addValidators(this.customValidators.requiredValidationsWithMessage('PleaseEnterData', controlsToValidate[index]));
			controlName?.updateValueAndValidity();
		});
	}

	private AddValidatorAndUpdateSegment(controlsToValidate: SectorCostCenterConfig[]) {
		if(!this.isAssigned) {
			controlsToValidate.forEach((control: SectorCostCenterConfig) => {
				const controlName = this.AddEditEventReasonForm.get(control.controlName ?? '');
				controlName?.addValidators(this.customValidators.requiredValidationsWithMessage('PleaseEnterData', control.localizeName ?? ''));
				controlName?.updateValueAndValidity();
			});
		}
	}

	public submitForm() {
		for (const controlName in this.AddEditEventReasonForm.controls) {
			this.AddEditEventReasonForm.get(controlName)?.markAsTouched();
		}

		if (!this.dataAfterChangedSector.HasChargeEffectiveDate) {
			this.clearValidatorsAndUpdate(this.AddEditEventReasonForm, 'EffectiveStartDate');
			this.clearValidatorsAndUpdate(this.AddEditEventReasonForm, 'EffectiveEndDate');
		}

		this.AddApproverForm.reset();
		if (this.AddEditEventReasonForm.valid) {
			this.AddEditEventReasonForm.markAllAsTouched();
			this.generatepayLoad();

			if (this.isEditMode) {
				this.processDialogResponse({ value: 3 });
			} else {
				this.processDialogResponse({ value: 1 });
			}
			this.isEdit = false;
		}
	}

	private generatepayLoad() {
		const payload = new CostAccountingCodeSubmit(this.AddEditEventReasonForm.getRawValue(), this.datePipe);
		payload.initializePayload(this.costCodingAccountObj, this.gridData);
	}

	public save() {
		if (this.isEditMode) {
			this.costCodingAccountObj.UKey = this.ukey;
			this.costCodingAccountObj.costAccountingCodeUKey = this.ukey;
			this.costCodingAccountObj.EffectiveStartDate = this.datePipe.transform(this.costCodingAccountObj.EffectiveStartDate, 'MM/dd/YYYY');
			this.costCodingAccountObj.EffectiveEndDate = this.datePipe.transform(this.costCodingAccountObj.EffectiveEndDate, 'MM/dd/YYYY');

			this.costService.updateCostAccountingCode(this.costCodingAccountObj).pipe(
				switchMap((updateCostCodeResponse: GenericResponseBase<null>) => {
					this.eventLogService.isUpdated.next(true);
					const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.costAccountCodeLabelTextParams);
					if (updateCostCodeResponse.StatusCode == Number(HttpStatusCode.Conflict)) {
						this.showToaster(ToastOptions.Error, 'CostCenterAlreadyExists', localizeTextParams);
						this.AddEditEventReasonForm.markAsDirty();
						return of(null);
					} else if (updateCostCodeResponse.StatusCode === Number(HttpStatusCode.Ok)) {
						this.commonService.resetAdvDropdown(this.entityId);
						this.showToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
						this.AddEditEventReasonForm.markAsPristine();
						return this.costService.getAllCostAccountingCodeByUkey(this.ukey);
					} else {
						this.showToaster(ToastOptions.Error, updateCostCodeResponse.Message, localizeTextParams);
						this.AddEditEventReasonForm.markAsDirty();
						return of(null);
					}
				}),
				takeUntil(this.destroyAllSubscribtion$)
			).subscribe((response) => {
				if(response)
					this.getDataByUkey(response);

			});
		} else {
			this.costService.addCostAccountingCode(this.costCodingAccountObj).pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((addCostCodeResponse: GenericResponseBase<null>) => {
					const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.costAccountCodeLabelTextParams);
					if (addCostCodeResponse.StatusCode == Number(HttpStatusCode.Conflict)) {
						this.showToaster(ToastOptions.Error, 'CostCenterAlreadyExists', localizeTextParams);
					} else if (addCostCodeResponse.StatusCode === Number(HttpStatusCode.Ok)) {
						this.commonService.resetAdvDropdown(this.entityId);
						this.showToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
						this.route.navigateByUrl('/xrm/master/cost-accounting-code/list');
					} else {
						this.showToaster(ToastOptions.Error, addCostCodeResponse.Message, localizeTextParams);
					}

				});
		}
		this.cdr.markForCheck();
	}

	private getSectorDropDownList(response: GenericResponseBase<IDropdownWithExtras[]>) {
		if (isSuccessfulResponse(response)) {
			if (response.Data.length == Number(magicNumber.one) && !this.isEditMode) {
				delete response.Data[0].IsSelected;
				delete response.Data[0].TextLocalizedKey;
				this.getDropDownList = response.Data;
				this.AddEditEventReasonForm.patchValue({ 'Sector': response.Data[0] });
				this.onChangeSectorDrodpdown(response.Data[0]);
			} else {
				this.getDropDownList = response.Data;
			}
			this.cdr.markForCheck();
		}
	}

	private getShiftDropDownData(response: GenericResponseBase<DropdownModel[]>) {
		if (isSuccessfulResponse(response)) {
			this.shiftDropdownList = response.Data;
			if(response.Data.length == Number(magicNumber.one)) {
				this.AddApproverForm.patchValue({'Shift': response.Data[0]});
			}
		}
	}

	private getUsersByRoleGroupData(response: GenericResponseBase<unknown>) {
		this.primaryapproverList = response.Data as DropdownModel[];
		if((response.Data as DropdownModel[]).length == Number(magicNumber.one)) {
			this.AddApproverForm.patchValue({'PrimaryApprover': this.primaryapproverList[0]});
			this.onChangePrimaryAndAlternateApprover();
		}
		this.alternateApproverList = response.Data as DropdownModel[];
	}

	private onEditItem = (dataItem: CostAccountingCodeApproverConfig) => {
		this.gridItems = dataItem;
		this.AddApproverForm.controls['Shift'].setValue(dataItem.ShiftId
			? { Text: dataItem.ShiftName, Value: String(dataItem.ShiftId) }
			: null);
		this.AddApproverForm.controls['AlternateApprover'].setValue(dataItem.AltApproverId
			? {
				Text: dataItem.AltApproverName,
				Value: String(dataItem.AltApproverId)
			}
			: null);
		this.AddApproverForm.controls['PrimaryApprover'].setValue(dataItem.ApproverId
			? { Text: dataItem.ApproverName, Value: String(dataItem.ApproverId) }
			: null);
		this.isEdit = true;
		this.AddApproverForm.markAsDirty();
		this.AddApproverForm.controls['CostAccountingCodeApproverId'].patchValue(dataItem.CostAccountingCodeApproverId);
	};

	private onDeleteItem = (dataItem: CostAccountingCodeApproverConfig) => {
		const itemIndex = this.gridData.findIndex((x: CostAccountingCodeApproverConfig) =>
			x.ShiftId == dataItem.ShiftId);
		this.gridData.splice(itemIndex, magicNumber.one);
		this.gridData = Object.assign([], this.gridData);
		if (this.isEdit) {
			this.resetAllTheDropDown();
			this.isEdit = false;
		}
	};

	private resetAllcodeApproverConfig() {
		this.resetAllTheDropDown();
		this.AddApproverForm.get('PrimaryApprover')?.markAsUntouched();
		this.AddApproverForm.get('AlternateApprover')?.markAsUntouched();
		this.AddApproverForm.get('Shift')?.markAsUntouched();
	}

	public addUpdateItemInGrid() {
		this.AddApproverForm.markAsDirty();
		this.AddApproverForm.controls['Shift'].markAllAsTouched();
		this.AddApproverForm.controls['PrimaryApprover'].markAllAsTouched();

		const primaryApprover = this.AddApproverForm.controls['PrimaryApprover'].value?.Value,
			alternateApprover = this.AddApproverForm.controls['AlternateApprover'].value?.Value,
			ShiftId = this.AddApproverForm.get('Shift')?.value.Value;

		if (primaryApprover == alternateApprover && this.commonService.notNullAndUndefined(alternateApprover)) {
			this.AddApproverForm.get('AlternateApprover')?.setErrors({ error: true, message: 'PrimaryAndAlternateCannotBeSame' });
			return;
		}

		if (!this.AddApproverForm.get('PrimaryApprover')?.valid || !this.AddApproverForm.get('Shift')?.valid
			|| !this.AddApproverForm.get('AlternateApprover')?.valid)
			return;

		if (this.isEdit) {
			this.EditModeSubmit(ShiftId);
		} else {
			this.AddModeSubmit(ShiftId);
		}
	}

	private AddModeSubmit(ShiftId: number) {
		let isExists = false;
		isExists = this.gridData.some((x: CostAccountingCodeApproverConfig) =>
			Number(x.ShiftId) == ShiftId);
		if (isExists) {
			this.showToaster(ToastOptions.Error, 'ApproverAlreadyExists');
			return;
		}

		const data = this.getData();

		this.gridData = [...this.gridData, data];
		this.resetAllTheDropDown();
		this.AddApproverForm.markAsDirty();
	}

	private EditModeSubmit(ShiftId: number) {
		let isExists = false;
		if (this.gridItems) {
			const itemIndex = this.gridData.findIndex((x: CostAccountingCodeApproverConfig) =>
				x.ShiftId == this.gridItems?.ShiftId);
			if (itemIndex == -magicNumber.one) {
				this.showToaster(ToastOptions.Error, 'Somethingwentwrong');
			} else {
				isExists = this.gridData.some((x: CostAccountingCodeApproverConfig) =>
					Number(x.ShiftId) == ShiftId && ShiftId != this.gridItems?.ShiftId);
				if (isExists) {
					this.showToaster(ToastOptions.Error, 'ApproverAlreadyExists');
					return;
				}

				this.gridData[itemIndex] = {
					'CostAccountingCodeApproverId': this.gridItems.CostAccountingCodeApproverId,
					'ShiftId': this.AddApproverForm.get('Shift')?.value.Value,
					'ShiftName': this.AddApproverForm.get('Shift')?.value.Text,
					'ApproverId': this.AddApproverForm.get('PrimaryApprover')?.value.Value,
					'ApproverName': this.AddApproverForm.get('PrimaryApprover')?.value.Text,
					'AltApproverId': this.AddApproverForm.get('AlternateApprover')?.value?.Value,
					'AltApproverName': this.AddApproverForm.get('AlternateApprover')?.value?.Text,
					'Disabled': (this.gridItems.CostAccountingCodeApproverId === magicNumber.zero),
					'isDelete': 'Yes'
				};
				this.gridData = Object.assign([], this.gridData);
				this.resetAllTheDropDown();
				this.AddApproverForm.markAsDirty();
				this.isEdit = false;
			}
		}
	}

	private getData() {
		return {
			'CostAccountingCodeApproverId': 0,
			'ShiftId': this.AddApproverForm.get('Shift')?.value.Value,
			'ShiftName': this.AddApproverForm.get('Shift')?.value.Text,
			'ApproverId': this.AddApproverForm.get('PrimaryApprover')?.value.Value,
			'ApproverName': this.AddApproverForm.get('PrimaryApprover')?.value.Text,
			'AltApproverId': this.AddApproverForm.get('AlternateApprover')?.value?.Value,
			'AltApproverName': this.AddApproverForm.get('AlternateApprover')?.value?.Text,
			'Disabled': true,
			'isDelete': 'Yes'
		};
	}

	public cancel() {
		this.route.navigateByUrl('/xrm/master/cost-accounting-code/list');
	}

	// eslint-disable-next-line max-params
	private segmentValidator(minLength: number, maxLength: number, validationMessage?: string, dynamicParam: DynamicParam[] = []): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (control.value == null)
				return null;

			const val = control.value.toString(),
				controlVal = val;

			if (controlVal.length < minLength) {
				return { error: true, message: validationMessage ?? 'RangeValidationMessage', dynamicParam: dynamicParam };
			}

			if (controlVal.length > maxLength) {
				return { error: true, message: validationMessage ?? 'RangeValidationMessage', dynamicParam: dynamicParam };
			}

			return null;
		};
	}

	public onChangePrimaryAndAlternateApprover() {
		const primaryApprover = this.AddApproverForm.controls['PrimaryApprover'].value?.Value,
			alternateApprover = this.AddApproverForm.controls['AlternateApprover'].value?.Value;

		if (primaryApprover == alternateApprover && this.commonService.notNullAndUndefined(alternateApprover)) {
			this.AddApproverForm.get('AlternateApprover')?.setErrors({ error: true, message: 'PrimaryAndAlternateCannotBeSame' });
		} else {
			this.AddApproverForm.get('AlternateApprover')?.setErrors(null);
		}
	}

	private resetAllTheFormBasedOnSector() {
		this.gridData = [];
		this.gridData = Object.assign([], this.gridData);
		const controlsToReset = ['EffectiveStartDate', 'EffectiveEndDate', 'Segment1', 'Segment2', 'Segment3', 'Segment4', 'Segment5', 'Description'];

		controlsToReset.forEach((control) => {
			this.AddEditEventReasonForm.get(control)?.reset();
			this.AddEditEventReasonForm.get(control)?.clearValidators();
			this.AddEditEventReasonForm.get(control)?.updateValueAndValidity();
		});
		this.resetAllTheDropDown();
	}

	private validatorsParams(startingValue: number, endingValue: number) {
		return [
			{ Value: startingValue.toString(), IsLocalizeKey: false },
			{ Value: endingValue.toString(), IsLocalizeKey: false }
		];
	}

	public keyUpSegmentChange(min: number, max: number, controlName: string) {
		min = (min == max)
			? min--
			: min;
		this.AddEditEventReasonForm.controls[controlName].addValidators(this.segmentValidator(
			min,
			max,
			this.localizationService.GetLocalizeMessage('RangeShouldBeLessThanAndGreaterThan', this.validatorsParams(min - magicNumber.one, max))
		));
		this.AddEditEventReasonForm.controls[controlName].updateValueAndValidity();
	}

	private segmentSetValidation() {
		this.allSegmentList.forEach((e: SectorCostCenterConfig) => {
			this.keyUpSegmentChange(e.SegmentMinLength ?? magicNumber.zero, e.SegmentMaxLength ?? magicNumber.zero, e.controlName ?? '');
			this.AddEditEventReasonForm.get(e.controlName ?? '')?.markAllAsTouched();
		});
		this.AddValidatorAndUpdateSegment(this.allSegmentList);
	}

	private showToaster(toasterOptions: ToastOptions, message: string, params: DynamicParam[] = []) {
		if (toasterOptions === ToastOptions.Error) {
			this.toasterService.showToaster(ToastOptions.Error, message, params);
			this.errorToasterEnable = true;
		} else if (toasterOptions === ToastOptions.Success) {
			this.toasterService.showToaster(ToastOptions.Success, message, params);
			this.errorToasterEnable = false;
		}
	}

	ngOnDestroy() {
		if (this.isEditMode || this.errorToasterEnable)
			this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
