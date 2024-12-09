import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewCandidatesRoutingModule } from './review-candidates-routing.module';
import { ListComponent } from './list/list.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { ReviewComponent } from './review-view/review.component';
import { CoreReviewCandidatesComponent } from './core-review-candidates.component';


@NgModule({
	declarations: [
		CoreReviewCandidatesComponent,
		ListComponent,
		ReviewComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		ReviewCandidatesRoutingModule
	]
})
export class ReviewCandidatesModule { }
