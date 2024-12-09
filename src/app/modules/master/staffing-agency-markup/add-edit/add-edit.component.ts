/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Component, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MarkupService } from '../services/markup.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { MarkupGridComponent } from '../markup-grid/markup-grid.component';
import { Store } from '@ngxs/store';
import { SaveGridData } from '@xrm-core/store/MarkupState/markup.state';
import { Subject, takeUntil } from 'rxjs';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { advancesearch } from '@xrm-shared/widgets/advance-search/advance-search/interface/advance-search.modal';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { ActivatedRoute } from '@angular/router';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { BaseMarkupConfig, FilterData, LaborCategoryMarkup, LocationMarkup, markupEnum, markupParam, MarkupSearchData, PermissionAction, SectorFilter, StaffingTier, updateSuccessResponse } from '../enum/enum';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { SelectedAdvanceFilter } from '@xrm-shared/models/manage-advance-filter.model';
import { IDropdown } from '@xrm-shared/models/common.model';


@Component({
	selector: 'app-add-edit-markup',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	encapsulation: ViewEncapsulation.None,
	animations: [
		trigger('slideInOut', [
			state('in', style({
				transform: 'translateX(0)',
				changeDetection: ChangeDetectionStrategy.OnPush
			})),
			transition(':enter', [
				style({ transform: 'translateX(100%)' }),
				animate('300ms ease-out')
			]),
			transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
		])
	]
})

export class AddEditComponent implements OnInit {

	@ViewChild(MarkupGridComponent) markupGridComponent: MarkupGridComponent;
	public advanceSearchFields: advancesearch[];
	public markupoffcanvasoverlay: boolean = false;
	public searchMarkupForm: FormGroup;
	public searchResult: MarkupSearchData | null;
	public isDisabled: boolean = true;
	public isBaseMarupLength: number;
	public ukey: string;
	public listStaffingAgency: StaffingTier[] = [];
	public addForm: FormGroup;
	public isEditMode: boolean = true;
	public actualData: MarkupSearchData | null;
	public filteredData: MarkupSearchData | null;
	public markUpRes: MarkupSearchData;
	public entityId = XrmEntities.StaffingAgencyMarkup;
	public columnOptions: GridColumnCaption[];
	public offcanvasServc: boolean = false;
	public FilterForm: FormGroup;
	public sectorList: IDropdown[];
	public laborCategoryList: IDropdown[];
	public locationList: IDropdown[];
	public AppliedfilterCount = magicNumber.zero;
	public SelectedAdvanceFilter: SelectedAdvanceFilter[];
	public MarkupConfigForm: FormGroup;
	public isFilterOpen: boolean = false;
	public selectedStaffingValue: StaffingTier;
	public isActionIdFound: boolean;
	public viewPermission: PermissionAction[];
	public isCopy: boolean = false;
	private unsubscribe$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		private customValidators: CustomValidators,
		private markupService: MarkupService,
		private loaderService: LoaderService,
		private gridService: GridViewService,
		private eventLogService: EventLogService,
		private store: Store,
		private toasterServc: ToasterService,
		private activatedroute: ActivatedRoute,
		private cd: ChangeDetectorRef

	) {
		this.advanceSearchFields = [];
		this.FilterForm = this.fb.group({
			Sector: [null],
			LaborCategory: [null],
			Location: [null]
		});
	}

	ngOnInit(): void {
		this.getColumnData();
		this.isDisabled = true;
		this.searchMarkupForm = this.fb.group({
			staffingAgency: [null, this.customValidators.RequiredValidator('PleaseSelectAtLeastOneStaffingAgency')],
			lcswitch: [false],
			locswitch: [false],
			allSector: [false]
		});
		this.markupService.isEditMode.pipe(takeUntil(this.unsubscribe$)).subscribe((dt: boolean) => {
			this.isEditMode = dt;
			if (dt) {
				this.addForm.markAsPristine();

			}
		});
		this.markupService.isCopy.pipe(takeUntil(this.unsubscribe$)).subscribe((dt: boolean) => {
			this.isCopy = dt;
		});
		this.loadStaffingAgencies();
		this.checkPermission();
	}

	public checkPermission() {
		this.activatedroute.params.pipe(takeUntil(this.unsubscribe$)).subscribe((action) => {
			this.viewPermission = action['permission'];
			this.isActionIdFound = this.viewPermission.length > Number(magicNumber.zero)
				? this.viewPermission.some((permission: PermissionAction) =>
					permission.ActionId === Number(Permission.VIEW_ONLY))
				: false;
		});

	}
	public onStaffingAgencyChange(data: StaffingTier) {
		try {
			this.selectedStaffingValue = data;
			this.AppliedfilterCount = magicNumber.zero;
			this.SelectedAdvanceFilter = [];
			this.searchRecords(data);
			this.FilterForm.reset();
		} catch (error) {
			console.log("error", error);
		}
	}


	private loadStaffingAgencies() {
		this.listStaffingAgency.length = magicNumber.zero;
		this.markupService.getDropdownRecordsforMarkup().pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<StaffingTier[]>) => {
			if (isSuccessfulResponse(res)) {
				this.listStaffingAgency = res.Data;
				if (this.listStaffingAgency.length == Number(magicNumber.one)) {
					this.onStaffingAgencyChange(this.listStaffingAgency[magicNumber.zero]);
					this.searchMarkupForm.get('staffingAgency')?.setValue(this.listStaffingAgency[magicNumber.zero]);
				}
			} else {
				this.toasterServc.showToaster(ToastOptions.Error, res.Message);
			}
			this.cd.markForCheck();
		});
	}

	public hideRightPannel() {
		this.markupoffcanvasoverlay = false;
		this.offcanvasServc = false;
		this.isFilterOpen = true;
		if (this.SelectedAdvanceFilter.length > Number(magicNumber.zero)) {
			this.FilterForm.patchValue({
				Sector: this.SelectedAdvanceFilter.find((e: SelectedAdvanceFilter) =>
					e.columnHeader === 'Sector')?.value,
				LaborCategory: this.SelectedAdvanceFilter.find((e: SelectedAdvanceFilter) =>
					e.columnHeader === 'LaborCategory')?.value,
				Location: this.SelectedAdvanceFilter.find((e: SelectedAdvanceFilter) =>
					e.columnHeader === 'Location')?.value
			});
		}
	}

	public openRightPanel() {
		this.offcanvasServc = true;
		this.markupoffcanvasoverlay = true;
		this.isFilterOpen = true;
		// this.FilterForm.markAsPristine();
	}


	private clearForm() {
		this.searchResult = null;
		this.searchMarkupForm.reset();
		this.actualData = null;
	}

	public save() {
		this.markupGridComponent.submitForm();
		this.markupService.updateSuccess.pipe(takeUntil(this.unsubscribe$)).subscribe((dt: updateSuccessResponse) => {
			if (dt.isSuccess) {
				this.toasterServc.showToaster(ToastOptions.Success, dt.message);
			}
		});
	}

	private searchRecords(data: StaffingTier) {
		this.searchMarkupForm.markAllAsTouched();
		this.markupService.addForm.pipe(takeUntil(this.unsubscribe$)).subscribe((dt: FormGroup) => {
			this.addForm = dt;
		});

		if (data?.Value) {
			this.ukey = String(data.Value);
			this.isDisabled = false;
		} else {
			this.clearForm();
			this.isDisabled = true;
			this.searchMarkupForm.get('allSector')?.setValue(false);
			this.searchMarkupForm.get('lcswitch')?.setValue(false);
			this.searchMarkupForm.get('locswitch')?.setValue(false);
		}

		if (!this.searchMarkupForm.valid && this.listStaffingAgency.length > Number(magicNumber.one)) {
			return;
		}

		this.searchResult = null;

		const param: markupParam = {
			ukey: String(this.ukey),
			sectorIds: [],
			laborCategoryIds: [],
			locationIds: []
		};

		this.markupService.getMarkupData(param).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponse) => {
			if (!res.Succeeded) {
				return;
			}
			this.searchResult = res.Data;
			this.markUpRes = res.Data;
			this.isBaseMarupLength = Number(this.searchResult?.baseMarkupConfigs.length);
			this.eventLogService.entityId.next(this.entityId);
			this.eventLogService.recordId.next(this.searchResult?.StaffingAgencyId);
			this.getDataForAdvanceSearch(res.Data.baseMarkupConfigs);
			this.locationList = this.removeDuplicateLocationLaborCategory(this.locationList);
			this.laborCategoryList = this.removeDuplicateLocationLaborCategory(this.laborCategoryList);
			this.store.dispatch(new SaveGridData(this.searchResult));
			this.actualData = res.Data;
			this.cd.markForCheck();
		});
	}

	private manageFilterCount(sector: IDropdown[], laborCategory: IDropdown[], location: IDropdown[]) {
		this.AppliedfilterCount = magicNumber.zero;
		this.SelectedAdvanceFilter = [];
		const manageFilter = (filterArray: IDropdown[], columnHeader: string) => {
			if (filterArray?.length > Number(magicNumber.zero)) {
				this.AppliedfilterCount += magicNumber.one;
				this.SelectedAdvanceFilter.push({
					columnHeader,
					controlType: markupEnum.MULTISELECT_CONTROL_TYPE,
					value: filterArray,
					dynamicParam: ''
				});
			}
		};
		manageFilter(sector, 'Sector');
		manageFilter(laborCategory, 'LaborCategory');
		manageFilter(location, 'Location');
	}

	getForm(formData: FormGroup) {
		this.MarkupConfigForm = formData;
	}

	public advanceFilterApply() {
		this.FilterForm.markAsPristine();
		try {
			this.markupoffcanvasoverlay = false;
			const sectorVal = this.FilterForm.get('Sector')?.value,
				laborCategoryVal = this.FilterForm.get('LaborCategory')?.value,
				locationVal = this.FilterForm.get('Location')?.value,
				originalData = JSON.parse(JSON.stringify(this.actualData)),
				filteredData = JSON.parse(JSON.stringify(originalData));
			if ((sectorVal == null
				|| sectorVal?.length == magicNumber.zero
			) &&
				(laborCategoryVal == null
					|| laborCategoryVal?.length == magicNumber.zero)
				&&
				(locationVal == null
					|| locationVal?.length == magicNumber.zero)) {
				this.AppliedfilterCount = magicNumber.zero;
				this.SelectedAdvanceFilter = [];
				this.searchResult = this.actualData;
				this.isBaseMarupLength = Number(this.searchResult?.baseMarkupConfigs.length);
				this.offcanvasServc = false;
				return;
			}
			filteredData.baseMarkupConfigs = this.filteredBaseData(
				filteredData.baseMarkupConfigs,
				{ sec: sectorVal, labour: laborCategoryVal, loc: locationVal }
			);
			this.searchResult = filteredData;
			this.manageFilterCount(sectorVal, laborCategoryVal, locationVal);
			this.offcanvasServc = false;
			this.isBaseMarupLength = Number(this.searchResult?.baseMarkupConfigs.length);
		} catch (error) {
			console.log("error", error);
		}
	}

	public filterLocations(locationMarkups: LocationMarkup[], locationVal: FilterData['loc']) {
		return locationMarkups?.filter((loc: LocationMarkup) => {
			if (
				locationVal?.some((e: IDropdown) =>
					e.Text === loc.LocationName) ||
				locationVal == null ||
				locationVal.length === Number(magicNumber.zero)
			) {
				return loc;
			}
			return;
		});
	}

	public filteredBaseData(basemarkup: SectorFilter[], data: FilterData) {
		return basemarkup.filter((sector: SectorFilter) => {
			const hasMatchingSector = data.sec?.some((e: IDropdown) =>
				e.Text === sector.SectorName);
			if (hasMatchingSector || !data.sec || data.sec?.length === Number(magicNumber.zero)) {
				sector.laborCategoryMarkups = sector.laborCategoryMarkups?.filter((labCat: LaborCategoryMarkup) => {
					const hasMatchingLaborCategory = data.labour?.some((e: IDropdown) =>
						e.Text === labCat.LaborCategoryName);
					if (hasMatchingLaborCategory || !data.labour || data.labour?.length === Number(magicNumber.zero)) {
						labCat.locationMarkups = this.filterLocations(labCat.locationMarkups ?? [], data.loc);
						return labCat.locationMarkups?.length > Number(magicNumber.zero) ||
							(data.labour?.length > Number(magicNumber.zero) && !data.loc);
					}
					return false;
				});
				return sector.laborCategoryMarkups.length > Number(magicNumber.zero) ||
					(data.sec?.length > Number(magicNumber.zero) && !data.labour && !data.loc);
			}
			return false;
		});
	}

	private getDataForAdvanceSearch(data: BaseMarkupConfig[]) {
		this.sectorList = [];
		this.laborCategoryList = [];
		this.locationList = [];

		data.forEach((sec: BaseMarkupConfig) => {
			this.sectorList.push({
				Text: sec.SectorName, Value: String(sec.SectorId)
			});
			sec.laborCategoryMarkups.forEach((labCat: LaborCategoryMarkup) => {
				this.laborCategoryList.push({
					Text: String(labCat.LaborCategoryName), Value: String(labCat.LaborCategoryId)
				});

				labCat.locationMarkups?.forEach((loc: LocationMarkup) => {
					this.locationList.push({
						Text: loc.LocationName, Value: String(loc.LocationId)
					});
				});
			});

		});
	}


	private removeDuplicateLocationLaborCategory(data: IDropdown[]) {
		data = data.filter((loc: IDropdown, index: number) => {
			return index === data.findIndex((obj: IDropdown) =>
				loc.Text === obj.Text);
		});
		return data;
	}

	public clearFilterForm() {
		try {
			if (this.FilterForm.value.Sector?.length > Number(magicNumber.zero) ||
			this.FilterForm.value.
				Location?.length > Number(magicNumber.zero) ||
			this.FilterForm.value.LaborCategory?.length > Number(magicNumber.zero)
			) {
				this.FilterForm.reset();
				this.FilterForm.markAsDirty();
				this.isFilterOpen = false;
			}
			else {
				this.isFilterOpen = true;
				this.FilterForm.markAsPristine();
			}
		} catch (error) {
			console.log("error", error);
		}
	}

	private getColumnData() {
		this.loaderService.setState(true);
		this.gridService.getColumnOption(this.entityId).pipe(takeUntil(this.unsubscribe$)).
			subscribe((res: GenericResponseBase<GridColumnCaption[]>) => {
				if (isSuccessfulResponse(res)) {
					this.loaderService.setState(false);
					this.columnOptions = res.Data.map((e: GridColumnCaption) => {
						e.fieldName = e.ColumnName;
						e.columnHeader = e.ColumnHeader;
						e.visibleByDefault = e.SelectedByDefault;
						return e;
					});
				} else {
					this.loaderService.setState(false);
				}
			});
	}

	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
