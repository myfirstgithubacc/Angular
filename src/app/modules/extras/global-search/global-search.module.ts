import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GlobalSearchRoutingModule } from './global-search-routing.module';
import { GlobalListComponent } from './list/list.component';
import { CoreGlobalSearchComponent } from './core-global-search.component';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [
		GlobalListComponent,
		CoreGlobalSearchComponent
	],
	imports: [
		CommonModule,
		GlobalSearchRoutingModule,
		SharedModule
	]
})
export class GlobalSearchModule { }
