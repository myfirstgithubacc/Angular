import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationRoutingModule } from './location-routing.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { CoreLocationComponent } from './core-location.component';
import { BackgroundChecksComponent } from './add-edit/background-checks/background-checks.component';
import { BasicDetailsComponent } from './add-edit/basic-details/basic-details.component';
import { BenefitAdderConfigurationsComponent } from './add-edit/benefit-adder-configurations/benefit-adder-configurations.component';
import { ConfigureMspProcessActivityComponent } from './add-edit/configure-msp-process-activity/configure-msp-process-activity.component';
import { LocationOfficerComponent } from './add-edit/location-officer/location-officer.component';
import { RequisitionConfigurationsComponent } from './add-edit/requisition-configurations/requisition-configurations.component';
import { TimeAndExpenseConfigurationsComponent } from './add-edit/time-and-expense-configurations/time-and-expense-configurations.component';
import { XrmTimeClockComponent } from './add-edit/xrm-time-clock/xrm-time-clock.component';


@NgModule({
	declarations: [
		CoreLocationComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent,
		BackgroundChecksComponent,
		BasicDetailsComponent,
		BenefitAdderConfigurationsComponent,
		ConfigureMspProcessActivityComponent,
		LocationOfficerComponent,
		RequisitionConfigurationsComponent,
		TimeAndExpenseConfigurationsComponent,
		XrmTimeClockComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		LocationRoutingModule
	]
})
export class LocationModule { }
