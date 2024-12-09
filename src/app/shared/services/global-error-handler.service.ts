import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {
	handleError(error: any) {
		// http errors
		// if (error instanceof HttpErrorResponse) {
		// 	// client side errors
		// 	if (error.error instanceof ProgressEvent) {
		// 		this.handleErrorFunc(
		// 			{
		// 				message: `client side error: ${error.message}`,
		// 				errorName: error.name,
		// 				action: `making request to url ${error.url}`
		// 			},
		// 			"Cannot connect to server, please try again later."
		// 		);
		// 	} else {
		// 		// server side errors
		// 		this.handleErrorFunc(
		// 			{
		// 				message: `server side error: ${error.message}`,
		// 				errorName: error.name,
		// 				action: `making request to url ${error.url}`
		// 			},
		// 			error.message
		// 		);
		// 	}
		// } else {
		// 	this.handleErrorFunc(
		// 		{
		// 			message: error.message || "unexpected error",
		// 			errorName: error.name || "Error",
		// 			stack: error.stack
		// 		},
		// 		error.message || "Unexpected error."
		// 	);
		// }
	}

	// private handleErrorFunc(errorData: any, notiMessage: string) {
	// 	throw (errorData);
	// }
}

