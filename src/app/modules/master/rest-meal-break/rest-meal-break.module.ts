import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestMealBreakRoutingModule } from './rest-meal-break-routing.module';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		RestMealBreakRoutingModule,
		SharedModule
	]
})

export class RestMealBreakModule { }
