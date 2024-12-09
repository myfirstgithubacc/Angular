import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterRoutingModule } from './master-routing.module';
import { CoreMasterComponent } from './core-master.component';
// import { SharedModule } from '@xrm-shared/shared.module';
import { HoverClassDirective } from '@xrm-shared/directives/hover-class.directive';
// import { CoreRateConfigurationComponent } from './rate-configuration/core-rate-configuration.component';


@NgModule({
	declarations: [CoreMasterComponent],
	imports: [CommonModule, MasterRoutingModule]
})
export class MasterModule { }
