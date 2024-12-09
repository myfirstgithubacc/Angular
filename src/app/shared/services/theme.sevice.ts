import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CustomThemeService {
	ThemeName: BehaviorSubject<any>;
	sideMenuToggle: BehaviorSubject<any>;
	DarkToggle: BehaviorSubject<any>;
	isShowDivOff: BehaviorSubject<boolean>;
	//themeChange : BehaviorSubject<string>;

	constructor() {
		this.ThemeName = new BehaviorSubject<any>('app-content theme-material');
		//this.themeChange = new BehaviorSubject<any>('theme-hybrid-v2');
		this.sideMenuToggle = new BehaviorSubject<any>('body--expended');
		this.DarkToggle = new BehaviorSubject<any>('dark-light__Theme');
	}

	// Theme Style Start

	setTheme(isconfirm: any) {
		return this.ThemeName.next(isconfirm);
	}

	getTheme(): Observable<any> {
		return this.ThemeName.asObservable();
	}

	getIsShowDivOff(): Observable<any> {
		return this.isShowDivOff.asObservable();
	}

	setIsShowDivOff(value: boolean) {
		this.isShowDivOff.next(value);
	}
	// Theme Style End

	// setThemeChanger(isconfirm:any) {
	// 	return this.themeChange.next(isconfirm);
	//   }

	//   getThemeChanger():Observable<any>{
	// 	return this.themeChange.asObservable();
	//   }



	// Side Toggle Menu Start
	setSideToggle(className: any) {
		return this.sideMenuToggle.next(className);
	}
	getSideToggle(): Observable<any> {
		return this.sideMenuToggle.asObservable();
	}
	// Side Toggle Menu End

	// Dark Theme Toggle Start
	setDarkToggle(className: any) {
		return this.DarkToggle.next(className);
	}
	getDarkToggle(): Observable<any> {
		return this.DarkToggle.asObservable();
	}
	// Dark Theme Toggle End

}
