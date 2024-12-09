import { AddEditComponent } from './add-edit/add-edit.component';
import { CommonModule } from '@angular/common';
import { CoreRequisitionLibraryComponent } from './core-requisition-library.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { RequisitionLibraryRoutingModule } from './requisition-library-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { ViewComponent } from './view/view.component';


@NgModule({
	declarations: [
		ListComponent,
		AddEditComponent,
		ViewComponent,
		CoreRequisitionLibraryComponent
	],
	imports: [
		CommonModule,
		RequisitionLibraryRoutingModule,
		SharedModule
	]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RequisitionLibraryModule {}
