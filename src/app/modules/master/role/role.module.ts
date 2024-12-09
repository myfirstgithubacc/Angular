import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleRoutingModule } from './role-routing.module';
import { CoreRoleComponent } from './core-role.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { SharedModule } from '@xrm-shared/shared.module';



@NgModule({
	declarations: [
		CoreRoleComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		RoleRoutingModule,
		SharedModule
	]
})
export class RoleModule { }
