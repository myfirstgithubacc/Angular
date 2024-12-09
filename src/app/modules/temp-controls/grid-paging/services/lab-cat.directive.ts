import { Subscription } from 'rxjs';
import { Directive } from '@angular/core';
import { DataBindingDirective, GridComponent } from '@progress/kendo-angular-grid';
import { LabCategoryService } from './lab-category.service';

@Directive({
	selector: '[appLabCat]'
})
export class LabCatDirective extends DataBindingDirective {

	private serviceSubscription: Subscription;

	constructor(
		private labCategoryService: LabCategoryService,
		grid: GridComponent
	) {
		super(grid);
	}

	public override ngOnInit(): void {
		this.serviceSubscription = this.labCategoryService.subscribe((result) => {
			this.grid.loading = false;
			this.grid.data = result;
			this.notifyDataChange();
		});

		super.ngOnInit();

		this.rebind();
	}

	public override ngOnDestroy(): void {
		this.serviceSubscription.unsubscribe();
		super.ngOnDestroy();
	}

	public override rebind(): void {
		this.grid.loading = true;

		this.labCategoryService.query(this.state);
	}

}
