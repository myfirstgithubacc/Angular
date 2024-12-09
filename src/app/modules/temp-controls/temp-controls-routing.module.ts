import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewComponent } from './demo-listing/view/view.component';
import { ControlsComponent } from './controls/controls.component';
import { CoreTempControlsComponent } from './core-temp-controls.component';
import { AdEditComponent } from './demo-listing/ad-edit/ad-edit.component';
import { DemoListingComponent } from './demo-listing/demo-listing.component';
import { ListingResolver } from './demo-listing/demo-listing.component.resolver';
import { GridViewComponent } from './grid-view/grid-view.component';
import { TestLocalizationComponent } from './test-localization/test-localization.component';
import { COETestingComponent } from './coe-testing/coe-testing.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { CultureComponent } from './culture/culture.component';
import { AutocompleteComponent } from './demo-listing/autocomplete/autocomplete.component';
import { PagingComponent } from './paging/paging.component';
import { GridPagingComponent } from './grid-paging/grid-paging.component';
import { HdrMockScreenComponent } from './hdr-mock-screen/hdr-mock-screen.component';
import { SprintComponent } from './sprint/sprint.component';
import { LoadOnDemandComponent } from './load-on-demand/load-on-demand.component';


const routes: Routes = [
	{
		path: '',
		component: CoreTempControlsComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'controls ' },
			{ path: 'controls', component: ControlsComponent },
			{ path: 'grid', component: GridViewComponent },
			{ path: 'listing', component: DemoListingComponent },
			{ path: 'add-edit', component: AdEditComponent },
			{ path: 'view', component: ViewComponent },
			{ path: 'test-localization', component: TestLocalizationComponent },
			{ path: 'COE', component: COETestingComponent },
			{ path: 'fileUpload', component: FileUploadComponent },
			{ path: 'culture', component: CultureComponent },
			{ path: 'paging', component: PagingComponent },
			{ path: 'grid-paging', component: GridPagingComponent },
			{ path: 'autoComplete', component: AutocompleteComponent },
			{ path: 'hdr-mock-screen', component: HdrMockScreenComponent },
			{ path: 'sprint', component: SprintComponent },
			{ path: 'load-on-demand', component: LoadOnDemandComponent }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [ListingResolver]
})
export class TempControlsRoutingModule { }
