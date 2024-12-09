import { AddEditComponent } from './add-edit/add-edit.component';
import { CommonModule } from '@angular/common';
import { CoreReasonForRequestComponent } from './core-reason-for-request.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ReasonForRequestRoutingModule } from './reason-for-request-routing.module';
import { SharedModule } from '@xrm-shared/shared.module';
import { ViewComponent } from './view/view.component';

@NgModule({
	declarations: [
		CoreReasonForRequestComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		ReasonForRequestRoutingModule,
		SharedModule
	]
})
export class ReasonForRequestModule {}
