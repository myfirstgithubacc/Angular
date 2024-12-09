import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreReactiveformsComponent } from './core-reactiveforms.component';
import { FormsComponent } from './forms/forms.component';

const routes: Routes = [
  {
    path: '',
    component: CoreReactiveformsComponent,
    children:[
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'forms'
      },
      {
        path:'forms',
        component: FormsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReactiveformsRoutingModule { }
