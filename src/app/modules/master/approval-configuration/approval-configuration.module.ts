import { AddEditComponent } from './add-edit/add-edit.component';
import { ApprovalConfigState } from '@xrm-core/store/states/approval-config.state';
import { ApprovalConfigurationRoutingModule } from './approval-configuration-routing.module';
import { CommonModule } from '@angular/common';
import { CoreApprovalConfigurationComponent } from './core-approval-configuration.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewComponent } from './view/view.component';


@NgModule({
	declarations: [
		AddEditComponent,
		ViewComponent,
		ListComponent,
		CoreApprovalConfigurationComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		ApprovalConfigurationRoutingModule,
		NgxsModule.forFeature([ApprovalConfigState])

	]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ApprovalConfigurationModule { }
