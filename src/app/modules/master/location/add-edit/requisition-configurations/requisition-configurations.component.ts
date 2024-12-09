import { Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { Subject, Subscription, take, takeUntil } from 'rxjs';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({
	selector: 'app-requisition-configurations',
	templateUrl: './requisition-configurations.component.html',
	styleUrls: ['./requisition-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequisitionConfigurationsComponent implements OnInit, OnDestroy {
	// get whole location parant form
	@Input() childFormGroup: FormGroup;

	// get the form is in edit mode or add mode
	@Input() isEditMode: boolean;

	// get is the whole form submitted
	@Input() isSubmitted: boolean;

	// list view widget control component reference
	@ViewChild(ListViewComponent) listViewComponent: ListViewComponent;

	// basic details child form
	public requisitionConfigurationForm: FormGroup;

	// make form array for background check field
	public assignmentTypesArray: FormArray;

	// get location whole data
	@Input() public locationDetails: any;

	// get sector whole data
	@Input() public sectorDetails: any;
	private unsubscribe$ = new Subject<void>();

	// start assignment Types
	public assignmentTypesColumnConfiguration = {
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
		itemLabelName: '',
		firstColumnColSpan: 1,
		lastColumnColSpan: 1,
		isAddMoreValidation: true,
		widgetId: 'AssignmentType'
	};

	public assignmentTypesColumn = [
		{
			colSpan: 10,
			columnName: 'ItemTitle',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'AssignmentName',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: magicNumber.hundred,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'ItemTitle', IsLocalizeKey: true }])]
				}
			]
		}
	];
	public assignmentId: string;

	public formValueChangesSub: Subscription;

	private basicDetailsForm: FormGroup;

	constructor(
		private customValidators: CustomValidators,
		private widget: WidgetServiceService,
		private formBuilder: FormBuilder
	) { }

	ngOnChanges(changes: SimpleChanges) {
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
		// get only location details formgroup from parent form and bind that in child form
		this.requisitionConfigurationForm = this.childFormGroup.get('requisitionConfiguration') as FormGroup;
		this.assignmentTypesArray = this.requisitionConfigurationForm.controls['assignmentTypes'] as FormArray;
		this.basicDetailsForm = this.childFormGroup.get('basicDetails') as FormGroup;

		this.widget.updateFormObs.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
			if (data) {
				this.requisitionConfigurationForm.markAsDirty();
			}
		});

	}

	private basicDetailsSubscription() {
		this.formValueChangesSub = this.basicDetailsForm.controls['sectorId'].valueChanges
			.pipe(take(magicNumber.one))
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((sectorId: any) => {
				if (!sectorId) {
					this.assignmentTypesPrefilledData.length = 0;
				}
			});
	}


	private patchBasicDetails(data: any) {
		const alternateReqControl = this.requisitionConfigurationForm.controls['alternateRequisitionConfigurations'];

		if (!this.isEditMode) {
			// if user has turn switch on then patch whole data of sector
			if (alternateReqControl.value && (this.sectorDetails?.RequisitionConfiguration?.SectorUkey ||
				this.locationDetails?.AltRequisitionConfigurations)) {
				this.onAlternateRequisitionConfigurationsChange(true);
			}

		}
		else {
			alternateReqControl.patchValue(this.locationDetails?.AltRequisitionConfigurations ?? false)

			if (alternateReqControl.value && (this.sectorDetails?.RequisitionConfiguration?.SectorUkey ||
				this.locationDetails?.AltRequisitionConfigurations)) {
				this.onAlternateRequisitionConfigurationsChange(true);
			}
		}
	}


	// requisition configuration form prefield data to be shown when load this section
	public assignmentTypesPrefilledData: any[] = [];

	public onAlternateRequisitionConfigurationsChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchAlternateRequisitionConfigurations();
		} else {
			this.requisitionConfigurationForm.controls['showExtendedWorkLocationAddress'].setValue(true);
			this.requisitionConfigurationForm.controls['positionDetailsEditable'].setValue(false);
			this.onAssignmentTypeChange(false);
		}
	}

	private patchAlternateRequisitionConfigurations() {
		this.widget.updateFormObs.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
			if (data) {
				this.requisitionConfigurationForm.markAsDirty();
			}
		});
		setTimeout(() => {
			this.requisitionConfigurationForm.patchValue({
				showExtendedWorkLocationAddress: true,
				positionDetailsEditable: (this.isEditMode
					? (this.locationDetails?.PositionDetailsEditable || false)
					: (this.sectorDetails?.RequisitionConfiguration?.IsPositionDetailsEditable || false))
			});
		}, magicNumber.hundred);
		if (this.sectorDetails?.RequisitionConfiguration?.SectorAssignmentTypes.length || this.locationDetails?.SectorAssignmentTypes.length) {
			this.onAssignmentTypeChange(true);
		} else {
			this.onAssignmentTypeChange(false);
		}
	}

	private onAssignmentTypeChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.basicDetailsSubscription();
			this.setAssignmentTypePrefieldData();
		} else {
			this.assignmentTypesArray.clear();
		}
	}

	public tempDataLocation: any;
	// get assignment type form status valid or invalid
	getAssignmentTypesFormStatus(list: any) {
		this.tempDataLocation = list.getRawValue();
		this.onAddAssignmentType(this.tempDataLocation);
		this.assignmentTypesArray.markAllAsTouched();
	}

	// set data to be shown prefied when this section open
	private setAssignmentTypePrefieldData(): void {
		const data = this.isEditMode
			? this.locationDetails?.SectorAssignmentTypes
			: this.sectorDetails.RequisitionConfiguration.SectorAssignmentTypes;
		this.assignmentTypesPrefilledData = data.length > magicNumber.zero
			? data
			: this.assignmentTypesPrefilledData;
		this.onAddAssignmentType(this.assignmentTypesPrefilledData);
	}

	private onAddAssignmentType(list: any) {
		this.assignmentTypesArray.clear();
		this.requisitionConfigurationForm.markAllAsTouched();
		list.forEach((row: any, index: number) => {
			this.assignmentTypesArray.push(this.formBuilder.group({
				AssignmentName: [row.AssignmentName, [this.customValidators.RequiredValidator()]],
				displayOrder: [(index + magicNumber.one)],
				Id: [
					(list[index].Id !== magicNumber.zero && list[index].Id !== null)
						? list[index].Id
						: magicNumber.zero
				]
			}));
		});
	}

	public getAlternateRequisitionConfigurationsValue() {
		if (this.isEditMode && this.requisitionConfigurationForm?.get('alternateRequisitionConfigurations')?.value) {
			return true;
		} else {
			return false;
		}
	}
	// end requisition configuration

	public oneTimeSettingForToggleSwitchToMakeDisable(controlFieldName: any) {
		if (this.isEditMode && this.locationDetails?.[controlFieldName]) {
			return true;
		} else {
			return false;
		}
	}
	public submitRequisitionConfigurations() {
		this.listViewComponent?.checkTouched();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
