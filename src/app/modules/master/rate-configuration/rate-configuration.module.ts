import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';
import { RateCalculatorRoutingModule } from './rate-configuration-routing.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreRateConfigurationComponent } from './core-rate-configuration.component';


@NgModule({
	declarations: [
		AddEditComponent,
		CoreRateConfigurationComponent
	],
	imports: [
		CommonModule,
		RateCalculatorRoutingModule,
		SharedModule
	]
})
export class RateConfigurationModule { }
