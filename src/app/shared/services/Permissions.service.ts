import { Injectable } from '@angular/core';
import { Permission } from '@xrm-shared/enums/permission.enum';

@Injectable({
	providedIn: 'root'
})
export class PermissionsService {
	public permission=[];

	hasPermission(data: number){
		return this.permission.some((obj:any) =>
			obj.ActionId==data);
	}

	public get Permission(){
		return Permission;
	}
}
