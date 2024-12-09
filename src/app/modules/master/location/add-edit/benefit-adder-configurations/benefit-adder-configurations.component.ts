import { Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { Subject, Subscription, take, takeUntil } from 'rxjs';

@Component({
	selector: 'app-benefit-adder-configurations',
	templateUrl: './benefit-adder-configurations.component.html',
	styleUrls: ['./benefit-adder-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BenefitAdderConfigurationsComponent implements OnInit, OnDestroy {
	// get whole location parant form
	@Input() childFormGroup: FormGroup;

	// get the form is in edit mode or add mode
	@Input() isEditMode: boolean;

	// get is the whole form submitted
	@Input() isSubmitted: boolean;

	// list view widget control component reference
	@ViewChild(ListViewComponent) listViewComponent: ListViewComponent;

	// background check child form
	public benefitAdderConfigurationsForm: FormGroup;

	// make form array for background check field
	public benefitAdderArray: FormArray;

	// whole sector details
	@Input() public sectorDetails: any;

	// whole location details
	@Input() public locationDetails: any;

	public formValueChangesSub: Subscription;

	private basicDetailsForm: FormGroup;

	private unsubscribe$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private customValidators: CustomValidators,
		private widget: WidgetServiceService
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (this.isSubmitted) {
			this.listViewComponent.checkTouched();
		}
		if (changes['sectorDetails']) {
			const data = changes['sectorDetails'].currentValue;
			this.getSectorDetailsById(data);
		}
		if (changes['locationDetails']) {
			const data = changes['locationDetails'].currentValue;
			this.getLocationDetailsById(data);
		}

	}

	private getSectorDetailsById(data: any) {
		this.sectorDetails = data;
		if (data) {
			this.patchBasicDetails(data);
		}
	}

	private getLocationDetailsById(data: any) {
		this.locationDetails = data;
		if (data) {
			this.patchBasicDetails(data);
		}
	}

	ngOnInit(): void {
		this.widget.updateForm.next(false);
		this.benefitAdderConfigurationsForm = this.childFormGroup.get('benefitAdderConfigurations') as FormGroup;
		this.benefitAdderArray = this.benefitAdderConfigurationsForm.controls['benefitAdder'] as FormArray;
		this.basicDetailsForm = this.childFormGroup.get('basicDetails') as FormGroup;
		this.widget.updateFormObs.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
			if (data) {
				this.benefitAdderConfigurationsForm.markAsDirty();
			}
		});
	}

	private basicDetailsSubscription() {
		this.formValueChangesSub = this.basicDetailsForm.controls['sectorId'].valueChanges
			.pipe(take(1))
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((sectorId: any) => {
				if (!sectorId) {
					this.benefitAdderPrefilledData.length = 0;
				}
			});
	}

	private patchBasicDetails(data: any) {
		const benefitAdderControl = this.benefitAdderConfigurationsForm.controls['alternateBenefitAdderConfigurations'];
		if (!this.isEditMode) {
			// if user has turn switch on then patch whole data of sector
			if (benefitAdderControl.value) {
				if (this.sectorDetails?.BenefitAdderConfiguration?.SectorUkey) {
					this.onAlternateBenefitAdderConfigurationsChange(true);
				}
			}
		}
		else {
			benefitAdderControl.patchValue(this.locationDetails?.AltBenefitAdderConfigurations ?? false);
			if (benefitAdderControl.value) {
				if (this.locationDetails?.AltBenefitAdderConfigurations) {
					this.onAlternateBenefitAdderConfigurationsChange(true);
				}
			}
		}

	}


	// benefit adder configuration section
	public benefitAdderPrefilledData: any[] = [];

	public onAlternateBenefitAdderConfigurationsChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchAlternateBenefitAdderConfigurations();
		} else {
			this.benefitAdderConfigurationsForm.controls['requireBenefitAdders'].setValue(false);
			this.onRequireBenefitAddersChange(false);
		}
	}

	private patchAlternateBenefitAdderConfigurations() {
		this.widget.updateFormObs.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
			if (data) {
				this.benefitAdderConfigurationsForm.markAsDirty();
			}
		});
		setTimeout(() => {
			this.benefitAdderConfigurationsForm.patchValue({
				requireBenefitAdders: (this.isEditMode
					? (this.locationDetails?.RequireBenefitAdders || false)
					: (this.sectorDetails?.BenefitAdderConfiguration?.IsBenefitAdder || false))
			});
		}, magicNumber.hundred);
		if (this.sectorDetails?.BenefitAdderConfiguration?.IsBenefitAdder || this.locationDetails?.SectorBenefitAdders.length) {
			this.onRequireBenefitAddersChange(true);
		} else {
			this.onRequireBenefitAddersChange(false);
		}
	}
	public onRequireBenefitAddersChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.basicDetailsSubscription();
			this.onBenefitAdderChange(true);

		} else {
			this.onBenefitAdderChange(false);
		}
	}

	// start assignment Types
	public benefitAdderColumnConfiguration = {
		isShowfirstColumn: true,
		isShowLastColumn: true,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: 'ItemNumber',
		secondColumnName: 'AddMore',
		deleteButtonName: 'Delete',
		noOfRows: 0,
		itemSr: true,
		itemLabelName: 'BenefitAdder',
		firstColumnColSpan: 2,
		lastColumnColSpan: 1,
		isAddMoreValidation: true
	};

	public benefitAdderColumn = [
		{
			colSpan: 9,
			columnName: 'BenefitAdder',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'Label',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: magicNumber.fifty,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'BenefitAdder', IsLocalizeKey: true }])]
				}
			]
		}
	];

	private onBenefitAdderChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.setBenefitAdderPrefieldData();
		} else {
			this.benefitAdderArray.clear();
		}
	}

	public tempDataLocation: any;
	// get assignment type form status valid or invalid
	public getBenefitAdderFormStatus(list: any) {
		this.tempDataLocation = list.getRawValue();
		this.onAddBenefitAdder(this.tempDataLocation);
		this.benefitAdderArray.markAllAsTouched();
	}

	// set data to be shown prefied when this section open
	public setBenefitAdderPrefieldData(): void {
		const data = this.isEditMode
			? this.locationDetails?.SectorBenefitAdders
			: this.sectorDetails.BenefitAdderConfiguration.SectorBenefitAdders;
		this.benefitAdderPrefilledData = data.length > magicNumber.zero
			? data
			: this.benefitAdderPrefilledData;
		this.onAddBenefitAdder(this.benefitAdderPrefilledData);
	}

	private onAddBenefitAdder(list: any) {
		this.benefitAdderArray.clear();
		this.benefitAdderConfigurationsForm.markAllAsTouched();
		list.forEach((row: any, index: number) => {
			this.benefitAdderArray.push(this.formBuilder.group({
				Label: [row.Label, [this.customValidators.RequiredValidator()]],
				Id: [
					(list[index].Id !== magicNumber.zero && list[index].Id !== null)
						? list[index].Id
						: magicNumber.zero
				]
			}));
		});
	}

	public oneTimeSettingForToggleSwitchToMakeDisable(controlFieldName: any) {
		if (this.isEditMode && this.locationDetails?.[controlFieldName]) {
			return true;
		} else {
			return false;
		}
	}

	public submitBenefit() {
		this.listViewComponent?.checkTouched();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
