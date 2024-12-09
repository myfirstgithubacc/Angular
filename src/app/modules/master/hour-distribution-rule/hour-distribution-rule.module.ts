import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreHourDistributionRuleModuleComponent } from './core-hour-distribution-rule.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { NgxsModule } from '@ngxs/store';
import { HourDistributionRuleRoutingModule } from './hour-distribution-rule-routing.module';
import { HourDistributionRuleState } from '@xrm-core/store/states/hour-distribution-rule.state';

@NgModule({
	declarations: [
		CoreHourDistributionRuleModuleComponent,
		AddEditComponent,
		ViewComponent,
		ListComponent
	],
	imports: [
		CommonModule,
		HourDistributionRuleRoutingModule,
		SharedModule,
		NgxsModule.forFeature([HourDistributionRuleState])
	]
})
export class HourDistributionRuleModule { }
