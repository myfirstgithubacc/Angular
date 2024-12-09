import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoprocessConfigurationComponent } from './autoprocess-configuration.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { AutoprocessConfigurationRoutingModule } from './autoprocess-configuration-routing.module';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [
		AutoprocessConfigurationComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		AutoprocessConfigurationRoutingModule,
		SharedModule
	]
})
export class AutoprocessConfigurationModule { }
