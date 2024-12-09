import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class LoaderService {
	public isBusy = new BehaviorSubject<boolean>(false);

	public isBusyObs = this.isBusy.asObservable();

	public isHttpRequest = new BehaviorSubject<boolean>(false);

	public isHttpRequestObs = this.isHttpRequest.asObservable();

	public isLoaderStopped: boolean = false;

	setState(state: boolean) {
		if (state && !this.isHttpRequest.value) {
			this.isBusy.next(true);
		}
		if (!state && !this.isHttpRequest.value) {
			this.isBusy.next(false);
		}
		this.isLoaderStopped = state;
	}

	setLoaderForHttpRequest(state: boolean) {
		if (!state && !this.isHttpRequest.value && !this.isLoaderStopped) {
			this.isBusy.next(false);
		}
		if (state && this.isHttpRequest.value) {
			this.isBusy.next(true);
		}
	}
}
