import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateSelectionReasonRoutingModule } from './candidate-selection-reason-routing.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { CoreCandidateSelectionReasonComponent } from './core-candidate-selection-reason.component';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [
		AddEditComponent,
		ListComponent,
		ViewComponent,
		CoreCandidateSelectionReasonComponent
	],
	imports: [
		CommonModule,
		CandidateSelectionReasonRoutingModule,
		SharedModule
	]
})

export class CandidateSelectionReasonModule {}
