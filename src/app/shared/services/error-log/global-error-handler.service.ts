import { ErrorHandler, Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { ErrorLogService } from './error-log.service';
import { Subject, takeUntil } from 'rxjs';
@Injectable({
	providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {
	componentName: any;
	private unsubscribe$ = new Subject<void>();
	constructor(
		private router: Router,
		private errorSer: ErrorLogService
	) { }

	errorLogArray: any[] = [];
	handleError(error: any) {
		if (error instanceof Error) {
			const stackTrace: any = error.stack,
				methodMatch = /at\s+([^(]+)\s+\(/.exec(stackTrace),
				methodName = methodMatch
					? methodMatch[1]
					: 'unknown method';
			let obj: any = {},
				isExists = false;
			obj = {
				"errorCode": "",
				"errorMessage": error.message,
				"className": "",
				"methodName": methodName,
				"lineNo": 0,
				"stackTrace": error.stack
			};
			isExists = this.errorLogArray.some((x) =>
				x.errorMessage == error.message && x.methodName == methodName);
			if (!isExists) {
				this.errorLogArray.push(obj);
				if (!this.router.url.includes("demo")) {
					this.errorSer.addErrorLog(obj).pipe(takeUntil(this.unsubscribe$))
						.subscribe((res: any) => {
							return res;
						});
				}
			}

		}
	}
	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
