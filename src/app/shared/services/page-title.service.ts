import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ConstantValueService } from './constant-value.service';
import { LocalizationService } from './Localization/localization.service';

@Injectable({
	providedIn: 'root'
})
export class PageTitleService extends TitleStrategy {

	// eslint-disable-next-line max-params
	constructor(
    readonly titleService: Title,
    private appProfix: ConstantValueService,
	private localizationService: LocalizationService
	) {
		super();
	}
	public title: string = '';

	public setScreenTitle = new BehaviorSubject('');
	castTitle = this.setScreenTitle.asObservable();

	public getRoute = new BehaviorSubject('');
	getRouteObs = this.getRoute.asObservable();

	public favorite = new BehaviorSubject('');
	isFavoriteItem = this.favorite.asObservable();

	setTitle(value: any) {
		this.setScreenTitle.next(value);
		this.favorite.next(value);
	}

	override updateTitle(routeStateSnap: RouterStateSnapshot): void {
		let title = this.buildTitle(routeStateSnap);
		if (title !== undefined) {
			// If required then add prefixes with application name
			// eslint-disable-next-line no-lone-blocks
			{
				title = this.localizationService.GetLocalizeMessage(title);
				this.titleService.setTitle(`${this.appProfix.appPrefixName()} ${title}`);
			}
		}
	}
}
