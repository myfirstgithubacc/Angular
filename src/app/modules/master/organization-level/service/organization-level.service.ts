import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import { ClientDetails, OrgLevelDetailsBySectorId, OrganizationLevel, ParentData, SaveUpdatePayload, StatusUpdatePayload } from '../Interfaces/Interface';

@Injectable({
	providedIn: 'root'
})

export class OrganizationLevelService extends HttpMethodService {

	public OrgLevel1ParentData = new BehaviorSubject<ParentData|null>(null);
	public OrgLevel2ParentData = new BehaviorSubject<ParentData|null>(null);
	public OrgLevel3ParentData = new BehaviorSubject<ParentData|null>(null);
	public OrgLevel4ParentData = new BehaviorSubject<ParentData|null>(null);

	constructor(private http: HttpClient) {
		super(http);
	}

	public getOrgLvl1List(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/org1');
	}

	public getUserDetailsDropdown(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/user-role-grp-entity-action');
	}

	public addOrgLvl1List(data: SaveUpdatePayload):Observable<GenericResponseBase<OrganizationLevel>> {
		return this.Post('/org1/save', data);
	}
	public updateOrgLvl1(model: SaveUpdatePayload): Observable<GenericResponseBase<OrganizationLevel>> {
		return this.Put(`/org1/edit`, model);
	}
	public updateOrgLvl1BulkStatus(Ukey: StatusUpdatePayload[]): Observable<GenericResponseBase<null>> {
		return this.PutBulk('/org1/bulk-status', Ukey);
	}
	public getOrgLvl1Byukey(id: string): Observable<GenericResponseBase<OrganizationLevel>> {
		return this.GetAll<GenericResponseBase<OrganizationLevel>>(`/org1/${id}`);
	}

	public getConfigureClient(): Observable<GenericResponseBase<ClientDetails>> {
		return this.GetAll<GenericResponseBase<ClientDetails>>('/ccl/basic-detail');
	}

	public getOrgLevelNameBySectorId(sectorId: number, orgType: number): Observable<GenericResponseBase<OrgLevelDetailsBySectorId>> {
		return this.GetAll<GenericResponseBase<OrgLevelDetailsBySectorId>>(`/sector/OrgLevelDetailsBySectorIdAndOrgLevelType/${sectorId}/${orgType}`);
	}

	public CheckDuplicateOrganizationLevel1Name(sectorid: string, orgname: string, ukey: string|null = null)
		:Observable<GenericResponseBase<boolean>> {
		const obj = {SectorId: sectorid, OrgnizationLevelName: orgname, UKey: ukey};
		return this.Post(`/org1-duplicate`, obj);
	}

	public getOrgLvl2List(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/org2');
	}

	public addOrgLvl2List(data: SaveUpdatePayload):Observable<GenericResponseBase<OrganizationLevel>> {
		return this.Post('/org2/save', data);
	}

	public updateOrgLvl2(model: SaveUpdatePayload): Observable<GenericResponseBase<OrganizationLevel>> {
		return this.Put(`/org2/edit`, model);
	}

	public getOrgLvl2Byukey(id: string): Observable<GenericResponseBase<OrganizationLevel>> {
		return this.GetAll<GenericResponseBase<OrganizationLevel>>(`/org2/${id}`);
	}

	public updateOrgLvl2BulkStatus(Ukey: StatusUpdatePayload[]): Observable<GenericResponseBase<null>> {
		return this.PutBulk('/org2/bulk-status', Ukey);
	}

	public CheckDuplicateOrganizationLevel2Name(sectorid: string, orgname: string, ukey: string|null = null)
		:Observable<GenericResponseBase<boolean>> {
		const obj = {SectorId: sectorid, OrgnizationLevelName: orgname, UKey: ukey};
		return this.Post(`/org2-duplicate`, obj);
	}


	public getOrgLvl3List(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/org3');
	}
	public getOrgLvl3Byukey(id: string): Observable<GenericResponseBase<OrganizationLevel>> {
		return this.GetAll<GenericResponseBase<OrganizationLevel>>(`/org3/${id}`);
	}
	public addOrgLvl3List(data: SaveUpdatePayload):Observable<GenericResponseBase<OrganizationLevel>> {
		return this.Post('/org3/save', data);
	}
	public updateOrgLvl3(model: SaveUpdatePayload): Observable<GenericResponseBase<OrganizationLevel>> {
		return this.Put('/org3/edit', model);
	}

	public updateOrgLvl3BulkStatus(Ukey: StatusUpdatePayload[]): Observable<GenericResponseBase<null>> {
		return this.PutBulk('/org3/bulk-status', Ukey);
	}
	public CheckDuplicateOrganizationLevel3Name(sectorid: string, orgname: string, ukey: string|null = null)
		:Observable<GenericResponseBase<boolean>> {
		const obj = {SectorId: sectorid, OrgnizationLevelName: orgname, UKey: ukey};
		return this.Post(`/org3-duplicate`, obj);
	}


	public getOrgLvl4List(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/org4');
	}
	public getOrgLvl4Byukey(id: string): Observable<GenericResponseBase<OrganizationLevel>> {
		return this.GetAll<GenericResponseBase<OrganizationLevel>>(`/org4-ukey/${id}`);
	}
	public addOrgLvl4List(data: SaveUpdatePayload):Observable<GenericResponseBase<OrganizationLevel>> {
		return this.Post('/org4/save', data);
	}
	public updateOrgLvl4(model: SaveUpdatePayload): Observable<GenericResponseBase<OrganizationLevel>> {
		return this.Put(`/org4/edit`, model);
	}
	public updateOrgLvl4BulkStatus(Ukey: StatusUpdatePayload[]): Observable<GenericResponseBase<null>> {
		return this.PutBulk('/org4/bulk-status', Ukey);
	}

	public CheckDuplicateOrganizationLevel4Name(sectorid: string, orgname: string, ukey:string|null = null)
		:Observable< GenericResponseBase<boolean>> {
		const obj = {SectorId: sectorid, OrgnizationLevelName: orgname, UKey: ukey};
		return this.Post(`/org4-duplicate`, obj);
	}

}
