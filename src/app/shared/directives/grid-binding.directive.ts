import { ChangeDetectorRef, Directive, Input } from '@angular/core';
import { DataBindingDirective, GridComponent } from '@progress/kendo-angular-grid';
import { IExportDataModel } from '@xrm-shared/models/export-data.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GlobalService } from '@xrm-shared/services/global.service';
import { GridService } from '@xrm-shared/services/grid.service';
import { Subject, takeUntil } from 'rxjs';

@Directive({
	selector: '[appGridBinding]'
})
export class GridBindingDirective extends DataBindingDirective {
	private unsubscribe$ = new Subject<void>();

	@Input() apiAddress: string = '';
	@Input() exportApiAddress: string | null = null;
	@Input() exportFileName: string = "Default";
	@Input() contractorId: number;
	@Input() searchText: string;
	@Input() currentTab: any = '';
	@Input() advFilterData: any;
	@Input() entityId: XrmEntities | null = null;
	@Input() entityType: string | null = null;
	@Input() selectedTabInfo: any = null;
	@Input() customSort: any = null;
	@Input() userValues: any = null;
	@Input() menuId: number | null = null;

	@Input() isExportBtnClicked: boolean = false;
	@Input() isServerSidePagingEnable: boolean = false;
	@Input() isReloadGridData: boolean = false;
	@Input() IsPreviousAssignment: boolean = false;

	private lastPayload: any = {};
	private lastPageSize: number;
	// private serviceSubscription: Subscription;
	private lastTabData: any = {};
	private numberZero = Number(magicNumber.zero);

	// eslint-disable-next-line max-params
	constructor(
		grid: GridComponent, private gridService: GridService,
		private globalSer: GlobalService, private gridConfiguration: GridConfiguration, private cd: ChangeDetectorRef
	) {
		super(grid);
		this.lastPayload = {};
	}

	public override ngOnInit(): void {
		if (!this.isServerSidePagingEnable || !this.entityId)
			return;

		super.ngOnInit();

		this.gridConfiguration.isGridRefereshObj.pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: any) => {
				if (!res)
					return;

				this.isReloadGridData = true;
				this.rebind();
			});

		this.gridService.pipe(takeUntil(this.unsubscribe$))
			.subscribe((result) => {
				this.grid.loading = false;
				this.grid.data = result;
				this.rebind();
				this.cd.markForCheck();
			});
	}

	override ngOnChanges(data: any): void {
		if (!this.isServerSidePagingEnable || !this.entityId)
			return;

		if (data?.isExportBtnClicked?.currentValue) {
			const payload: IExportDataModel = {
				xrmEntityId: this.entityId,
				entityType: this.entityType,
				menuId: this.menuId,
				fileType: magicNumber.one
			};

			this.gridService.exportData(payload, this.exportFileName);
		}

		setTimeout(() => {
			this.rebind();
		}, magicNumber.five);
	}

	// eslint-disable-next-line max-lines-per-function
	public override rebind(): void {

		if (!this.apiAddress || !this.isServerSidePagingEnable || !this.entityId)
			return;

		if (this.isReloadGridData) {
			this.reloadGrid();
			return;
		}

		if (this.state.skip && JSON.stringify(this.lastTabData) != JSON.stringify(this.getTabData())) {
			this.skip = this.numberZero;
		}

		this.state.take = this.state.take ?? this.lastPageSize;
		this.lastTabData = this.getTabData();

		const startIndex = Number(this.state.skip) / Number(this.state.take),
			newPayload = this.getPayload(startIndex);

		if (isNaN(startIndex) || this.isDuplicateRequest(newPayload))
			return;

		if (this.lastPayload) {
			if (JSON.stringify(this.lastPayload.advanceFilter) != JSON.stringify(newPayload.advanceFilter)) {
				this.skip = this.numberZero;
				newPayload.startIndex = this.numberZero;

			}
			else if (this.lastPayload.smartSearchText != newPayload.smartSearchText) {
				this.skip = this.numberZero;
				newPayload.startIndex = this.numberZero;
			}
		}

		this.lastPayload = newPayload;


		this.lastPageSize = this.state.take;
		this.gridService.query(this.apiAddress, newPayload);
	}

	public override ngOnDestroy(): void {
		if (!this.isServerSidePagingEnable)
			return;

		this.apiAddress = '';
		this.lastPayload = undefined;
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		super.ngOnDestroy();
	}

	private isDuplicateRequest(newObj: any): boolean {
		return JSON.stringify(this.lastPayload) == JSON.stringify(newObj);
	}

	public resetpagingData(): void {
		this.state.take = magicNumber.ten;
		this.state.skip = magicNumber.zero;
		this.rebind();
	}

	public reloadGrid() {
		if (this.apiAddress == '')
			return;

		this.isReloadGridData = false;
		this.gridService.query(this.apiAddress, this.lastPayload);
		this.gridConfiguration.refreshGrid(false);
	}

	private getPayload(startIndex: any) {
		let columnName: any = null,
			sorting: any = null;


		if (this.state.sort && this.state.sort.length != Number(magicNumber.zero)) {
			const sortingInfo = this.state.sort.filter((x: any) =>
				x.dir);

			if (sortingInfo.length != this.numberZero) {
				sorting = sortingInfo[0].dir;
				columnName = sortingInfo[0].field;
			}
		}

		if (this.advFilterData && Array.isArray(this.advFilterData))
			this.advFilterData = null;

		const obj = {
			xrmEntityId: this.entityId,
			entityType: this.entityType,
			IsPreviousAssignment: this.IsPreviousAssignment,
			userId: this.globalSer.getXUIDValue(),
			pageSize: this.state.take,
			startIndex: startIndex,
			columnName: columnName,
			sortingDirection: sorting,
			tabData: this.lastTabData,
			smartSearchText: this.searchText ?? '',
			advanceFilter: this.advFilterData,
			contractorId: this.contractorId,
			userValues: this.userValues,
			menuId: this.menuId
		};
		return obj;
	}

	private getTabData() {
		const result: any = {},
			values: any = {};
		if (!this.selectedTabInfo)
			return result;

		if (!this.selectedTabInfo.bindingInfo) {

			if (!this.selectedTabInfo.bindingField)
				return result;

			values[this.selectedTabInfo.bindingField.toString()] = this.selectedTabInfo.tabName != 'All'
				? [this.selectedTabInfo.favourableValue]
				: [];

			result.value = values;
			return result;
		}

		if (this.selectedTabInfo.bindingInfo.length == Number(magicNumber.zero))
			return result;

		this.selectedTabInfo.bindingInfo.map((item: any) => {
			values[item.columnName] = item.values;
		});

		result.value = values;
		return result;

	}

};
