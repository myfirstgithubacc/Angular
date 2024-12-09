import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthGuardService } from './auth/services/auth-guard.service';

@Injectable({
	providedIn: 'root'
})
export class CacheBustingService {
	private currentVersion = '';
	private versionUrl = 'assets/version.json';
	private newVersionAvailable = new BehaviorSubject<boolean>(false);

	constructor(
private http: HttpClient,
		public authService: AuthGuardService
	) {}

	checkForUpdates(): Observable<boolean> {
		return this.getNewVersion().pipe(
			tap((newVersion) => {
				if (this.currentVersion && this.currentVersion !== newVersion) {
					this.newVersionAvailable.next(true);
				} else {
					this.currentVersion = newVersion;
				}
			}),
			map(() =>
				this.newVersionAvailable.value)
		);
	}

	private getNewVersion(): Observable<string> {
		return this.http.get<{ version: string }>(`${this.versionUrl}?t=${new Date().getTime()}`)
			.pipe(map((response) =>
				response.version));
	}

	applyUpdate(): void {
		this.updateStyles();
		this.updateScripts();
		this.newVersionAvailable.next(false);
		console.log("going to call logout api");
		window.location.reload();
	}

	private updateStyles(): void {
		const links = document.getElementsByTagName('link');
		for (let i = 0; i < links.length; i++) {
			const link = links[i];
			if (link.rel === 'stylesheet') {
				link.href = this.addTimestamp(link.href);
			}
		}
	}

	private updateScripts(): void {
		const scripts = document.getElementsByTagName('script');
		for (let i = 0; i < scripts.length; i++) {
			const script = scripts[i];
			if (script.src && !script.src.includes('inline')) {
				const newScript = document.createElement('script');
				newScript.src = this.addTimestamp(script.src);
				script.parentNode?.replaceChild(newScript, script);
			}
		}
	}

	private addTimestamp(url: string): string {
		return `${url.split('?')[0]}?t=${new Date().getTime()}`;
	}
}
