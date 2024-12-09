import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreSubmittalsComponent } from './core-submittals.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { SubmittalsRoutingModule } from './submittals.routing.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { InterviewRequestComponent } from './interview-request/interview-request.component';
import { CandidateDetailsComponent } from './add-edit/candidate-details/candidate-details.component';
import { PositionDescriptionComponent } from './add-edit/position-description/position-description.component';
import { RateDetailsBillrateComponent } from './add-edit/rate-details-billrate/rate-details-billrate.component';
import { RateDetailsMarkupComponent } from './add-edit/rate-details-markup/rate-details-markup.component';
import { RecruiterDetailsComponent } from './add-edit/recruiter-details/recruiter-details.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { ProcessComponent } from './process/process.component';
import { MassComparison } from './mass-comparison/mass-comparison.component';
import { ReviewComponent } from './review/review.component';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		SubmittalsRoutingModule
	],
	declarations: [
		CoreSubmittalsComponent,
		AddEditComponent, InterviewRequestComponent, WithdrawComponent,
		CandidateDetailsComponent, PositionDescriptionComponent, RateDetailsBillrateComponent,
		RateDetailsMarkupComponent, RecruiterDetailsComponent, ProcessComponent,
		MassComparison, ReviewComponent
	]
})
export class SubmittalsModule { }
