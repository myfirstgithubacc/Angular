import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from 'src/app/shared/shared.module';
import { BusinessClassificationRoutingModule } from './business-classification-routing.module';
import {CoreBusinessClassificationComponent} from './core-business-classification.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { ListComponent } from './list/list.component';


@NgModule({
	declarations: [
		CoreBusinessClassificationComponent,
		AddEditComponent,
		ViewComponent,
		ListComponent
	],
	imports: [
		CommonModule,
		BusinessClassificationRoutingModule,
		SharedModule
	]
})
export class BusinessClassificationModule { }
