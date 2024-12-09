import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { CoreManageCountryComponent } from './core-manage-country.component';
import { ManageCountryRoutingModule } from './manage-country-routing.module';

@NgModule({
	declarations: [
		CoreManageCountryComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [CommonModule, ManageCountryRoutingModule, SharedModule]
})
export class ManageCountryModule {}
