import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { CoreAuthComponent } from './core-auth.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { FooterComponent } from './footer/footer.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestComponent } from './test/test.component';
import { ForgotUserIdComponent } from './forgot-user-id/forgot-user-id.component';
import { UserActivationComponent } from './user_activation/user_activation.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SetNewPasswordComponent } from './set-new-password/set-new-password.component';

@NgModule({
	declarations: [
		CoreAuthComponent,
		HeaderComponent,
		LoginComponent,
		FooterComponent,
		TestComponent,
		ForgotUserIdComponent,
		UserActivationComponent,
		ForgotPasswordComponent,
		SetNewPasswordComponent
	],
	imports: [
		CommonModule,
		AuthRoutingModule,
		SharedModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class AuthModule { }
