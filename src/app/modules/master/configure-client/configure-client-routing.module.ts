import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditComponent } from './edit/edit.component';
import { CoreConfigureClientComponent } from './core-configure-client.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreConfigureClientComponent,
		children: [
			{ path: '',
				component: EditComponent,
				title: 'ConfigureClient',
				data: { title: 'ConfigureClient', breadcrumb: '', entityId: XrmEntities.ConfigureClient },
				canActivate:	[RouteGuard]
			}

		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ConfigureClientRoutingModule { }
