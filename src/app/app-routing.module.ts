import { NgModule } from '@angular/core';
import {
	Route,
	RouterModule,
	TitleStrategy
} from '@angular/router';
import { BlankPageComponent } from '@xrm-shared/common-components/blank-page/blank-page.component';
import { UnauthorizedRecordPageComponent } from '@xrm-shared/common-components/unauthorized-record-page/unauthorized-record-page.component';
import { UnauthorizedComponent } from '@xrm-shared/common-components/unauthorized/unauthorized.component';
import { AuthGuard } from './core/guards/auth.guard';
import { MasterGuard } from './core/guards/master.guard';
import { PageNotFoundComponent } from './shared/common-components/page-not-found/page-not-found.component';
import { PageTitleService } from './shared/services/page-title.service';
import { PreloadingModuleService } from './shared/services/preloading-module.service';
import { SingleTabGuard } from '@xrm-core/guards/single-tab.guard';
import { LinkExpiredComponent } from '@xrm-shared/common-components/link-expired/link-expired.component';

export class AppRouting{
	public getRoute(): Route[]{
		return [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'auth'
			},
			{
				path: 'auth',
				canActivate: [MasterGuard],
				loadChildren: () =>
					import('./auth/auth.module').then((m) =>
						m.AuthModule)
			},
			{
				path: 'xrm',
				canActivate: [AuthGuard],
				loadChildren: () =>
					import('./modules/modules.module').then((m) =>
						m.ModulesModule),
				data: { title: 'xrm' }
			},
			{
				path: 'unauthorized',
				component: UnauthorizedComponent
			},
			{
				path: 'pagenotfound',
				component: PageNotFoundComponent
			},
			{
				path: 'unauthorizedRecordPage',
				component: UnauthorizedRecordPageComponent
			},
			{
				path: 'review/:id1',
				component: BlankPageComponent
			},
			{
				path: 'link-expired',
				component: LinkExpiredComponent
			},
			{
				path: '**',
				component: PageNotFoundComponent
			}
		];
	}
}

@NgModule({
	imports: [
		RouterModule.forRoot(new AppRouting().getRoute(), {
			preloadingStrategy: PreloadingModuleService
		})
	],
	exports: [RouterModule],
	providers: [{ provide: TitleStrategy, useClass: PageTitleService }]
})
export class AppRoutingModule { }
