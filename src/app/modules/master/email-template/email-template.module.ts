import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailTemplateRoutingModule } from './email-template-routing.module';
import { CoreEmailTemplateComponent } from './core-email-template.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from '@xrm-shared/shared.module';

@NgModule({
	declarations: [
		CoreEmailTemplateComponent,
		AddEditComponent,
		ViewComponent,
		ListComponent
	],
	imports: [CommonModule, EmailTemplateRoutingModule, SharedModule]
})
export class EmailTemplateModule {}
