import { ErrorHandler, Injectable } from '@angular/core';
import 'reflect-metadata';

@Injectable({
	providedIn: 'root'
})


export class ErrorHandlerService implements ErrorHandler{

	handleError(error: any, componentName?: string) {
		
	}
}
