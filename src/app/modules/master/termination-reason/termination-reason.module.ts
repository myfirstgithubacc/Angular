import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminationReasonRoutingModule } from './termination-reason-routing.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { CoreTerminationReasonComponent } from './core-termination-reason.component';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [
		CoreTerminationReasonComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		TerminationReasonRoutingModule,
		SharedModule
	]
})
export class TerminationReasonModule { }
