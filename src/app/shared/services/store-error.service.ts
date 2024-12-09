import { ErrorHandler, Injectable } from '@angular/core';
@Injectable({
	providedIn: 'root'
})
export class StoreErrorService implements ErrorHandler{
	handleError(error: any): void {
		console.error('Error from store', error);
	}
}
