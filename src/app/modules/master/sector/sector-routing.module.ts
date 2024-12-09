import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreSectorComponent } from './core-sector.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ViewComponent } from './view/view.component';
import { RouteConfigGenerator } from '../../route-config-generator';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreSectorComponent,
		children: RouteConfigGenerator.getMasterModuleRouteConfig(ListComponent, ViewComponent, AddEditComponent, 'Sector', XrmEntities.Sector)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SectorRoutingModule { }
