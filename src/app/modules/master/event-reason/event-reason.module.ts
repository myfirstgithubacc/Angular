import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventReasonRoutingModule } from './event-reason-routing.module';
import { CoreEventReasonComponent } from './core-event-reason.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';


@NgModule({
	declarations: [
		CoreEventReasonComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		EventReasonRoutingModule,
		SharedModule
	]
})
export class EventReasonModule { }
