import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-background-checks',
	templateUrl: './background-checks.component.html',
	styleUrls: ['./background-checks.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundChecksComponent implements OnInit, OnChanges {
	// get whole location parant form
	@Input() childFormGroup: FormGroup;
	@Input() isEditMode: boolean;
	@Input() isSubmitted: boolean;
	@ViewChild(ListViewComponent) listViewComponent: ListViewComponent;
	public backgroundChecksForm: FormGroup;
	public sectorBackgroundsArray: FormArray;
	@Input() public sectorDetails: any;
	@Input() public locationDetails: any;

	// background check
	public radioButtonArray = [
		{ Text: "Yes", Value: true },
		{ Text: "No", Value: false }
	];

	public backgroundCheckId: string;
	public basicDetailsForm: FormGroup;

	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private customValidators: CustomValidators,
		private widget: WidgetServiceService,
		public localizationService: LocalizationService
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (this.isSubmitted) {
			this.listViewComponent.checkTouched();
		}
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (changes['sectorDetails']) {
			const data = changes['sectorDetails'].currentValue;
			this.getSectorDetailsById(data);
		}
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (changes['locationDetails']) {
			const data = changes['locationDetails'].currentValue;
			this.getLocationDetailsById(data);
		}
	}

	private getSectorDetailsById(data: any) {
		if (data) {
			this.sectorDetails = data;
			this.patchBasicDetails(data);
		}
	}

	private getLocationDetailsById(data: any) {
		if (data) {
			this.locationDetails = data;
			this.patchBasicDetails(data);
		}
	}

	ngOnInit(): void {
		this.widget.updateForm.next(false);
		this.backgroundChecksForm = this.childFormGroup.get('backgroundChecks') as FormGroup;
		this.sectorBackgroundsArray = this.backgroundChecksForm.controls['SectorBackgrounds'] as FormArray;
		this.basicDetailsForm = this.childFormGroup.get('basicDetails') as FormGroup;
		this.subscribeToUpdateFormObs();
	}

	private subscribeToUpdateFormObs(): void {
		this.widget.updateFormObs.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data: any) => {
			if (data) {
				this.backgroundChecksForm.markAsDirty();
			}
		});
	}

	private patchBasicDetails(data: any) {
		if (this.isEditMode) {
			// update background check column json for RfxSowRequired
			this.updateBackgrounCheckColumnJson(this.locationDetails.IsRfxSowRequired);

			this.backgroundChecksForm.patchValue({
				AlternateDrugsAndBackgroundChecksConfigurations:
					(this.locationDetails?.AltDandBChecksConfigurations
						? this.locationDetails?.AltDandBChecksConfigurations
						: false)
			});

			if (this.backgroundChecksForm.controls['AlternateDrugsAndBackgroundChecksConfigurations'].value) {
				if (this.locationDetails?.AltDandBChecksConfigurations) {
					this.onAlternateDrugsAndBackgroundChecksConfigurationsChange(true);
				}
			}
		} else {
			// update background check column json for RfxSowRequired
			this.updateBackgrounCheckColumnJson(this.sectorDetails?.RfxConfiguration?.IsRfxSowRequired);

			// if user has turn switch on then patch whole data of sector
			if (this.backgroundChecksForm.controls['AlternateDrugsAndBackgroundChecksConfigurations'].value) {
				if (this.sectorDetails?.BackgroundCheck?.SectorUkey) {
					this.onAlternateDrugsAndBackgroundChecksConfigurationsChange(true);
				}
			}
		}
	}


	// update background check column json for RfxSowRequired
	private updateBackgrounCheckColumnJson(IsRfxSowRequired: boolean) {
		if (!IsRfxSowRequired) {
			const findIndex = this.backgroundChecksColumn.findIndex((x: any) =>
				x.columnName == 'ICSOW');
			if (findIndex !== Number(magicNumber.minusOne)) {
				// remove index
				this.backgroundChecksColumn.splice(findIndex, magicNumber.one);
				// change colspan configuration for compliance label
				this.backgroundChecksColumn.forEach((element) => {
					if (element.columnName == "ComplianceItemLabel") {
						element.colSpan = 5;
					}
				});
			}
		} else {
			const findIndex = this.backgroundChecksColumn.findIndex((x: any) =>
				x.columnName == 'ICSOW');
			if (findIndex == Number(magicNumber.minusOne)) {
				this.backgroundChecksColumn.push({
					colSpan: 1,
					columnName: 'ICSOW',
					controls: [
						{
							controlType: 'switch',
							controlId: 'IsApplicableForSow',
							defaultValue: false,
							isEditMode: true,
							onLabel: 'Yes',
							dependableVisibility: true,
							offLabel: 'No',
							isDisable: false,
							placeholder: '',
							requiredMsg: 'ReqFieldValidationMessage'
						}
					]
				});
			}
			// change colspan configuration for compliance label
			this.backgroundChecksColumn.forEach((element) => {
				if (element.columnName == "ComplianceItemLabel") {
					element.colSpan = 4;
				}
			});
		}
	}


	// background check configuration section
	public backgroundChecksPrefilledData: any[] = [
		{
			Id: 0,
			ComplianceType: "B",
			IsApplicableForProfessional: false,
			IsApplicableForLi: false,
			IsApplicableForSow: false,
			ComplianceFieldName: "",
			ComplianceItemLabel: "",
			IsVisibleToClient: true
		}
	];

	public onAlternateDrugsAndBackgroundChecksConfigurationsChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchAlternateDrugsAndBackgroundChecksConfigurations();
		} else {
			this.backgroundChecksForm.controls['Id'].setValue(magicNumber.zero);
			this.backgroundChecksForm.controls['allowToFillCandidateWithPendingCompliance'].setValue(false);
			this.backgroundChecksForm.controls['allowAttachPreEmploymentDocToClientEmail'].setValue(false);
			this.backgroundChecksForm.controls['isDrugResultVisible'].setValue(false);
			this.backgroundChecksForm.controls['defaultDrugResultValue'].setValue(false);
			this.backgroundChecksForm.controls['isBackGroundCheckVisible'].setValue(false);
			this.backgroundChecksForm.controls['defaultBackGroundCheckValue'].setValue(false);
			this.backgroundChecksForm.controls['activeClearanceOptionRequired'].setValue(false);
			this.sectorBackgroundsArray.clear();
		}
	}


	private patchAlternateDrugsAndBackgroundChecksConfigurations() {
		this.widget.updateFormObs.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(this.handleFormUpdate);

		setTimeout(() => {
			this.patchBackgroundChecksForm();

			this.handleDrugResultVisibility();
			this.handleBackgroundCheckVisibility();
		}, magicNumber.hundred);

		this.handleBackgroundChecksChange();
	}

	private handleFormUpdate = (data: any) => {
		if (data) {
			this.backgroundChecksForm.markAsDirty();
		}
	};

	private patchBackgroundChecksForm() {
		this.backgroundChecksForm.patchValue({
			Id: this.getBackgroundCheckId(),
			allowToFillCandidateWithPendingCompliance: this.getAllowToFillCandidateWithPendingCompliance(),
			allowAttachPreEmploymentDocToClientEmail: this.getAllowAttachPreEmploymentDocToClientEmail(),
			activeClearanceOptionRequired: this.getActiveClearanceOptionRequired(),
			isDrugResultVisible: this.getIsDrugResultVisible(),
			isBackGroundCheckVisible: this.getIsBackGroundCheckVisible(),
		});
	}

	private getBackgroundCheckId() {
		return this.isEditMode
			? this.locationDetails?.SectorBackgroundCheck?.Id || magicNumber.zero
			: this.sectorDetails?.BackgroundCheck?.Id || magicNumber.zero;
	}

	private getAllowToFillCandidateWithPendingCompliance() {
		return this.isEditMode
			? this.locationDetails?.SectorBackgroundCheck?.FillWithPendingCompliance || false
			: this.sectorDetails?.BackgroundCheck?.AllowToFillCandidateWithPendingCompliance || false;
	}

	private getAllowAttachPreEmploymentDocToClientEmail() {
		return this.isEditMode
			? this.locationDetails?.SectorBackgroundCheck?.AttachPreEmpDocToClientEmail || false
			: this.sectorDetails?.BackgroundCheck?.AllowAttachPreEmploymentDocToClientEmail || false;
	}

	private getActiveClearanceOptionRequired() {
		return this.isEditMode
			? this.locationDetails?.SectorBackgroundCheck?.IsActiveClearance || false
			: this.sectorDetails?.BackgroundCheck?.IsActiveClearance || false;
	}

	private getIsDrugResultVisible() {
		return this.isEditMode
			? this.locationDetails?.SectorBackgroundCheck?.IsDrugResultVisible || false
			: this.sectorDetails?.BackgroundCheck?.IsDrugResultVisible || false;
	}

	private getIsBackGroundCheckVisible() {
		return this.isEditMode
			? this.locationDetails?.SectorBackgroundCheck?.IsBackGroundCheckVisible || false
			: this.sectorDetails?.BackgroundCheck?.IsBackGroundCheckVisible || false;
	}

	private handleDrugResultVisibility() {
		const isDrugResultVisible = this.backgroundChecksForm.value.isDrugResultVisible
			|| this.locationDetails?.SectorBackgroundCheck?.IsDrugResultVisible;
		this.onIsDrugResultVisibleChange(isDrugResultVisible);
	}

	private handleBackgroundCheckVisibility() {
		const isBackGroundCheckVisible = this.backgroundChecksForm.value.isBackGroundCheckVisible
			|| this.locationDetails?.SectorBackgroundCheck?.IsBackGroundCheckVisible;
		this.onIsBackGroundCheckVisibleChange(isBackGroundCheckVisible);
	}

	private handleBackgroundChecksChange() {
		const hasSectorBackgrounds = this.sectorDetails?.BackgroundCheck?.SectorBackgrounds.length
			|| this.locationDetails?.SectorBackgroundCheck?.SectorBackgrounds.length;
		this.onBackgroundChecksChange(hasSectorBackgrounds);
	}


	// background check
	public backgroundChecksColumnConfiguration = {
		isShowfirstColumn: true,
		isShowLastColumn: true,
		changeStatus: false,
		uKey: true,
		Id: true,
		firstColumnName: 'ComplianceFieldName',
		secondColumnName: 'AddMore',
		deleteButtonName: 'Delete',
		noOfRows: 0,
		itemSr: true,
		itemLabelName: 'OnboardingItem',
		firstColumnColSpan: 2,
		lastColumnColSpan: 1,
		isAddMoreValidation: true
	};

	public backgroundChecksColumn: any[] = [
		{
			colSpan: 4,
			columnName: 'OnboardingItemLabel',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'ComplianceItemLabel',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: magicNumber.hundred,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [
						this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'OnboardingItemLabel', IsLocalizeKey: true }]),
						this.customValidators.MaxLengthValidator(magicNumber.hundred, "MaximumCharLimit")
					]
				}
			]
		},
		{
			colSpan: 1,
			columnName: 'Visible',
			tooltipVisible: true,
			tooltipTitile: 'Standard_Field_Name_Visible_Tooltip',
			controls: [
				{
					controlType: 'switch',
					controlId: 'IsVisibleToClient',
					defaultValue: true,
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					requiredMsg: 'ReqFieldVali/dationMessage',
					validators: [],
					onLabel: 'Yes',
					offLabel: 'No'
				}
			]
		},
		{
			colSpan: 1,
			columnName: 'Professional',
			controls: [
				{
					controlType: 'switch',
					controlId: 'IsApplicableForProfessional',
					defaultValue: false,
					isEditMode: true,
					isDisable: false,
					onLabel: 'Yes',
					dependableVisibility: true,
					offLabel: 'No',
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		},
		{
			colSpan: 1,
			columnName: 'LightIndustrial',
			controls: [
				{
					controlType: 'switch',
					controlId: 'IsApplicableForLi',
					defaultValue: false,
					isEditMode: true,
					isDisable: false,
					onLabel: 'Yes',
					offLabel: 'No',
					dependableVisibility: true,
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		},
		{
			colSpan: 1,
			columnName: 'ICSOW',
			controls: [
				{
					controlType: 'switch',
					controlId: 'IsApplicableForSow',
					defaultValue: false,
					isEditMode: true,
					onLabel: 'Yes',
					dependableVisibility: true,
					offLabel: 'No',
					isDisable: false,
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		}
	];

	private onBackgroundChecksChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.setBackgroundChecksPrefieldData();
		} else {
			this.onAddSectorBackground(this.backgroundChecksPrefilledData);
		}
	}

	public tempDataBackground: any;
	public tempOnBoarding: any;
	isDrugAndBackgroundCheckStatus: boolean = false;
	// get assignment type form status valid or invalid
	public getBackgroundChecksFormStatus(list: any) {
		this.tempDataBackground = list.getRawValue();
		this.onAddSectorBackground(this.tempDataBackground);
		this.disableControls(list);
	}

	// set data to be shown prefied when this section open
	private setBackgroundChecksPrefieldData(): void {
		// get data from location & sector
		const data: any = this.isEditMode
			? this.locationDetails.SectorBackgroundCheck.SectorBackgrounds
			: this.sectorDetails.BackgroundCheck.SectorBackgrounds;
		this.backgroundChecksPrefilledData = data.length > magicNumber.zero
			? data
			: this.backgroundChecksPrefilledData;
		this.onAddSectorBackground(this.backgroundChecksPrefilledData);
	}

	private onAddSectorBackground(list: any) {
		this.sectorBackgroundsArray.clear();

		list.forEach((row: any, index: number) => {
			const id = (row.Id !== magicNumber.zero && row.Id !== null)
					? row.Id
					: magicNumber.zero,
				formGroup = this.formBuilder.group({
					Id: [id],
					ComplianceItemLabel: [row.ComplianceItemLabel, [this.customValidators.RequiredValidator()]],
					IsVisibleToClient: [row.IsVisibleToClient ?? false],
					IsApplicableForLi: [row.IsApplicableForLi ?? false],
					IsApplicableForProfessional: [row.IsApplicableForProfessional ?? false],
					IsApplicableForSow: [row.IsApplicableForSow ?? false],
					DisplayOrder: [(index + magicNumber.one)],
					ComplianceType: ['B'],
					ComplianceFieldName: [(index + magicNumber.one)]
				});

			this.sectorBackgroundsArray.push(formGroup);
		});
	}

	private disableControls(form: any) {
		form.controls.forEach((control: any, index: number) => {
			if (index === Number(magicNumber.zero)) {
				this.disableFirstVisibleToClient(control);
			}
			if (index !== Number(magicNumber.zero) && !control.get("IsVisibleToClient").value) {
				this.disableApplicableControls(control);
			}
		});
	}

	private disableFirstVisibleToClient(control: any) {
		control.get("IsVisibleToClient")?.disable({ onlySelf: true, emitEvent: false });
	}

	private disableApplicableControls(control: any): void {
		control.get('IsApplicableForLi')?.disable({ onlySelf: true, emitEvent: false });
		control.get('IsApplicableForProfessional')?.disable({ onlySelf: true, emitEvent: false });
		control.get('IsApplicableForSow')?.disable({ onlySelf: true, emitEvent: false });
	}

	public switchChange(e: any) {
		if (e.control === 'IsVisibleToClient') {
			if (!e.data.value.IsVisibleToClient) {
				e.formData.at(e.index).get('IsApplicableForProfessional')?.setValue(false);
				e.formData.at(e.index).get('IsApplicableForLi')?.setValue(false);
				e.formData.at(e.index).get('IsApplicableForSow')?.setValue(false);
				e.formData.at(e.index).get('IsApplicableForProfessional')?.disable();
				e.formData.at(e.index).get('IsApplicableForLi')?.disable();
				e.formData.at(e.index).get('IsApplicableForSow')?.disable();
			}
			else {
				e.formData.at(e.index).get('IsApplicableForProfessional')?.enable({ onlySelf: true, emitEvent: false });
				e.formData.at(e.index).get('IsApplicableForLi')?.enable({ onlySelf: true, emitEvent: false });
				e.formData.at(e.index).get('IsApplicableForSow')?.enable({ onlySelf: true, emitEvent: false });
			}
		}
		e.formData.at(e.index).get('IsMandatorySign')?.setValue(e.data.value.IsVisibleToClient);
		e.formData.at(e.index).get('IsShowHide')?.setValue(e.data.value.IsVisibleToClient);
	}

	// background check
	public onIsDrugResultVisibleChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchIsDrugResultVisible();
		} else {
			this.backgroundChecksForm.controls['isDrugScreenItemEditable'].setValue(false);
			this.backgroundChecksForm.controls['defaultDrugResultValue'].setValue(false);
		}
	}

	private patchIsDrugResultVisible() {
		setTimeout(() => {
			this.backgroundChecksForm.patchValue({
				isDrugScreenItemEditable: (this.isEditMode
					? (this.locationDetails?.SectorBackgroundCheck?.IsDrugScreenItemEditable || false)
					: (this.sectorDetails?.BackgroundCheck?.IsDrugScreenItemEditable || false)),

				defaultDrugResultValue: (this.isEditMode
					? (this.locationDetails?.SectorBackgroundCheck?.DefaultDrugResultValue || false)
					: (this.sectorDetails?.BackgroundCheck?.IsDrugResultVisible || false))
			});
		});
	}
	// end background check

	public onIsBackGroundCheckVisibleChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchIsBackGroundCheckVisible();
		} else {
			this.backgroundChecksForm.controls['isBackGroundItemEditable'].setValue(false);
			this.backgroundChecksForm.controls['defaultBackGroundCheckValue'].setValue(false);
		}
	}

	private patchIsBackGroundCheckVisible() {
		setTimeout(() => {
			this.backgroundChecksForm.patchValue({
				isBackGroundItemEditable: (this.isEditMode
					? (this.locationDetails?.SectorBackgroundCheck?.IsBackGroundItemEditable || false)
					: (this.sectorDetails?.BackgroundCheck?.IsBackGroundItemEditable || false)),

				defaultBackGroundCheckValue: (this.isEditMode
					? (this.locationDetails?.SectorBackgroundCheck?.DefaultBackGroundCheckValue || false)
					: (this.sectorDetails?.BackgroundCheck?.DefaultBackGroundCheckValue || false))
			});
		}, magicNumber.hundred);
	}
	// end onboarding requirement

	public oneTimeSettingForToggleSwitchToMakeDisable(controlFieldName: any) {
		if (this.isEditMode && this.locationDetails?.[controlFieldName]) {
			return true;
		} else {
			return false;
		}
	}

	public submitBackgroundChecks() {
		this.listViewComponent?.checkTouched();
	}

	ngOnDestroy(): void {
		// unsubscribe from all subscriptions
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

}
