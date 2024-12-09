type NullableString = string | null;
export interface BroadcastInterface {
    broadcastUkey: NullableString;
    requestUkey: string,
    xrmEntitityId: number,
    sectorId: number;
    locationId: number;
    laborCategoryId: number;
    selectedBroadcastedRound: string;
    requestBroadcastReasonId: number;
    comments: string;
    OverrideDelayedNotification: boolean;
    requestBroadcastDetails: any[];
    submittalCutOffDate?: NullableString;
}


export interface DropdownItem {
    Text: number
    Value: number
}
