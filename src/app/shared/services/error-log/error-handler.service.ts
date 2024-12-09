import { ErrorHandler, Injectable} from '@angular/core';
import 'reflect-metadata';
import { ErrorLogService } from './error-log.service';
import { Subject, takeUntil } from 'rxjs';
@Injectable({
	providedIn: 'root'
})


export class ErrorHandlerService implements ErrorHandler{
	private unsubscribe$ = new Subject<void>();
	constructor(private errorSer : ErrorLogService){}

	handleError(error: any, componentName?: string) {
		if (error instanceof Error) {
			const stackTrace:any = error.stack,
				methodMatch = /at\s+([^(]+?)\s+\(/.exec(stackTrace),
				methodName = methodMatch
					? methodMatch[1]
					: 'unknown method';
			let obj = {};
			obj = {
				"errorCode": "",
				"errorMessage": error.message,
				"className": componentName,
				"methodName": methodName,
				"lineNo": 0,
				"stackTrace": error.stack
			};
			this.errorSer.addErrorLog(obj)
				.pipe(takeUntil(this.unsubscribe$))
				.subscribe((res:any) => {
					return res;
				});
			console.error(`Error in method: ${methodName}`, error.stack, error.message);
			console.error(error);
		} else {
			console.error('An unknown error occurred:', error);
		}


	}
	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
