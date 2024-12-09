import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationLevel4RoutingModule } from './organization-level-4-routing.module';
import { CoreOrganizationLevel4Component } from './core-organization-level-4.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { ViewComponent } from './view/view.component';

@NgModule({
	declarations: [
		CoreOrganizationLevel4Component,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [CommonModule, OrganizationLevel4RoutingModule, SharedModule]
})
export class OrganizationLevel4Module {}
