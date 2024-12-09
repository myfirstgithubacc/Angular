import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
	providedIn: 'root'
})
export class SessionStorageService {
	constructor(private cookieService: CookieService) {}
	set(key: string, value: string) {
		sessionStorage.setItem(key, value);
	}

	get(key: string) {
		return sessionStorage.getItem(key);
	}

	remove(key: string) {
		sessionStorage.removeItem(key);
	}

	clear() {
		sessionStorage.clear();
	}

	getCookieValue(key:string): string {
		return this.cookieService.get(key);
	}
}
