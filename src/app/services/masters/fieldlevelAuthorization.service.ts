import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericService } from '@xrm-shared/services/generic.service';

@Injectable({
	providedIn: 'root'
})
export class FieldlevelAuthorizationService extends GenericService{

	constructor(private http: HttpClient) {
		super(http);
	}

	getUserDetailsbyUserNumber(id: number) {
		return this.GetAll(`/OrgLevel4/TempAuthCardDetail?roleGroupID=${id}`);
	}

}
