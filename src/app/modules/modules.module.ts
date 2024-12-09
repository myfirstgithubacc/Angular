import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModulesRoutingModule } from './modules-routing.module';
import { ModulesComponent } from './modules.component';
import { SharedModule } from '../shared/shared.module';
import { BreadcrumbsComponent } from '../shared/widgets/breadcrumbs/breadcrumbs.component';
import { HoverClassDirective } from '@xrm-shared/directives/hover-class.directive';
import { BreadcrumbComponent, BreadcrumbItemDirective } from 'xng-breadcrumb';
import { NgxsModule } from '@ngxs/store';
import { AdvFilterState } from '@xrm-core/store/advance-filter/states/adv-filter.states';
import { TranslationModule } from '@xrm-shared/translation/translation.module';
@NgModule({
	declarations: [
		ModulesComponent,
		BreadcrumbsComponent,
		HoverClassDirective
	],
	imports: [
		CommonModule,
		ModulesRoutingModule,
		TranslationModule,
		SharedModule,
		BreadcrumbComponent, BreadcrumbItemDirective,
		NgxsModule.forFeature([AdvFilterState])
	]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ModulesModule {
}
