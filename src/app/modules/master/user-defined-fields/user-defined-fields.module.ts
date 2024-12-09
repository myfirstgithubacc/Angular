import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDefinedFieldsRoutingModule } from './user-defined-fields-routing.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { CoreUserDefinedFieldsComponent } from './core-user-defined-fields.component';


@NgModule({
	declarations: [
		CoreUserDefinedFieldsComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		UserDefinedFieldsRoutingModule,
		SharedModule
	],
	providers: [ViewComponent]
})
export class UserDefinedFieldsModule { }
