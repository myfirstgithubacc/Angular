import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationLevel3RoutingModule } from './organization-level-3-routing.module';
import { CoreOrganizationLevel3Component } from './core-organization-level-3.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { ViewComponent } from './view/view.component';

@NgModule({
	declarations: [
		CoreOrganizationLevel3Component,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [CommonModule, OrganizationLevel3RoutingModule, SharedModule]
})
export class OrganizationLevel3Module {}
