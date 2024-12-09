import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { CoreMessageComponent } from './core-message.component';
import { MessageRoutingModule } from './message-routing.module';

@NgModule({
	declarations: [
		ListComponent,
		ViewComponent,
		CoreMessageComponent
	],
	imports: [
		CommonModule,
		MessageRoutingModule,
		SharedModule
	]
})
export class MessageModule { }
