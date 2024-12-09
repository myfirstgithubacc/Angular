import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigureClientRoutingModule } from './configure-client-routing.module';
import { CoreConfigureClientComponent } from './core-configure-client.component';

import { SharedModule } from 'src/app/shared/shared.module';
import { EditComponent } from './edit/edit.component';
import { BasicDetailsComponent } from './edit/basic-details/basic-details.component';
import { SystemMessagesComponent } from './edit/system-messages/system-messages.component';
import { SecurityClearanceComponent } from './edit/security-clearance/security-clearance.component';
import { LoginMethodComponent } from './edit/login-method/login-method.component';
import { PasswordPolicyComponent } from './edit/password-policy/password-policy.component';
import { StaffingAgencyComponent } from './edit/staffing-agency/staffing-agency.component';
import { LocationOfficerComponent } from './edit/location-officer/location-officer.component';


@NgModule({
  declarations: [
    CoreConfigureClientComponent,
    EditComponent,
    BasicDetailsComponent,
    SystemMessagesComponent,
    SecurityClearanceComponent,
    LoginMethodComponent,
    PasswordPolicyComponent,
    StaffingAgencyComponent,
    LocationOfficerComponent,
  ],
  imports: [
    CommonModule,
    ConfigureClientRoutingModule,
    SharedModule
  ]
})
export class ConfigureClientModule { }
