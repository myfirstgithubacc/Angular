import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericService } from '@xrm-shared/services/generic.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService extends GenericService {

  constructor(private http:HttpClient) {super(http) }
  get(){
    return this.GetAll<ApiResponse>("/Sector/GetDropdownRecords");
  }
  getdropdown(id:any){
    return this.GetAll<ApiResponse>("/OrgLevel2/GetDropdownRecordsBySectorId?sectorId="+id);
  }
}
