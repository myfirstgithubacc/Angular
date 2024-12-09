import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateDeclineReasonRoutingModule } from './candidate-decline-reason-routing.module';
import { CoreCandidateDeclineReasonComponent } from './core-candidate-decline-reason.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { ListComponent } from './list/list.component';


@NgModule({
	declarations: [
		CoreCandidateDeclineReasonComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		CandidateDeclineReasonRoutingModule,
		SharedModule
	]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CandidateDeclineReasonModule { }
