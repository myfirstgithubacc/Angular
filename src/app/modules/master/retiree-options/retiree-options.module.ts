import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { RetireeOptionsRoutingModule } from './retiree-options-routing.module';
import { ViewComponent } from './view/view.component';
import { CoreRetireeOptionsComponent } from './core-retiree-options.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from '../retiree-options/list/list.component';


@NgModule({
	declarations: [
		CoreRetireeOptionsComponent,
		AddEditComponent,
		ViewComponent,
		ListComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		RetireeOptionsRoutingModule
	]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RetireeOptionsModule { }
