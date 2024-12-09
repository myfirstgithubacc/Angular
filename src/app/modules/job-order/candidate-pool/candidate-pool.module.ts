import { AddEditComponent } from './add-edit/add-edit.component';
import { CandidatePoolRoutingModule } from './candidate-pool-routing.module';
import { CommonModule } from '@angular/common';
import { CoreCandidatePoolComponent } from './core-candidate-pool.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '@xrm-shared/shared.module';
import { ViewComponent } from './view/view.component';


@NgModule({
	declarations: [
		CoreCandidatePoolComponent,
		ListComponent,
		ViewComponent,
		AddEditComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		CandidatePoolRoutingModule
	]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CandidatePoolModule { }
