import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevisionComponent } from './revision.component';
import { RevisionRoutingModule } from './revision-routing.module';
import { SharedModule } from '@xrm-shared/shared.module';


@NgModule({
	declarations: [RevisionComponent],
	imports: [
		CommonModule,
		RevisionRoutingModule,
		SharedModule
	]
})
export class RevisionModule { }
