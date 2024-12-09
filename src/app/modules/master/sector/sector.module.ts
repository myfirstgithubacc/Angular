import { AddEditComponent } from './add-edit/add-edit.component';
import { AssignmentExtensionAndOtherConfigurationsComponent } from './add-edit/assignment-extension-and-other-configurations/assignment-extension-and-other-configurations.component';
import { BackgroundChecksComponent } from './add-edit/background-checks/background-checks.component';
import { BasicDetailsComponent } from './add-edit/basic-details/basic-details.component';
import { BenefitAddConfigurationsComponent } from './add-edit/benefit-add-configurations/benefit-add-configurations.component';
import { ChargeNumberConfigurationsComponent } from './add-edit/charge-number-configurations/charge-number-configurations.component';
import { CommonModule } from '@angular/common';
import { ConfigureMspProcessActivityComponent } from './add-edit/configure-msp-process-activity/configure-msp-process-activity.component';
import { CoreSectorComponent } from './core-sector.component';
import { EmailApprovalConfigurationsComponent } from './add-edit/email-approval-configurations/email-approval-configurations.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { OrganizationStructureComponent } from './add-edit/organization-structure/organization-structure.component';
import { PerformanceSurveyConfigurationsComponent } from './add-edit/performance-survey-configurations/performance-survey-configurations.component';
import { PricingModelConfigurationsComponent } from './add-edit/pricing-model-configurations/pricing-model-configurations.component';
import { RatesAndFeesConfigurationsComponent } from './add-edit/rates-and-fees-configurations/rates-and-fees-configurations.component';
import { RequisitionConfigurationsComponent } from './add-edit/requisition-configurations/requisition-configurations.component';
import { RfxConfigurationsComponent } from './add-edit/rfx-configurations/rfx-configurations.component';
import { SectorRoutingModule } from './sector-routing.module';
import { SectorState } from '@xrm-core/store/states/sector.state';
import { SharedModule } from '@xrm-shared/shared.module';
import { ShiftConfigurationsComponent } from './add-edit/shift-configurations/shift-configurations.component';
import { SubmittalConfigurationsComponent } from './add-edit/submittal-configurations/submittal-configurations.component';
import { TenureConfigurationsComponent } from './add-edit/tenure-configurations/tenure-configurations.component';
import { TimeAndExpenseConfigurationsComponent } from './add-edit/time-and-expense-configurations/time-and-expense-configurations.component';
import { UserDefinedFieldsComponent } from './add-edit/user-defined-fields/user-defined-fields.component';
import { ViewComponent } from './view/view.component';
import { XrmTimeClockComponent } from './add-edit/xrm-time-clock/xrm-time-clock.component';

@NgModule({
	declarations: [
		CoreSectorComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent,
		BasicDetailsComponent,
		ShiftConfigurationsComponent,
		PricingModelConfigurationsComponent,
		RatesAndFeesConfigurationsComponent,
		OrganizationStructureComponent,
		TimeAndExpenseConfigurationsComponent,
		AssignmentExtensionAndOtherConfigurationsComponent,
		TenureConfigurationsComponent,
		RequisitionConfigurationsComponent,
		SubmittalConfigurationsComponent,
		BenefitAddConfigurationsComponent,
		ConfigureMspProcessActivityComponent,
		PerformanceSurveyConfigurationsComponent,
		RfxConfigurationsComponent,
		ChargeNumberConfigurationsComponent,
		BackgroundChecksComponent,
		XrmTimeClockComponent,
		UserDefinedFieldsComponent,
		EmailApprovalConfigurationsComponent
	],
	imports: [
		CommonModule,
		SectorRoutingModule,
		SharedModule,
		NgxsModule.forFeature([SectorState])
	],
	providers: []
})

export class SectorModule {}
