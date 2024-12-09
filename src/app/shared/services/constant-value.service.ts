import { Injectable } from '@angular/core';
@Injectable({
	providedIn: 'root'
})
export class ConstantValueService {
	public getPrefix(): string {
		return 'prefix-';
	}
	public getSuffix(): string {
		return '-suffix';
	}
	public appPrefixName(): string {
		// return 'XRM - ';  /* Remove by prashant for Breadcrumb Nameing  */
		return '';
	}
}
