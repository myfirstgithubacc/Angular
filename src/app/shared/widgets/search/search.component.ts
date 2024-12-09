/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { SmartSearchSet } from '@xrm-core/store/actions/smart-search.action';
import { AdvFilterState } from '@xrm-core/store/advance-filter/states/adv-filter.states';
import { SmartSearchState } from '@xrm-core/store/states/smart-search.state';
import { BulkDataRecord } from '@xrm-master/bulk-data-management/constants/model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GlobalService } from '@xrm-shared/services/global.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { Observable, Subject, takeUntil } from 'rxjs';
@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnChanges {
	text: string = '';
	advanceFilter$!: Observable<any[]>;
	SelectedAdvanceFilter: any;
	private unsubscribe$ = new Subject<void>();

	@Input() EntityId: number | null = null;
	@Input() entityType: string | null = null;
	@Input() menuId: number | null = null;
	@Input() buttonNameSearch: string = '';
	@Input() list: BulkDataRecord[] | string;
	@Input() placeholder: string = 'SearchFor';
	@Input() isSpecialCharacterAllowed: boolean = true;
	@Input() specialCharactersAllowed: string[] = [];
	@Input() specialCharactersNotAllowed: string[] = [];
	@Input() isServerSidePagingEnable: boolean = false;
	@Input() columnOptions: GridColumnCaption[] | any = [];

	@Output() onSearch: EventEmitter<any> = new EventEmitter<any>();
	private timeoutIds: any[] = [];
	public SmartSearchPersistencey$!: Observable<any[]>;
	@ViewChild('searchTextBox', { static: true })
	searchTextBox!: TextBoxComponent;

	advFilterPersistData$: any;
	listFromAdv: any[] = [];
	isAdvSearchApplied: boolean = false;
	recorderedColumns: any[] = [];
	lastSearchText: string = '';
	isSearchBtnClicked: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
		private store: Store, private cdr: ChangeDetectorRef,
		private globalService: GlobalService,
		private gridViewService: GridViewService
	) {
		this.SmartSearchPersistencey$ = this.store.select(SmartSearchState.get_SmartSearch);
		this.advFilterPersistData$ = store.select(AdvFilterState.GetAdvFilterData);
	}

	ngOnChanges(): void {
		this.text = '';
		this.SmartSearchPersistencey$.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data: any) => {
				if (data && data.key == this.EntityId && data.entityType == this.entityType && data.menuId == this.menuId) {
					if (data.search != undefined) {
						this.text = data.search ?? '';

						this.onSearch.emit(this.text);
					}
				}
			});

		const timeoutId = setTimeout(() => {
			this.SmartSearch(this.text, false);
		}, magicNumber.fiveHundred);
		this.timeoutIds.push(timeoutId);
	}

	ngOnInit(): void {
		this.getDataListFromAdvFilter();

		if (this.listFromAdv.length > Number(magicNumber.zero))
			this.text = '';

		const timeoutId = setTimeout(() => {
			this.searchTextBox.focus();
		}, magicNumber.zero);
		this.timeoutIds.push(timeoutId);
	}

	ngAfterViewInit() {

		this.globalService.gridreset.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data) => {
				if (data) {
					this.SmartSearch('', true);
					this.globalService.gridreset.next(false);
				}
			});

		this.gridViewService.searchreset.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data) => {
				if (this.recorderedColumns.length > Number(magicNumber.zero)) {
					if (data) {
						this.SmartSearch('', true);
						this.gridViewService.searchreset.next(false);
					}
				}
			});
		this.gridViewService.getUpdatedColumnOptions.pipe(takeUntil(this.unsubscribe$))
			.subscribe((res) => {
				if (res.length == Number(magicNumber.zero))
					return;

				const data: any = res.find((x) =>
					x.entityId == this.EntityId && data.entityType == this.entityType && data.menuId == this.menuId);

				if (data == undefined || data.length == Number(magicNumber.zero))
					return;

				this.recorderedColumns = data.recorderedData;
				this.columnOptions = this.columnOptions.map((item: GridColumnCaption) => {
					const record = this.recorderedColumns.find((x) =>
						x.xrmEntityColumnCaptionId == item.XrmGridPersistentMasterId);
					if (record != undefined) {
						item.SelectedByDefault = record.isVisible;
					}
					return item;
				});


			});
	}

	search() {
		this.SmartSearch(this.text.trim(), true);
	}

	public onChange(value: string): void {
		if (value == '') {
			this.SmartSearch(this.text.trimStart().trimEnd(), true);
		}
	}

	OnEntrePress(event: KeyboardEvent) {
		if (event.key == 'Enter') {
			this.SmartSearch(this.text.trim(), true);
		}
	}

	SmartSearch(text: string, isEvent: boolean) {
		this.gridViewService.triggerClearCheckbox();
		this.isSearchBtnClicked = isEvent;
		if (this.isServerSidePagingEnable) {
			this.onSearch.emit(text);

			if (isEvent) {
				this.store.dispatch(new SmartSearchSet({ key: this.EntityId, entityType: this.entityType, menuId: this.menuId, search: text }));
			}

			this.lastSearchText = text;
			return;
		}

		this.getDataListFromAdvFilter();
		this.newAllData(text, isEvent);

		if (isEvent) {
			this.store.dispatch(new SmartSearchSet({ key: this.EntityId, entityType: this.entityType, menuId: this.menuId, search: text }));
		}
		// end function
	}

	newAllData(text: string, isEvent: boolean) {
		const allData: any = this.listFromAdv.length > Number(magicNumber.zero)
			? this.listFromAdv
			: this.list,
			searchData: any = [];

		if (text == '' || text.length == Number(magicNumber.zero)) {
			this.onSearch.emit(allData);
			if (isEvent) {
				this.store.dispatch(new SmartSearchSet({ key: this.EntityId, entityType: this.entityType, menuId: this.menuId, search: text }));
				this.isSearchBtnClicked = false;
			}
			return;
		}

		allData.forEach((item: any) => {
			for (const columnInfo of this.columnOptions) {
				if (!columnInfo.SelectedByDefault)
					continue;

				if (item[columnInfo.ColumnName] == undefined || item[columnInfo.ColumnName] == null)
					continue;

				const columnName = columnInfo.ColumnName,
					columnValue = item[columnName].toString().toLowerCase();

				if (columnValue.includes(text.toLowerCase())) {
					searchData.push(item);
					break;
				}
			}
		});

		this.onSearch.emit(searchData);
	}

	getDataListFromAdvFilter() {
		this.advFilterPersistData$.pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: any) => {
				const obj = res.find((x: any) =>
					x.entityId == this.EntityId && x.entityType == this.entityType && x.menuId == this.menuId);

				if (obj?.advFilterList != undefined)
					this.listFromAdv = obj?.advFilterList;
			});
	}


	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		this.timeoutIds.forEach((timeoutId) => {
			if (timeoutId) clearTimeout(timeoutId);
		});
	}
}