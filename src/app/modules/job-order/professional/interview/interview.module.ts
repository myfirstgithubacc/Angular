import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';
import { InterviewRoutingModule } from './interview-routing.module';
import { CoreInterviewComponent } from './core-interview.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';


@NgModule({
	declarations: [
		CoreInterviewComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		InterviewRoutingModule
	]
})
export class InterviewModule { }
