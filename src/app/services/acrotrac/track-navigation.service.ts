import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subscription } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class TrackNavigationService {
	private history: string[] = [];
	private routerSubscription: Subscription | undefined;

	constructor(private router: Router) {

	}

	startTracking(): void {
		this.routerSubscription =	this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.history.push(event.urlAfterRedirects);
			}
		});
	}

	getHistory(): string[] {
		return this.history;
	}

	getPreviousUrl(): string | undefined {
		return this.history.length > magicNumber.one
			? this.history[this.history.length - magicNumber.two]
			: undefined;
	}

	stopTracking(): void {
		this.history = [];
		this.routerSubscription?.unsubscribe();
	}
}
