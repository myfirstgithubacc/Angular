import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageRoutingModule } from './landing-page-routing.module';
import { CoreLandingComponent } from './core-landing.component';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '@xrm-shared/shared.module';

@NgModule({
	declarations: [
		CoreLandingComponent,
		HomeComponent
  	],
	imports: [
		CommonModule,
		LandingPageRoutingModule,
		SharedModule
	]
})
export class LandingPageModule { }
