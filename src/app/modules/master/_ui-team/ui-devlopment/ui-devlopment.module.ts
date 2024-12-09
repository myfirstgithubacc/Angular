import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { UiDevlopmentRoutingModule } from './ui-devlopment-routing.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { ListComponent } from './list/list.component';


@NgModule({
  declarations: [
    AddEditComponent,
    ViewComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    UiDevlopmentRoutingModule,
    SharedModule
  ]
})
export class UiDevlopmentModule { }
