import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { CoreUserDefinedFieldPickListComponent } from './core-user-defined-field-pick-list.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreUserDefinedFieldPickListComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'PickList',
				data: { title: 'PickList', breadcrumb: { skip: true }, entityId: XrmEntities.UserDefinedFieldPicklistType }
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'PickList',
				data: { title: 'PickList', breadcrumb: 'Add', entityId: XrmEntities.UserDefinedFieldPicklistType }
			},
			{
				path: 'add-edit/:ukey',
				component: AddEditComponent,
				title: 'PickList',
				data: { title: 'PickList', breadcrumb: 'Edit', entityId: XrmEntities.UserDefinedFieldPicklistType }
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserDefinedFieldPickListRoutingModule { }
