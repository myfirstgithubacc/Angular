import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonUserDefineFieldsComponent } from '../common-user-define-fields.component';
import { SharedModule } from '@xrm-shared/shared.module';



@NgModule({
  declarations: [CommonUserDefineFieldsComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [CommonUserDefineFieldsComponent]
})
export class UserDefineFieldsModule { }
