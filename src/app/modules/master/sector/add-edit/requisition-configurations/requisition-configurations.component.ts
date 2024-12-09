
import { FormArray, FormGroup } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { resetFormArrayErrorsOnSectorEdit } from '@xrm-master/sector/common/common-sector-code';
import { SectorAssignmentType } from '@xrm-core/models/Sector/sector-assignment-types.model';
import { SectorCandidateEvaluationItem } from '@xrm-core/models/Sector/sector-candidate-evaluation-items.model';
import { IRequisitionConfigFM, ISectorAssignmentTypes, ISectorCandidateEvaluationItems, patchRequisitionConfig } from './utils/helper';
import { Column, ColumnConfigure } from '@xrm-shared/models/list-view.model';
import { IDropdown } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-requisition-configurations',
	templateUrl: './requisition-configurations.component.html',
	styleUrls: ['./requisition-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequisitionConfigurationsComponent implements OnInit, OnDestroy, AfterViewInit {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() ShowAll: boolean = false;
	@Input() isSubmitted: boolean;
	@ViewChild(ListViewComponent) ListViewComponent: ListViewComponent|undefined;

	public sectorAllDropdowns: SectorAllDropdowns;
	public requisitionConfigForm: FormGroup<IRequisitionConfigFM>;
	public isswitchQuestionBankFunctionalityRequiredShow: boolean = false;
	public isswitchSystemRankingFunctionality: boolean = false;
	public isswitchEnableManagerScoring: boolean = false;
	private EvaluationCriteriaShowError: FormArray | undefined;
	private AssignmentTypeShowError: FormArray | undefined;
	private getFormErrorStatus: number = magicNumber.zero;
	private isEditMode: boolean;
	public prefilledData: SectorAssignmentType[] = [{ 'AssignmentName': null, 'DisplayOrder': magicNumber.zero, 'Id': magicNumber.zero}];
	public prefilledEvaluationCriteriaData: SectorCandidateEvaluationItem[] = [{ 'Description': null, 'DisplayOrder': 0, 'EvaluationRequirementId': '', 'EvaluationRequirementName': null, 'Id': 0, 'IsVisible': false }];
	public listItems: IDropdown[] | undefined | null;
	public sectorAssignmentTypesFA: FormArray<FormGroup<ISectorAssignmentTypes>>;
	public sectorCandidateEvaluationItemsFA: FormArray<FormGroup<ISectorCandidateEvaluationItems>>;
	public columnEvaluationCriteriaConfiguration = {
		isShowfirstColumn: true,
		isShowLastColumn: true,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: 'ItemNumber',
		secondColumnName: 'AddMore',
		deleteButtonName: 'Delete',
		noOfRows: magicNumber.zero,
		itemSr: true,
		itemLabelName: '',
		firstColumnColSpan: magicNumber.one,
		lastColumnColSpan: magicNumber.two,
		isAddMoreValidation: true,
		isAddMoreClicked: true,
		widgetId: 'EvaluationCriteria'
	};
	public columnAssignmentTypeConfiguration:ColumnConfigure = {
		isShowfirstColumn: true,
		isShowLastColumn: true,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: 'ItemNumber',
		secondColumnName: 'AddMore',
		deleteButtonName: 'Delete',
		noOfRows: magicNumber.one,
		itemSr: true,
		itemLabelName: '',
		firstColumnColSpan: magicNumber.zero,
		lastColumnColSpan: magicNumber.two,
		isAddMoreValidation: true,
		isAddMoreClicked: true,
		widgetId: 'AssignmentType'
	};

	public columnAssignmentType:Column[] = [
		{
			colSpan: magicNumber.nine,
			columnName: 'ItemTitle',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'AssignmentName',
					defaultValue: null,
					isEditMode: true,
					isDisable: false,
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'ItemTitle')],
					maxlength: magicNumber.hundred,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: []
				}
			]
		}
	];

	public columnEvaluationCriteria:Column[] = [
		{
			colSpan: magicNumber.three,
			columnName: 'EvaluationType',
			asterik: true,
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'EvaluationRequirementId',
					defaultValue: null,
					isEditMode: true,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: [],
					specialCharactersNotAllowed: [],
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseSelectData', 'EvaluationType')],
					isDisable: false,
					requiredMsg: 'ReqFieldValidationMessage',
					placeholder: 'DdlSelect',
					isValuePrimitiveAllowed: true
				}
			]
		},
		{
			colSpan: magicNumber.four,
			columnName: 'ItemTitle',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'Description',
					defaultValue: null,
					maxlength: magicNumber.hundred,
					isEditMode: true,
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'ItemTitle')],
					isDisable: false,
					placeholder: '',
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'Visible',
			controls: [
				{
					controlType: 'switch',
					controlId: 'IsVisible',
					onLabel: 'Yes',
					offLabel: 'No',
					defaultValue: false,
					isEditMode: true,
					isDisable: false,
					placeholder: ''
				}
			]
		}
	];

	private destroyAllSubscribtion$ = new Subject<void>();
	// eslint-disable-next-line max-params
	constructor(
		private sectorService: SectorService,
		private store: Store,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) {
	 }
	ngAfterViewInit(): void {
		if((this.AssignmentTypeShowError?.invalid || this.EvaluationCriteriaShowError?.invalid) && this.isSubmitted && this.isEditMode)
		{
			this.ListViewComponent?.checkTouched();
			this.AssignmentTypeShowError?.markAllAsTouched();
			this.EvaluationCriteriaShowError?.markAllAsTouched();
		}
	}

	private subscribeToRequisitionDetails() {
		this.sectorService.getAssignmentRequisitionDetails.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if (data) {
				this.prefilledData = data;
				this.cdr.markForCheck();
			}
		});

		this.sectorService.getEvaluationRequisitionDetails.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if (data) {
				this.prefilledEvaluationCriteriaData = data;
				this.prefilledEvaluationCriteriaData.map((row) => {
					row.EvaluationRequirementId = row.EvaluationRequirementId?.toString() ?? '';
				});
				this.cdr.markForCheck();
			}
		});

		this.switchQuestionBankFunctionalityRequired(this.requisitionConfigForm.controls.QuestionBankRequired.value ?? false);
		this.switchIsSystemRankingFunctionality(this.requisitionConfigForm.controls.IsSystemRankingFunctionality.value ?? false);
		this.switchIsEnableManagerScoring(this.requisitionConfigForm.controls.EnableManagerScoring.value);
		this.sectorService.onAddSectorAssignmentTypes(this.prefilledData, this.sectorAssignmentTypesFA);
	}

	ngOnChanges() {
		this.isEditMode = this.formStatus;
		if (this.isSubmitted) {
			this.ListViewComponent?.checkTouched();
			this.EvaluationCriteriaShowError?.markAllAsTouched();
			this.AssignmentTypeShowError?.markAllAsTouched();
		}

		if (this.reload) {
			this.subscribeToRequisitionDetails();
		}
	}

	ngOnInit(): void {
		this.sectorService.setFormInitStatus(magicNumber.eight);
		this.getFormErrorStatus = this.sectorService.getFormErrorStatus(magicNumber.eight);
		this.handleScreenScroll();

		this.initializeForm();
	}

	private handleScreenScroll(): void {
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}
	}

	private initializeForm(): void {
		this.requisitionConfigForm = this.childFormGroup.get('RequisitionConfiguration') as FormGroup<IRequisitionConfigFM>;
		this.sectorAssignmentTypesFA = this.requisitionConfigForm.controls.SectorAssignmentTypes;
		this.sectorCandidateEvaluationItemsFA = this.requisitionConfigForm.controls.SectorCandidateEvaluationItems;

		this.store.select(SectorState.getSectorAllDropdowns).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: SectorAllDropdowns) => {
			this.sectorAllDropdowns = data;
			this.listItems = data.EvaluationRequirements;
			this.cdr.markForCheck();
		});

		this.columnEvaluationCriteria.forEach((item: Column) => {
			if (item.controls[magicNumber.zero].controlId === "EvaluationRequirementId") {
				item.controls[magicNumber.zero].defaultValue = this.listItems;
			}
		});

		if(this.isEditMode) {
			this.EditMode();
		}
		else {
			this.AddMode();
		}
	}

	private AddMode() {
		this.subscribeToRequisitionDetails();
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({RequisitionConfiguration}) => {

				patchRequisitionConfig(RequisitionConfiguration, this.requisitionConfigForm);

				this.prefilledData = RequisitionConfiguration.SectorAssignmentTypes.length > Number(magicNumber.zero)
					? RequisitionConfiguration.SectorAssignmentTypes
					: this.prefilledData;

				this.prefilledEvaluationCriteriaData = RequisitionConfiguration.SectorCandidateEvaluationItems.length > Number(magicNumber.zero)
					? RequisitionConfiguration.SectorCandidateEvaluationItems
					: this.prefilledEvaluationCriteriaData;

				if (RequisitionConfiguration.SectorCandidateEvaluationItems.length > Number(magicNumber.zero)) {
					this.prefilledEvaluationCriteriaData.forEach((row: SectorCandidateEvaluationItem, i: number) => {
						row.EvaluationRequirementId = RequisitionConfiguration.SectorCandidateEvaluationItems[i].EvaluationRequirementId?.toString() ?? '';
					});
				}

				this.sectorService.onAddSectorAssignmentTypes(this.prefilledData, this.sectorAssignmentTypesFA);

				this.switchIsSystemRankingFunctionality(RequisitionConfiguration.IsSystemRankingFunctionality);
				this.switchQuestionBankFunctionalityRequired(RequisitionConfiguration.QuestionBankRequired);
				this.switchIsEnableManagerScoring(RequisitionConfiguration.EnableManagerScoring);
				this.cdr.markForCheck();
			});
	}

	getFormStatus(formArray: FormArray) {
		if ('AssignmentType' in formArray.value[0]) {
			this.AssignmentTypeShowError = formArray;
			this.sectorService.onAddSectorAssignmentTypes(formArray.value, this.sectorAssignmentTypesFA);
			this.sectorAssignmentTypesFA.markAllAsTouched();
		}
		else if ('EvaluationCriteria' in formArray.value[0] && this.requisitionConfigForm.controls.IsSystemRankingFunctionality.value) {
			this.EvaluationCriteriaShowError = formArray;
			this.sectorService.onAddSectorCandidateEvaluationItems(formArray.value, this.sectorCandidateEvaluationItemsFA);
			this.sectorCandidateEvaluationItemsFA.markAllAsTouched();
		}
		if(formArray.touched || !formArray.pristine) {
			this.requisitionConfigForm.markAsTouched();
			this.requisitionConfigForm.markAsDirty();
		}
		resetFormArrayErrorsOnSectorEdit(formArray);
	}

	switchQuestionBankFunctionalityRequired(toggle: boolean) {
		if (toggle) {
			this.isswitchQuestionBankFunctionalityRequiredShow = true;
		} else {
			this.isswitchQuestionBankFunctionalityRequiredShow = false;
		}
	}

	switchIsSystemRankingFunctionality(e: boolean) {
		if (e) {
			this.isswitchSystemRankingFunctionality = true;
			this.sectorService.onAddSectorCandidateEvaluationItems(this.prefilledEvaluationCriteriaData, this.sectorCandidateEvaluationItemsFA);
		} else {
			this.isswitchSystemRankingFunctionality = false;
		}
	}

	switchIsEnableManagerScoring(e: boolean) {
		if (e) {
			this.isswitchEnableManagerScoring = true;
		} else {
			this.isswitchEnableManagerScoring = false;
		}
	}

	ngOnDestroy(): void {
		if (!this.isEditMode && !this.isDraft) {
			this.sectorService.holdEvaluationRequisitionDetails.next(this.EvaluationCriteriaShowError?.value);
			this.sectorService.holdAssignmentRequisitionDetails.next(this.AssignmentTypeShowError?.value);
		}
		else {
			this.sectorService.holdAssignmentRequisitionDetails.next(null);
			this.sectorService.holdEvaluationRequisitionDetails.next(null);
		}
		this.sectorService.clearTimeout();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}

