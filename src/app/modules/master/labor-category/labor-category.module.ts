import { CommonModule, DatePipe } from '@angular/common';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreLaborCategoryComponent } from './core-labor-category.component';
import { LaborCategoryRoutingModule } from './labor-category-routing.module';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '@xrm-shared/shared.module';
import { ViewComponent } from './view/view.component';

@NgModule({
	declarations: [
		CoreLaborCategoryComponent,
		AddEditComponent,
		ViewComponent,
		ListComponent
	],
	imports: [CommonModule, LaborCategoryRoutingModule, SharedModule],
	providers: [ViewComponent, DatePipe]
})

export class LaborCategoryModule { }
