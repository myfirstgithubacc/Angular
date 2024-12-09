import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { MarkupService } from '../services/markup.service';
import { BaseMarkupConfig, LaborCategoryMarkup, LabourMarkup, LocationMarkup, MarkupSearchData, SectorMarkup, StaffingTier } from '../enum/enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { chevronDownDimension, chevronUpDimension, chevronRightDimension } from '@xrm-shared/icons/xrm-icon-library/xrm-icon-library.component'

@Component({
	selector: 'app-view-markup',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ViewComponent implements OnInit {
	//UI Icons
	public chevronDown = chevronDownDimension;
	public chevronUp = chevronUpDimension;
	public chevronRight = chevronRightDimension;

	@Input() markupSearchData: MarkupSearchData;
	@Input() markupResult: MarkupSearchData;
	@Input() appliedFilterCount: number = magicNumber.zero;
	@Input() selectedStaffingValue: StaffingTier;
	@Output() onChange: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

	public AddEditMarkupConfiForm: FormGroup;
	public isViewOnly: boolean = false;
	public isMarkupLength: boolean = false;
	private collapsedRows: number[] = [];
	private collapsedRows2: number[] = [];
	private initialData: BaseMarkupConfig[];


	constructor(
		private fb: FormBuilder,
		private markupService: MarkupService
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['markupSearchData'].currentValue) {

			this.markupSearchData = changes['markupSearchData'].currentValue;
			this.markupSearchData.StaffingTier = this.markupSearchData.StaffingTier.map((x: StaffingTier) => {
				x.Value = Number(x.Value);
				return x;
			});
			this.isMarkupLength = this.markupSearchData.baseMarkupConfigs.length > parseInt(`${magicNumber.zero}`);
			this.initializeForm();
		}


	}

	private initializeForm(): void {
		this.AddEditMarkupConfiForm = this.fb.group({
			baseMarkupConfigs: this.fb.array([])
		});

		this.markupService.addForm.next(this.AddEditMarkupConfiForm);

		this.initiFormArray();
	}

	ngOnInit(): void {
		this.initializeForm();
	}

	toggleRow(parentItemId: SectorMarkup) {
		if (this.isCollapsed(parentItemId.SectorId)) {
			this.collapsedRows = this.collapsedRows.filter((id) =>
				id !== parentItemId.SectorId);
			return;
		}
		this.collapsedRows.push(parentItemId.SectorId);
	}

	isExpanded(parentItemId: SectorMarkup): boolean {
		return this.collapsedRows.includes(parentItemId.SectorId);
	}

	isCollapsed(parentItemId: number): boolean {
		return this.collapsedRows.includes(parentItemId);
	}

	toggleRow2(parentItemId: LabourMarkup): void {
		if (this.isCollapsed2(parentItemId.LaborCategoryId)) {
			this.collapsedRows2 = this.collapsedRows2.filter((id) =>
				id !== parentItemId.LaborCategoryId);
			return;
		}
		this.collapsedRows2.push(parentItemId.LaborCategoryId);
	}

	isExpanded2(parentItemId: LabourMarkup): boolean {
		return this.collapsedRows2.includes(parentItemId.LaborCategoryId);
	}

	isCollapsed2(parentItemId: number): boolean {
		return this.collapsedRows2.includes(parentItemId);
	}


	private initiFormArray() {
		this.markupSearchData.baseMarkupConfigs.forEach((x: BaseMarkupConfig) => {
			(this.AddEditMarkupConfiForm.get("baseMarkupConfigs") as FormArray).push(this.fb.group({
				RecruitedMspFee: [x.RecruitedMspFee],
				PayrolledMspFee: [x.PayrolledMspFee],
				SectorId: [x.SectorId],
				LaborCategoryMarkups: this.fb.array([])
			}));

		});

		this.initialData = this.markupSearchData.baseMarkupConfigs;
		this.addLaborCategoryFormControls();
	}

	get baseMarkupConfigs(): FormArray {
		return this.AddEditMarkupConfiForm.get('baseMarkupConfigs') as FormArray;
	}

	private addLaborCategoryFormControls() {
		this.markupSearchData.baseMarkupConfigs.forEach((x: BaseMarkupConfig, index: number) => {
			x.laborCategoryMarkups.forEach((y: LaborCategoryMarkup) => {
				const laborCategoryMarkups = this.baseMarkupConfigs.at(index).get('LaborCategoryMarkups') as FormArray;
				laborCategoryMarkups.push(this.fb.group({
					LaborCategoryName: [y.LaborCategoryName],
					BroadCastAllowed: [y.BroadCastAllowed],
					RecruitedMarkup: [Number(y.RecruitedMarkup).toFixed(magicNumber.three)],
					RecruitedMspFee: [Number(y.RecruitedMspFee).toFixed(magicNumber.three)],
					PayrolledMarkup: [Number(y.PayrolledMarkup).toFixed(magicNumber.three)],
					PayrolledMspFee: [Number(y.PayrolledMspFee).toFixed(magicNumber.three)],
					OtMultiplier: [Number(y.OtMultiplier).toFixed(magicNumber.three)],
					DtMultiplier: [Number(y.DtMultiplier).toFixed(magicNumber.three)],
					LaborCategoryId: [y.LaborCategoryId],
					TierLevel: [y.TierLevel, [] as ValidatorFn[]],
					TierLevelName: [y.TierLevelName],
					StaffingAgencyMarkupId: [y.StaffingAgencyMarkupId],
					LocationMarkups: this.fb.array([])
				}));
			});
		});

		this.addLocationFormControls();
	}


	private addLocationFormControls() {
		this.markupSearchData.baseMarkupConfigs.forEach((x: BaseMarkupConfig, index: number) => {
			x.laborCategoryMarkups.forEach((y: LaborCategoryMarkup, index2: number) => {
				y.locationMarkups?.forEach((z: LocationMarkup) => {
					const locationMarkups = (this.baseMarkupConfigs.at(index).get('LaborCategoryMarkups') as FormArray).at(index2).get('LocationMarkups') as FormArray;
					locationMarkups.push(this.fb.group({
						BroadCastAllowed: [z.BroadCastAllowed],
						LocationName: [z.LocationName],
						ActualRecruitedMarkup: [
							z.ActualRecruitedMarkup
								? Number(z.ActualRecruitedMarkup).toFixed(magicNumber.three)
								: '0.000'
						],
						RecruitedMarkupAdder: [Number(z.RecruitedMarkupAdder).toFixed(magicNumber.three)],
						ActualPayrolledMarkup: [
							z.ActualPayrolledMarkup
								? Number(z.ActualPayrolledMarkup).toFixed(magicNumber.three)
								: '0.000'
						],
						PayrolledMarkupAdder: [Number(z.PayrolledMarkupAdder).toFixed(magicNumber.three)],
						LocationId: [z.LocationId],
						TierLevelName: [z.TierLevelName],
						StaffingAgencyMarkupAdderId: [z.StaffingAgencyMarkupAdderId],
						TierLevel: [z.TierLevel, [] as ValidatorFn[]]
					}));
				});
			});
		});
	}

	public getSectorControl(index: number) {
		const myArray = this.AddEditMarkupConfiForm.get('baseMarkupConfigs') as FormArray;
		return myArray.at(index) as FormGroup;
	}

	public getLaborCategoryControl(sectorIndex: number, laborCategoryIndex: number) {
		return (this.baseMarkupConfigs.at(sectorIndex).get('LaborCategoryMarkups') as FormArray).at(laborCategoryIndex) as FormGroup;
	}


	public getLocationControl(sectorIndex: number, laborCategoryIndex: number, locationIndex: number) {
		return ((this.baseMarkupConfigs.at(sectorIndex).get('LaborCategoryMarkups') as FormArray).at(laborCategoryIndex).get('LocationMarkups') as FormArray).at(locationIndex) as FormGroup;
	}


	ngOnDestroy(): void {
		this.markupService.isCopy.next(false);
	}
}
