import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractorDetailsRoutingModule } from './contractor-details-routing.module';
import { SharedModule } from '@xrm-shared/shared.module';
import { ContractorListComponent } from './contractor-list/contractor-list.component';
import { ContractorAddEditComponent } from './contractor-add-edit/contractor-add-edit.component';
import { ContractorViewComponent } from './contractor-view/contractor-view.component';
import { TimeExpenseListComponent } from './time-expense/list/list.component';
import { EventsModule } from '../event/events.module';


@NgModule({
	declarations: [
		ContractorListComponent,
		ContractorAddEditComponent,
		ContractorViewComponent,
		TimeExpenseListComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		ContractorDetailsRoutingModule,
		EventsModule
	]
})
export class ContractorDetailsModule { }
