import { Component, ChangeDetectionStrategy } from '@angular/core';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';

@Component({selector: 'app-grid-paging',
	templateUrl: './grid-paging.component.html',
	styleUrls: ['./grid-paging.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridPagingComponent {

	public columnOptions: any = [];


	constructor(private gridService:GridViewService) {

	}

	private getColumnData() {
		this.gridService.getColumnOption(XrmEntities.LaborCategory).subscribe((res: any) => {
			if (res.Succeeded) {
				this.columnOptions = res.Data.map((e: any) => {
					e.fieldName = e.ColumnName;
					e.columnHeader = e.ColumnHeader;
					e.visibleByDefault = e.SelectedByDefault;
					return e;
				});
			}
		});
	}

}
