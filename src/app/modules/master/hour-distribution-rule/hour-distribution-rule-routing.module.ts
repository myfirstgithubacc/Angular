import { NgModule } from '@angular/core';
import { CoreHourDistributionRuleModuleComponent } from './core-hour-distribution-rule.component';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { RouteConfigGenerator } from '../../route-config-generator';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreHourDistributionRuleModuleComponent,
		children: RouteConfigGenerator.getMasterModuleRouteConfigWithCanDeactivate(ListComponent, ViewComponent, AddEditComponent, 'HourDistributionRule', 'HourDistributionRule', XrmEntities.HourDistributionRule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class HourDistributionRuleRoutingModule { }
