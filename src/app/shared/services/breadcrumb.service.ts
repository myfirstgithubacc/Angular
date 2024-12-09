import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class BreadcrumbService {
	screenTitlevisibility = true;

	public setscreenTitlevisibility = new BehaviorSubject<boolean>(this.screenTitlevisibility);

	public castscreenTitlevisibility = this.setscreenTitlevisibility.asObservable();

	constructor( private router: Router	)
	{
	}

	getScreenTitlevisibility(params: boolean) {

		this.screenTitlevisibility = params;

		this.setscreenTitlevisibility.next(this.screenTitlevisibility);

	}
}
