import { IUserDetails } from "../../light-industrial/interface/li-request.interface";

export function flattenObject(obj: any, parentKey: string = '', separator: string = '_'): any {
	const result: any = {};

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const value = obj[key],
				newKey = parentKey
					? key
					: key;

			if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
				Object.assign(result, flattenObject(value, '', separator));
			} else {
				result[newKey] = value;
			}
		}
	}

	return result;
}

export function transformResponseKeys(response: any[]) {
	return response.map((item) =>
		({
			...item,
			WorkLocationId: item.LocationId,
			NteBillRate: item.BillRate,
			BaseWageRate: item.WageRate
		}));
}

export function replaceNestedValueObjects(obj: object | null): object | null {
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	return Object.keys(obj).reduce((acc, key) => {
		const value = (obj as Record<string, any>)[key];

		if (value && typeof value === 'object' && 'Value' in value) {
			const nestedValue = (value as { Value: unknown }).Value;
			// Convert to number if the value is a string representing a number
			(acc as Record<string, any>)[key] = typeof nestedValue === 'string' && !isNaN(Number(nestedValue))
				? Number(nestedValue)
				: nestedValue;
		} else {
			(acc as Record<string, any>)[key] = replaceNestedValueObjects(value as object | null);
		}

		return acc;
	}, {} as Record<string, any>);
}


export function transformResKeysClientPrimaryDetails(response: IUserDetails) {
	return {
		...response,
		SectorId: response.PrimarySectorId,
		WorkLocationId: response.PrimaryLocationId,
		OrgLevel1Id: response.PrimaryOrgLevels1Id,
		OrgLevel2Id: response.PrimaryOrgLevels2Id,
		OrgLevel3Id: response.PrimaryOrgLevels3Id,
		OrgLevel4Id: response.PrimaryOrgLevels4Id,
		CostAccountingId: response.DefaultCostAccountingsCode
	};
}
