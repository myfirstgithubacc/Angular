/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable one-var */
/* eslint-disable max-nested-callbacks */
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	Renderer2,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
	ColumnChooserComponent,
	DataBindingDirective
} from '@progress/kendo-angular-grid';
import { NumberPipe } from '@progress/kendo-angular-intl';
import {
	PagerPosition,
	PagerSettings,
	PagerType
} from '@progress/kendo-angular-listview';
import { PopupService } from '@progress/kendo-angular-popup';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { SortDescriptor, process } from '@progress/kendo-data-query';
import { ClearGridTab } from '@xrm-core/store/actions/grid-tab.action';
import { ClearAdvAppliedFilterData } from '@xrm-core/store/advance-filter/actions/adv-filter.actions';
import { GridTabNameState } from '@xrm-core/store/states/grid-tab.state';
import { GridBindingDirective } from '@xrm-shared/directives/grid-binding.directive';
import { IButtonSet } from '@xrm-shared/models/button-set.model';
import { IActionModel, IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ManageGridActionSet } from '@xrm-shared/models/manage-grid-actionset.model';
import { IMassActionButton } from '@xrm-shared/models/mass-action-button.model';
import { ITabOption } from '@xrm-shared/models/tab-option.model';
import { CurrencyPipe } from '@xrm-shared/pipes/currency.pipe';
import { MaskFormatPipe } from '@xrm-shared/pipes/mask-format.pipe';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GlobalService } from '../../services/global.service';
import { GridViewService } from '../../services/grid-view.service';

@Component({
	selector: 'grid-view',
	templateUrl: './grid-view.component.html',
	styleUrls: ['./grid-view.component.scss'],
	providers: [CurrencyPipe, AuthCommonService],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridViewComponent implements OnInit, OnChanges, AfterViewInit {

	// #region declaration area
	@ViewChild(TooltipDirective)
	public tooltipDir!: TooltipDirective;
	public state: { skip: number; take: number; sort: never[]; filter: object; };
	public showTooltip(e: MouseEvent): void {
		const element = e.target as HTMLElement;
		if (
			(element.nodeName === 'TD' || element.nodeName === 'TH') &&
			element.offsetWidth < element.scrollWidth && !element.classList.contains('allCheckBox')
		) {
			this.tooltipDir.toggle(element);
		} else {
			this.tooltipDir.hide();
		}
	}
	public appliedFilter = false;
	public multiple = false;
	public allowUnsort = true;
	public orderedArray: any = [];
	private nCount = magicNumber.zero;
	@ViewChild(GridBindingDirective, { static: false }) gridDirective: GridBindingDirective;
	@ViewChild('columnchooser') public columnchooser: ColumnChooserComponent;
	@ViewChild(DataBindingDirective) dataBinding!: DataBindingDirective;
	@ViewChild('htCheckbox') htCheckbox: ColumnChooserComponent;
	@ViewChild('prev', { read: ElementRef }) prevbutton: any | ElementRef;
	@ViewChild('next', { read: ElementRef }) nextbutton: any | ElementRef;
	@ViewChild('grid') grid: any;
	@Input() noRecordsMessage: string = "GridNoRecordAvailable";
	// contains the data to be shown
	@Input() gridData: any;
	@Input() entityId: number | null = null;
	@Input() subEntityType: string | null = null;
	// Meaningful column name for the table
	@Input() columnOptions: GridColumnCaption[] | any = [];
	// action stored for the row data
	@Input() actionSet: IActionSetModel[] | any;
	// the unique property for the selection of kendoGridRows by default id otherwise set by user
	@Input() kendoGridSelectedBy: string = 'UKey';
	// this is to serve dynamic tabs in the tab strip
	@Input() tabOptions: ITabOption | any = [];
	@Input() extraButtonSet: IButtonSet[] = [];
	@Input() title: string = '';
	// selection is allowed or not in grid
	@Input() multiSelect: boolean = true;
  @Input() forceMultiSelect: boolean = false;
	@Input() height: number = magicNumber.fiveHundred;
	@Input() fileName: string = '';
	// flag for the column wise sorting
	@Input() isSortingAllowed: boolean = true;
	// flag for the column wise filtering
	@Input() isFilteringAllowed: boolean = true;
	// flag to show or hide action column
	@Input() isActionColumnVisible: boolean = true;
	// this contains the property name on which the action items depends
	@Input() actionItemCategoryField: string = 'Disabled';
	@Input() pageSize: number = Number(magicNumber.zero);
	@Input() isInternalSearch: boolean = false;
	// flag for the display the pagination
	@Input() isPaginationVisible: boolean = true;
	@Input() isColumnChooserVisible: boolean = true;
	@Input() ShowActivateDeactivateButton: boolean = false;
	@Input() isExportHide: boolean = false;
	@Input() massActionButtonSet: IMassActionButton[] | any[] = [];
	@Output() onGroupedAction: EventEmitter<{
		actionName: string;
		rowIds: string[];
		clickedTabName: string;
	}>;
	@Output() selectedTab: EventEmitter<string>;
	@Output() gridHeaderBtnType = new EventEmitter<any>();
	@Output() emitFileData = new EventEmitter<any>();
	@Output() onExportData = new EventEmitter<{ fileType: string }>;
	@ViewChild('gridChooserColumn', { read: ElementRef })
	gridChooserColumn: ElementRef;
	@Input() apiAddress: string = '';
	@Input() exportApiAddress: string = '';
	@Input() isApiGateway: boolean = false;
	@Input() searchText: string | any = '';
	@Input() advFilterData: any;
	@Input() entityType: string = '';
	@Input() isServerSidePagingEnable: boolean = false;
	@Input() isReloadGridData: boolean = false;
	@Input() showTabs: boolean = true;
	@Input() pageHideOnServerSide: boolean = false;
	@Input() isToolbarVisible: boolean = true;
	@Input() manageActionSets: ManageGridActionSet[] = [];
	@Input() isRowIndexNeeded: boolean = false;
	@Input() contractorId: number;
	@Input() userValues: any = null;
	@Input() IsPreviousAssignment: boolean = false;
	@Input() showPagination: boolean = true;
	@Input() menuId: number | null = null;
	public isExportBtnClicked: boolean = false;
	public splitButtonItems: any[] = [];
	public exportClearTimeOut: any = null;
	private lastsearchText: string;
	public position: PagerPosition = 'bottom';
	public pageSizes = true;
	public total: number = magicNumber.hundred;
	public info = true;
	public prevNext = true;
	public type: PagerType = 'numeric';
	public radioValue = 'yes';
	public dateFormat = '';
	public timeCultureEnum = CultureFormat.TimeFormat;
	public dateTimeFormat = '';
	public currencyFormat = '';
	public decimalPlaces = magicNumber.zero;
	public cultureArray = ['date', 'time', 'datetime', 'phone', 'number'];
	public phoneMask = '';
	public currentTabIndex = magicNumber.zero;
	public currentTab: string = 'active';
	public isCheckboxVisible: boolean = false;
	public selectedDataFromReorder: any = [];
	public gridDataTabWise: any;
	public gridTabData$!: Observable<any[]>;
	public get pagerSettings(): PagerSettings {
		return {
			position: this.position,
			pageSizeValues: this.pageSizes,
			info: this.info,
			previousNext: this.prevNext,
			type: this.type
		};
	}
	/* currentActionMethod: any;
	   currentDataItem: any;
	   currentAction: any; */
	public sort: SortDescriptor[];
	public addNewDialog: boolean = false;
	public value: string[] = ['Baseball'];
	public isList: boolean = true;
	public gridView!: any;
	public mySelection: string[] = [];
	public buttonCount = magicNumber.two;
	public sizes = [magicNumber.ten, magicNumber.twenty, magicNumber.fifty];

	// FontAwesome icon
	public iconClass = 'check-circle check-activate';

	public bookmarks = [
		{
			icon: 'eye',
			text: 'View'
		}
	];
	public status = 'not open';
	//	dialogHelp: boolean = false;
	public successFullySaved: boolean = false;
	public selectedTabInfo: any = null;
	private offsetString: any = null;
	private unsubscribe$ = new Subject<void>();
	private removeClickListener: (() => void) | undefined;

	// eslint-disable-next-line max-params
	constructor(
		public route: Router,
		public popupService: PopupService,
		public localizationService: LocalizationService,
		private renderer: Renderer2,
		private store: Store,
		private cdref: ChangeDetectorRef,
		private gridViewService: GridViewService,
		private globalSer: GlobalService,
		private commonService: AuthCommonService,
		private maskFormat: MaskFormatPipe,
		private numberPipe: NumberPipe,
		private gridConfiguration: GridConfiguration
	) {
		this.onGroupedAction = new EventEmitter<{
			actionName: string;
			rowIds: string[];
			clickedTabName: string;
		}>();
		this.mySelection = [];
		this.gridTabData$ = this.store.select(GridTabNameState.GetTabName);
		this.selectedTab = new EventEmitter<any>();
		this.dateFormat = this.localizationService.GetCulture(CultureFormat.DateFormat);
		this.dateTimeFormat = this.localizationService.GetCulture(CultureFormat.DateTimeFormat);
		this.gridConfiguration.isGridRefereshObj.pipe(takeUntil(this.unsubscribe$)).subscribe((res: any) => {
			if (!res)
				return;

			this.mySelection = [];
		});
	}

	private clearCheckbox() {
		this.mySelection = [];
		this.ShowActivateDeactivateButton = false;
	}

	// Grid have not any records then pagination will hide
	private checkGridEmpty() {
		if (this.isServerSidePagingEnable || this.entityId == XrmEntities.StaffingAgency)
			return;

		// this.isExportHide = false;
		this.isPaginationVisible = !this.pageHideOnServerSide;

		if (this.gridData == null || this.gridData.length <= magicNumber.zero || !this.showPagination) {
			this.isPaginationVisible = false;
			this.isExportHide = true;
			return;
		}

		if (this.currentTab.toLowerCase() == 'active') {
			if (!this.gridData.some((x: any) =>
				!x.Disabled)) {
				this.isPaginationVisible = false;
				this.isExportHide = true;
				return;
			}
		}

		if (this.currentTab.toLowerCase() == 'inactive') {
			if (!this.gridData.some((x: any) =>
				x.Disabled)) {
				this.isPaginationVisible = false;
				this.isExportHide = true;
				return;
			}
		}
	}

	// eslint-disable-next-line max-params
	public actionClicked(fun: any, dataItem: any, action: string, index?: number) {
		if (this.isRowIndexNeeded)
			fun(dataItem, action, index);
		else
			fun(dataItem, action);
	}

	public groupedAction(actionName: string) {
		this.onGroupedAction.emit({
			actionName: actionName,
			rowIds: this.mySelection,
			clickedTabName: this.currentTab
		});
	}

	private loadDataToGrid() {
		const bindingField = this.tabOptions.bindingField,
			tab = this.tabOptions.tabList.find((i: any) =>
				i.tabName.toLowerCase() == this.currentTab.toLowerCase());
		let index = 0;

		if (tab != undefined) {
			index = this.tabOptions.tabList.findIndex((a: any) =>
				a.tabName == this.currentTab);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
			if (index > magicNumber.minusOne) {
				this.tabOptions.tabList.forEach((el: any) => {
					el.selected = false;
				});
				this.tabOptions.tabList[index].selected = true;
			}
			this.gridView = new Array();
			if (tab.favourableValue == 'All') {
				this.isCheckboxVisible = false;
				this.gridView = this.gridData;
			}
			else {
				if (tab.favourableValue === Number(magicNumber.eightyThree)) {
					this.isCheckboxVisible = false;
				}
				else {
					this.isCheckboxVisible = true;
				}
				this.gridView = this.gridData?.filter((i: any) => {
					return i[bindingField] == tab.favourableValue;
				});
			}
		}
	}

	public alterTabbedView(event: any, isClickEvent: boolean = false) {
		this.selectedTabInfo = null;
		this.currentTabIndex = event.index;
		this.currentTab = this.tabOptions.tabList[event.index].tabName;
		if (!this.isServerSidePagingEnable && this.gridData?.length == Number(magicNumber.zero))
			return;
		this.mySelection = [];
		const filter = this.currentTab,
			bindingField = this.tabOptions.bindingField,
			tab = this.tabOptions.tabList.find((i: any) =>
				i.tabName == filter),
			index = event.index;
		if (isClickEvent) {
			this.globalSer.persistTab.next({ tabName: filter, key: this.entityId });
			this.selectedTabInfo = tab;
			this.selectedTabInfo.bindingField = bindingField;
		}
		else {
			this.selectedTabInfo = tab;
			this.selectedTabInfo.bindingField = bindingField;
		}
		this.selectedTab.emit(this.currentTab);
		if (tab != undefined) {
			if (index > Number(magicNumber.minusOne)) {
				this.tabOptions.tabList.forEach((el: any) => {
					el.selected = false;
				});
				this.tabOptions.tabList[index].selected = true;
			}
			if (tab.favourableValue == 'All') {
				this.isCheckboxVisible = false;
				this.gridView = this.gridData;
			}
			else {
				if (tab.favourableValue === magicNumber.eightyThree) {
					this.isCheckboxVisible = false;
				}
				else {
					this.isCheckboxVisible = true;
				}
				this.gridView = this.gridData?.filter((i: any) => {
					return i[bindingField] == tab.favourableValue;
				});
			}
		}
		this.checkGridEmpty();
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (this.dataBinding)
			this.dataBinding.skip = Number(magicNumber.zero);
		this.cdref.detectChanges();
	}

	public changeView(tabtitle: any) {
		if (tabtitle != 'list') {
			this.isList = true;
		} else {
			this.isList = false;
		}
	}

	public filterCheck() {
		this.appliedFilter = true;
	}

	public appliedFilterCheck() {
		if (this.appliedFilter) {
			return 'Applied Filters (4)';
		} else {
			return '';
		}
	}

	public reset() {
		this.appliedFilter = false;
	}

	public goToView(event: any) {
		if (event.text == 'View') {
			this.route.navigate(['/requistionUI/view-req']);
		}
	}

	private resetColumnData() {
		this.sort = [];
		this.gridViewService.getColumnOptionValue(this.entityId, this.entityType).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: any) => {
				if (res.Succeeded === true) {
					res.Data.map((e: any) => {
						const index = this.columnOptions.findIndex(((x: any) =>
							x.ColumnName == e.ColumnName));

						if (index > Number(magicNumber.minusOne)) {
							const updatedObj = { ...this.columnOptions[index] };
							updatedObj.visibleByDefault = e.SelectedByDefault;

							this.columnOptions = [
								...this.columnOptions.slice(magicNumber.zero, index),
								updatedObj,
								...this.columnOptions.slice(index + magicNumber.one)
							];
						}
					});
				}
				this.cdref.detectChanges();
				if (this.gridDirective) {
					this.gridDirective.resetpagingData();
				}
				this.gridDirective.skip=0;
			    this.gridDirective.pageSize=10;
				this.gridDirective.rebind();
				this.onPageSizeChange({take: magicNumber.ten}, true);
			});
		this.tabreset();
		this.isCheckboxVisible = false;
		this.tabView();
		this.grid.skip = Number(magicNumber.zero);
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition

		this.appliedFilter = false;
		this.advFilterData = null;
		this.store.dispatch(new ClearAdvAppliedFilterData());
		this.store.dispatch(new ClearGridTab());
		this.globalSer.gridreset.next(true);
		this.cdref.detectChanges();
	}

	private tabreset() {
		if (this.tabOptions?.tabList && this.tabOptions.tabList.length > Number(magicNumber.zero)) {
			const firstTab = this.tabOptions.tabList[0];
			firstTab.selected = true;
			this.currentTab = firstTab.tabName;
			this.currentTabIndex = 0;
			this.selectedTabInfo = firstTab;
			this.selectedTabInfo.bindingField = this.tabOptions.bindingField;
			this.selectedTab.emit(this.currentTab);
		}
	}

	private tabView() {
		this.tabOptions.tabList.forEach((item: any, i: number) => {
			if (item.selected) {
				const defaultTab = {
					index: i,
					prevented: false,
					title: item.tabName
				};
				this.alterTabbedView(defaultTab, false);
			}
		});
	}

	public ngOnInit(): void {
		this.offsetString = sessionStorage.getItem(CultureFormat[CultureFormat.OffSetValue]);
		if (this.grid) {
			this.grid.pageSize = this.pageSize ?
				this.pageSize
				: magicNumber.ten;
			this.grid.skip = Number(magicNumber.zero);
		}
		this.globalSer.persistTabName.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
			if (data?.key == this.entityId) {
				const index = this.tabOptions.tabList.findIndex((a: any) =>
					a.tabName.toLowerCase() == data.tabName.toLowerCase()),
					defaultTab = {
						index: index,
						prevented: false,
						title: this.tabOptions.tabList[index]?.tabName
					};
				this.alterTabbedView(defaultTab, false);
			} else {
				this.tabOptions.tabList.map((item: any, index: number) => {
					if (item.selected) {
						const defaultTab = {
							index: index,
							prevented: false,
							title: item.tabName
						};
						this.alterTabbedView(defaultTab, false);
					}
				});
			}
		});
		if (this.entityId) {
			this.getPermission();
		}
		this.gridView = this.gridData;
		this.tabView();
		this.gridViewService.clearCheckbox$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
			this.clearCheckbox();
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		this.splitButtonItems.length = 0;
		this.splitButtonItems.push({
			text: this.localizationService.GetLocalizeMessage('ExportToExcel'),
			icon: 'excel'
		});

		this.sortData();
		this.loadDataToGrid();
		this.checkGridEmpty();
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (changes['subEntityType'])
			if (changes['subEntityType'].currentValue != changes['subEntityType'].previousValue){
			this.grid.skip = Number(magicNumber.zero);
			this.gridDirective.rebind();
			this.gridDirective.skip=0;
			this.gridDirective.pageSize=this.pageSize;
			this.getPermission();
			this.cdref.detectChanges();
			}



		if (this.isServerSidePagingEnable) {
			this.cdref.detectChanges();
			return;
		}

		this.loadDataToGrid();
		this.mySelection = [];
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (this.dataBinding) {
			this.dataBinding.skip = 0;
		}
		this.cdref.detectChanges();
	}

	private getPermission() {
		this.commonService.getGridAuthPermission(this.entityId, this.actionSet, this.subEntityType, this.forceMultiSelect)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((response: any) => {
				if (response.length > magicNumber.zero)
					if (response?.[0]?.actionSet) {
						this.actionSet = response[0]?.actionSet;
						if (this.multiSelect)
							this.multiSelect = response[0]?.isMultiSelect;
					}
					else
						this.actionSet = response;
			});
	}

	public onGridFilter(inputValue: string): void {
		const filterableField = this.columnOptions.map((item: any) => {
			return { field: item.fieldName, operator: 'contains', value: inputValue };
		});
		this.gridView = process(this.gridData, {
			filter: {
				logic: 'or',
				filters: filterableField
			}
		}).data;

		this.dataBinding.skip = 0;
	}
	private isReset = true;
	ngAfterViewInit(): void {
		const btnElement: HTMLElement | null = this.gridChooserColumn.nativeElement.querySelector('.k-button');
		if(btnElement){
			this.removeClickListener = this.renderer.listen(btnElement, 'click', () => {
				const input = this.popupService.rootViewContainerNode.querySelector('.k-column-list'),
					columnChooserBtn = this.popupService.rootViewContainerNode.querySelectorAll('.k-actions-stretched .k-button');
				columnChooserBtn.forEach((item: any, index) => {
					item.setAttribute('id', index + magicNumber.one);
					this.renderer.listen(item, 'click', () => {
						if(this.isReset) this.onPageSizeChange({take: magicNumber.ten}, true);
						this.isReset = false;
						const btnId = item.getAttribute('id');
						if (btnId == magicNumber.one) {
							this.gridViewService.searchreset.next(true);
						}
						else if (btnId == magicNumber.two) {
							const data = {
								xrmEntityId: this.entityId
							};
							this.gridViewService.resetColumnOption(data)
								.pipe(takeUntil(this.unsubscribe$))
								.subscribe((res: any) => {
									this.resetColumnData();
								});

							const popupElement = this.popupService.rootViewContainerNode.querySelector('.k-popup');
							if (popupElement) {
								popupElement.parentNode?.removeChild(popupElement);
							}
						}
					});
				});
				input?.querySelectorAll('input')[0].focus();
				this.columnChooserFirstItem();
			});
		}
	}

	public columnChooserFirstItem(): void {
		const checkboxEvent = this.popupService.rootViewContainerNode
			.querySelector('.k-column-list .k-column-list-item');
		const firstCheckbox = this.popupService.rootViewContainerNode
			.querySelector('.k-column-list .k-checkbox');

		if (firstCheckbox) {
			firstCheckbox.setAttribute('disabled', 'true');
			this.renderer.listen(checkboxEvent, 'click', (event: Event) => {
				event.preventDefault();
				event.stopPropagation();
				return false;
			});
		}
	}
	public onSplitButtonClick(): void {
		const button = document.querySelector('.k-split-button-arrow.k-button') as HTMLElement;
		if (button) {
			button.click();
		}
	}

	public headericonClick(type: any) {
		this.renderer.addClass(document.body, 'scrolling__hidden');
		this.gridHeaderBtnType.emit(type);
	}

	public onSplitButtonItemClick(dataItem: Record<string, unknown>): void {
		if (dataItem['icon'] === 'pdf') {
			document.getElementById('pdf_btn')?.click();
		} else if (dataItem['icon'] === 'excel') {
			this.isExportBtnClicked = true;
			this.exportClearTimeOut = setTimeout(() => {
				this.isExportBtnClicked = false;
			}, magicNumber.hundred);
			this.onExportData.emit({ fileType: dataItem['icon'] });
		}
	}

	public sortChange(sort: SortDescriptor[]): void {
		this.sort = sort;
		const sortingdata = sort[0];

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (sort) {
			const sortObj = {
				userNo: this.globalSer.getXUIDValue(),
				xrmEntityColumnCaptionId: this.getId(sortingdata.field),
				xrmEntityId: this.entityId,
				menuId: this.menuId,
				sortingOrder: sortingdata.dir ?? 'undefined',
				direction: magicNumber.one
			};

			this.columnOptions.map((item: any) => {
				if (item.ColumnName == sortingdata.field)
					item.Dir = sortingdata.dir ?? 'undefined';
				else
					item.Dir = 'undefined';

			});

			this.gridViewService.updateSorting(sortObj)
				.pipe(takeUntil(this.unsubscribe$))
				.subscribe((res: any) => { });
		}
	}

	public onColumnReordered(e: any) {
		if (
			e.newIndex == magicNumber.zero ||
			e.newIndex == magicNumber.one ||
			e.oldIndex == magicNumber.one ||
			e.oldIndex == magicNumber.zero ||
			e.newIndex == this.grid.columnList.toArray().length - magicNumber.one
		) {
			e.preventDefault();
		} else {
			setTimeout(() => {
				const columnData = this.grid.columnList.toArray(),
					selectedData = columnData.filter((order: any) =>
						order.columnMenu);
				let isIndexZero = false;

				const reorderedData = selectedData.map((evt: any) => {
					if (evt.orderIndex == magicNumber.zero) {
						isIndexZero = true;
					}
					return {
						isVisible: !evt.hidden,
						columnSequence: isIndexZero
							? evt.orderIndex + magicNumber.one
							: evt.orderIndex,
						menuId: this.menuId,
						xrmEntityColumnCaptionId: this.getId(evt.field)
					};
				});
				if (reorderedData) {
					const reorderObj = {
						userId: this.globalSer.getXUIDValue(),
						xrmEntityId: this.entityId,
						userGridPersistentDetail: reorderedData
					};

					this.gridViewService
						.updateColumnDataAfterReorder(reorderObj)
						.pipe(takeUntil(this.unsubscribe$))
						.subscribe((res: any) => { });
				}
			}, magicNumber.hundred);
		}
	}

	private getId(fieldName: any) {
		const data = this.columnOptions.filter((d: any) => {
			return d.fieldName == fieldName;
		});
		return data[0]?.XrmGridPersistentMasterId;
	}

	public getWidth(value: any) {
		return window.innerWidth <= Number(magicNumber.nineHundredTwenty);
	}

	public onVisibilityChange(event: any) {
		const dataAfterChange: any = event.columns,
			reorderedData = dataAfterChange.map((e: any) => {
				return {
					isVisible: !e.hidden,
					menuId: this.menuId,
					columnSequence: this.getColumnSeqOfSpecVisibleValue(e.field),
					xrmEntityColumnCaptionId: this.getId(e.field)
				};
			});

		if (reorderedData) {
			const reorderObj = {
				userId: this.globalSer.getXUIDValue(),
				xrmEntityId: this.entityId,
				userGridPersistentDetail: reorderedData
			};

			this.gridViewService.updateColumnOptions(this.entityId, reorderedData);

			this.gridViewService
				.updateColumnDataAfterReorder(reorderObj)
				.pipe(takeUntil(this.unsubscribe$))
				.subscribe((res: any) => { });
			this.sort = [];
		}
	}

	private getColumnSeqOfSpecVisibleValue(fieldName: any) {
		const data = this.columnOptions.filter((d: any) => {
			return d.fieldName == fieldName;
		});
		return data[0].DefaultColumnSequence;
	}

	public onPageSizeChange(data: any, allowChange: boolean=false) {
		this.mySelection = [];
		this.nCount += 1;
		//if (this.nCount == magicNumber.one || allowChange) {
			const obj = {
				userNo: this.globalSer.getXUIDValue(),
				xrmEntityId: this.entityId,
				menuId: this.menuId,
				entityType: this.entityType,
				pageSize: data.take
			};
			this.gridViewService.updatePageNumber(obj).pipe(takeUntil(this.unsubscribe$))
				.subscribe((res: any) => { });

			if(this.entityType){
				this.gridDirective.reloadGrid();
			}
		//}
	}

	private sortData() {
		this.sort = this.columnOptions?.map((e: any) => {
			return {
				field: e.ColumnName,
				dir: e.Dir === 'undefined'
					? undefined
					: e.Dir
			};
		});
	}

	public manageSmartSearchText() {
		if (this.lastsearchText == undefined) { /* empty */ }
		else if (this.lastsearchText == null) { /* empty */ }
		else if (this.lastsearchText.length > Number(magicNumber.zero) && this.searchText.length == Number(magicNumber.zero)) {
			this.cdref.detectChanges();
		}

		if (this.searchText == undefined) { /* empty */ }
		else if (this.searchText == null) { /* empty */ }
		else if (this.searchText.length == magicNumber.eightyThree) { /* empty */ }
		else {
			this.cdref.detectChanges();
		}
		this.lastsearchText = this.searchText;
	}

	public phoneFormat(countryId: any, val: any) {

		if (!countryId || !val)
			return val;

		val = val.trim();
		const phoneExtMask = this.localizationService.GetCulture(CultureFormat.PhoneExtFormat, countryId),
			value = val.split(","),
			phoneVal = value[0]?.trim(),
			phoneExtVal = value[1]?.trim();

		let result = '';
		if (val.indexOf(',') == magicNumber.minusOne || val.endsWith(',')) {
			result = this.localizationService.TransformData(phoneVal, CultureFormat.PhoneFormat, countryId);
		}

		if (phoneExtVal)
			result = (`${this.localizationService.TransformData(phoneVal, CultureFormat.PhoneFormat, countryId)} ${this.localizationService.GetLocalizeMessage('PhoneExt')} ${this.maskFormat.transform(phoneExtVal, phoneExtMask)}`);

		return result;
	}

	public getActionSet(dataActionSet: IActionModel[], dataItem: any) {
		if (this.manageActionSets.length == Number(magicNumber.zero)) {
			return dataActionSet;
		}

		this.manageActionSets.forEach((item: ManageGridActionSet) => {
			if (dataItem[item.ColumnName] == item.ColumnValue) {
				dataActionSet = dataActionSet.filter((x: IActionModel) =>
					!item.ActionTitles.includes(x.title));
			}
		});

		return dataActionSet;
	}

	emitFileObjData(data: any) {
		this.emitFileData.emit(data);
	}

	public getRowValue(columnInfo: any, dataItem: any) {
		if (!columnInfo.ValueType)
			return dataItem[columnInfo.fieldName];

		const valueType = columnInfo.ValueType.toLowerCase(),
			data = dataItem[columnInfo.fieldName];

		if (!data || data == null || data == '')
			return data;

		if (!this.cultureArray.includes(valueType))
			return data;

		if (valueType == 'date')
			return this.localizationService.TransformData(data, CultureFormat.DateFormat);

		if (valueType == 'time')
			return this.localizationService.TransformData(data, CultureFormat.TimeFormat);

		if (valueType == 'datetime')
			return this.localizationService.TransformData(data, CultureFormat.DateTimeFormat);

		if (valueType == 'phone')
			return this.phoneFormat(dataItem.CountryId, data);

		if (valueType == 'number') {
			const decimalPlaces = columnInfo.DecimalPlaces;
			if (!decimalPlaces || decimalPlaces == magicNumber.zero)
				return data;

			return this.numberPipe.transform(data, `1.${decimalPlaces}-${decimalPlaces}`);
		}


		return data;
	}

	public isNaN(val: any) {
		return isNaN(val);
	}

	public getColumnWidth(passedWidth: number): any {
		if (passedWidth > Number(magicNumber.zero) && window.innerWidth <= Number(magicNumber.thirteenSixtySix)) {
			return passedWidth;
		}
	}

	public setDateTimezone(value: string) {
		if (!value) {
			return value;
		}
		let offsetValue: number = 0;
		if (this.offsetString !== null) {
			offsetValue = parseInt(this.offsetString);
		}
		const date = new Date(value),
			newDate = new Date(date.getTime());
		newDate.setMinutes(newDate.getMinutes() + offsetValue);
		return newDate;
	}

	ngOnDestroy() {
		clearTimeout(this.exportClearTimeOut);
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		if(this.removeClickListener){
			this.removeClickListener();
		}
	}
}
