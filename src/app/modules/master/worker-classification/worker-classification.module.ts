import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';
import { WorkerClassificationRoutingModule } from './worker-classification-routing.module';
import { WorkerClassificationComponent } from './core-worker-classification.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { AddEditComponent } from './add-edit/add-edit.component';


@NgModule({
	declarations: [WorkerClassificationComponent, ListComponent, ViewComponent, AddEditComponent],
	imports: [CommonModule, WorkerClassificationRoutingModule, SharedModule]
})
export class WorkerClassificationModule { }

