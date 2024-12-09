
export interface SecurityClearanceData{
    Id: number;
    isDisabled: boolean;
    order: number;
    switch1: boolean;
    text1: string;
    uKey: string;
}

export class SecurityClearanceGet{
	uKey: string;
	SecurityName?: string;
	isVisible: boolean;
	disabled: boolean;
	DisplayOrder?: number;
}


