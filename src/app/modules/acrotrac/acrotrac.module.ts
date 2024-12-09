import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActrotracRoutingModule } from './acrotrac-routing.module';
import { CoreActrotracComponent } from './core-acrotrac.component';
import { SharedModule } from '@xrm-shared/shared.module';

@NgModule({
	declarations: [CoreActrotracComponent],
	imports: [CommonModule, ActrotracRoutingModule, SharedModule]
})
export class ActrotracModule { }
