import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffingAgencyRoutingModule } from './staffing-agency-routing.module';
import { CoreStaffingAgencyComponent } from './core-staffing-agency.component';
import { ViewComponent } from './view/view.component';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { StaffingAgencyMarkupModule } from '@xrm-master/staffing-agency-markup/staffing-agency-markup.module';
import { UserModule } from '@xrm-master/user/user.module';


@NgModule({
	declarations: [
		CoreStaffingAgencyComponent,
		ViewComponent,
		ListComponent,
		AddEditComponent


	],
	imports: [
		CommonModule,
		StaffingAgencyRoutingModule,
		SharedModule,
		StaffingAgencyMarkupModule,
		UserModule
	],
	exports: [
		ListComponent,
		AddEditComponent
	]
})
export class StaffingAgencyModule { }
