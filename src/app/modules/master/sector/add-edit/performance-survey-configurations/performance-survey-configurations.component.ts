import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ListViewComponent } from '@xrm-widgets';
import { Subject, take, takeUntil } from 'rxjs';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from '@xrm-core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { removeFormArrayValidations, resetFormArrayErrorsOnSectorEdit } from '@xrm-master/sector/common/common-sector-code';
import { SectorRequisitionSurveyScale } from '@xrm-core/models/Sector/sector-requisition-survey-scales';
import { SectorRequisitionSurveyPerformanceFactor } from '@xrm-core/models/Sector/sector-requisition-survey-performance-factors';
import { SectorClpSurveyScale } from '@xrm-core/models/Sector/sector-survey-scales.model';
import { SectorClpSurveyPerformanceFactor } from '@xrm-core/models/Sector/sector-clp-survey-performance-factors';
import { INoOfDaysAfterStartDateLevels, IPerformanceSurveyConfigFM, ISectorClpSurveyPerformanceFactors, ISectorClpSurveyScales, ISectorRequisitionSurveyPerformanceFactors, ISectorRequisitionSurveyScales, patchPerformanceSurveyConfig } from './utils/helper';
import { DropdownModel } from '@xrm-shared/models/common.model';
import { Column } from '@xrm-shared/models/list-view.model';

@Component({
	selector: 'app-performance-survey-configurations',
	templateUrl: './performance-survey-configurations.component.html',
	styleUrls: ['./performance-survey-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush

})
export class PerformanceSurveyConfigurationsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() ShowAll: boolean = false;
	@Input() isSubmitted: boolean;
	@Output() changeSubmit:EventEmitter<boolean> =new EventEmitter<boolean>();
	@ViewChild(ListViewComponent) ListViewComponent: ListViewComponent|undefined;

	public performanceSurveyConfigForm: FormGroup<IPerformanceSurveyConfigFM>;
	public isSwitchDisplayQuestion: boolean = false;
	public isSwitchScheduleLengthAssignment: boolean = false;
	public isSwitchDaysAssignmentStart: boolean = false;
	public isSwitchSurveyForAssignment: boolean = false;
	public isSwitchSurveyForCloserReq: boolean = false;
	public isSwitchDisplayQuestionScore: boolean = false;
	public magicNumbers = magicNumber;

	// Req Survey Scale Form Array
	private reqSurveyScalesFormArray: FormArray<FormGroup<ISectorRequisitionSurveyScales>>;
	private reqSurveyScalesShowError: FormArray|undefined;
	private ReqSurveyScaleArr: SectorRequisitionSurveyScale[];
	public ReqSurveyScaleDataPrefilledData: SectorRequisitionSurveyScale[] = [{ Id: Number(magicNumber.zero), XrmEntityId: Number(magicNumber.twenty), Scale: Number(magicNumber.one), Definition: '', ApplicableFor: '', ApplicableForName: '' }];
	public RequisitionSurveyScaleColumn = [
		{
			colSpan: Number(magicNumber.eight),
			columnName: 'ItemTitle',
			asterik: true,
			tooltipVisible: true,
			tooltipTitile: 'Requisition_Survey_Scale_Tooltip',
			controls: [
				{
					controlType: 'text',
					controlId: 'Definition',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: Number(magicNumber.hundred),
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'ItemTitle')]
				}
			]
		}
	];

	public ReqSurveyScaleColumnConfig =
		{
			isShowfirstColumn: true,
			isShowLastColumn: true,
			changeStatus: false,
			uKey: false,
			Id: true,
			firstColumnName: 'ItemNumber',
			secondColumnName: 'AddMore',
			deleteButtonName: 'Delete',
			noOfRows: Number(magicNumber.zero),
			itemSr: true,
			itemLabelName: '',
			firstColumnColSpan: Number(magicNumber.two),
			lastColumnColSpan: Number(magicNumber.two),
			isAddMoreValidation: true,
			isAddMoreClicked: true,
			widgetId: 'ReqSurveyScale'
		};

	// Req Performance Factor Form Array
	private reqPerformaceFactorFormArray: FormArray<FormGroup<ISectorRequisitionSurveyPerformanceFactors>>;
	private reqPerformaceFactorShowError: FormArray|undefined;

	private ReqPerformanceFactorArr: SectorRequisitionSurveyPerformanceFactor[];

	public getFormErrorStatus: number = magicNumber.zero;

	public ReqPerformanceFactorPrefilledData: SectorRequisitionSurveyPerformanceFactor[] = [{ Id: Number(magicNumber.zero), XrmEntityId: Number(magicNumber.twenty), Factor: '' }];

	public RequisitionPerformanceFactorColumn = [
		{
			colSpan: Number(magicNumber.eight),
			columnName: 'ItemTitle',
			asterik: true,
			tooltipVisible: true,
			tooltipTitile: 'Requisition_Performance_Factor_Tooltip',
			controls: [
				{
					controlType: 'text',
					controlId: 'Factor',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: Number(magicNumber.hundred),
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'ItemTitle')]
				}
			]
		}
	];

	public ReqPerformanceFactorColumnConfig =
		{
			isShowfirstColumn: true,
			isShowLastColumn: true,
			changeStatus: false,
			uKey: false,
			Id: true,
			firstColumnName: 'ItemNumber',
			secondColumnName: 'AddMore',
			deleteButtonName: 'Delete',
			noOfRows: Number(magicNumber.zero),
			itemSr: true,
			itemLabelName: '',
			firstColumnColSpan: Number(magicNumber.two),
			lastColumnColSpan: Number(magicNumber.two),
			isAddMoreValidation: true,
			isAddMoreClicked: true,
			widgetId: 'ReqPerformanceFactor'
		};

	// Days(s) Form Array...
	private NoOfDaysAfterStartDateLevelsFomArray: FormArray<FormGroup<INoOfDaysAfterStartDateLevels>>;
	private NoOfDaysAfterStartDateLevelsShowError: FormArray|undefined;
	public NoOfSchedulePerformancePrefilledData: {'Days': number | null }[] | number[] = [{ 'Days': null }];
	private NoOfSchedulePerformanceArr: {'Days': number | null}[];

	public ScheduleOfPerformanceColumn = [
		{
			colSpan: 8,
			columnName: 'Days',
			asterik: true,
			tooltipVisible: true,
			tooltipTitile: 'Days_Tooltip',
			controls: [
				{
					controlType: 'number',
					decimals: '0',
					format: 'n',
					controlId: 'Days',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					min: 0,
					placeholder: '',
					maxlength: 3,
					isSpecialCharacterAllowed: false,
					specialCharactersAllowed: false,
					specialCharactersNotAllowed: false,
					validators: [
						this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'Days_s'),
						this.customValidators.RangeValidator(magicNumber.one, magicNumber.oneHundredEighty, 'FieldSpecificYouCanEnterValueBetween', [{ Value: 'Days_s', IsLocalizeKey: true }, { Value: '1', IsLocalizeKey: true }, { Value: '180', IsLocalizeKey: true }])
					]
				}
			]
		}
	];

	public ScheduleOfPerformanceColumnConfig =
		{
			isShowfirstColumn: false,
			isShowLastColumn: true,
			changeStatus: false,
			uKey: false,
			Id: false,
			firstColumnName: '',
			secondColumnName: 'AddMore',
			deleteButtonName: 'Delete',
			noOfRows: 0,
			itemSr: true,
			itemLabelName: '',
			firstColumnColSpan: 0,
			lastColumnColSpan: 4,
			isAddMoreValidation: true,
			isAddMoreEnabled: false,
			isAddMoreClicked: true,
			widgetId: 'NoOfScheduleOfPerformance'
		};

	// CLP Survey Scale Form Array...
	private clpSurveyScaleFormArray: FormArray<FormGroup<ISectorClpSurveyScales>>;
	private clpSurveyScaleError: FormArray|undefined;
	public CLPSurveyScalePrefilledData: SectorClpSurveyScale[] = [{ Id: Number(magicNumber.zero), XrmEntityId: Number(magicNumber.twentyNine), Scale: Number(magicNumber.one), Definition: '', ApplicableFor: '' }];

	private clpSurveyScaleFormArrayArr: SectorClpSurveyScale[];

	public CLPSurveyScaleColumn: Column[] = [
		{
			colSpan: Number(magicNumber.four),
			columnName: 'ItemTitle',
			asterik: true,
			controls: [
				{
					controlType: 'text',
					controlId: 'Definition',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: Number(magicNumber.hundred),
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'ItemTitle')]
				}
			]
		},
		{
			colSpan: Number(magicNumber.four),
			columnName: 'UsedIn',
			asterik: true,
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'ApplicableFor',
					defaultValue: 'A',
					isEditMode: true,
					isDisable: false,
					placeholder: 'DdlSelect',
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					isValuePrimitiveAllowed: true,
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseSelectData', 'UsedIn')]
				}
			]
		}
	];

	public ColumnConfigCLP =
		{
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
			firstColumnColSpan: 2,
			lastColumnColSpan: 2,
			isAddMoreValidation: true,
			isAddMoreClicked: true,
			widgetId: 'CLPSurveyScale'
		};

	// Clp Performace Factor Form Array...
	public clpPerformanceFactorFormArray: FormArray<FormGroup<ISectorClpSurveyPerformanceFactors>>;

	public ClpPerformanceFactorsPrefilledData: SectorClpSurveyPerformanceFactor[] = [{ Id: Number(magicNumber.zero), XrmEntityId: Number(magicNumber.twentyNine), Factor: '', ApplicableFor: '' }];

	public clpPerformanceFactorFormArrayArr: SectorClpSurveyPerformanceFactor[];

	public CLPPerformanceFactorColumn: Column[] = [
		{
			colSpan: Number(magicNumber.four),
			columnName: 'ItemTitle',
			asterik: true,
			tooltipVisible: true,
			tooltipTitile: 'CLP_Performance_Factor_Tooltip',
			controls: [
				{
					controlType: 'text',
					controlId: 'Factor',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					maxlength: Number(magicNumber.hundred),
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'ItemTitle')]
				}
			]
		},
		{
			colSpan: 4,
			columnName: 'UsedIn',
			asterik: true,
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'ApplicableFor',
					defaultValue: 'A',
					isEditMode: true,
					isDisable: false,
					placeholder: 'DdlSelect',
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					isValuePrimitiveAllowed: true,
					validators: [this.sectorService.fieldSpecficRequiredMessageValidation('PleaseSelectData', 'UsedIn')]
				}
			]
		}
	];
	private clpPerformanceFactorError: FormArray|undefined;
	public CLPPerformanceFactorColumnConfig =
		{
			isShowfirstColumn: true,
			isShowLastColumn: true,
			changeStatus: false,
			uKey: false,
			Id: true,
			firstColumnName: 'ItemNumber',
			secondColumnName: 'AddMore',
			deleteButtonName: 'Delete',
			noOfRows: Number(magicNumber.zero),
			itemSr: true,
			itemLabelName: '',
			firstColumnColSpan: Number(magicNumber.two),
			lastColumnColSpan: Number(magicNumber.two),
			isAddMoreValidation: true,
			isAddMoreClicked: true,
			widgetId: 'CLPPerformaceFactor'
		};

	public dropdowns: DropdownModel | undefined | null;
	public isSwitchSurveyForClosedReq: boolean;

	private listItems: DropdownModel | undefined | null;
	private destroyAllSubscribtion$ = new Subject<void>();
	private isEditMode: boolean;

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		private sectorService: SectorService,
		private store: Store,
		private el: ElementRef,
		private customValidators: CustomValidators,
		private cdr: ChangeDetectorRef
	) { }
	ngAfterViewInit(): void {
		if(this.isSubmitted && (this.reqPerformaceFactorShowError?.invalid || this.clpSurveyScaleError?.invalid ||
			 this.reqSurveyScalesShowError?.invalid || this.clpPerformanceFactorError?.invalid ||
			this.NoOfDaysAfterStartDateLevelsShowError?.invalid) && this.isEditMode) {
			this.ListViewComponent?.checkTouched();
			this.reqSurveyScalesShowError?.markAllAsTouched();
			this.reqPerformaceFactorShowError?.markAllAsTouched();
			this.clpSurveyScaleError?.markAllAsTouched();
			this.clpPerformanceFactorError?.markAllAsTouched();
			this.NoOfDaysAfterStartDateLevelsShowError?.markAllAsTouched();
		}
	}

	ngOnChanges() {
		this.isEditMode = this.formStatus;

		if (this.isSubmitted) {
			this.ListViewComponent?.checkTouched();
			this.reqSurveyScalesShowError?.markAllAsTouched();
			this.reqPerformaceFactorShowError?.markAllAsTouched();
			this.clpSurveyScaleError?.markAllAsTouched();
			this.clpPerformanceFactorError?.markAllAsTouched();
			this.NoOfDaysAfterStartDateLevelsShowError?.markAllAsTouched();
		}

		if (this.reload) {
			this.subscribeToFormArrays();
			this.switchSurveyForClosedReq(this.performanceSurveyConfigForm.controls.SurveyForClosedReq.value);
			this.switchSurveyForAssignment(this.performanceSurveyConfigForm.controls.SurveyAllowedForAssignment.value ?? false);
			this.switchDisplayQuestionScore(this.performanceSurveyConfigForm.controls.IsAvgSurveyScoreAllowForComment.value ?? false);
			this.sectorService.onAddClpSurveyScale(this.CLPSurveyScalePrefilledData, this.clpSurveyScaleFormArray);
			this.sectorService.onAddClpPerformanceFactor(this.ClpPerformanceFactorsPrefilledData, this.clpPerformanceFactorFormArray);
		}
	}

	ngOnInit(): void {
		this.changeSubmit.emit(true);
		this.sectorService.setFormInitStatus(magicNumber.tweleve);
		this.getFormErrorStatus = this.sectorService.getFormErrorStatus(magicNumber.tweleve);
		if (!this.ShowAll)
			this.sectorService.makeScreenScrollOnUpdate(this.el);

		this.performanceSurveyConfigForm = this.childFormGroup.get('PerformanceSurveyConfiguration') as FormGroup<IPerformanceSurveyConfigFM>;
		this.getFormArrays();

		this.store.select(SectorState.getSectorAllDropdowns).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({SurveyUsedInEntities, LengthOfAssignmentTypes}) => {
				this.dropdowns = LengthOfAssignmentTypes;
				this.listItems = SurveyUsedInEntities;
				this.CLPSurveyScaleColumn.forEach((item) => {
					if (item.controls[0].controlId == "ApplicableFor")
						item.controls[0].defaultValue = this.listItems;
				});

				this.CLPPerformanceFactorColumn.forEach((item) => {
					if (item.controls[0].controlId == "ApplicableFor")
						item.controls[0].defaultValue = this.listItems;
				});
				this.cdr.markForCheck();
			});

		// Edit & Draft Mode...
		if (this.isEditMode) {
			this.EditMode();
		}else {
			this.AddMode();
		}
	}

	private getFormArrays() {
		this.reqPerformaceFactorFormArray = this.performanceSurveyConfigForm.controls.SectorRequisitionSurveyPerformanceFactors as FormArray<FormGroup<ISectorRequisitionSurveyPerformanceFactors>>;
		this.clpSurveyScaleFormArray = this.performanceSurveyConfigForm.controls.SectorClpSurveyScales as FormArray<FormGroup<ISectorClpSurveyScales>>;
		this.reqSurveyScalesFormArray = this.performanceSurveyConfigForm.controls.SectorRequisitionSurveyScales as FormArray<FormGroup<ISectorRequisitionSurveyScales>>;
		this.clpPerformanceFactorFormArray = this.performanceSurveyConfigForm.controls.SectorClpSurveyPerformanceFactors as FormArray<FormGroup<ISectorClpSurveyPerformanceFactors>>;
		this.NoOfDaysAfterStartDateLevelsFomArray = this.performanceSurveyConfigForm.controls.NoOfDaysAfterStartDateLevels as FormArray<FormGroup<INoOfDaysAfterStartDateLevels>>;
	}

	private AddMode() {
		this.subscribeToFormArrays();
		this.switchSurveyForClosedReq(this.performanceSurveyConfigForm.controls.SurveyForClosedReq.value);
		this.switchSurveyForAssignment(this.performanceSurveyConfigForm.controls.SurveyAllowedForAssignment.value ?? false);
		this.switchDisplayQuestionScore(this.performanceSurveyConfigForm.controls.IsAvgSurveyScoreAllowForComment.value ?? false);
		this.sectorService.onAddClpSurveyScale(this.CLPSurveyScalePrefilledData, this.clpSurveyScaleFormArray);
		this.sectorService.onAddClpPerformanceFactor(this.ClpPerformanceFactorsPrefilledData, this.clpPerformanceFactorFormArray);
	}

	private subscribeToFormArrays() {
		this.sectorService.getReqSurveyScales.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if (data !== null)
				this.ReqSurveyScaleDataPrefilledData = data;
			this.cdr.markForCheck();
		});

		this.sectorService.getReqPerformanceFactor.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if (data !== null)
				this.ReqPerformanceFactorPrefilledData = data;
			this.cdr.markForCheck();
		});

		this.sectorService.getNoOfDaysAfterStartDateLevelsObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if (data && data.length !== Number(magicNumber.zero)) {
				if ((data[0] as {'Days': number | null}).Days === undefined) {
					this.NoOfSchedulePerformancePrefilledData = data.map((row) =>
						({ 'Days': row })) as {'Days': number | null}[];
				}
				else {
					this.NoOfSchedulePerformancePrefilledData = data as number[];
				}
				this.cdr.markForCheck();
			}
		});

		this.sectorService.getCLPSurveyScaleObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if (data !== null)
				this.CLPSurveyScalePrefilledData = data;
			this.cdr.markForCheck();
		});

		this.sectorService.getCLPPerformanceFactorObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if (data !== null)
				this.ClpPerformanceFactorsPrefilledData = data;
			this.cdr.markForCheck();
		});
	}


	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).subscribe(({PerformanceSurveyConfiguration}) => {
			patchPerformanceSurveyConfig(PerformanceSurveyConfiguration, this.performanceSurveyConfigForm);

			if (PerformanceSurveyConfiguration.NoOfDaysAfterStartDateLevels?.length && PerformanceSurveyConfiguration.NoOfDaysAfterAssignmentStart) {
				this.NoOfSchedulePerformancePrefilledData = PerformanceSurveyConfiguration.NoOfDaysAfterStartDateLevels.map((row) =>
					({ 'Days': row })) as {'Days': number | null}[];
			}

			this.ClpPerformanceFactorsPrefilledData = PerformanceSurveyConfiguration.SectorClpSurveyPerformanceFactors;
			this.CLPSurveyScalePrefilledData = PerformanceSurveyConfiguration.SectorClpSurveyScales;

			this.switchSurveyForClosedReq(PerformanceSurveyConfiguration.SurveyForClosedReq);
			if (PerformanceSurveyConfiguration.SectorRequisitionSurveyScales?.length && PerformanceSurveyConfiguration.SurveyForClosedReq) {
				this.ReqSurveyScaleDataPrefilledData = PerformanceSurveyConfiguration.SectorRequisitionSurveyScales;
			}
			if(PerformanceSurveyConfiguration.SectorRequisitionSurveyPerformanceFactors?.length && PerformanceSurveyConfiguration.SurveyForClosedReq) {
				this.ReqPerformanceFactorPrefilledData = PerformanceSurveyConfiguration.SectorRequisitionSurveyPerformanceFactors;
			}
			this.switchSurveyForAssignment(PerformanceSurveyConfiguration.SurveyAllowedForAssignment);
			this.switchDisplayQuestionScore(PerformanceSurveyConfiguration.IsAvgSurveyScoreAllowForComment);

			this.sectorService.onAddClpSurveyScale(PerformanceSurveyConfiguration.SectorClpSurveyScales, this.clpSurveyScaleFormArray);
			this.sectorService.onAddClpPerformanceFactor(this.ClpPerformanceFactorsPrefilledData, this.clpPerformanceFactorFormArray);
			this.cdr.markForCheck();
		});
	}

	onAddNoOfScheduleperformance(list: {'Days': number | null}[]) {
		this.NoOfDaysAfterStartDateLevelsFomArray.clear();

		if (list.length <= Number(magicNumber.four)) {
			this.ScheduleOfPerformanceColumnConfig.isAddMoreEnabled =
				(this.ScheduleOfPerformanceColumnConfig.isAddMoreEnabled) ?
					false
					: this.ScheduleOfPerformanceColumnConfig.isAddMoreEnabled;
		}
		else {
			this.ScheduleOfPerformanceColumnConfig.isAddMoreEnabled = true;
		}

		list.forEach((row) => {
			this.NoOfDaysAfterStartDateLevelsFomArray.push(this.fb.group({
				Days: [
					row.Days,
					[
						this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'Days_s'),
						this.customValidators.RangeValidator(magicNumber.one, magicNumber.oneHundredEighty, 'FieldSpecificYouCanEnterValueBetween', [{ Value: 'Days_s', IsLocalizeKey: true }, { Value: '1', IsLocalizeKey: false }, { Value: '180', IsLocalizeKey: false }])
					]
				]
			}));
		});
	}

	switchDisplayQuestion(toggle: boolean) {
		this.isSwitchDisplayQuestion = toggle;
	}

	switchScheduleLengthAssignment(toggle: boolean) {
		this.isSwitchScheduleLengthAssignment = toggle;
	}

	switchDaysAssignmentStart(toggle: boolean) {;
		if (toggle) {
			this.isSwitchDaysAssignmentStart = true;
		} else {
			this.isSwitchDaysAssignmentStart = false;
			removeFormArrayValidations(this.NoOfDaysAfterStartDateLevelsFomArray);
		}
	}

	switchSurveyForAssignment(toggle: boolean) {
		if (toggle) {
			this.isSwitchSurveyForAssignment = true;
			this.switchDaysAssignmentStart(this.performanceSurveyConfigForm.controls.NoOfDaysAfterAssignmentStart.value);
			this.switchScheduleLengthAssignment(this.performanceSurveyConfigForm.controls.ScheduleThroughoutLengthOfAssignment.value);
			this.switchDisplayQuestion(this.performanceSurveyConfigForm.controls.DisplayQuestion.value);
		} else {
			this.isSwitchSurveyForAssignment = false;
			removeFormArrayValidations(this.NoOfDaysAfterStartDateLevelsFomArray);
		}
	}

	switchSurveyForClosedReq(toggle: boolean) {
		if (toggle) {
			this.isSwitchSurveyForClosedReq = true;
		} else {
			this.isSwitchSurveyForClosedReq = false;
			removeFormArrayValidations(this.reqSurveyScalesFormArray);
			removeFormArrayValidations(this.reqPerformaceFactorFormArray);
		}
		this.cdr.markForCheck();
	}

	switchDisplayQuestionScore(toggle: boolean) {
		this.isSwitchDisplayQuestionScore = toggle;
		this.cdr.markForCheck();
	}

	getFormStatus(formArray: FormArray) {
		if ('ReqSurveyScale' in formArray.value[0]) {
			this.reqSurveyScalesShowError = formArray;
			this.ReqSurveyScaleArr = formArray.value;
			this.sectorService.onAddReqSurveyScale(formArray.value, this.reqSurveyScalesFormArray);
			this.reqSurveyScalesFormArray.markAllAsTouched();
		}

		else if ('ReqPerformanceFactor' in formArray.value[0]) {
			this.reqPerformaceFactorShowError = formArray;
			this.ReqPerformanceFactorArr = formArray.value;
			this.sectorService.onAddReqPerformaceFactor(formArray.value, this.reqPerformaceFactorFormArray);
			this.reqPerformaceFactorFormArray.markAllAsTouched();
		}
		else {
			this.getFormStatusPartTwo(formArray);
		}

		if((formArray.touched || !formArray.pristine)) {
			this.performanceSurveyConfigForm.markAsTouched();
			this.performanceSurveyConfigForm.markAsDirty();
		}
		resetFormArrayErrorsOnSectorEdit(formArray);
	}

	private getFormStatusPartTwo(formArray: FormArray) {
		if ('NoOfScheduleOfPerformance' in formArray.value[0]) {
			this.NoOfDaysAfterStartDateLevelsShowError = formArray;
			this.NoOfSchedulePerformanceArr = formArray.value;
			this.onAddNoOfScheduleperformance(formArray.value);
			this.NoOfDaysAfterStartDateLevelsFomArray.markAllAsTouched();
		}

		else if ('CLPSurveyScale' in formArray.value[0]) {
			this.clpSurveyScaleError = formArray;
			this.clpSurveyScaleFormArrayArr = formArray.value;
			this.sectorService.onAddClpSurveyScale(formArray.value, this.clpSurveyScaleFormArray);
			this.clpSurveyScaleFormArray.markAllAsTouched();
		}

		else if ('CLPPerformaceFactor' in formArray.value[0]) {
			this.clpPerformanceFactorError = formArray;
			this.clpPerformanceFactorFormArrayArr = formArray.value;
			this.sectorService.onAddClpPerformanceFactor(formArray.value, this.clpPerformanceFactorFormArray);
			this.clpPerformanceFactorFormArray.markAllAsTouched();
		}
	}

	ngOnDestroy() {
		if ((this.isEditMode && !this.isDraft)) {
			this.sectorService.holdReqSurveyScales.next(null);
			this.sectorService.holdReqPerformanceFactor.next(null);
			this.sectorService.holdNoOfDaysAfterStartDateLevels.next(null);
			this.sectorService.holdCLPSurveyScale.next(null);
			this.sectorService.holdCLPPerformanceFactor.next(null);
		} else {
			this.sectorService.holdReqSurveyScales.next(this.ReqSurveyScaleArr);
			this.sectorService.holdReqPerformanceFactor.next(this.ReqPerformanceFactorArr);
			this.sectorService.holdNoOfDaysAfterStartDateLevels.next(this.NoOfSchedulePerformanceArr);
			this.sectorService.holdCLPSurveyScale.next(this.clpSurveyScaleFormArrayArr);
			this.sectorService.holdCLPPerformanceFactor.next(this.clpPerformanceFactorFormArrayArr);
		}
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}


