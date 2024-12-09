import { Injectable } from '@angular/core';
import { UserRole } from '../enum/enums';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Injectable({
	providedIn: 'root'
})
export class CommonFunctionService {

	getEntityType(roleGroupId: any){
		if(roleGroupId == UserRole.Client)
			return 'Client';
		else if(roleGroupId == UserRole.StaffingAgency)
			return 'StaffingUser';
		else
			return 'MSP';
	}

	setEntityType(entityType: number): Record<'entityType' | 'subEntityType', string> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		if(entityType == magicNumber.two){
			return {entityType: 'MSP', subEntityType: 'MSP'};
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		else if(entityType == magicNumber.three){
			return {entityType: 'StaffingUser', subEntityType: 'Staffing'};
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		else if(entityType == magicNumber.four){
			return {entityType: 'Client', subEntityType: 'Client'};
		}
		return {entityType: '', subEntityType: ''};
	}

}
