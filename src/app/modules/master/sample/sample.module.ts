import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SampleRoutingModule } from './sample-routing.module';
import { CoreSampleComponent } from './core-sample.component';
import { SampleAddEditComponent } from './sample-add-edit/sample-add-edit.component';
import { SampleListComponent } from './sample-list/sample-list.component';
import { SampleViewComponent } from './sample-view/sample-view.component';
import { SharedModule } from '@xrm-shared/shared.module';

@NgModule({
  declarations: [
    CoreSampleComponent,
    SampleAddEditComponent,
    SampleListComponent,
    SampleViewComponent,
  ],
  imports: [CommonModule, SampleRoutingModule, SharedModule],
})
export class SampleModule {}
