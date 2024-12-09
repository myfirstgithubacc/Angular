import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { NotifierService } from './../../shared/services/notifier.service';
import { httpStatusCode } from '@xrm-core/http-status-code.enum';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
	private failedApiCount = 0;
	constructor(public notifierService:NotifierService) {
	}
	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request)
			.pipe(
				retry(magicNumber.one),
				catchError((error: HttpErrorResponse) => {
					console.log(error);					
					if ((error.status === Number(magicNumber.fiveHundred)) || (error.error && error.error.StatusCode === magicNumber.fiveHundred)) {
						this.failedApiCount++;
						if (this.failedApiCount == magicNumber.three) {
							this.notifierService.statusCode.next(true);
						}
					}

					let errorMessage = '';
					if (error.error instanceof ErrorEvent) {
						this.notifierService.error(`c${error.error.message}`);
						errorMessage = `Error: ${error.error.message}`;
					} else {
						this.notifierService.error(`s${error.message}`);
						errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
					}
					return throwError(() =>
						new Error(errorMessage));
				})
			);
	}
}


