import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestCancelReasonRoutingModule } from './request-cancel-reason-routing.module';
import { CoreRequestCancelReasonComponent } from './core-request-cancel-reason.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [
		CoreRequestCancelReasonComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		RequestCancelReasonRoutingModule,
		SharedModule
	]
})
export class RequestCancelReasonModule { }
