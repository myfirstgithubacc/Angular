import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackendUploadRoutingModule } from './bulk-data-management-routing.module';
import { CoreBackendUploadComponent } from './core-bulk-data-management.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from "../../../shared/shared.module";


@NgModule({
	declarations: [
		CoreBackendUploadComponent,
		AddEditComponent,
		ListComponent
	],
	imports: [
		CommonModule,
		BackendUploadRoutingModule,
		SharedModule
	]
})
export class BackendUploadModule { }
