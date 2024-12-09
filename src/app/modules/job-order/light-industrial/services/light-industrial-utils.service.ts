import { Injectable } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DropdownItem, IApprovalDetailData } from '../interface/li-request.interface';

@Injectable({
	providedIn: 'root'
})

export class LightIndustrialUtilsService {

	public isValidArray(array: []): boolean {
		return Array.isArray(array) && array.length > Number(magicNumber.zero);
	}

	public isNonNegativeNumber(value: number): boolean {
		return typeof value === 'number' && value >= Number(magicNumber.zero);
	}

	public isValidDate(date: Date | string): boolean {
		return date instanceof Date && !isNaN(date.getTime());
	}

	public isNotANumber(value: number): boolean {
		return isNaN(value);
	}

	public isNull(value: string | number | undefined | null): boolean {
		return value === null;
	}

	public isNotNull(value: string | number | undefined | null): boolean {
		return value !== null;
	}

	public isUndefined(value: string | number | undefined | null): boolean {
		return value === undefined;
	}

	public isZero(value: number): boolean {
		return value === Number(magicNumber.zero);
	}

	isAllValuesZero(data: IApprovalDetailData[]): boolean {
		const allItems = data.reduce<DropdownItem[]>((acc, approver) => {
			return acc.concat(approver.Items);
		}, []);

		return allItems.every((item) =>
			 item.Value === "0");
	}
}
