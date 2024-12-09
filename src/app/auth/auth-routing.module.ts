import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreAuthComponent } from './core-auth.component';
import { LoginComponent } from './login/login.component';
import { TestComponent } from './test/test.component';
import { ForgotUserIdComponent } from './forgot-user-id/forgot-user-id.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { UserActivationComponent } from './user_activation/user_activation.component';
import { SetNewPasswordComponent } from './set-new-password/set-new-password.component';

const routes: Routes = [
	{
		path: '',
		component: CoreAuthComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				title: 'Login',
				redirectTo: 'login'
			},
			{
				path: 'login',
				title: 'Login',
				component: LoginComponent
			},
			{
				path: 'forget-user-id',
				title: 'ForgotUserID',
				component: ForgotUserIdComponent
			},
			{
				path: 'forgot-password',
				title: 'ForgotPassword',
				component: ForgotPasswordComponent
			},
			{
				path: 'set-new-password/:uid',
				title: 'SetNewPassword',
				component: SetNewPasswordComponent
			},
			{
				path: 'user-activation/:ukey',
				title: 'UserActivation',
				component: UserActivationComponent
			},
			{
				title: 'test',
				component: TestComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AuthRoutingModule { }
