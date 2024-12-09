import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveformsRoutingModule } from './reactiveforms-routing.module';
import { CoreReactiveformsComponent } from './core-reactiveforms.component';
import { FormsComponent } from './forms/forms.component';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
  declarations: [
    CoreReactiveformsComponent,
    FormsComponent
  ],
  imports: [
    CommonModule,
    ReactiveformsRoutingModule,
    SharedModule
  ]
})
export class ReactiveformsModule { }
