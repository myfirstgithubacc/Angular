import { AddEditComponent } from './add-edit/add-edit.component';
import { CommonModule } from '@angular/common';
import { CoreJobCategoryComponent } from './core-job-category.component';
import { JobCategoryRoutingModule } from './job-category-routing.module';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '@xrm-shared/shared.module';
import { ViewComponent } from './view/view.component';

@NgModule({
	declarations: [CoreJobCategoryComponent, ListComponent, ViewComponent, AddEditComponent],
	imports: [CommonModule, JobCategoryRoutingModule, SharedModule]
})

export class JobCategoryModule {}
