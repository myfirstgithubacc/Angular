
import { Subject, takeUntil } from 'rxjs';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ListViewComponent } from '@xrm-widgets';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { removeFormArrayValidations, resetFormArrayErrorsOnSectorEdit } from '@xrm-master/sector/common/common-sector-code';
import { IBenefitAdderConfigFM, ISectorBenefitAdders, patchBenefitAdderConfig } from './utils/helper';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorBenefitAdder } from '@xrm-core/models/Sector/sector-benefit-adder.model';

@Component({
	selector: 'app-benefit-add-configurations',
	templateUrl: './benefit-add-configurations.component.html',
	styleUrls: ['./benefit-add-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class BenefitAddConfigurationsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() isSubmitted: boolean;
	@Input() ShowAll: boolean = false;
	@ViewChild(ListViewComponent) listViewComponent: ListViewComponent|undefined;

	public benefitAdderConfigForm: FormGroup<IBenefitAdderConfigFM>;
	public isSwitchBenefitAdderShow: boolean | null | undefined = false;
	public prefilledData: SectorBenefitAdder[] = [new SectorBenefitAdder({ Id: magicNumber.zero, Label: null })];

	public benefitAddercolumns = [
		{
			colSpan: Number(magicNumber.eight),
			columnName: 'BenefitAdder',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'Label',
					defaultValue: null,
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: magicNumber.fifty,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [
						this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'BenefitAdder'),
						this.customvalidators.MaxLengthValidator(magicNumber.fifty, "MaximumCharLimit")
					]
				}
			]
		}
	];

	public benefitAdderColumnConfigs = {
		isShowfirstColumn: true,
		isShowLastColumn: true,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: 'ItemNumber',
		secondColumnName: 'AddMore',
		deleteButtonName: 'Delete',
		noOfRows: 1,
		itemSr: true,
		itemLabelName: 'BenefitAdder',
		firstColumnColSpan: Number(magicNumber.two),
		lastColumnColSpan: Number(magicNumber.two),
		isAddMoreValidation: true,
		isAddMoreClicked: true
	};

	private destroyAllSubscribtion$ = new Subject<void>();
	private getFormErrorStatus: number = magicNumber.zero;
	private isEditMode: boolean;
	private benefitAdderArray: FormArray<FormGroup<ISectorBenefitAdders>>;
	private storeBenefitAdderArray: SectorBenefitAdder[];
	private BenefitAdderShowError: FormArray|undefined;

	// eslint-disable-next-line max-params
	constructor(
		private customvalidators: CustomValidators,
		private store: Store,
		private sectorService: SectorService,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) { }
	ngAfterViewInit(): void {
		if(this.isSubmitted && this.BenefitAdderShowError?.invalid) {
			this.listViewComponent?.checkTouched();
			this.BenefitAdderShowError?.markAllAsTouched();
		}
	}

	ngOnChanges(): void {
		this.isEditMode = this.formStatus;

		if (this.isSubmitted) {
			this.listViewComponent?.checkTouched();
			this.BenefitAdderShowError?.markAllAsTouched();
		}
		if (this.reload) {
			this.switchBenefitAdder(this.benefitAdderConfigForm.controls.IsBenefitAdder.value ?? false);
			if (this.benefitAdderConfigForm.controls.IsBenefitAdder.value)
				this.sectorService.onAddBenefitAdderFormArray(this.prefilledData, this.benefitAdderArray);
		}
	}

	ngOnInit(): void {
		this.sectorService.setFormInitStatus(magicNumber.ten);
		this.getFormErrorStatus = this.sectorService.getFormErrorStatus(magicNumber.ten);
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}

		this.benefitAdderConfigForm = this.childFormGroup.get('BenefitAdderConfiguration') as FormGroup<IBenefitAdderConfigFM>;
		this.benefitAdderArray = this.benefitAdderConfigForm.controls.SectorBenefitAdders;

		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe(({ BenefitAdderConfiguration }: Sector) => {
				patchBenefitAdderConfig(BenefitAdderConfiguration, this.benefitAdderConfigForm);
				if (BenefitAdderConfiguration.IsBenefitAdder) {
					this.prefilledData = BenefitAdderConfiguration.SectorBenefitAdders;
					this.sectorService.onAddBenefitAdderFormArray(this.prefilledData, this.benefitAdderArray);
				}
				this.switchBenefitAdder(BenefitAdderConfiguration.IsBenefitAdder);
				this.cdr.markForCheck();
			});
	}

	private AddMode() {
		this.sectorService.getBenefitAdder.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((benefitAdderResponse) => {
			if (benefitAdderResponse && benefitAdderResponse.length > Number(magicNumber.zero))
				this.prefilledData = benefitAdderResponse;
			this.cdr.markForCheck();
		});
		this.switchBenefitAdder(this.benefitAdderConfigForm.controls.IsBenefitAdder.value ?? false);
	}

	public getFormStatus(formArray: FormArray): void {
		this.BenefitAdderShowError = formArray;
		this.storeBenefitAdderArray = formArray.value;
		this.sectorService.onAddBenefitAdderFormArray(formArray.value, this.benefitAdderArray);
		this.benefitAdderArray.markAllAsTouched();
		if ((formArray.touched || !formArray.pristine)) {
			this.benefitAdderConfigForm.markAsTouched();
			this.benefitAdderConfigForm.markAsDirty();
		}
		resetFormArrayErrorsOnSectorEdit(formArray);
	}

	public switchBenefitAdder(toggle: boolean): void {
		if (toggle) {
			this.isSwitchBenefitAdderShow = true;
			this.sectorService.onAddBenefitAdderFormArray(this.prefilledData, this.benefitAdderArray);
		} else {
			this.isSwitchBenefitAdderShow = false;
			removeFormArrayValidations(this.benefitAdderArray);
		}
		this.benefitAdderConfigForm.updateValueAndValidity();
	}

	ngOnDestroy(): void {
		if (!this.isEditMode && !this.isDraft) {
			this.sectorService.holdBenefitAdder.next(this.storeBenefitAdderArray);
		} else {
			this.sectorService.holdBenefitAdder.next(null);
		}
		if (this.isEditMode && !this.benefitAdderConfigForm.controls.IsBenefitAdder.value) {
			this.benefitAdderArray.clear();
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
