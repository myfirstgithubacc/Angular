
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { UniqueSubmittal } from '@xrm-core/models/Sector/sector-unique-submittal.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ISubmittalConfigFM, IUniqueSubmittal, patchSubmittalConfig } from './utils/helper';
import { Subject, take, takeUntil } from 'rxjs';
import { Column, ColumnConfigure, NumericChangeData, OutputParams } from '@xrm-shared/models/list-view.model';

@Component({selector: 'app-submittal-configurations',
	templateUrl: './submittal-configurations.component.html',
	styleUrls: ['./submittal-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmittalConfigurationsComponent implements OnInit, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() ShowAll: boolean = false;
	@Input() isSubmitted: boolean;
	@ViewChild(ListViewComponent) ListViewComponent: ListViewComponent;

	private destroyAllSubscribtion$ = new Subject<void>();
	private uidMaxLength: number = magicNumber.zero;
	private uidDynamicLabel: string = 'UID';
	private uidDynamicColumnname: string = 'UIDLength';
	private isEditMode: boolean;

	public label:string[] = ['UID'];
	public submittalConfigForm: FormGroup;
	public magicNumbers = magicNumber;
	public IsSubmittalReminderToManager: boolean | null | undefined = false;
	public SubmittalReminderToStaffingForNotOfferAccepting: boolean | null = false;
	private uniqueSubmittalFormArray: FormArray<FormGroup<IUniqueSubmittal>>;
	public getFormErrorStatus: number = magicNumber.zero;
	public AllowSupplierToSubmitExistingClps: boolean = false;
	public prefilledData: UniqueSubmittal[] = [
		{
			'Id': magicNumber.zero,
			'LabelName': this.uidDynamicLabel,
			'ToolTip': null,
			'MaxLength': null,
			'IsNumeric': false,
			'IsPartialEntry': false,
			'RightmostChars': null
		}
	];

	public columnSubmitalConfig:ColumnConfigure = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: 'CurrentFieldName',
		secondColumnName: '',
		deleteButtonName: '',
		noOfRows: magicNumber.zero,
		itemSr: true,
		itemLabelName: '',
		firstColumnColSpan: magicNumber.zero,
		lastColumnColSpan: magicNumber.zero,
		isAddMoreValidation: false,
		widgetId: 'UniqueSubmittals'
	};

	private arr1: UniqueSubmittal[];

	public column:Column[] = [
		{
			colSpan: magicNumber.one,
			columnName: 'StandardFieldName',
			controls: [
				{
					controlType: 'label',
					controlId: 'CurrentFieldName',
					defaultValue: this.uidDynamicLabel,
					isEditMode: true,
					isDisable: true,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					placeholder: ''
				}
			]
		},
		{
			colSpan: magicNumber.one,
			columnName: 'CurrentFieldName',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'LabelName',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					maxlength: magicNumber.fifty,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					placeholder: '',
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'CurrentFieldName')]
				}
			]
		},
		{
			colSpan: magicNumber.one,
			columnName: 'ToolTip',
			controls: [
				{
					controlType: 'text',
					controlId: 'ToolTip',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					maxlength: magicNumber.fiveThousand,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		},
		{
			colSpan: magicNumber.one,
			columnName: this.uidDynamicColumnname,
			asterik: true,
			controls: [
				{
					controlType: 'number',
					controlId: 'MaxLength',
					isEditMode: true,
					defaultValue: null,
					format: 'n0',
					maxlength: magicNumber.two,
					min: magicNumber.zero,
					isDisable: true,
					decimals: magicNumber.zero,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', this.uidDynamicColumnname)]
				}
			]
		},
		{
			colSpan: magicNumber.one,
			columnName: 'Numeric',
			controls: [
				{
					controlType: 'switch',
					controlId: 'IsNumeric',
					defaultValue: true,
					onLabel: 'Yes',
					offLabel: 'No',
					isEditMode: true,
					isDisable: true,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					placeholder: ''
				}
			]
		},
		{
			colSpan: magicNumber.one,
			columnName: 'IsPartialEntry',
			controls: [
				{
					controlType: 'switch',
					controlId: 'IsPartialEntry',
					defaultValue: '',
					isEditMode: true,
					onLabel: 'Yes',
					offLabel: 'No',
					isDisable: true,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.customvalidators.RequiredValidator()]
				}
			]
		},
		{
			colSpan: magicNumber.one,
			columnName: 'RightmostChars',
			asterik: true,
			controls: [
				{
					controlType: 'number',
					controlId: 'RightmostChars',
					format: 'n0',
					maxlength: magicNumber.hundred,
					defaultValue: null,
					min: magicNumber.zero,
					decimals: magicNumber.zero,
					isEditMode: true,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					isDisable: true,
					placeholder: ''
				}
			]
		}
	];

	// eslint-disable-next-line max-params
	constructor(
		private customvalidators: CustomValidators,
		private sectorService: SectorService,
		private store: Store,
		private el: ElementRef,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.initializeForm();
		this.initializeSubmittalConfigurations();

		if (this.isDraft || !this.isEditMode) {
			this.enableColumns();
		}

		if (this.isEditMode) {
			this.EditMode();
		}
		else {
			this.AddMode();
		}
		if (!this.isEditMode && !this.isDraft && !this.prefilledData[0].IsPartialEntry)
			this.DisableMode();
	}

	private initializeForm(){
		this.sectorService.setFormInitStatus(magicNumber.nine);
		this.getFormErrorStatus = this.sectorService.getFormErrorStatus(magicNumber.nine);
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}
	}

	private initializeSubmittalConfigurations(){
		this.submittalConfigForm = this.childFormGroup.get('SubmittalConfiguration') as FormGroup<ISubmittalConfigFM>;
		this.uniqueSubmittalFormArray = this.submittalConfigForm.controls['UniqueSubmittals'] as FormArray<FormGroup<IUniqueSubmittal>>;
	}

	private enableColumns(){
		this.column.forEach((row) => {
			row.controls[0].isDisable = false;
		});
	}

	private subscribeToUniqueSubmittals() {
		this.sectorService.getUniqueSubmittals.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if(data){
				this.prefilledData = data.length > Number(magicNumber.zero)
					? data
					: [...this.prefilledData, ...data];

				this.uidMaxLength = data[0]?.MaxLength ?? magicNumber.zero;
				this.cdr.markForCheck();
			}
		});
		this.sectorService.onAddSectorSubmittal(this.prefilledData, this.uniqueSubmittalFormArray, this.uidDynamicColumnname);
	}

	private patchDataFromConfigurClient() {
		this.sectorService.configureClientUIDObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
			// UID Settings coming from Configure Client is 0 then use default setting otherwise use configure client setting...
			if(response?.UidLength) {
				this.ConfigureClientUID(response);
				this.cdr.markForCheck();
			}
		});
	}

	ngOnChanges() {
		this.isEditMode = this.formStatus;

		if (this.isSubmitted) {
			this.ListViewComponent.checkTouched();
		}

		if (this.reload) {
			this.subscribeToUniqueSubmittals();
			this.alterRightMostChars();

			this.IsSubmittalReminderToManager = this.submittalConfigForm.controls['IsSubmittalReminderToManager'].value;
			this.SubmittalReminderToStaffingForNotOfferAccepting =
				this.submittalConfigForm.controls['SubmittalReminderToStaffingForNotOfferAccepting'].value;

			this.switchSendReminderStaffingAgenciesOfferAccepting(this.submittalConfigForm.get('SubmittalReminderToStaffingForNotOfferAccepting')?.value);
			this.switchSendSubmittalReminderManager(this.submittalConfigForm.get('IsSubmittalReminderToManager')?.value);
		}
	}

	private ConfigureClientUID(uidData: {
    IsUidNumeric: boolean;
    UidLength: number|null;
    UidLabelLocalizedKey: string;
}) {
		this.prefilledData[0].MaxLength = uidData.UidLength;
		this.prefilledData[0].IsNumeric = uidData.IsUidNumeric;
		this.label[0] = uidData.UidLabelLocalizedKey;
		this.uidDynamicLabel = this.localizationService.GetLocalizeMessage(uidData.UidLabelLocalizedKey);
		this.uidDynamicColumnname = this.localizationService.GetLocalizeMessage(
			'DynamicLength',
			[{ Value: this.uidDynamicLabel, IsLocalizeKey: true }]
		);
		this.column[0].controls[0].defaultValue = this.uidDynamicLabel;

		this.column[3].columnName = this.uidDynamicColumnname;
		this.uidMaxLength = uidData.UidLength ?? magicNumber.zero;
		this.prefilledData[0].LabelName = this.uidDynamicLabel;
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(Number(magicNumber.one)), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({SubmittalConfiguration}) => {
				patchSubmittalConfig(SubmittalConfiguration, this.submittalConfigForm);

				if (SubmittalConfiguration.UniqueSubmittals.length) {
					this.patchUniqueSubmittals(SubmittalConfiguration.UniqueSubmittals[0]);
				}

				this.IsSubmittalReminderToManager = SubmittalConfiguration.IsSubmittalReminderToManager;
				this.SubmittalReminderToStaffingForNotOfferAccepting = SubmittalConfiguration.SubmittalReminderToStaffingForNotOfferAccepting;

				this.sectorService.onAddSectorSubmittal(this.prefilledData, this.uniqueSubmittalFormArray, this.uidDynamicColumnname);
				this.switchSendReminderStaffingAgenciesOfferAccepting(this.submittalConfigForm.get('SubmittalReminderToStaffingForNotOfferAccepting')?.value);
				this.switchSendSubmittalReminderManager(this.submittalConfigForm.get('IsSubmittalReminderToManager')?.value);
				this.cdr.markForCheck();
			});

		if (!this.uniqueSubmittalFormArray.value[0].IsPartialEntry) {
			this.uniqueSubmittalFormArray.at(magicNumber.zero).get('RightmostChars')?.clearValidators();
			this.uniqueSubmittalFormArray.at(magicNumber.zero).get('RightmostChars')?.disable();
			this.uniqueSubmittalFormArray.at(magicNumber.zero).get('RightmostChars')?.updateValueAndValidity();
			this.alterRightMostChars();
		}
	}

	private AddMode() {
		this.subscribeToUniqueSubmittals();
		this.switchSendReminderStaffingAgenciesOfferAccepting(this.submittalConfigForm.get('SubmittalReminderToStaffingForNotOfferAccepting')?.value);
		this.switchSendSubmittalReminderManager(this.submittalConfigForm.get('IsSubmittalReminderToManager')?.value);
		this.patchDataFromConfigurClient();
	}

	private alterRightMostChars() {
		this.column.forEach((row) => {
			if (row.columnName === 'RightmostChars') {
				row.asterik = false;
				row.controls[0].isDisable = true;
			}
		});
	}

	private DisableMode() {
		this.alterRightMostChars();

		this.IsSubmittalReminderToManager = this.submittalConfigForm.controls['IsSubmittalReminderToManager'].value;
		this.SubmittalReminderToStaffingForNotOfferAccepting =
			this.submittalConfigForm.controls['SubmittalReminderToStaffingForNotOfferAccepting'].value;
	}

	private patchUniqueSubmittals(data: UniqueSubmittal) {
		this.submittalConfigForm.patchValue({
			Id: data.Id ?? magicNumber.zero,
			LabelName: data.LabelName,
			ToolTip: data.ToolTip,
			MaxLength: data.MaxLength,
			IsNumeric: data.IsNumeric,
			IsPartialEntry: data.IsPartialEntry,
			RightmostChars: data.RightmostChars
		});

		this.uidMaxLength = data.MaxLength ?? magicNumber.zero;

		this.prefilledData = [
			{
				"Id": data.Id ?? magicNumber.zero,
				"LabelName": data.LabelName,
				"ToolTip": data.ToolTip,
				"MaxLength": data.MaxLength,
				"IsNumeric": data.IsNumeric,
				"IsPartialEntry": data.IsPartialEntry,
				"RightmostChars": data.RightmostChars
			}
		];
	}


	getFormStatus(list: FormArray) {
		if(this.getFormErrorStatus > Number(magicNumber.one)) {
			list.markAllAsTouched();
		}
		this.arr1 = list.getRawValue();
		this.sectorService.onAddSectorSubmittal(this.arr1, this.uniqueSubmittalFormArray, this.uidDynamicColumnname);
		if(this.uidMaxLength > Number(magicNumber.zero)) {
			list.at(magicNumber.zero).get('MaxLength')?.disable({ emitEvent: false});
			list.at(magicNumber.zero).get('IsNumeric')?.disable({ emitEvent: false});
		}
		if(!list.pristine) {
			this.submittalConfigForm.markAsDirty();
		}
	}

	OnChangeNum(e: NumericChangeData) {
		if ((e.control === 'MaxLength' || e.control === 'RightmostChars') && e.data.value.IsPartialEntry) {
			e.formData.at(e.index).get('RightmostChars')?.setValidators([
				this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'RightmostChars'), this.customvalidators.RangeValidator(
					magicNumber.four, e.data.value.MaxLength
					, 'RightMostCharatersShouldBeGreatest', [{ Value: this.uidDynamicColumnname, IsLocalizeKey: true }]
				)
			]);
			e.formData.at(e.index).get('RightmostChars')?.updateValueAndValidity();

		}
		else if (e.control === 'MaxLength' && !e.data.value.IsPartialEntry) {
			this.clearAndDisableRightmostCharsValidators(e);
		}
	}

	clearAndDisableRightmostCharsValidators(e: NumericChangeData) {
		e.formData.at(e.index).get('RightmostChars')?.clearValidators();
		e.formData.at(e.index).get('RightmostChars')?.disable();
		e.formData.at(e.index).get('RightmostChars')?.setValue(null);
		e.formData.at(e.index).get('RightmostChars')?.updateValueAndValidity();

		this.column.forEach((row) => {
			if (row.columnName == 'RightmostChars') {
				row.asterik = false;
			}
		});
	}

	switchSendSubmittalReminderManager(toggle: boolean) {
		this.IsSubmittalReminderToManager = toggle;
	}

	switchSendReminderStaffingAgenciesOfferAccepting(toggle: boolean) {
		this.SubmittalReminderToStaffingForNotOfferAccepting = toggle;
	}

	switchEvent(e: OutputParams) {
		if (e.control === 'IsPartialEntry') {
			if (e.data.value.IsPartialEntry) {
				e.formData.at(e.index).get('RightmostChars')?.enable();
				e.formData.at(e.index).get('RightmostChars')?.setValidators([
					this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'RightmostChars'), this.customvalidators.RangeValidator(
						magicNumber.four, e.data.value.MaxLength
						, 'RightMostCharatersShouldBeGreatest', [{ Value: this.uidDynamicColumnname, IsLocalizeKey: true }]
					)
				]);
				e.formData.at(e.index).get('RightmostChars')?.updateValueAndValidity();
				this.column.forEach((row) => {
					if (row.columnName === 'RightmostChars') {
						row.asterik = false;
					}
				});
			}
			else {
				this.clearAndDisableRightmostCharsValidators(e);
			}
		}
	}

	ngOnDestroy(): void {
		if ((this.isEditMode && !this.isDraft)) {
			this.sectorService.holdUniqueSubmittals.next(null);
		} else {
			this.sectorService.holdUniqueSubmittals.next(this.arr1);
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}

}
