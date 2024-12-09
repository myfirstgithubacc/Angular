import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { LaborCategoryService } from 'src/app/services/masters/labor-category.service';

@Component({selector: 'app-paging',
	templateUrl: './paging.component.html',
	styleUrls: ['./paging.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagingComponent {

	public listLabCat: any;
	public listLabCatCopy: any;
	public columnOptions = [];
	public actionSet: any;
	public selectedTabName: string = '';

	htmlTootipValue = `<ul>
  <li><strong> Single PO :</strong> Select this option if only one purchase order
    is issued by the Client for all CLPs in this Sector, i.e. a blanket PO.
  </li>
  <li><strong> Multiple PO :</strong> Select this option if the Client will be
  issuing different purchase orders for each CLP or groups of CLPs.</li>
</ul>`;

	public tabOptions = {
		bindingField: 'Disabled',
		tabList: [
			{
				tabName: 'Active',
				isTooltipVisible: true,
				tooltipText: 'SowMiscChargeApproverId',
				favourableValue: false,
				selected: true
			},
			{
				tabName: 'Inactive',
				isTooltipVisible: true,
				tooltipText: 'OrgLevel',
				tooltipLocalizedParam: [{ Value: '', IsLocalizeKey: false}],
				favourableValue: true
			},
			{
				tabName: 'All',
				isTooltipVisible: true,
				tooltipText: this.htmlTootipValue,
				isHtmlContent: true,
				favourableValue: 'All'
			}
		]
	};
	pagingForm: FormGroup;


	entityId = XrmEntities.LaborCategory;
	pageSize = magicNumber.ten;
	isServerSidePagingEnable: boolean = false;
	apiAddress: string = 'LaborCategory/GetAllPagination';
	searchText: any;
	appliedAdvFilters: any;

	constructor(
    private gridConfiguration: GridConfiguration,
    public gridService: GridViewService,
    private laborCategoryService: LaborCategoryService
	) { }

	ngOnInit(): void {
		if (!this.isServerSidePagingEnable) {
			this.laborCategoryService.getLaborCategory().subscribe((res: any) => {
				this.listLabCatCopy = this.listLabCat = res.Data;
			});
		}
		this.getActionSet();
		this.getColumnData();
	}

	public selectedTab($event: any) {
		this.selectedTabName = $event;
	}

	private getColumnData() {
		this.gridService.getColumnOption(this.entityId).subscribe((res: any) => {
			if (!res.Succeeded)
				return;
			this.columnOptions = res.Data.map((e: any) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		});
	}

	onView = () => { };

	onEdit = () => { };

	onActivateDeactivateAction = () => { };

	onFilter = (data: any) => {
		if(this.isServerSidePagingEnable)
			this.appliedAdvFilters = data;
		else
			this.listLabCatCopy = data;
	};

	onSearch = (data: any) => {
		if (this.isServerSidePagingEnable)
			this.searchText = data;
		else
			this.listLabCatCopy = data;
	};

	navigateToAdd = () => { };

	public getActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
				)
			}
		];
	}

}
