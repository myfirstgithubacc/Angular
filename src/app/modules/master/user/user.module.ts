import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { CoreUserComponent } from './core-user.component';
import { UserRoutingModule } from './user-routing.module';
import { SideMenuComponent } from './add-edit/side-menu/side-menu.component';
import { NgxsModule } from '@ngxs/store';
import { UserState } from '@xrm-core/store/states/user.state';
import { SectorComponent } from './add-edit/sector/sector.component';
import { BasicdetailsComponent } from './add-edit/basicdetails/basicdetails.component';
// import { PreferenceComponent } from './add-edit/preference/preference.component';
import { AlternateContactDetailsComponent } from './add-edit/alternate-contact-details/alternate-contact-details.component';
import { FieldLevelAuthComponent } from '@xrm-master/FieldLevelAuth/FieldLevelAuth.component';
import { ChangePasswordComponent } from './change-password/change-password.component';


@NgModule({
  declarations: [
    CoreUserComponent,
    AddEditComponent,
    ChangePasswordComponent,
    SideMenuComponent,
    // PreferenceComponent,
    ListComponent,
    ViewComponent,
    SideMenuComponent,
    SectorComponent,
    BasicdetailsComponent,
    AlternateContactDetailsComponent,
    FieldLevelAuthComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
    NgxsModule.forFeature([UserState]),
  ],
  exports: [
    ListComponent,
    ViewComponent,
   ]
})
export class UserModule { }
