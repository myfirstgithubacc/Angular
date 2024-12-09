import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ExpenseTypeService } from 'src/app/services/masters/expense-type.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { NavigationPaths } from '../route-constants/route-constants';
import { ExpenseTypeAddEdit } from '@xrm-core/models/expense-type/add-Edit/expense-type-add-edit';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { Subject, forkJoin, map, of, switchMap, take, takeUntil } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { DropdownModel, IDropdownWithExtras } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public isEditMode: boolean = false;
	public addEditExpenseTypeForm: FormGroup;
	private ukey: string;
	public magicNumber = magicNumber;
	public sectorDropDownList: DropdownModel[];
	public natureExpenseDropDownList: DropdownModel[];
	private expenseTypeLabelTextParams: DynamicParam[] = [{ Value: 'ExpenseType', IsLocalizeKey: true }];
	private expenseTypeDataByUkey: ExpenseTypeAddEdit;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private sectorService: SectorService,
		private expenseTypeService: ExpenseTypeService,
		private customvalidators: CustomValidators,
		private toasterService: ToasterService,
		private localizationService: LocalizationService,
		private activatedRoute: ActivatedRoute,
		private eventLog: EventLogService,
		private cdr: ChangeDetectorRef
	) {
		this.addEditExpenseTypeForm = this.formBuilder.group({
			'SectorId': [null, [this.customvalidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]],
			'ExpenseTypeName': [null, [this.customvalidators.RequiredValidator('PleaseEnterData', [{ Value: 'ExpenseType', IsLocalizeKey: true }])]],
			'Description': [null],
			'ExpenseTypeCode': [null, [this.customvalidators.RequiredValidator('PleaseEnterData', [{ Value: 'ExpenseTypeCode', IsLocalizeKey: true }])]],
			'AvailableToClp': [true],
			'IsMspFeeAdded': [false],
			'NatureOfExpenseId': [null, [this.customvalidators.RequiredValidator('PleaseSelectData', [{ Value: 'NatureofExpense', IsLocalizeKey: true }])]]
		});
	}

	ngOnInit(): void {
		forkJoin({
			'NatureOfExpenseRes': this.expenseTypeService.getNatureOfExpenseDropDown('NatureExpense'),
			'SectorDropdownRes': this.sectorService.getSectorDropDownList(),
			'RouteRes': this.activatedRoute.params.pipe(map( (res) => { return res['id'];}), take(magicNumber.one))
		}).pipe(switchMap((data: {NatureOfExpenseRes: GenericResponseBase<DropdownModel[]>,
			SectorDropdownRes:GenericResponseBase<IDropdownWithExtras[]>, RouteRes:string}) => {
			if(isSuccessfulResponse(data.NatureOfExpenseRes))
				this.natureExpenseDropDownList = data.NatureOfExpenseRes.Data;
			this.sectorDropdownResponse(data.SectorDropdownRes);
			if (data.RouteRes) {
				this.isEditMode = true;
				this.ukey = data.RouteRes;
			}
			if(this.ukey)
				return this.expenseTypeService.getExpenseTypeByUkey(this.ukey);
			else
				return of(null);
		}), takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ExpenseTypeAddEdit> | null) => {
				if(res && isSuccessfulResponse(res))
					this.getExpenseDetailsByUkey(res);
				this.cdr.markForCheck();
			});
	}

	private sectorDropdownResponse(SectorDropdownRes:GenericResponseBase<IDropdownWithExtras[]>){
		if(isSuccessfulResponse(SectorDropdownRes)){
			if (SectorDropdownRes.Data.length == Number(magicNumber.one) && !this.isEditMode) {
				delete SectorDropdownRes.Data[magicNumber.zero].IsSelected;
				delete SectorDropdownRes.Data[magicNumber.zero].TextLocalizedKey;
				this.sectorDropDownList = SectorDropdownRes.Data;
				this.addEditExpenseTypeForm.patchValue({
					'SectorId': SectorDropdownRes.Data[magicNumber.zero]
				});
			} else {
				this.sectorDropDownList = SectorDropdownRes.Data;
			}
		}


	}

	private getExpenseDetailsByUkey(response:GenericResponseBase<ExpenseTypeAddEdit>) {
		if (isSuccessfulResponse(response)) {
			this.expenseTypeDataByUkey = response.Data;
			this.expenseTypeService.holdData.next({'Disabled': this.expenseTypeDataByUkey.Disabled, 'RuleCode': this.expenseTypeDataByUkey.ExpenseCode, 'Id': this.expenseTypeDataByUkey.Id});
			this.patchExpenseTypeReactiveForm(this.expenseTypeDataByUkey);
		}

	}

	private patchExpenseTypeReactiveForm(copiedData: ExpenseTypeAddEdit) {
		this.addEditExpenseTypeForm.patchValue({
			'SectorId': { Text: copiedData.SectorName, Value: copiedData.SectorId?.toString() },
			'ExpenseTypeName': copiedData.ExpenseTypeName,
			'Description': copiedData.Description,
			'ExpenseTypeCode': copiedData.ExpenseTypeCode,
			'AvailableToClp': copiedData.AvailableToClp,
			'IsMspFeeAdded': copiedData.IsMspFeeAdded,
			'NatureOfExpenseId': { Text: copiedData.NatureExpense, Value: copiedData.NatureOfExpenseId?.toString() }
		});
	}


	public backToList() {
		return this.router.navigate([`${NavigationPaths.list}`]);
	}


	private addNewExpenseType(payload: ExpenseTypeAddEdit) {
		this.expenseTypeService.addNewExpenseType(payload).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ExpenseTypeAddEdit>) => {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.expenseTypeLabelTextParams);
				if (isSuccessfulResponse(res)) {
					this.toasterService.displayToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
					this.backToList();
				}
				else if (hasValidationMessages(res)) {
					ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
				}
				else if (res.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, res.Message);
				}
				this.cdr.markForCheck();
			});
	}

	private updateExpenseType(payload: ExpenseTypeAddEdit) {
		this.expenseTypeService.updateExpenseType(payload).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ExpenseTypeAddEdit>) => {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.expenseTypeLabelTextParams);
				if (isSuccessfulResponse(res)) {
					this.toasterService.displayToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
					this.addEditExpenseTypeForm.markAsPristine();
					this.eventLog.isUpdated.next(true);
					this.cdr.markForCheck();
				}
				else if (hasValidationMessages(res)) {
					ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
					this.addEditExpenseTypeForm.markAsDirty();
				}
				else if (res.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, res.Message, localizeTextParams);
					this.addEditExpenseTypeForm.markAsDirty();
				}
				this.cdr.markForCheck();
			});
	}

	public submitForm() {
		this.addEditExpenseTypeForm.markAllAsTouched();
		const payload: ExpenseTypeAddEdit = new ExpenseTypeAddEdit(this.addEditExpenseTypeForm.getRawValue());
		if (this.addEditExpenseTypeForm.valid) {
			if (this.isEditMode) {
				payload.UKey = this.ukey;
				this.updateExpenseType(payload);
			} else {
				this.addNewExpenseType(payload);
			}
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
