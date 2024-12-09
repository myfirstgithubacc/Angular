import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreCandidatePoolComponent } from './core-candidate-pool.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ViewComponent } from './view/view.component';
import { RouteConfigGenerator } from '../../route-config-generator';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreCandidatePoolComponent,
		children: RouteConfigGenerator.getMasterModuleRouteConfig(ListComponent, ViewComponent, AddEditComponent, 'CandidatePool', XrmEntities.CandidatePool)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CandidatePoolRoutingModule { }
