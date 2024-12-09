import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractorRoutingModule } from './contractor-routing.module';
import { CoreAssignmentDetailsComponent } from './assignment-details/core-assignment-details.component';
import { CoreContractorComponent } from './core-contractor.component';
import { CoreContractorDetailsComponent } from './contractor-details/core-contractor-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@xrm-shared/shared.module';

@NgModule({
	declarations: [
		CoreContractorComponent,
		CoreAssignmentDetailsComponent,
		CoreContractorDetailsComponent
	],
	imports: [CommonModule, ContractorRoutingModule, ReactiveFormsModule, SharedModule]
})
export class ContractorModule {}
