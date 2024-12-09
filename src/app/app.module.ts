import {
	ErrorHandler,
	NgModule,
	LOCALE_ID
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { LabelModule } from '@progress/kendo-angular-label';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { StoreErrorService } from './shared/services/store-error.service';
import { CustomValidators } from './shared/services/custom-validators.service';
import { SharedModule } from '@xrm-shared/shared.module';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { AdvanceFilterState } from '@xrm-core/store/states/advance-filter.state';
import { GridTabNameState } from '@xrm-core/store/states/grid-tab.state';
import { SmartSearchState } from '@xrm-core/store/states/smart-search.state';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoaderInterceptor } from '@xrm-core/interceptors/loader.interceptor';
import { ICON_SETTINGS } from '@progress/kendo-angular-icons';
import { TranslationModule } from '@xrm-shared/translation/translation.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { GlobalErrorHandlerService } from '@xrm-shared/services/error-log/global-error-handler.service';
import { CoreModule } from '@xrm-core/core.module';
import { NgxsResetPluginModule } from 'ngxs-reset-plugin';
import { ScrollViewModule } from '@progress/kendo-angular-scrollview';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { environment } from 'src/environments/environment';
import { DatePickerInterceptor } from '@xrm-core/interceptors/datepicker.interceptor';
@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		HttpClientModule,
		NgxGoogleAnalyticsModule.forRoot(environment.GaMeasurementId),
		NgxGoogleAnalyticsRouterModule,
		TranslationModule,
		NgxsModule.forRoot([
			AdvanceFilterState,
			SmartSearchState,
			GridTabNameState
		]),
		SharedModule,
		NgxsLoggerPluginModule.forRoot(),
		NgxsReduxDevtoolsPluginModule.forRoot(),
		NgxsResetPluginModule.forRoot(),
		LabelModule,
		IndicatorsModule,
		TreeViewModule,
		GridModule,
		CoreModule,
		ScrollViewModule,
	],
	providers: [
		{ provide: ICON_SETTINGS, useValue: { type: 'font' } },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: LoaderInterceptor,
			multi: true
		},
		/* {
					provide: NGXS_PLUGINS,
					useValue: clearStorePlugin,
					multi: true
				 }, */
		{ provide: ErrorHandler, useClass: StoreErrorService },
		{ provide: ErrorHandler, useClass: GlobalErrorHandlerService },
		{ provide: LOCALE_ID, useValue: 'en-US' },
		{ provide: HTTP_INTERCEPTORS, useClass: DatePickerInterceptor, multi: true },
		CustomValidators
	],
	bootstrap: [AppComponent]
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule { }
