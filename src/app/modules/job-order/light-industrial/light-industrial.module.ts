import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LightIndustrialRoutingModule } from './light-industrial-routing.module';
import { CoreLightIndustrialComponent } from './core-light-industrial.component';
import { AddEditComponent } from './request/add-edit/add-edit.component';
import { ListComponent } from './request/list/list.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { ReviewRequestComponent } from './request/review-request/review-request.component';
import { BroadcastComponent } from './request/broadcast/broadcast.component';
import { FillARequestComponent } from './request/fill-a-request/fill-a-request.component';
import { PopupPositionViewComponent } from './request/fill-a-request/popup-position-view/popup-position-view.component';
import { PopupAddEditComponent } from './request/fill-a-request/popup-add-edit/popup-add-edit.component';
import { LiSharedComponentsModule } from './LiShared-components.module';

@NgModule({
	declarations: [
		CoreLightIndustrialComponent,
		AddEditComponent,
		ListComponent,
		ReviewRequestComponent,
		BroadcastComponent,
		FillARequestComponent,
		PopupPositionViewComponent,
		PopupAddEditComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		LiSharedComponentsModule,
		LightIndustrialRoutingModule
	]
})
export class LightIndustrialModule { }
