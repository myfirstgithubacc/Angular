export class LocationOfficerListData {
	uKey: string;
	disabled: boolean;
	locationOfficerDesignation : string;
}

export class LocationOfficersDataToUpdate
{
	locationOfficerTypeList : LocationOfficerListData[];
	reasonForChange : string;
}

export interface LocationOfficer {
    Id: number;
    isDisabled: boolean;
    text1: string;
    uKey: string;
}

export interface LocationOfficerData {
	Disabled: boolean;
	LocationOfficerDesignation: string;
	LocationOfficerNumber: number;
	LocationOfficerTypeId: number;
	Ukey: string;
  }
