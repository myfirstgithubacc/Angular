import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';
import { Subject, switchMap, take, takeUntil } from 'rxjs';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { ValidationMethods } from '@xrm-shared/services/common-methods/validation-methods';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { TIMEANDEXPENTRYSELECTION } from '../../expense/expense/enum-constants/enum-constants';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { TimeEntryService } from 'src/app/services/acrotrac/time-entry.service';
import { NavigationPaths } from '../../Time/timesheet/route-constants/route-constants';
import { ScreenId } from '../../Time/enum-constants/enum-constants';
import { animate, style, transition, trigger } from '@angular/animations';
import { setStartPoint } from '../../expense/utils/CommonEntryMethods';
import { isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { AssignmentDetailsData } from '@xrm-core/models/acrotrac/expense-entry/add-edit/assignment-details';
import { DropdownModel, IDropdown, IDropdownWithExtras } from '@xrm-shared/models/common.model';
import { IUserValues } from '@xrm-core/models/acrotrac/common/user-value.model';
import { GridViewService } from '@xrm-shared/services/grid-view.service';

@Component({
	selector: 'app-filter-sidebar',
	templateUrl: './filter-sidebar.component.html',
	styleUrls: ['./filter-sidebar.component.scss'],
	encapsulation: ViewEncapsulation.None,
	animations: [
		trigger("inOutPaneAnimation", [
			transition(":enter", [
				style({ transform: "translateX(100%)" }),
				animate(
					".3s ease-in-out",
					style({ transform: "translateX(0)" })
				)
			]),
			transition(":leave", [
				style({ opacity: magicNumber.one, transform: "translateX(0)" }),
				animate(
					"600ms ease-in-out",
					style({ opacity: magicNumber.zero, transform: "translateX(100%)" })
				)
			])
		])
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilterSidebarComponent implements OnInit, OnDestroy, AfterViewInit {
	@Input() headerName: string = '';
	@Input() navigationPath: string = '';
	@Input() usingTimesheet: boolean = false;
	@Input() entityId: number;

	@Output() isShowFilterChange = new EventEmitter<boolean>();

	public AddEditExpenseEntryForm: FormGroup;
	public activeSectorList: IDropdownWithExtras[] = [];
	public contractorNameList: IDropdown[] = [];
	public assignmentList: IDropdown[] = [];
	public magicNumber = magicNumber;
	public weekendingList: IDropdown[] = [];
	public sideBarHeader: string = '';
	public searchTextContractor: string = '';
	public searchTextAssignment: string = '';

	private assignmentFilterData: AssignmentDetailsData;
	private dateFormat: string;
	private isVisible: boolean = true;
	private weekendingDateFromService: DropdownModel | null;
	private destroyAllSubscribtion$ = new Subject<void>();

	public AssignmentIdParams = {
		"byPassLoader": true,
		"entityId": magicNumber.thirtyFive,
		"entityType": "",
		"pageIndex": magicNumber.zero,
		"pageSize": magicNumber.ten,
		"columnName": null,
		"searchText": "",
		"userValues": {
			"sectorId": magicNumber.zero,
			"locationId": magicNumber.zero,
			"contractorId": magicNumber.zero
		}
	};

	public ContractorIdParams = {
		"byPassLoader": true,
		"entityId": magicNumber.thirtyFive,
		"entityType": null,
		"pageIndex": magicNumber.zero,
		"pageSize": magicNumber.ten,
		"columnName": null,
		"searchText": "",
		"userValues": {
			"sectorId": magicNumber.zero,
			"locationId": magicNumber.zero,
			"contractorId": magicNumber.zero
		}
	};
	public userValuesAssignment: IUserValues = new IUserValues();
	public userValuesContractor: IUserValues = new IUserValues();

	// eslint-disable-next-line max-params
	constructor(
		private expEntryService: ExpenseEntryService,
		private customValidators: CustomValidators,
		private localizationService: LocalizationService,
		private router: Router,
		private sessionStore: SessionStorageService,
		private formBuilder: FormBuilder,
		private timesheetService: TimeEntryService,
		private gridViewSrv: GridViewService,
		private cd: ChangeDetectorRef
	) {
		this.AddEditExpenseEntryForm = this.formBuilder.group({
			'Sector': [null, ValidationMethods.fieldSpecificRequiredValidator('PleaseSelectData', 'Sector', this.customValidators)],
			'ContractorName': [null, ValidationMethods.fieldSpecificRequiredValidator('PleaseSelectData', 'Contractor', this.customValidators)],
			'AssignmentId': [null, ValidationMethods.fieldSpecificRequiredValidator('PleaseSelectData', 'AssignmentID', this.customValidators)],
			'WeekendingDate': [null, ValidationMethods.fieldSpecificRequiredValidator('PleaseSelectData', 'WeekendingDate', this.customValidators)]
		});
	}

	ngOnInit(): void {
		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
		this.getSectorList();
		this.maintainPersistencyOfForm();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['entityId'].currentValue) {
			this.AssignmentIdParams.entityId = changes['entityId'].currentValue;
			this.ContractorIdParams.entityId = changes['entityId'].currentValue;
		}

	}

	ngAfterViewInit(): void {
		this.sideBarHeader = this.localizationService.GetLocalizeMessage('SideBarHeader', [{ Value: this.headerName, IsLocalizeKey: true }]);
	}

	private maintainPersistencyOfForm() {
		this.expEntryService.formDataRelease.pipe(
			take(magicNumber.one),
			takeUntil(this.destroyAllSubscribtion$)
		).subscribe((data) => {
			if (data) {
				this.weekendingDateFromService = data.WeekendingDate;
				this.ContractorIdParams.userValues.sectorId = parseInt(data.Sector.Value);
				// on selection of Sector and Contractor, Assignment api run...
				this.onSelectingContractor(data.ContractorName);
				// on selection of assignment, weekending api is run...
				this.selectedAssigment(data.AssignmentId);
				// Now api run while selecting data then patch...
				this.AddEditExpenseEntryForm.patchValue({
					'AssignmentId': { 'Value': data.AssignmentId.Value }
				});
				this.updatingWeekeningDate(data.WeekendingDate);
			}
		});
		this.cd.markForCheck();
	}

	private updatingWeekeningDate($event: DropdownModel) {
		if (this.weekendingDateFromService) {
			this.AddEditExpenseEntryForm.controls['WeekendingDate'].patchValue(this.weekendingDateFromService);
		} else {
			this.AddEditExpenseEntryForm.controls['WeekendingDate'].patchValue($event);
		}

		if (this.usingTimesheet) {
			this.timesheetStatusAPI();
		}
	}

	private timesheetStatusAPI() {
		// if somehow api give wrong response then it will navigate to 'add-edit' page...
		this.navigationPath = NavigationPaths.addEdit;

		this.timesheetService.getTimesheetStatus(this.AddEditExpenseEntryForm.getRawValue(), {
			'RouteOrigin': 'SideBar',
			'Action': 'addedit',
			'ScreenId': 2
		})
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((path: string) => {
				this.navigationPath = path;
			});
		this.cd.markForCheck();
	}

	public onWeekendingDateChange($event: IDropdown | undefined) {
		if ($event && this.usingTimesheet)
			this.timesheetStatusAPI();
	}

	private getSectorList() {
		this.expEntryService.getAllSectorDropDown().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if (isSuccessfulResponse(res))
				this.activeSectorList = res.Data;
			// if single record is selected then we will patch that value in SectorName field and call the required...
			this.singleRecordPatch(this.activeSectorList, 'Sector', this.onSectorChangeGetRequiredData.bind(this));
		});
		this.cd.markForCheck();
	}

	public onSectorChangeGetRequiredData($event: DropdownModel | undefined) {
		this.ContractorIdParams.userValues.sectorId = this.AssignmentIdParams.userValues.sectorId = ($event)
			? parseInt($event.Value)
			: magicNumber.zero;
		//if($event){
		this.userValuesContractor = new IUserValues();
		const data = $event
			? $event.Value
			: '0';
		this.userValuesContractor.sectorId = parseInt(data);
		//}
		// Contractor, Assignment, Weekekending Date will get reset when sector change...
		this.clearDropdownFilter(['ContractorName', 'AssignmentId', 'WeekendingDate']);

		if (!$event) {
			// if Selected Sector Removed then Contractor Name, Assignment List will get reset...
			this.AssignmentIdParams.userValues.contractorId = magicNumber.zero;
		}
		this.onSelectingContractor(undefined);
		// Selected SectorId to get Assignment Name List...
	}

	private clearDropdownFilter(controlNames: string[]) {
		controlNames.forEach((controlName: string) => {
			this.AddEditExpenseEntryForm.controls[controlName].reset(null);
		});
	}

	public onSelectingContractor($event: IDropdown | undefined) {
		this.AssignmentIdParams.userValues.contractorId = ($event)
			? parseInt($event.Value)
			: magicNumber.zero;

		//if($event){
		this.userValuesAssignment = new IUserValues();
		this.userValuesAssignment.sectorId = this.AddEditExpenseEntryForm.controls['Sector'].value?.Value ?? magicNumber.zero;
		const contractorId = $event
			? $event.Value
			: '0';
		this.userValuesAssignment.contractorId = parseInt(contractorId);
		//}
		// if Selected Contractor Removed then Assignment Id will get removed...
		if (!$event) {
			this.clearDropdownFilter(['AssignmentId', 'WeekendingDate']);
		}
	}

	public selectedAssigment($event: IDropdown | undefined) {
		this.weekendingList = [];
		this.AddEditExpenseEntryForm.get('WeekendingDate')?.setValue(null);
		if ($event) {
			const { Value } = $event,
				payload = {assignmentId: Value, entityId: this.entityId, weekendingDate: null};
			// eslint-disable-next-line max-len
			this.expEntryService.getAssignmentDetailsForTandE(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
				if (isSuccessfulResponse(response)) {
					this.assignmentFilterData = response.Data.Result;
					const { SectorId, ContractorId } = this.assignmentFilterData;

					/* This check is very important because if contractor will call selectedContractor() and then it will call Assignment
					then it will again call selectedAssigment() this loop will break here... */
					if (!this.contractorNameList.length) {
						this.ContractorIdParams.userValues.sectorId = parseInt(SectorId);
						this.ContractorIdParams.userValues.locationId = magicNumber.zero;
					}
					this.searchTextContractor = this.assignmentFilterData.ContractorName;
					this.userValuesContractor = new IUserValues();
					this.userValuesContractor.contractorId = parseInt(ContractorId);
					this.userValuesContractor.sectorId = parseInt(SectorId);
					this.AddEditExpenseEntryForm.patchValue({
						'Sector': { 'Value': SectorId },
						'ContractorName': { 'Value': ContractorId }
					});
					this.getAllWeekendingDates(parseInt(Value));
				}
			});
			this.cd.markForCheck();
		}
	}

	private getAllWeekendingDates(assignmentId: number) {
		this.expEntryService.getAllWeekendingDatesForEntry(
			this.entityId, assignmentId, ScreenId.SelectionPopUp,
			this.dateFormat
		).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((weekendingDate) => {
			this.weekendingList = weekendingDate;
			if (this.weekendingList.length > Number(magicNumber.zero))
				this.updatingWeekeningDate(this.weekendingList[0]);
		});
		this.cd.markForCheck();
	}

	public closeDialog() {
		this.isShowFilterChange.emit(false);
	}

	public navigate() {
		if (this.AddEditExpenseEntryForm.valid) {
			const data = this.AddEditExpenseEntryForm.getRawValue(),
				payload = {assignmentId: data.AssignmentId.Value, entityId: this.entityId, weekendingDate: data.WeekendingDate.Value};
			this.expEntryService.getAssignmentDetailsForTandE(payload)
				.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
					if (isSuccessfulResponse(response)) {
						sessionStorage.setItem(TIMEANDEXPENTRYSELECTION, JSON.stringify({
							'AssignmentDetails': response.Data.Result,
							'WeekendingDate': this.AddEditExpenseEntryForm.controls['WeekendingDate'].value as IDropdown,
							'WeekendingList': this.weekendingList
						}));
						if (this.usingTimesheet)
							setStartPoint(this.sessionStore, 'SideBar', 'AddEdit');
						this.router.navigate([this.navigationPath]);
					}
				});
		} else {
			this.AddEditExpenseEntryForm.markAllAsTouched();
		}
	}

	private singleRecordPatch = (data: DropdownModel[], controlName: string, afterPatchFunction: (value: DropdownModel) => void) => {
		if (data.length === Number(magicNumber.one)) {
			this.AddEditExpenseEntryForm.controls[controlName].patchValue({ 'Value': data[0].Value });
			afterPatchFunction(data[0]);
		}
	};

	public resetForm() {
		this.onlyResetWhenDataIsMoreThanOne(this.activeSectorList, 'Sector');
		if (this.AddEditExpenseEntryForm.controls['Sector'].value == null) {
			this.ContractorIdParams.userValues.sectorId = magicNumber.zero;
			this.AssignmentIdParams.userValues.sectorId = magicNumber.zero;
			this.searchTextContractor = '';
			this.onSectorChangeGetRequiredData(undefined);
		}

		this.ifSectorIsResetThenResetContractor().pipe(switchMap((res) => {
			if (this.AddEditExpenseEntryForm.controls['Sector'].value) {
				this.onlyResetWhenDataIsMoreThanOne(res.Data[0]?.data ?? [], 'ContractorName');
			} else {
				this.AddEditExpenseEntryForm.controls['ContractorName'].reset();
				this.ContractorIdParams.userValues.sectorId = magicNumber.zero;
				this.ContractorIdParams.userValues.contractorId = magicNumber.zero;
			}
			return this.ifContractorIsResetThenResetAssignment();
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if (this.AddEditExpenseEntryForm.controls['ContractorName'].value) {
				this.onlyResetWhenDataIsMoreThanOne(res.Data[0]?.data ?? [], 'AssignmentId');
			} else {
				this.AddEditExpenseEntryForm.controls['AssignmentId'].reset();
			}

			this.ifAssignmentResetThenResetWeekending();
		});
	}

	private ifSectorIsResetThenResetContractor = () => {
		return this.gridViewSrv.loadDropdownDataOnDemand('contractor/select-contractor', this.ContractorIdParams, true);
	};

	private ifContractorIsResetThenResetAssignment = () => {
		return this.gridViewSrv.loadDropdownDataOnDemand('assignment/select-valid-assignment', this.AssignmentIdParams, true);
	};

	private ifAssignmentResetThenResetWeekending = () => {
		if (this.AddEditExpenseEntryForm.controls['AssignmentId'].value) {
			this.onlyResetWhenDataIsMoreThanOne(this.weekendingList, 'WeekendingDate');
		} else {
			this.AddEditExpenseEntryForm.controls['WeekendingDate'].reset();
			this.weekendingList = [];
		}
	};

	private onlyResetWhenDataIsMoreThanOne = (data: DropdownModel[], controlName: string) => {
		if (data.length > Number(magicNumber.one)) {
			this.AddEditExpenseEntryForm.controls[controlName].reset();
		}
	};

	private allPropertiesAreNull(ob: FormGroup): boolean {
		const obj = ob.value;
		for (const key in obj) {
			if (obj[key] !== null) {
				return false;
			}
		}
		return true;
	}

	ngOnDestroy(): void {
		this.expEntryService.formDataHold.next(this.allPropertiesAreNull(this.AddEditExpenseEntryForm)
			? null
			: this.AddEditExpenseEntryForm.value);

		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}


