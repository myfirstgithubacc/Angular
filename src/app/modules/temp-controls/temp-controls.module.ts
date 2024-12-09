import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TempControlsRoutingModule } from './temp-controls-routing.module';
import { CoreTempControlsComponent } from './core-temp-controls.component';
import { ControlsComponent } from './controls/controls.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { DemoListingComponent } from './demo-listing/demo-listing.component';
import { AdEditComponent } from './demo-listing/ad-edit/ad-edit.component';
import { ViewComponent } from './demo-listing/view/view.component';
import { TestLocalizationComponent } from './test-localization/test-localization.component';
import { GridViewComponent } from './grid-view/grid-view.component';
import { COETestingComponent } from './coe-testing/coe-testing.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { CultureComponent } from './culture/culture.component';
import { GridPagingComponent } from './grid-paging/grid-paging.component';
import { LabCatDirective } from './grid-paging/services/lab-cat.directive';
import { AutocompleteComponent } from './demo-listing/autocomplete/autocomplete.component';
import { PagingComponent } from './paging/paging.component';
import { HdrMockScreenComponent } from './hdr-mock-screen/hdr-mock-screen.component';
import { DynamicChildLoaderDirective } from './demo-listing/dynamiccomponent.directive';
import { SprintComponent } from './sprint/sprint.component';
import { LoadOnDemandComponent } from './load-on-demand/load-on-demand.component';

@NgModule({
	declarations: [
		CoreTempControlsComponent,
		ControlsComponent,
		DemoListingComponent,
		AdEditComponent,
		ViewComponent,
		TestLocalizationComponent,
		GridViewComponent,
		COETestingComponent,
		FileUploadComponent,
		CultureComponent,
		GridPagingComponent,
		LabCatDirective,
		AutocompleteComponent,
		PagingComponent,
		HdrMockScreenComponent,
		DynamicChildLoaderDirective,
		SprintComponent,
		LoadOnDemandComponent
	],
	imports: [CommonModule, TempControlsRoutingModule, SharedModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TempControlsModule {

}
