import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddComponent } from "./add/add.component";
import { CoreChargeApproverComponent } from "./core-charge-approver.component";
import { ListComponent } from "./list/list.component";
import { ViewComponent } from "./view/view.component";


const routes : Routes = [
    {
        path: '',
        component: CoreChargeApproverComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'list'
          },
          {
            path: 'list',
            component: ListComponent,
            title: 'charge approvers',
            data: { title: 'List', breadcrumb: { skip: true } },
          },
          {
            path: 'view',
            component: ViewComponent,
            title: 'charge approver',
            data: { title: 'View', breadcrumb: 'View' },
          },
          {
            path : 'add',
            component : AddComponent,
            title : 'Add Charge Approver',
            data: {title : 'Add Approver', breadcrumb : 'Add'},
          }
        ],
      },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class ChargeApproverRountingModule{}