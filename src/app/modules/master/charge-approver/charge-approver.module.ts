import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreChargeApproverComponent } from './core-charge-approver.component';
import { ChargeApproverRountingModule } from './charge-approver-rounting.module';
import { SharedModule } from '@xrm-shared/shared.module';
import { ListComponent } from './list/list.component';
import { ViewComponent } from "./view/view.component";
import { AddComponent } from './add/add.component';



@NgModule({
  declarations: [
    CoreChargeApproverComponent,
    ListComponent,
    ViewComponent,
    AddComponent
  ],
  imports: [
    CommonModule,
    ChargeApproverRountingModule,
    SharedModule

  ]
})
export class ChargeApproverModule { }
