import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsRoutingModule } from './events-routing.module';
import { EventsListComponent } from './list/list.component';
import { EventsViewComponent } from './view/view.component';
import { EventsAddEditComponent } from './add-edit/add-edit.component';
import { CoreEventsComponent } from './core-events.component';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [
		EventsListComponent,
		EventsViewComponent,
		EventsAddEditComponent,
		CoreEventsComponent
	],
	imports: [
		CommonModule,
		EventsRoutingModule,
		SharedModule
	],
	exports: [EventsListComponent]
})
export class EventsModule { }
