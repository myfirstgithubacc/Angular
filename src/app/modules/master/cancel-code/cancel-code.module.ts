import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CancelCodeRoutingModule } from './cancel-code-routing.module';
import { CoreCancelCodeComponent } from './core-cancel-code.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';


@NgModule({
  declarations: [
    CoreCancelCodeComponent,
    AddEditComponent,
    ListComponent,
    ViewComponent
  ],
  imports: [
    CommonModule,
    CancelCodeRoutingModule
  ]
})
export class CancelCodeModule { }
