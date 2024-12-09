import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { environment } from 'src/environments/environment';

export function HttpLoaderFactory(httpClient: HttpClient): TranslateHttpLoader | null {
    const clientName = sessionStorage.getItem(CultureFormat[CultureFormat.ClientName]) ?? 'Default',
        path = `${environment.LocalizationBasePath}${clientName}/Language/`,
        timestamp = new Date().getTime();
 
    if (path.length == Number(magicNumber.zero)) {
        return new TranslateHttpLoader(httpClient);
    } else if (clientName) {
        return new TranslateHttpLoader(httpClient, path, `.json?ts=${timestamp}`);
    }
 
    return null;
}

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		TranslateModule.forRoot({
			defaultLanguage: sessionStorage.getItem(CultureFormat[CultureFormat.ClientCultureCode]) ?? 'en-US',
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		})
	],
	exports: [TranslateModule]
})
export class TranslationModule { }
