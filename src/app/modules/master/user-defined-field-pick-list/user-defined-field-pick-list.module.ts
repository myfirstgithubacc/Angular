import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDefinedFieldPickListRoutingModule } from './user-defined-field-pick-list-routing.module';
import { CoreUserDefinedFieldPickListComponent } from './core-user-defined-field-pick-list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [
		AddEditComponent,
		ListComponent,
		CoreUserDefinedFieldPickListComponent
	],
	imports: [
		CommonModule,
		UserDefinedFieldPickListRoutingModule,
		SharedModule
	]
})
export class UserDefinedFieldPickListModule { }
