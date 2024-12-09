import {
	type HttpEvent,
	type HttpHandler,
	type HttpInterceptor,
	type HttpRequest
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { finalize, type Observable } from 'rxjs';
import { LoaderService } from 'src/app/shared/services/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
	private pendingRequests: any = magicNumber.zero;

	private readonly blackList: string[] = [
		'google-analytics.com',
		'/Language/en-US.json',
		'/ErrorLog',
		'err-log/log',
		'/Authentication/RenewToken',
		'/Favorite/SubmitData',
		'/li-req/get-open-no',
		'/li-req/get-pend-broad-no',
		'/li-req/get-pend-appr-no',
		'/expense/get-pend-appr-no',
		'/assgmt-apprv-count',
		'/assgmt-proc-count',
		'/time/get-pend-appr-no',
		'/assgmt-compliance-count',
		'pag-acc-log/log',
		'/prof-req/get-pend-appr-no',
		'/prof-req/get-pend-broad-no'
	];

	constructor(@Inject(LoaderService) private readonly loaderService: LoaderService) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const isBlacklisted = this.blackList.some((val) =>
				request.url.includes(val)),
			byPassLoader = request.body?.byPassLoader || false,
			isByPassLoader = isBlacklisted || byPassLoader;

		if (isByPassLoader)
			return next.handle(request);

		this.pendingRequests++;
		this.loaderService.isHttpRequest.next(true);
		this.loaderService.setLoaderForHttpRequest(true);

		return next.handle(request).pipe(finalize(() => {
			setTimeout(() => {
				this.pendingRequests--;
				if (this.pendingRequests <= Number(magicNumber.zero)) {
					this.pendingRequests = magicNumber.zero;
					this.loaderService.isHttpRequest.next(false);
					this.loaderService.setLoaderForHttpRequest(false);
				}
			}, magicNumber.one)
		}));
	}}
