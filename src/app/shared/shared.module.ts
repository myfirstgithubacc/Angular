import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicesModule } from './services/services.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { BreadcrumbService } from './services/breadcrumb.service';
import { LocalizationService } from './services/Localization/localization.service';
import { SmartSearchService } from './services/smartsearch.service';
import { UdfImplementationComponent } from './common-components/udf-implementation/udf-implementation.component';
import { UdfListViewComponent } from './widgets/udf-list-view/udf-list-view.component';
import { RouterModule } from '@angular/router';
import { CultureFormat } from './services/Localization/culture-format.enum';
import { magicNumber } from './services/common-constants/magic-number.enum';
import { DmsImplementationComponent } from './common-components/dms-implementation/dms-implementation.component';
import { PreferenceComponent } from '@xrm-master/user/add-edit/preference/preference.component';
import { BenefitAdderComponent } from './common-components/benefit-adder/benefit-adder.component';
import { kendoModules, widgets, pipes, directives } from './shared-export/shared.imports';
import { OnboardingRequirementsComponent } from './common-components/onboarding-requirements/onboarding-requirements.component';
import { CommonAssignmentListComponent } from '../modules/contractor/assignment-details/list/list.component';
import { ScrollViewModule } from '@progress/kendo-angular-scrollview';
import { NumberPipe } from '@progress/kendo-angular-intl';
import { NumericPipe } from './pipes/numeric.pipe';
import { MaskFormatPipe } from './pipes/mask-format.pipe';
import { OnboardingSummarizedViewComponent } from './common-components/onboarding-summarized-view/onboarding-summarized-view.component';
import { AfterValueChangedDirective } from './widgets/form-controls/kendo-numericbox/after-value-changed.directive';
import { RevisionListComponent } from '../modules/contractor/revision/revision-list/revision-list.component';
import { EmailjsonPipe } from './pipes/emailjson.pipe';
import { ApprovalFormV2Component } from './widgets/approval-form-v2/approval-form-v2.component';
import { ApprovalWidgetV2Component } from './widgets/approval-widget-v2/approval-widget-v2.component';
import { XRMIconLibraryComponent } from './icons/xrm-icon-library/xrm-icon-library.component';
import { SelectBaseDataComponent } from '../modules/report/create-report/select-base-data/select-base-data.component';
import { BuildComponent } from '../modules/report/create-report/build/build.component';
import { FiterReportComponent } from '../modules/report/create-report/fiter-report/fiter-report.component';
import { FilterModule } from '@progress/kendo-angular-filter';
import { FormatAndSaveComponent } from '../modules/report/create-report/format-and-save/format-and-save.component';
import { ListViewComponent } from '../modules/report/create-report/list-view/list-view.component';
import '@xrm-shared/services/dateExtensions';
import { MultiLevelCommentsComponent } from './common-components/multi-level-comments/multi-level-comments.component';
import { ManageFolderComponent } from '../modules/report/common/manage-folder/manage-folder.component';
import { BrowserNotSupportedComponent } from './common-components/browser-not-supported/browser-not-supported.component';
import { ListComponent } from '../modules/job-order/submittals/list/list.component';
import { ProffViewComponent } from '../modules/job-order/professional/request/view/view.component';
import { StatusBarComponent } from '../modules/job-order/professional/common/status-bar/status-bar.component';
import { LinkExpiredComponent } from './common-components/link-expired/link-expired.component';
import { SubmitalViewComponent } from '../modules/job-order/submittals/view/view.component';


export function HttpLoaderFactory(httpClient: HttpClient): TranslateHttpLoader | null {
	const clientName = sessionStorage.getItem(CultureFormat[CultureFormat.ClientName]) ?? 'Default',
		path = `${environment.LocalizationBasePath}${clientName}/Language/`,
		timestamp = new Date().getTime();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
	if (path.length == magicNumber.zero) {
		return new TranslateHttpLoader(httpClient);
	} else if (clientName) {
		return new TranslateHttpLoader(httpClient, path, `.json?ts=${timestamp}`);
	}
	return null;
}

const allWidgets = [
	// COMPONENTS
	UdfListViewComponent,
	UdfImplementationComponent,
	DmsImplementationComponent,
	BenefitAdderComponent,
	PreferenceComponent,
	OnboardingRequirementsComponent,
	CommonAssignmentListComponent,
	OnboardingSummarizedViewComponent,
	RevisionListComponent,
	AfterValueChangedDirective,
	ApprovalFormV2Component,
	ApprovalWidgetV2Component,
	XRMIconLibraryComponent,
	MultiLevelCommentsComponent,
	BrowserNotSupportedComponent,
	ListComponent,
	SubmitalViewComponent,
	ProffViewComponent,
	StatusBarComponent,
	LinkExpiredComponent,
	SelectBaseDataComponent,
	BuildComponent,
	FiterReportComponent,
	FormatAndSaveComponent,
	ListViewComponent,
	ManageFolderComponent
];
@NgModule({
	declarations: [
		...allWidgets,
		widgets,
		pipes,
		directives
	],
	imports: [
		TranslateModule.forChild({
			defaultLanguage: sessionStorage.getItem(CultureFormat[CultureFormat.ClientCultureCode]) ?? 'en-US',
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			},
			isolate: false
		}),
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		ServicesModule,
		RouterModule,
		kendoModules,
		ScrollViewModule,
		FilterModule
	],
	exports: [
		TranslateModule,
		ServicesModule,
		...allWidgets,
		widgets,
		pipes,
		kendoModules,
		directives,
		ScrollViewModule
	],
	providers: [
		BreadcrumbService,
		SmartSearchService,
		LocalizationService,
		DatePipe,
		NumericPipe,
		NumberPipe,
		MaskFormatPipe,
		DecimalPipe,
		EmailjsonPipe
	]
})
export class SharedModule {
	public title = 'Shared Module';
}
