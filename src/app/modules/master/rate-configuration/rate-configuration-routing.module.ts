import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreRateConfigurationComponent } from './core-rate-configuration.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreRateConfigurationComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'add-edit'
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'RateCalculator',
				data: { title: 'RateCalculator', breadcrumb: { skip: true }, entityId: XrmEntities.RateCalculator }
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'RateCalculator',
				data: { title: 'RateCalculator', breadcrumb: 'Edit', entityId: XrmEntities.RateCalculator }
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RateCalculatorRoutingModule { }
