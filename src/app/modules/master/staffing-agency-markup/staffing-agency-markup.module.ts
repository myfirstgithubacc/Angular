import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffingAgencyMarkupRoutingModule } from './staffing-agency-markup-routing.module';
import { CoreStaffingAgencyMarkupComponent } from './core-staffing-agency-markup.component';
import { ViewComponent } from './view/view.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MarkupGridComponent } from './markup-grid/markup-grid.component';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { MarkupState } from '@xrm-core/store/MarkupState/markup.state';


@NgModule({
	declarations: [
		ViewComponent,
		AddEditComponent,
		CoreStaffingAgencyMarkupComponent,
		MarkupGridComponent
	],
	imports: [
		CommonModule,
		StaffingAgencyMarkupRoutingModule,
		SharedModule,
		FormsModule,
		NgxsModule.forRoot([MarkupState]),
		NgxsReduxDevtoolsPluginModule.forRoot()
	],
	exports: [
		AddEditComponent,
		ViewComponent
	],
	providers: []

})
export class StaffingAgencyMarkupModule { }
