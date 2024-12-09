import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreferenceRoutingModule } from './preference-routing.module';
import { CorePreferenceComponent } from './core-preference.component';
import { SharedModule } from '@xrm-shared/shared.module';



@NgModule({
  declarations: [
    CorePreferenceComponent,
    
 ],
  imports: [
    CommonModule,
    PreferenceRoutingModule,
    SharedModule
  ]
})
export class PreferenceModule { }
