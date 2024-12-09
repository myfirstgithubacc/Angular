import { Injectable } from '@angular/core';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { BehaviorSubject } from 'rxjs';
import { DynamicParam } from './Localization/DynamicParam.interface';
import { magicNumber } from './common-constants/magic-number.enum';
import { WindowScrollTopService } from './window-scroll-top.service';

@Injectable({
	providedIn: 'root'
})
export class ToasterService {
	public isRemovableToaster: boolean = false;
	constructor(private windowScrollServc: WindowScrollTopService) { }

	data: any[] = [];
	private toasterSetting = new BehaviorSubject<any>(null);
	toasterSettingObs = this.toasterSetting.asObservable();
	public showLeftPannelObj = new BehaviorSubject<any>(false);
	showRightPannelObj = this.showLeftPannelObj.asObservable();
	notPopup=new BehaviorSubject(true);


	// eslint-disable-next-line max-params
	public showToaster(
		toastOption: ToastOptions, text: string,
		dynamicParam: DynamicParam[] = [], isHtml: boolean = false,
		isOpenLeftPannel: boolean = false, moduleName?: string, timeSpan: number = magicNumber.thirty
	) {
		let cssClass = '',
			iconCssClass = '';

		if (toastOption == ToastOptions.Success) {
			cssClass = 'alert__success';
			iconCssClass = 'check-circle';
		}
		if (toastOption == ToastOptions.Error) {
			cssClass = 'alert__danger';
			iconCssClass = 'alert-circle';
		}
		if (toastOption == ToastOptions.Warning) {
			cssClass = 'alert__warning';
			iconCssClass = 'alert-triangle';
		}
		if (toastOption == ToastOptions.Information) {
			cssClass = 'alert__info';
			iconCssClass = 'info';
		}
		/* let isExists = this.data.some((item: any) => item.cssClass == cssClass && item.text == text);
			 if (!isExists) */
		this.data.length = 0;
		this.data.push({
			toasterId: Date.now().toString(),
			cssClass: cssClass, iconCssClass: iconCssClass, text: text,
			dynamicParam: dynamicParam, isHtml: isHtml,
			isOpenLeftPannel: isOpenLeftPannel, moduleName: moduleName,
			timeSpan: (toastOption == ToastOptions.Success)
				? timeSpan
				: magicNumber.zero
		});
		this.toasterSetting.next(this.data);
		/* Scroll to top commented as suggested by UI team. As the toast placement shifted from fixed to floating
		 this.windowScrollServc.scrollTop(); */
	}

	// eslint-disable-next-line max-params
	public displayToaster(toasterOptions: ToastOptions, message: string, params: DynamicParam[] = [], isHtml: boolean = false) {
		if (toasterOptions === ToastOptions.Error) {
			this.showToaster(ToastOptions.Error, message, params, isHtml);
			this.isRemovableToaster = true;
		}
		else if (toasterOptions === ToastOptions.Success) {
			this.showToaster(ToastOptions.Success, message, params, isHtml);
			this.isRemovableToaster = false;
		}
		else if (toasterOptions === ToastOptions.Information) {
			this.showToaster(ToastOptions.Information, message, params, isHtml);
			this.isRemovableToaster = true;
		}
		else {
			this.showToaster(ToastOptions.Warning, message, params, isHtml);
			this.isRemovableToaster = true;
		}
	}

	public resetToaster(toasterId: string = '') {
		if (toasterId.length == Number(magicNumber.zero)) {
			this.data.length = 0;
			this.toasterSetting.next(null);
			this.showLeftPannelObj.next(false);
			return;
		}

		this.data = this.data.filter((item) =>
			item.toasterId != toasterId);
		this.toasterSetting.next(this.data);
	}
	public openRightPannel(toasterId: string = '') {
		if (toasterId.length == Number(magicNumber.zero)) {
			this.data.length = 0;
			this.toasterSetting.next(null);
		}
		this.showLeftPannelObj.next(true);
	}
}
