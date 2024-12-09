import { Inject, Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpResponse
} from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { NotifierService } from 'src/app/shared/services/notifier.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';

@Injectable()
export class HttpResponseInterceptor implements HttpInterceptor {

	constructor(private notifierService: NotifierService) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		return next.handle(request)
			.pipe(map((event: HttpEvent<any>) => {
				if (event instanceof HttpResponse) {
					// this.manageCultureFile(event.headers.get('Culturefileversion'));
					if (event.body.Succeeded == false) {
						if (event.body.StatusCode == magicNumber.fourHundredNine) {
							// this.notifierService.error('This record already exists.')
						} else if (!event.body.validationMessages) {
							// this.notifierService.error(event.body.Message)
						} else {
							this.notifierService.error(event.body.validationMessages[0].errorMessage);
						}
					}
				}
				return event;
			}));
	}
}
