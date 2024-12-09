/* eslint-disable one-var */
import { Injectable } from '@angular/core';
import { magicNumber } from './common-constants/magic-number.enum';
import { LocalizationService } from './Localization/localization.service';

@Injectable({
	providedIn: 'root'
})
export class LoadOnDemandService {

	private controlInfo: any[] = [];
	private numberZero = Number(magicNumber.zero);
	private numberMinusOne = Number(magicNumber.minusOne);


	constructor(private localizationSrv: LocalizationService) {

	}

	public manageLoader(controlName: any, isLoading: boolean) {
		const itemIndex = this.controlInfo.findIndex((x: any) =>
			x.controlName == controlName);

		if (itemIndex == this.numberMinusOne) {
			this.controlInfo.push({
				controlName: controlName,
				isLoading: isLoading
			});
		}
		else {
			this.controlInfo[itemIndex].isLoading = isLoading;
		}

	}

	public isLoading(controlName: any) {
		const itemIndex = this.controlInfo.findIndex((x: any) =>
			x.controlName == controlName);

		return itemIndex == this.numberMinusOne
			? false
			: this.controlInfo[itemIndex].isLoading ?? false;
	}

	public manageInitialDataSet(controlName: any, dataSet: any) {
		const index = this.getPageIndex(controlName);
		if (this.getPageIndex(controlName) > this.numberZero)
			return;

		const itemIndex = this.controlInfo.findIndex((x: any) =>
			x.controlName == controlName);

		if (itemIndex == this.numberMinusOne) {
			this.controlInfo.push({
				controlName: controlName,
				index: index,
				dataSet: dataSet
			});
		}
		else if (!this.controlInfo[itemIndex].dataSet) {
			this.controlInfo[itemIndex].dataSet = dataSet;
		}
	}

	public getInitialDataSet(controlName: any) {
		const itemIndex = this.controlInfo.findIndex((x: any) =>
			x.controlName == controlName);

		return itemIndex == this.numberMinusOne
			? []
			: this.controlInfo[itemIndex].dataSet ?? [];
	}

	public manageIndexing(controlName: any, index: number) {
		const itemIndex = this.controlInfo.findIndex((x: any) =>
			x.controlName == controlName);

		if (itemIndex == this.numberMinusOne) {
			this.controlInfo.push({
				controlName: controlName,
				index: index
			});
		}
		else {
			this.controlInfo[itemIndex].index = index;
		}
	}

	public getPageIndex(controlName: any): number {
		const itemIndex = this.controlInfo.findIndex((x: any) =>
			x.controlName == controlName);
		return itemIndex == this.numberMinusOne
			? this.numberZero
			: (this.controlInfo[itemIndex].index ?? this.numberZero);
	}

	public isLastPage(controlName: any): boolean {
		const itemIndex = this.controlInfo.findIndex((x: any) =>
			x.controlName == controlName);
		if (itemIndex == this.numberMinusOne)
			return false;

		return this.controlInfo[itemIndex].isLast;
	}

	public transformData(data: any) {
		if (!data)
			return data;

		const result = data.map((item: any) => {
			item.Text = this.localizationSrv.GetLocalizeMessage(item.Text);
			return item;
		});

		return result;
	}

	public managePage(controlName: any, isLast: boolean = false) {
		const itemIndex = this.controlInfo.findIndex((x: any) =>
			x.controlName == controlName);

		if (itemIndex == this.numberMinusOne) {
			this.controlInfo.push({
				controlName: controlName,
				isLast: isLast
			});
		}
		else {
			this.controlInfo[itemIndex].isLast = isLast;
		}

	}

}
