import { NgModule } from '@angular/core';
import { LiViewComponent } from './request/view/view.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { ContractorDetailsComponent } from './request/add-edit/contractor-details/contractor-details.component';
import { StatusBarComponent } from './common/status-bar/status-bar.component';
import { RouterModule } from '@angular/router';

@NgModule({
	declarations: [LiViewComponent, ContractorDetailsComponent, StatusBarComponent],
	exports: [LiViewComponent, ContractorDetailsComponent, StatusBarComponent],
	imports: [SharedModule, RouterModule]
})
export class LiSharedComponentsModule {}
