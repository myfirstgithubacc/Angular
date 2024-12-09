import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtrasRoutingModule } from './extras-routing.module';
import { CoreExtraComponent } from './core-extra.component';


@NgModule({
	declarations: [CoreExtraComponent],
	imports: [
		CommonModule,
		ExtrasRoutingModule
	]
})
export class ExtrasModule { }
