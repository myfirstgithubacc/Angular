import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { OnboardingRequirementsService } from '@xrm-shared/services/onboarding-requirements.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Subject, takeUntil } from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ComplianceOnboardingItemDto, IOnboardingPayloadData } from './utils/onboarding-requirement.interface';

@Component({
	selector: 'app-onboarding-requirements',
	templateUrl: './onboarding-requirements.component.html',
	styleUrls: ['./onboarding-requirements.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class OnboardingRequirementsComponent implements OnInit, OnChanges, OnDestroy {
	public onboardingForm: FormGroup;
	@Input() public entityId: number = magicNumber.zero;
	@Input() public isPendingResultSection: boolean = false;
	public isPendingResult: boolean = false;

	// get background check items
	@Input() public sectorId: number;
	@Input() public locationId: number;

	@Input() public isDrugScreen: boolean = false;
	// in case of add
	@Input() public parentInfosDrugScreen: any;

	@Input() public isBackgroundCheck: boolean = false;

	// in case of add
	@Input() public parentInfosBackgroundCheck: any;

	@Input() public recordUKey: string = '';
	@Input() public showTitle: boolean = false;

	// 1: add, 2: edit, 3: view
	@Input() public actionTypeId: any = magicNumber.zero;
	@Input() public isButtonVisible: boolean = false;
	@Input() public recordId: any = magicNumber.zero;

	@Output() onDataPicked = new EventEmitter<any>();

	public isEditMode: boolean = false;
	public isViewMode: boolean = false;
	private backgroundCheckItemsList: any = [];
	public rowsInfo: any[] = [];
	private selectedBackgroundChecksItemList: any = [];

	private drugScreenRadioGroupArray: any = [
		{ Text: "Negative", Value: DrugStatusId.Negative },
		{ Text: "PositivewithException", Value: DrugStatusId.PositiveWithException },
		{ Text: "None", Value: DrugStatusId.None }
	];
	private drugScreenRadioGroupArray2: any = [
		{ Text: "Negative", Value: DrugStatusId.Negative },
		{ Text: "PositivewithException", Value: DrugStatusId.PositiveWithException },
		{ Text: "Pending", Value: DrugStatusId.Initiated },
		{ Text: "None", Value: DrugStatusId.None }
	];

	private backgroundCheckRadioFroupArray: any = [
		{ Text: "Completed", Value: BackgroundStatusId.Completed },
		{ Text: "None", Value: BackgroundStatusId.None }
	];
	private backgroundCheckRadioFroupArray2: any = [
		{ Text: "Completed", Value: BackgroundStatusId.Completed },
		{ Text: "Pending", Value: BackgroundStatusId.Pending },
		{ Text: "None", Value: BackgroundStatusId.None }
	];

	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		public onboardingService: OnboardingRequirementsService,
		private customValidators: CustomValidators,
		public localizationService: LocalizationService,
		private toasterService: ToasterService,
		private cdr: ChangeDetectorRef
	) {
		this.initializeOnboardingForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isDrugScreen']?.currentValue) {
			this.onboardingForm.controls['drugScreenResultId'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'DrugScreenResult', IsLocalizeKey: true }]));
		}

		if (changes['isBackgroundCheck']?.currentValue) {
			this.onboardingForm.controls['backgroundCheckScreen'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'BackgroundCheck', IsLocalizeKey: true }]));
		}

		if (changes['parentInfosDrugScreen']?.currentValue) {
			this.patchDrugScreenData();
		}

		if (changes['parentInfosBackgroundCheck']?.currentValue) {
			this.patchBackgroundCheckData();
		}

		if (changes['recordId']?.currentValue) {
			this.getSelectedOnboardingCompliance();
		}

	}

	async ngOnInit() {
		await this.getBackgroundCheckItemsBasedOnSecLoc();

		// initial emait data to parent component when the form is loaded
		const initialData: IOnboardingPayloadData = this.prepareRequestedData();
		this.onDataPicked.emit({ data: initialData, formGroup: this.onboardingForm });

		// subscribe to form changes to emit the data to parent component
		this.onboardingForm.valueChanges.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(() => {
			const data: IOnboardingPayloadData = this.prepareRequestedData();
			this.onDataPicked.emit({ data: data, formGroup: this.onboardingForm });
		});
	}

	ngDoCheck(): void {
		if (this.onboardingForm?.touched && !this.onboardingForm?.valid) {
			this.cdr.markForCheck();
		}
	}

	private initializeOnboardingForm(): void {
		this.onboardingForm = this.formBuilder.group({
			pendingResult: [false],
			drugScreenId: [null],
			drugScreenResultId: [null],
			drugResultDate: [null],
			backgroundCheckScreen: [null],
			backgroundResultDate: [null],
			sectorBackgroundsArray: this.formBuilder.array([])
		});
	}

	private getBackgroundCheckItemsBasedOnSecLoc(): Promise<any> {
		return new Promise((resolve) => {
			const data = {
				locId: this.locationId,
				secId: this.sectorId
			};
			this.onboardingService.getOnboardingRequirements(data).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
				if (res.Succeeded) {
					this.backgroundCheckItemsList = res.Data
						? res.Data.OnboardingRequirementItems
						: [];
					this.prepareBackgroundCheckItemsList();
					this.isPendingResultSectionShow(res.Data);
					resolve(true);
				}
				this.cdr.markForCheck();
			});
		});
	}

	// show pending result section based on the switch state as "allow to fill candidate with pending compliance" in sector or location module
	private isPendingResultSectionShow(data: any) {
		if (this.isPendingResultSection) {
			this.isPendingResult = data.AllowToFillCandidateWithPendingCompliance;
		} else {
			this.isPendingResult = false;
		}
	}

	// computed property to generate the radio group array based on the switch state
	get dynamicRadioGroupArray(): any[] {
		const pendingResult = this.onboardingForm.controls['pendingResult'].value;
		if (pendingResult) {
			return this.drugScreenRadioGroupArray2;
		} else {
			return this.drugScreenRadioGroupArray;
		}
	}

	get dymamicBackgroundCheckRadioGroupArray(): any[] {
		const pendingResult = this.onboardingForm.controls['pendingResult'].value;
		if (pendingResult) {
			return this.backgroundCheckRadioFroupArray2;
		} else {
			return this.backgroundCheckRadioFroupArray;
		}
	}


	/**
	 * Updates the form controls based on the value of 'pendingResult'.
	 * If 'pendingResult' is truthy, sets the 'drugScreenResultId' control to 'DrugStatusId.Initiated',
	 * sets the 'backgroundCheckScreen' control to 'BackgroundStatusId.Pending',
	 * and calls 'isBackgroundCheckItemsRequired', 'resetDrugResultDate', and 'resetBackgroundResultDate' methods.
	 * If 'pendingResult' is falsy, sets the 'drugScreenResultId' and 'backgroundCheckScreen' controls to null.
	 */
	public pendingResultModel() {
		const pendingResult = this.onboardingForm.controls['pendingResult'].value;
		if (pendingResult) {
			this.onboardingForm.controls['drugScreenId'].setValue(DrugStatusId.Initiated);
			this.onboardingForm.controls['drugScreenResultId'].setValue(DrugStatusId.Initiated);
			this.onboardingForm.controls['backgroundCheckScreen'].setValue(BackgroundStatusId.Pending);
			// remove required validator from drug and background
			this.resetDrugResultDate();
			this.resetBackgroundResultDate();
		} else {
			this.onboardingForm.controls['drugScreenId'].setValue(null);
			this.onboardingForm.controls['drugScreenResultId'].setValue(null);
			this.onboardingForm.controls['backgroundCheckScreen'].setValue(null);
		}
	}


	/**
	 * Handles the change event of the drug result.
	 * If the event is Negative or PositiveWithException, adds a required validator to the drugResultDate control.
	 * Otherwise, resets the drugResultDate control.
	 * @param event The event object.
	 */
	public onDrugResultChange(event: any) {
		this.resetDrugResultDate();
		if (event == DrugStatusId.Negative || event == DrugStatusId.PositiveWithException) {
			this.onboardingForm.controls['drugResultDate'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'DrugResultDate', IsLocalizeKey: true }]));
			this.onboardingForm.controls['drugResultDate'].updateValueAndValidity();
			// set value of drugResultId as DrugStatusIdCompleted
			this.onboardingForm.controls['drugScreenId'].setValue(DrugStatusId.Completed);
		} else {
			this.resetDrugResultDate();
			// set value of drugResultId as drugScreenResultId
			this.onboardingForm.controls['drugScreenId'].setValue(event);
		}
	}

	private resetDrugResultDate() {
		this.onboardingForm.controls['drugResultDate'].reset();
		this.onboardingForm.controls['drugResultDate'].setErrors(null);
		this.onboardingForm.controls['drugResultDate'].clearValidators();
		this.onboardingForm.controls['drugResultDate'].updateValueAndValidity();
	}

	private patchDrugScreenData() {
		if (this.parentInfosDrugScreen && this.isDrugScreen) {
			// check drugScreenRadioGroupArray array value and set based on that value
			const drugId = this.parentInfosDrugScreen.drugScreenResultId,
				drugScreenResultId = this.drugScreenRadioGroupArray.find((ele: any) =>
					ele.Value == drugId)?.Value;
			if (drugScreenResultId) {
				this.onboardingForm.patchValue({
					'drugScreenId': this.parentInfosDrugScreen?.drugScreenId,
					'drugScreenResultId': this.parentInfosDrugScreen.drugScreenResultId,
					'drugResultDate': this.parentInfosDrugScreen.drugResultDate
						? (new Date(this.parentInfosDrugScreen.drugResultDate))
						: null
				});
			}
		}
	}


	/**
	 * Handles the change event for the background check.
	 * If the background check is completed, adds a validator to the backgroundResultDate control.
	 * Otherwise, resets the backgroundResultDate and backgroundChecksItemsList controls.
	 * Finally, checks if background check items are required.
	 * @param event - The event object.
	 */
	public onBackgroundCheckChange(event: any) {
		this.resetBackgroundResultDate();
		if (event == BackgroundStatusId.Completed) {
			this.onboardingForm.controls['backgroundResultDate'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'BackgroundResultDate', IsLocalizeKey: true }]));
			this.onboardingForm.controls['backgroundResultDate'].updateValueAndValidity();
		}
		else {
			this.resetBackgroundResultDate();
			this.resetBackgroundChecksItemsList();
		}
	}

	private resetBackgroundResultDate() {
		this.onboardingForm.controls['backgroundResultDate'].reset();
		this.onboardingForm.controls['backgroundResultDate'].setErrors(null);
		this.onboardingForm.controls['backgroundResultDate'].clearValidators();
		this.onboardingForm.controls['backgroundResultDate'].updateValueAndValidity();
	}

	private resetBackgroundChecksItemsList() {
		this.selectedBackgroundChecksItemList = [];
		this.prepareBackgroundCheckItemsList();
	}

	public validateBackgroundCheckItemsRequired(msg?: string) {
		const backgroundCheck = this.onboardingForm.controls['backgroundCheckScreen'].value,
			bgItemToastValidationMsg = msg
				? msg
				: 'BackgroundChecksRequiredValidationMessage';
		if (this.isBackgroundCheck && backgroundCheck == BackgroundStatusId.Completed && this.isBackgroundCheckItemsRequired()) {
			this.toasterService.showToaster(ToastOptions.Error, bgItemToastValidationMsg);
			return false;
		}
		return true;
	}

	public isBackgroundCheckItemsRequired(): boolean {
		const backgroundItems = this.onboardingForm.controls['sectorBackgroundsArray'].value;
		return backgroundItems.some((item: any) =>
			Object.values(item).some((value) =>
				value === false));
	}

	private patchBackgroundCheckData() {
		if (this.parentInfosBackgroundCheck && this.isBackgroundCheck) {
			// check backgroundCheckRadioFroupArray array value and set based on that value
			const backgroundCheckId = this.parentInfosBackgroundCheck.backgroundCheckScreen,
				backgroundCheck = this.backgroundCheckRadioFroupArray.find((ele: any) =>
					ele.Value == backgroundCheckId)?.Value;
			if (backgroundCheck) {
				this.onboardingForm.patchValue({
					'backgroundCheckScreen': this.parentInfosBackgroundCheck.backgroundCheckScreen,
					'backgroundResultDate': this.parentInfosBackgroundCheck.backgroundResultDate
						? (new Date(this.parentInfosBackgroundCheck.backgroundResultDate))
						: null
				});
			}
		}
	}


	/**
	 * Prepares the background check items list.
	 * This method takes a list of items and prepares it for further processing.
	 * It initializes the `rowsInfo` property and maps each item in the list to perform additional operations.
	 * @param list - The list of items to be prepared.
	 */
	private prepareBackgroundCheckItemsList() {
		this.rowsInfo = [];
		this.backgroundCheckItemsList.map((item: any) => {
			this.rowsInfo.push(item);
		});
		this.fa.clear();
		this.fa.push(this.initFields(this.rowsInfo));
		this.cdr.markForCheck();
	}

	private initFields(data: any) {
		const group = new FormGroup({});
		data.map((item: any) => {
			// used for patching the selected onboarding compliance data in edit mode and view mode
			const complianceCheckValue = this.checkComplianceCheckValue(item);
			// update the value in rowsInfo
			item.ComplianceCheckValue = complianceCheckValue;
			group.setControl(item.SectorComplianceItemId, new FormControl(complianceCheckValue));
		});
		return group;
	}

	private checkComplianceCheckValue(item: any) {
		if (this.selectedBackgroundChecksItemList.length) {
			const complianceItem = this.selectedBackgroundChecksItemList.find((ele: any) =>
				ele.SectorComplianceItemId == item.SectorComplianceItemId);
			if (complianceItem) {
				return complianceItem.ComplianceCheckValue;
			}
		}
		return false;
	}

	get fa(): FormArray { return this.onboardingForm.get('sectorBackgroundsArray') as FormArray; }

	public trackByFn(index: number, item: any) {
		return item.trackingId;
	}


	/**
	 * Retrieves the selected onboarding compliance data.
	 * and patched the selected onboarding compliance data.
	 * case 2: edit, 3: view
	 */
	private getSelectedOnboardingCompliance() {
		const data = {
			"xrmEntityId": this.entityId,
			"recordId": this.recordId
		};
		this.onboardingService.getSelectedOnboardingCompliance(data).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
			if (res.Succeeded) {
				this.patchSelectedOnboardingCompliance(res.Data);
			}
		});
	}

	private patchSelectedOnboardingCompliance(data: any) {
		// patch pending result
		this.onboardingForm.patchValue({
			'pendingResult': data?.PendingResult
		});

		// patch drug screen
		this.onboardingForm.patchValue({
			'drugScreenId': data?.DrugScreenId,
			'drugScreenResultId': data?.DrugScreenResultId,
			'drugResultDate': data?.DrugResultDate
				? (new Date(data?.DrugResultDate))
				: null
		});

		// patch background check
		this.onboardingForm.patchValue({
			'backgroundCheckScreen': data?.BackgroundCheckId,
			'backgroundResultDate': data?.BackgroundResultDate
				? (new Date(data?.BackgroundResultDate))
				: null
		});
		// patch background check items
		this.selectedBackgroundChecksItemList = data?.ComplianceOnboardingItems;
		this.prepareBackgroundCheckItemsList();
		if (this.actionTypeId == Number(magicNumber.three)) {
			this.isViewMode = true;
			this.isEditMode = true;
		}
	}


	/**
	 * Prepares the requested data for onboarding.
	 * @returns The prepared data object for payload.
	 */
	private prepareRequestedData(): IOnboardingPayloadData {
		return {
			"pendingResult": this.onboardingForm.controls['pendingResult'].value,
			"drugScreenId": this.onboardingForm.controls['drugScreenId'].value || DrugStatusId.None,
			"drugScreenResultId": this.onboardingForm.controls['drugScreenResultId'].value || DrugStatusId.None,
			"drugResultDate": this.localizationService.TransformDate(this.onboardingForm.controls['drugResultDate'].value, 'MM/dd/yyyy'),
			"backgroundCheckId": this.onboardingForm.controls['backgroundCheckScreen'].value || BackgroundStatusId.None,
			"backgroundResultDate": this.localizationService.TransformDate(this.onboardingForm.controls['backgroundResultDate'].value, 'MM/dd/yyyy'),
			"complianceOnboardingItemDto": this.prepareComplianceOnboardingItemGetDto()
		};
	}

	private prepareComplianceOnboardingItemGetDto(): ComplianceOnboardingItemDto[] {
		const outputData: ComplianceOnboardingItemDto[] = [],
			complianceOnboardingItemDto = this.onboardingForm.controls['sectorBackgroundsArray'].value;
		complianceOnboardingItemDto.forEach((item: any) => {
			for (const key in item) {
				// eslint-disable-next-line no-prototype-builtins
				if (item.hasOwnProperty(key)) {
					const value = item[key];
					outputData.push({
						sectorComplianceItemId: parseInt(key),
						complianceCheckValue: value,
						isVisibleToClient: true
					});
				}
			}
		});
		return outputData;
	}

	// when page destroy unsubscribe all the action which are subscribed above on this page
	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

}

const DrugStatusId = {
		Positive: 87,
		Negative: 88,
		PositiveWithException: 198,
		None: 199,
		Initiated: 200,
		Completed: 216
	},
	BackgroundStatusId = {
		Completed: 217,
		Pending: 211,
		None: 201,
		Initiated: 202
	};
