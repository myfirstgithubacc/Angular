import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentConfigurationRoutingModule } from './document-configuration-routing.module';
import { CoreDocumentConfigurationComponent } from './core-document-configuration.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from '@xrm-shared/shared.module';

@NgModule({
	declarations: [
		CoreDocumentConfigurationComponent,
		AddEditComponent,
		ViewComponent,
		ListComponent
	],
	imports: [
		CommonModule,
		DocumentConfigurationRoutingModule,
		SharedModule
	]
})
export class DocumentConfigurationModule { }
