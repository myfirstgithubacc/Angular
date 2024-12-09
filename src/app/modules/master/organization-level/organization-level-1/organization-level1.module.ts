import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationLevel1RoutingModule } from './organization-level1-routing.module';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { CoreOrganizationLevel1Component } from './core-organization-level1.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { UserDefineFieldsModule } from '../common-user-define-fields/user-define-fields-module/user-define-fields-module';


@NgModule({
	declarations: [
		ListComponent,
		AddEditComponent,
		ViewComponent,
		CoreOrganizationLevel1Component
	],
	imports: [
		CommonModule,
		OrganizationLevel1RoutingModule,
		SharedModule,
		UserDefineFieldsModule
	]
})
export class OrganizationLevel1Module {

}
