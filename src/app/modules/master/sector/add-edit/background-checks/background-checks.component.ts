import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { Subject, take, takeUntil } from 'rxjs';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SectorBackground } from '@xrm-core/models/Sector/sector-backgrounds.model';
import { IBackgroundChecksFM, ISectorBackgrounds, patchBackgroundChecks } from './utils/helper';
import { Column, ColumnConfigure, OutputParams } from '@xrm-shared/models/list-view.model';

@Component({
	selector: 'app-background-checks',
	templateUrl: './background-checks.component.html',
	styleUrls: ['./background-checks.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class BackgroundChecksComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
	@ViewChild('input') input: ElementRef;
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() reload: number = magicNumber.zero;
	@Input() isSubmitted: boolean;
	@ViewChild(ListViewComponent) ListViewComponent: ListViewComponent;
	@Input() ShowAll: boolean = false;

	public sectorAllDropdowns: SectorAllDropdowns;
	public backgroundChecksForm: FormGroup<IBackgroundChecksFM>;
	public isDrugResultVisible: boolean = false;
	public isBackGroundCheckVisible: boolean = false;
	public label:string[] = [
		'RequiredBackgroundChecksApplicable',
		'AttestationOnOnboardScreen'
	];

	public prefilledBackgroundDetails: SectorBackground[] = [
		{
			'Id': 0,
			'ComplianceType': "B",
			'IsApplicableForProfessional': false,
			'IsApplicableForLi': false,
			'IsApplicableForSow': false,
			'ComplianceFieldName': "",
			'ComplianceItemLabel': "",
			'IsVisibleToClient': true,
			'IsMandatorySign': true,
			'IsShowHide': true,
			'DisplayOrder': 0
		}
	];
	public columnBackgroundDetailsConfiguration:ColumnConfigure = {
		'isShowfirstColumn': true,
		'isShowLastColumn': true,
		'changeStatus': false,
		'uKey': true,
		'Id': true,
		'firstColumnName': 'ComplianceFieldName',
		'secondColumnName': 'AddMore',
		'deleteButtonName': 'Delete',
		'noOfRows': 0,
		'itemSr': true,
		'itemLabelName': 'OnboardingItem',
		'firstColumnColSpan': 3,
		'lastColumnColSpan': 2,
		'isAddMoreValidation': true,
		'isAddMoreClicked': true,
		'isVisibleAsterick': false
	};
	public columnBackgroundDetails:Column[] = [
		{
			'colSpan': 2,
			'columnName': 'OnboardingItemLabel',
			'asterik': true,
			'controls': [
				{
					'controlType': 'text',
					'controlId': 'ComplianceItemLabel',
					'defaultValue': null,
					'isEditMode': true,
					'isDisable': false,
					'maxlength': 100,
					'isSpecialCharacterAllowed': true,
					'specialCharactersAllowed': [],
					'specialCharactersNotAllowed': [],
					'dependableVisibility': false,
					'placeholder': '',
					'requiredMsg': 'ReqFieldValidationMessage',
					'validators': [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'OnboardingItemLabel')]
				},
				{
					'controlType': '',
					'controlId': 'IsShowHide',
					'defaultValue': true,
					'isEditMode': true,
					'isDisable': false,
					'placeholder': ''
				}
			]
		},
		{
			'colSpan': 1,
			'columnName': 'Visible',
			'tooltipVisible': true,
			'tooltipTitile': 'Standard_Field_Name_Visible_Tooltip',
			'controls': [
				{
					'controlType': 'switch',
					'controlId': 'IsVisibleToClient',
					'defaultValue': true,
					'isEditMode': true,
					'isDisable': false,
					'onLabel': 'Yes',
					'offLabel': 'No',
					'dependableVisibility': false,
					'placeholder': '',
					'validators': []
				}
			]
		},
		{
			'colSpan': 1,
			'columnName': 'Professional',
			'controls': [
				{
					'controlType': 'switch',
					'controlId': 'IsApplicableForProfessional',
					'defaultValue': false,
					'isEditMode': true,
					'isDisable': false,
					'onLabel': 'Yes',
					'dependableVisibility': true,
					'offLabel': 'No',
					'placeholder': '',
					'requiredMsg': 'ReqFieldValidationMessage',
					'validators': []
				}
			]
		},
		{
			'colSpan': 1,
			'columnName': 'LightIndustrial',
			'controls': [
				{
					'controlType': 'switch',
					'controlId': 'IsApplicableForLi',
					'defaultValue': false,
					'isEditMode': true,
					'isDisable': false,
					'onLabel': 'Yes',
					'offLabel': 'No',
					'dependableVisibility': true,
					'placeholder': '',
					'requiredMsg': 'ReqFieldValidationMessage',
					'validators': []
				}
			]
		},
		{
			'colSpan': 1,
			'columnName': 'ICSOW',
			'controls': [
				{
					'controlType': 'switch',
					'controlId': 'IsApplicableForSow',
					'defaultValue': false,
					'isEditMode': true,
					'onLabel': 'Yes',
					'dependableVisibility': true,
					'offLabel': 'No',
					'isDisable': false,
					'placeholder': '',
					'requiredMsg': 'ReqFieldValidationMessage',
					'validators': []
				}
			]
		}
	];
	private isEditMode: boolean;
	private getFormErrorStatus: number = magicNumber.zero;
	private SectorBackgroundsArray: FormArray<FormGroup<ISectorBackgrounds>>;
	private SectorBackgroundsArrayError: FormArray;
	private destroyAllSubscribtion$ = new Subject<void>();
	private tempDataBackground: SectorBackground[];

	// eslint-disable-next-line max-params
	constructor(
		private sectorService: SectorService,
		private store: Store,
		private el: ElementRef,
		private widget: WidgetServiceService,
		private cdr: ChangeDetectorRef
	) {}
	ngAfterViewInit(): void {
		if (this.isSubmitted && this.SectorBackgroundsArrayError?.invalid && this.isEditMode) {
			this.ListViewComponent.checkTouched();
			this.SectorBackgroundsArrayError.markAllAsTouched();
		}
	}

	ngOnChanges() {
		this.isEditMode = this.formStatus;
		if (this.isSubmitted) {
			this.ListViewComponent.checkTouched();
			this.SectorBackgroundsArrayError.markAllAsTouched();
		}

		if (this.reload) {
			this.switchIsBackGroundCheckVisible(this.backgroundChecksForm.controls.IsBackGroundCheckVisible.value);
			this.switchIsDrugResultVisible(this.backgroundChecksForm.controls.IsDrugResultVisible.value);
			this.sectorService.onAddSectorBackground(this.prefilledBackgroundDetails, this.SectorBackgroundsArray);
		}
	}

	ngOnInit(): void {
		this.sectorService.setFormInitStatus(magicNumber.fifteen);
		this.getFormErrorStatus = this.sectorService.getFormErrorStatus(magicNumber.fifteen);
		if (!this.ShowAll)
			this.sectorService.makeScreenScrollOnUpdate(this.el);

		this.widget.updateForm.next(false);
		this.backgroundChecksForm = this.childFormGroup.get('BackgroundCheck') as FormGroup<IBackgroundChecksFM>;
		this.SectorBackgroundsArray = this.backgroundChecksForm.controls.SectorBackgrounds as FormArray<FormGroup<ISectorBackgrounds>>;

		this.store.select(SectorState.getSectorAllDropdowns).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: SectorAllDropdowns) => {
			this.sectorAllDropdowns = data;
			this.cdr.markForCheck();
		});

		this.widget.updateFormObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
			if (data) {
				this.backgroundChecksForm.markAsDirty();
			}
		});

		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	private AddMode() {
		this.sectorService.getBackgroundDetails.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if (data) {
				this.prefilledBackgroundDetails = data;
			}
			this.sectorService.onAddSectorBackground(this.prefilledBackgroundDetails, this.SectorBackgroundsArray);
			this.cdr.markForCheck();
		});
		this.switchIsBackGroundCheckVisible(this.backgroundChecksForm.controls.IsBackGroundCheckVisible.value);
		this.switchIsDrugResultVisible(this.backgroundChecksForm.controls.IsDrugResultVisible.value);
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({BackgroundCheck}) => {
				patchBackgroundChecks(BackgroundCheck, this.backgroundChecksForm);
				this.prefilledBackgroundDetails = BackgroundCheck.SectorBackgrounds.length > Number(magicNumber.zero)
					? BackgroundCheck.SectorBackgrounds
					: this.prefilledBackgroundDetails;
				this.prefilledBackgroundDetails.map((row) => {
					row.IsMandatorySign = row.IsVisibleToClient;
					row.IsShowHide = row.IsVisibleToClient;
				});
				this.switchIsBackGroundCheckVisible(BackgroundCheck.IsBackGroundCheckVisible);
				this.switchIsDrugResultVisible(BackgroundCheck.IsDrugResultVisible);
				this.sectorService.onAddSectorBackground(this.prefilledBackgroundDetails, this.SectorBackgroundsArray);
				this.cdr.markForCheck();
			});
	}


	getFormStatus(list: FormArray) {
		if (this.getFormErrorStatus > Number(magicNumber.one)) {
			list.markAllAsTouched();
		}
		this.SectorBackgroundsArrayError = list;
		this.handleBooleanClearance(list);
		this.setupWidgetUpdateFormObs(list);

		if((list.touched || !list.pristine)) {
			this.backgroundChecksForm.markAsDirty();
		}
	}

	private setupWidgetUpdateFormObs(list: FormArray) {
		setTimeout(() => {
			this.widget.updateFormObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
				if (!data) {
					this.handleDataSubscription(list);
				}
				this.columnBackgroundDetailsConfiguration.isAddMoreValidation = true;
				this.cdr.markForCheck();
			});
		}, magicNumber.hundred);
	}

	private handleDataSubscription(list: FormArray) {
		this.prefilledBackgroundDetails.forEach((row, index: number) => {
			this.handleBooleanClearanceDetails(list, row, index);
		});
	}

	private handleBooleanClearanceDetails(list: FormArray, row: SectorBackground, index: number) {
		list.at(magicNumber.zero).get('IsVisibleToClient')?.setValue(true, { onlySelf: true, emitEvent: false });
		list.at(magicNumber.zero).get('IsVisibleToClient')?.disable({ onlySelf: true, emitEvent: false });
		const complianceItemLabelControl = list.at(index).get('ComplianceItemLabel');

		if (row.IsVisibleToClient) {
			complianceItemLabelControl?.addValidators([this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'OnboardingItemLabel')]);
			complianceItemLabelControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
		} else {
			complianceItemLabelControl?.clearValidators();
			complianceItemLabelControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
		}
	}

	private handleBooleanClearance(list: FormArray) {
		this.tempDataBackground = list.getRawValue();
		this.sectorService.onAddSectorBackground(this.tempDataBackground, this.SectorBackgroundsArray);
	}

	switchIsDrugResultVisible(toggle: boolean) {
		this.isDrugResultVisible = toggle;
	}

	arraySwitchChange(e: OutputParams) {
		if (e.control === 'IsVisibleToClient' && !e.data.value.IsVisibleToClient) {
			this.NotVisibleToClient(e);
		}
		e.formData.at(e.index).get('IsMandatorySign')?.setValue(e.data.value.IsVisibleToClient);
		e.formData.at(e.index).get('IsShowHide')?.setValue(e.data.value.IsVisibleToClient);
	}

	private NotVisibleToClient(e: OutputParams) {
		e.formData.at(e.index).get('IsApplicableForProfessional')?.setValue(false);
		e.formData.at(e.index).get('IsApplicableForLi')?.setValue(false);
		e.formData.at(e.index).get('IsApplicableForSow')?.setValue(false);
	}

	switchIsBackGroundCheckVisible(toggle: boolean) {
		this.isBackGroundCheckVisible = toggle;
	}

	ngOnDestroy(): void {
		if (this.isEditMode) {
			this.sectorService.holdBackgroundDetails.next(null);
		}
		else {
			this.sectorService.holdBackgroundDetails.next(this.tempDataBackground);
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}

}


