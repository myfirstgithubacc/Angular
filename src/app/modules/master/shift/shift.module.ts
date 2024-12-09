import { AddEditComponent } from './add-edit/add-edit.component';
import { CommonModule } from '@angular/common';
import { CoreShiftComponent } from './core-shift.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '@xrm-shared/shared.module';
import { ShiftRoutingModule } from './shift-routing.module';
import { ViewComponent } from './view/view.component';


@NgModule({
	declarations: [
		CoreShiftComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [CommonModule, ShiftRoutingModule, SharedModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ShiftModule {}
