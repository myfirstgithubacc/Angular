import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationLevel2RoutingModule } from './organization-level-2-routing.module';
import { CoreOrganizationLevel2Component } from './core-organization-level-2.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';

@NgModule({
	declarations: [
		CoreOrganizationLevel2Component,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [CommonModule, OrganizationLevel2RoutingModule, SharedModule]
})
export class OrganizationLevel2Module {}
