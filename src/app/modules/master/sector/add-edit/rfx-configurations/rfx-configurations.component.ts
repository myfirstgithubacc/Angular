import { FormArray, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { Subject, take, takeUntil } from 'rxjs';
import { PoTypeSowIcs } from '@xrm-shared/services/common-constants/static-data.enum';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SectorRfxStandardField } from '@xrm-core/models/Sector/sector-rfx-standard-fields.model';
import { SectorSowCommodityType } from '@xrm-core/models/Sector/sector-sow-commodity-types.model';
import { IRfxConfigFM, ISectorRfxStandardFields, ISectorSowCommodityType, patchRfxConfig } from './utils/helper';
import { resetFormArrayErrorsOnSectorEdit } from '@xrm-master/sector/common/common-sector-code';
import { LabelTextItem } from 'src/app/modules/contractor/contractor-details/constant/contractor-interface';
import { IRadioWithExtras } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-rfx-configurations',
	templateUrl: './rfx-configurations.component.html',
	styleUrls: ['./rfx-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RfxConfigurationsComponent implements OnInit, OnChanges, OnDestroy {

	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() ShowAll: boolean = false;
	@Input() isSubmitted: boolean;
	@ViewChild(ListViewComponent) ListViewComponent: ListViewComponent|undefined;

	public isEditMode: boolean;
	public RfxConfigForm: FormGroup<IRfxConfigFM>;
	public isPORecruitment: boolean = false;
	public isSwitchTotalSOWCertainValue: boolean = false;
	public isSwitchRFXSOW: boolean = false;
	public POType: IRadioWithExtras[];
	public disableControls: boolean = false;
	public magicNumbers = magicNumber;
	public sectorLabelTextParams: DynamicParam[] = [
		{ Value: 'Sector', IsLocalizeKey: true },
		{ Value: 'Sector', IsLocalizeKey: true }
	];

	public RfxStandardLabelText: LabelTextItem[] = [
		{ label: 'RfxName', tooltipVisible: false, tooltipTitle: '' },
		{ label: 'RfxType', tooltipVisible: false, tooltipTitle: '' },
		{ label: 'PaymentRequestOption', tooltipTitle: '' },
		{ label: 'OpenDate', tooltipVisible: false, tooltipTitle: '' },
		{ label: 'KeyComponent', tooltipVisible: false, tooltipTitle: '' }
	];

	public RfxStandardPrefilledData: SectorRfxStandardField[] = [
		{ Id: magicNumber.zero, RfxLabelId: magicNumber.one, DisplayName: 'RFx Name', StandardFieldName: 'RFx Name' },
		{ Id: magicNumber.zero, RfxLabelId: magicNumber.two, DisplayName: 'RFx Type', StandardFieldName: 'RFx Type' },
		{ Id: magicNumber.zero, RfxLabelId: magicNumber.three, DisplayName: 'Payment Request Option', StandardFieldName: 'Payment Request Option' },
		{ Id: magicNumber.zero, RfxLabelId: magicNumber.four, DisplayName: 'Open Date', StandardFieldName: 'Open Date' },
		{ Id: magicNumber.zero, RfxLabelId: 5, DisplayName: 'Key Component', StandardFieldName: 'Key Component' }
	];

	public CommodityTypeLabelText = [
		{ label: 'ServiceLabor', tooltipVisible: false, tooltipTitle: '' },
		{ label: 'Material', tooltipVisible: false, tooltipTitle: '' },
		{ label: 'ServiceRecurring', tooltipVisible: false, tooltipTitle: '' },
		{ label: 'RateCardItem', tooltipVisible: true, tooltipTitle: 'Rate_Card_Item_Tooltip' }
	];

	public CommodityTypeNamePrefilledData: SectorSowCommodityType[] = [
		{ Id: magicNumber.zero, SowCommodityConfigId: magicNumber.one, CommodityTypeName: 'Service-Labor', CurrentCommodityTypeName: 'Service-Labor', Active: false },
		{ Id: magicNumber.zero, SowCommodityConfigId: magicNumber.two, CommodityTypeName: 'Material', CurrentCommodityTypeName: 'Material', Active: false },
		{ Id: magicNumber.zero, SowCommodityConfigId: magicNumber.three, CommodityTypeName: 'Service-Recurring', CurrentCommodityTypeName: 'Service-Recurring', Active: false },
		{ Id: magicNumber.zero, SowCommodityConfigId: magicNumber.four, CommodityTypeName: 'Rate Card Item', CurrentCommodityTypeName: 'Rate Card Item', Active: false }
	];

	// Rfx Standards Form Array
	public RfxStandardColumns = [
		{
			colSpan: magicNumber.four,
			columnName: 'StandardFieldName',
			asterik: false,
			controls: [
				{
					controlType: 'label',
					controlId: 'StandardFieldName',
					defaultValue: 'RfxStandardPrefilledData.StandardFieldName',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					requiredMsg: ''
				}
			]
		},
		{
			colSpan: magicNumber.eight,
			columnName: 'CurrentFieldName',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'DisplayName',
					defaultValue: 'DisplayName',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: magicNumber.fifty,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'CurrentFieldName'), this.customvalidators.MaxLengthValidator(magicNumber.fifty, "MaximumCharLimit")]
				}
			]
		}
	];

	// Commodity Type Form Array
	public CommodityTypeColumns = [
		{
			colSpan: magicNumber.four,
			columnName: 'CommodityTypeName',
			asterik: false,
			controls: [
				{
					controlType: 'label',
					controlId: 'CommodityTypeName',
					defaultValue: 'CommodityTypeNamePrefilledData.CommodityTypeName',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					requiredMsg: ''
				}
			]
		},
		{
			colSpan: magicNumber.six,
			columnName: 'CurrentCommodityTypeName',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'CurrentCommodityTypeName',
					defaultValue: 'CurrentCommodityTypeName',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: magicNumber.fifty,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'CurrentCommodityTypeName'), this.customvalidators.MaxLengthValidator(magicNumber.fifty, "MaximumCharLimit")]
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'Active',
			asterik: false,
			controls: [
				{
					controlType: 'switch',
					controlId: 'Active',
					onLabel: 'Yes',
					offLabel: 'No',
					defaultValue: false,
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: magicNumber.fifty,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true
				}
			]
		}
	];

	public RfxStandardFieldColumnConfigs = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		noOfRows: magicNumber.zero,
		itemSr: false,
		isAddMoreValidation: false,
		widgetId: 'RfxStandardField'
	};

	public CommodityTypesColumnConfigs = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		noOfRows: magicNumber.zero,
		itemSr: false,
		isAddMoreValidation: false,
		widgetId: 'CommodityTypes'
	};
	public countryId: number|undefined;

	private getFormErrorStatus: number = magicNumber.zero;
	private sectorRfxStandardFA: FormArray<FormGroup<ISectorRfxStandardFields>>;
	private sectorRfxStandardShowError: FormArray|undefined;
	private sectorSowCommodityFA: FormArray<FormGroup<ISectorSowCommodityType>>;
	private sectorSowCommodityShowError: FormArray|undefined;
	private RfxArr: SectorRfxStandardField[];
	private CommodityArr: SectorSowCommodityType[];

	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private customvalidators: CustomValidators,
		private sectorService: SectorService,
		private store: Store,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) { }

	ngOnChanges() {
		this.isEditMode = this.formStatus;

		if (this.isSubmitted) {
			this.ListViewComponent?.checkTouched();
			this.sectorRfxStandardShowError?.markAllAsTouched();
			this.sectorSowCommodityShowError?.markAllAsTouched();
		}

		if (this.reload) {
			this.subscribeToFormArray();
			this.switchRFXSOW(this.RfxConfigForm.controls.IsRfxSowRequired.value ?? false);

			this.sectorService.onAddRfxStandardFields(this.RfxStandardPrefilledData, this.sectorRfxStandardFA);
			this.sectorService.onAddCommodityTypes(this.CommodityTypeNamePrefilledData, this.sectorSowCommodityFA);
		}
	}

	ngOnInit(): void {
		this.sectorService.setFormInitStatus(Number(magicNumber.thirteen));
		this.getFormErrorStatus = this.sectorService.getFormErrorStatus(Number(magicNumber.thirteen));

		this.childFormGroup.get('BasicDetail')?.valueChanges.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((value) => {
			this.countryId = parseInt(value.CountryId.Value);
			this.cdr.markForCheck();
		});

		if (this.countryId == Number(magicNumber.zero) || this.countryId == undefined) {
			this.getCountryData();
		}

		if (!this.ShowAll)
			this.sectorService.makeScreenScrollOnUpdate(this.el);

		this.RfxConfigForm = this.childFormGroup.get('RfxConfiguration') as FormGroup<IRfxConfigFM>;
		this.sectorRfxStandardFA = this.RfxConfigForm.controls.SectorRfxStandardFields as FormArray<FormGroup<ISectorRfxStandardFields>>;
		this.sectorSowCommodityFA = this.RfxConfigForm.controls.SectorSowCommodityTypes as FormArray<FormGroup<ISectorSowCommodityType>>;

		this.store.select(SectorState.getSectorAllDropdowns).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: SectorAllDropdowns) => {
			this.POType = data.PoTypeSowIcs ?? [{'Text': '', 'Value': ''}];
			this.cdr.markForCheck();
		});

		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	getCountryData() {
		this.countryId = (this.childFormGroup.get('BasicDetail')?.get('CountryId')?.value?.Value == undefined)
			? parseInt(this.childFormGroup.get('BasicDetail')?.get('CountryId')?.value)
			: parseInt(this.childFormGroup.get('BasicDetail')?.get('CountryId')?.value?.Value);
	}

	private AddMode() {
		this.subscribeToFormArray();
		this.switchRFXSOW(this.RfxConfigForm.controls.IsRfxSowRequired.value ?? false);

		this.sectorService.onAddRfxStandardFields(this.RfxStandardPrefilledData, this.sectorRfxStandardFA);
		this.sectorService.onAddCommodityTypes(this.CommodityTypeNamePrefilledData, this.sectorSowCommodityFA);
	}

	private subscribeToFormArray() {
		// ForkJoin is not working...
		this.sectorService.getRfxStandardField.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((RfxStandardField) => {
			if (RfxStandardField) {
				this.RfxStandardPrefilledData = RfxStandardField;
			}
			this.cdr.markForCheck();
		});

		this.sectorService.getCommodityTypes.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((CommodityTypes) => {
			if (CommodityTypes) {
				this.CommodityTypeNamePrefilledData = CommodityTypes;
			}
			this.cdr.markForCheck();
		});
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({RfxConfiguration}: Sector) => {

				patchRfxConfig(RfxConfiguration, this.RfxConfigForm);
				this.switchRFXSOW(RfxConfiguration.IsRfxSowRequired);

				this.disableControlsOnEdit();

				if (RfxConfiguration.SectorRfxStandardFields.length && RfxConfiguration.IsRfxSowRequired)
					this.RfxStandardPrefilledData = RfxConfiguration.SectorRfxStandardFields;

				if (RfxConfiguration.SectorSowCommodityTypes.length && RfxConfiguration.IsRfxSowRequired) {
					this.CommodityTypeNamePrefilledData = RfxConfiguration.SectorSowCommodityTypes;
				}

				this.sectorService.onAddRfxStandardFields(this.RfxStandardPrefilledData, this.sectorRfxStandardFA);
				this.sectorService.onAddCommodityTypes(this.CommodityTypeNamePrefilledData, this.sectorSowCommodityFA);

				this.cdr.markForCheck();
			});
	}

	private disableControlsOnEdit = () =>
		this.disableControls = true;

	onPOClick(event: string | null) {
		if (event == PoTypeSowIcs['Single Po'].toString()) {
			this.isPORecruitment = true;
		}
		else {
			this.isPORecruitment = false;
		}
	}

	switchRFXSOW(toggle: boolean) {
		this.isSwitchRFXSOW = toggle;
		if (toggle) {
			this.switchTotalSOWCertainValue(this.RfxConfigForm.controls.IsSowAmountLimitRequired.value);
			this.onPOClick(this.RfxConfigForm.controls.PoTypeSowIc.value);
		}
	}

	switchTotalSOWCertainValue(toggle: boolean) {
		this.isSwitchTotalSOWCertainValue = toggle;
	}

	getFormStatus(formArray: FormArray) {
		if(this.getFormErrorStatus > Number(magicNumber.one)) {
			formArray.markAllAsTouched();
		}
		if ('RfxStandardField' in formArray.value[0]) {
			this.sectorRfxStandardShowError = formArray;
			this.RfxArr = formArray.value;
			this.sectorService.onAddRfxStandardFields(formArray.value, this.sectorRfxStandardFA);
			this.sectorRfxStandardFA.markAllAsTouched();
			// list-view widget formArray gets touched then touch our form...
			if(!formArray.pristine) {
				this.sectorRfxStandardFA.markAsTouched();
				this.sectorRfxStandardFA.markAsDirty();
			}
		}
		else if ('CommodityTypes' in formArray.value[0]) {
			this.sectorSowCommodityShowError = formArray;
			this.CommodityArr = formArray.value;
			this.sectorService.onAddCommodityTypes(formArray.value, this.sectorSowCommodityFA);
			this.sectorSowCommodityFA.markAllAsTouched();
			// list-view widget formArray gets touched then touch our form...
			if(!formArray.pristine) {
				this.sectorSowCommodityFA.markAsTouched();
				this.sectorSowCommodityFA.markAsDirty();
			}
		}
		resetFormArrayErrorsOnSectorEdit(formArray);
	}

	ngOnDestroy() {
		if ((this.isEditMode && !this.isDraft)) {
			this.sectorService.holdRfxStandardField.next(null);
			this.sectorService.holdCommodityTypes.next(null);
		} else {
			this.sectorService.holdRfxStandardField.next(this.RfxArr);
			this.sectorService.holdCommodityTypes.next(this.CommodityArr);
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}

