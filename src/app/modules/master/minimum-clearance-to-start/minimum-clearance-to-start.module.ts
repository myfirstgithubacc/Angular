import { AddEditComponent } from './add-edit/add-edit.component';
import { CommonModule } from '@angular/common';
import { CoreMinimumClearanceToStartComponent } from './core-minimum-clearance-to-start.component';
import { ListComponent } from './list/list.component';
import { MinimumClearanceToStartRoutingModule } from './minimum-clearance-to-start-routing.module';
import { NgModule } from '@angular/core';
import { SharedModule } from '@xrm-shared/shared.module';
import { ViewComponent } from './view/view.component';
@NgModule({
	declarations: [
		CoreMinimumClearanceToStartComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		MinimumClearanceToStartRoutingModule,
		SharedModule
	]
})
export class MinimumClearanceToStartModule {}
