import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventConfigurationRoutingModule } from './event-configuration-routing.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { CoreEventConfirgurationComponent } from './core-event-configuration.component';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [
		AddEditComponent,
		ListComponent,
		ViewComponent,
		CoreEventConfirgurationComponent
	],
	imports: [
		CommonModule,
		EventConfigurationRoutingModule,
		SharedModule
	]
})
export class EventConfigurationModule { }
