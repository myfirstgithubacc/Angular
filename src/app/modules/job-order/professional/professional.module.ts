import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalRoutingModule } from './professional-routing.module';
import { SharedModule } from '@xrm-shared/shared.module';
import { ListComponent } from './request/list/list.component';
import { CoreProfessionalComponent } from './core-professional.component';
import { AddEditComponent } from './request/add-edit/add-edit.component';
import { JobDetailsComponent } from './request/add-edit/job-details/job-details.component';
import { AssignmentDetailsComponent } from './request/add-edit/assignment-details/assignment-details.component';
import { FinancialDetailsComponent } from './request/add-edit/financial-details/financial-details.component';
import { ApproverOtherDetailsComponent } from './request/add-edit/approver-other-details/approver-other-details.component';
import { PreviewComponent } from './request/add-edit/preview/preview.component';
import { BroadcastComponent } from './request/broadcast/broadcast.component';
import { ReviewComponent } from './request/review/review.component';
import { SubmittalDetailsComponent } from './request/submittal-details/submittal-details.component';


@NgModule({
	declarations: [
		CoreProfessionalComponent,
		ListComponent,
		AddEditComponent,
		JobDetailsComponent,
		AssignmentDetailsComponent,
		FinancialDetailsComponent,
		ApproverOtherDetailsComponent,
		PreviewComponent,
		BroadcastComponent,
		ReviewComponent,
		SubmittalDetailsComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		ProfessionalRoutingModule
	]
})
export class ProfessionalModule { }
