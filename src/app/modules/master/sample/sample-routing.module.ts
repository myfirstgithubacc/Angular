import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreSampleComponent } from './core-sample.component';
import { SampleAddEditComponent } from './sample-add-edit/sample-add-edit.component';
import { SampleListComponent } from './sample-list/sample-list.component';
import { SampleViewComponent } from './sample-view/sample-view.component';

const routes: Routes = [
  {
    path: '',
    component: CoreSampleComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list'
      },
      {
        path: 'view',
        component: SampleViewComponent,
        title: 'Labor Category View',
        data: { title: 'View', breadcrumb: 'View' },
      },
      {
        path: 'add-edit',
        component: SampleAddEditComponent,
        title: 'Labor Category View',
        data: { title: 'View', breadcrumb: 'aaa' },
      },
      {
        path: 'list',
        component: SampleListComponent,
        title: 'Sample list',
        data: { title: 'list', breadcrumb: { skip: true } },
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SampleRoutingModule { }
