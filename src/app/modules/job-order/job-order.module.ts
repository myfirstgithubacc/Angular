import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobOrderRoutingModule } from './job-order-routing.module';
import { CoreJobOrderComponent } from './core-job-order.component';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [CoreJobOrderComponent],
	imports: [CommonModule, JobOrderRoutingModule, SharedModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class JobOrderModule { }
