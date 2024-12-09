import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

import { UiWelcomeRoutingModule } from './ui-welcome-routing.module';
import { HomeComponent } from './home/home.component';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    UiWelcomeRoutingModule,
    SharedModule
  ]
})
export class UiWelcomeModule { }
