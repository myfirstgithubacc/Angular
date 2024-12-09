
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { Subject, take, takeUntil } from 'rxjs';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IChargeNumberConfigFM, ISectorCostCenterConfig, patchCostAccCodeConfig } from './utils/helper';
import { SectorCostCenterConfig } from '@xrm-core/models/Sector/sector-cost-center-configs.model';
import { SectorChargeNumberConfiguration } from '@xrm-core/models/Sector/sector-charge-number-configuration.model';
import { resetFormArrayErrorsOnSectorEdit } from '@xrm-master/sector/common/common-sector-code';
import { IDropdown } from '@xrm-shared/models/common.model';
import { Column, OutputParams } from '@xrm-shared/models/list-view.model';

@Component({
	selector: 'app-charge-number-configurations',
	templateUrl: './charge-number-configurations.component.html',
	styleUrls: ['./charge-number-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChargeNumberConfigurationsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() isSubmitted: boolean;
	@Input() ShowAll: boolean = false;

	@ViewChild(ListViewComponent) ListViewComponent: ListViewComponent|undefined;

	public isEditMode: boolean;
	public chargeNumberConfigForm: FormGroup<IChargeNumberConfigFM>;
	public storeCostAccConfigArray: SectorCostCenterConfig[] = [];
	public isDisableIsChargeEnteredManually: boolean;

	public getFormErrorStatus: number = magicNumber.zero;
	public segmentslist: IDropdown[] = [{ Text: "1", Value: '1' }, { Text: "2", Value: '2' }, { Text: "3", Value: '3' }, { Text: "4", Value: '4' }, { Text: "5", Value: '5' }];
	public isSwitchChargeEnteredManully: boolean = false;
	public prefilledData: SectorCostCenterConfig[] = [{ "Id": 0, "SegmentName": null, "SegmentMinLength": null, "SegmentMaxLength": null }];
	public columnConfigure = {
		isShowfirstColumn: true,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		isAddMoreValidation: false,
		Id: true,
		firstColumnName: 'S.No.',
		secondColumnName: 'AddMore',
		deleteButtonName: 'Delete',
		noOfRows: Number(magicNumber.zero),
		itemSr: true,
		itemLabelName: ' ',
		itemlabelLocalizeParam: [{ Value: 'Sector', IsLocalizeKey: true }],
		firstColumnColSpan: Number(magicNumber.zero),
		lastColumnColSpan: Number(magicNumber.zero)
	};

	public costCenterConfigCenterColumns: Column[] = [
		{
			columnWidth: '70px',
			columnName: 'SegmentName',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'SegmentName',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					maxlength: 100,
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'SegmentName')]
				}
			]
		},
		{
			colSpan: 2,
			columnName: 'SegmentMinLength',
			asterik: true,
			controls: [
				{
					controlType: 'number',
					controlId: 'SegmentMinLength',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					format: 'n0',
					min: Number(magicNumber.one),
					decimals: Number(magicNumber.zero),
					maxlength: Number(magicNumber.two),
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'SegmentMinLength')]
				}
			]
		},
		{
			colSpan: Number(magicNumber.two),
			columnName: 'SegmentMaxLength',
			asterik: true,
			controls: [
				{
					controlType: 'number',
					controlId: 'SegmentMaxLength',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					format: 'n0',
					decimals: Number(magicNumber.zero),
					min: Number(magicNumber.one),
					maxlength: Number(magicNumber.two),
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'SegmentMaxLength')]
				}
			]
		}
	];

	private destroyAllSubscribtion$ = new Subject<void>();
	private sectorCostCenterConfigFA: FormArray<FormGroup<ISectorCostCenterConfig>>;
	private CostAccConfigShowError: FormArray;

	// eslint-disable-next-line max-params
	constructor(
		private customvalidators: CustomValidators,
		private sectorService: SectorService,
		private store: Store,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) { }
	ngAfterViewInit(): void {
		if (this.isSubmitted && this.CostAccConfigShowError?.invalid && this.isEditMode) {
			this.ListViewComponent?.checkTouched();
			this.CostAccConfigShowError.markAllAsTouched();
		}
	}

	ngOnChanges() {
		this.isEditMode = this.formStatus;

		if (this.isSubmitted) {
			this.ListViewComponent?.checkTouched();
			this.CostAccConfigShowError.markAllAsTouched();
		}

		if (this.reload) {
			this.subscribeToFormArrayData();
			this.disableSwitchInEditMode(this.childFormGroup.get('ChargeNumberConfiguration')?.value);
			this.switchChargeEnteredManully(this.childFormGroup.get('ChargeNumberConfiguration.IsChargeEnteredManually')?.value);
			this.switchIsMultipleTimeApprovalNeeded(this.childFormGroup.get('ChargeNumberConfiguration.IsMultipleTimeApprovalNeeded')?.value);
		}
	}

	ngOnInit(): void {
		this.sectorService.setFormInitStatus(magicNumber.fourteen);
		this.getFormErrorStatus = this.sectorService.getFormErrorStatus(magicNumber.fourteen);

		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}

		this.chargeNumberConfigForm = this.childFormGroup.get('ChargeNumberConfiguration') as FormGroup<IChargeNumberConfigFM>;
		this.sectorCostCenterConfigFA = this.chargeNumberConfigForm.controls.SectorCostCenterConfigs as FormArray<FormGroup<ISectorCostCenterConfig>>;

		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	private AddMode() {
		this.subscribeToFormArrayData();
		this.switchChargeEnteredManully(this.chargeNumberConfigForm.controls.IsChargeEnteredManually.value);
		this.switchIsMultipleTimeApprovalNeeded(this.chargeNumberConfigForm.controls.IsMultipleTimeApprovalNeeded.value);
	}

	// for Sector Edit and Copy a Sector...
	subscribeToFormArrayData() {
		this.sectorService.getPersistChargeNumber.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if (data) {
				this.prefilledData = data.length > Number(magicNumber.zero)
					? data
					: [...this.prefilledData, ...data];
				this.cdr.markForCheck();
			}
			this.sectorService.onAddCostAccCenterConfig(this.prefilledData, this.sectorCostCenterConfigFA);
		});
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({ ChargeNumberConfiguration }) => {
				patchCostAccCodeConfig(ChargeNumberConfiguration, this.chargeNumberConfigForm);
				this.prefilledData = ChargeNumberConfiguration.SectorCostCenterConfigs.length > Number(magicNumber.zero)
					? ChargeNumberConfiguration.SectorCostCenterConfigs
					: this.prefilledData;

				this.disableSwitchInEditMode(ChargeNumberConfiguration);
				this.switchChargeEnteredManully(ChargeNumberConfiguration.IsChargeEnteredManually);
				this.switchIsMultipleTimeApprovalNeeded(ChargeNumberConfiguration.IsMultipleTimeApprovalNeeded);
				this.sectorService.onAddCostAccCenterConfig(this.prefilledData, this.sectorCostCenterConfigFA);
				this.cdr.markForCheck();
			});
	}

	private disableSwitchInEditMode({ IsChargeEnteredManually }: SectorChargeNumberConfiguration) {
		this.isDisableIsChargeEnteredManually = IsChargeEnteredManually;
	}

	switchIsMultipleTimeApprovalNeeded(toggle: boolean) {
		if (toggle) {
			this.chargeNumberConfigForm.controls.IsChargeEnteredManually.setValue(false);
			this.chargeNumberConfigForm.controls.IsChargeEnteredManually.disable();
			this.isSwitchChargeEnteredManully = true;
		} else {
			this.chargeNumberConfigForm.controls.IsChargeEnteredManually.enable();
		}
	}

	OnChangeNum(e: OutputParams) {
		if (e.control === 'SegmentMinLength') {
			e.formData.at(e.index).get('SegmentMinLength')?.setValidators([this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'SegmentMinLength'), this.customvalidators.RangeValidator(magicNumber.one, e.data.value.SegmentMaxLength, 'MinLengthCannotBeGreaterThanMaxLength')]);
			e.formData.at(e.index).get('SegmentMinLength')?.updateValueAndValidity();

			e.formData.at(e.index).get('SegmentMaxLength')?.clearValidators();
			e.formData.at(e.index).get('SegmentMaxLength')?.updateValueAndValidity();
			e.formData.at(e.index).get('SegmentMaxLength')?.setValidators(this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'SegmentMaxLength'));
			e.formData.at(e.index).get('SegmentMaxLength')?.updateValueAndValidity();
		} else {
			e.formData.at(e.index).get('SegmentMaxLength')?.setValidators([this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'MaxLength'), this.customvalidators.RangeValidator(e.data.value.SegmentMinLength, magicNumber.ninetyNine, 'MinLengthCannotBeGreaterThanMaxLength')]);
			e.formData.at(e.index).get('SegmentMaxLength')?.updateValueAndValidity();

			e.formData.at(e.index).get('SegmentMinLength')?.clearValidators();
			e.formData.at(e.index).get('SegmentMinLength')?.updateValueAndValidity();
			e.formData.at(e.index).get('SegmentMinLength')?.setValidators(this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'SegmentMinLength'));
			e.formData.at(e.index).get('SegmentMinLength')?.updateValueAndValidity();
		}
	}

	getFormStatus(formArray: FormArray) {
		if (this.getFormErrorStatus > Number(magicNumber.one)) {
			formArray.markAllAsTouched();
		}
		this.CostAccConfigShowError = formArray;
		this.storeCostAccConfigArray = formArray.value;
		this.sectorService.onAddCostAccCenterConfig(this.storeCostAccConfigArray, this.sectorCostCenterConfigFA);
		// list-view widget formArray gets touched then touch our form...
		if (!formArray.pristine) {
			this.sectorCostCenterConfigFA.markAsTouched();
			this.sectorCostCenterConfigFA.markAsDirty();
		}
		resetFormArrayErrorsOnSectorEdit(formArray);
	}

	switchChargeEnteredManully(toggle: boolean) {
		this.isSwitchChargeEnteredManully = !toggle;
	}

	onChangeSegments(event: IDropdown | undefined) {
		if(event) {
			const countOfRows = Number(event.Value),
				removeRow = this.prefilledData.length - countOfRows,
				addRow = countOfRows - this.prefilledData.length,
				objects: SectorCostCenterConfig[] = [];

			if (this.prefilledData.length >= countOfRows) {
				this.prefilledData = this.prefilledData.
					splice(magicNumber.zero, this.prefilledData.length - removeRow);
			}
			else {
				for (let x = Number(magicNumber.zero); x < addRow; x++) {
					objects.push({ "Id": Number(magicNumber.zero), "SegmentName": '', "SegmentMinLength": null, "SegmentMaxLength": null });
				}
				this.prefilledData = [...this.prefilledData, ...objects];

			}
			this.sectorService.onAddCostAccCenterConfig(this.prefilledData, this.sectorCostCenterConfigFA);
			this.chargeNumberConfigForm.markAsDirty();
		}
	}

	ngOnDestroy(): void {
		if (this.isEditMode) {
			this.sectorService.holdPersistChargeNumber.next(null);
		} else {
			this.sectorService.holdPersistChargeNumber.next(this.storeCostAccConfigArray);
		}

		this.sectorService.clearTimeout();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
