import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import { Injectable } from '@angular/core';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ContractorData, DuplicateData, PoData } from 'src/app/modules/contractor/contractor-details/constant/contractor-interface';
import { CustomResponse } from 'src/app/auth/user_activation/user_activation_interfaces';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { AssignmentDetails, ContractorEventData, EventConfigData, IEventNameDropdown, IGetStaffingAgencies, IGetStaffingAgency } from 'src/app/modules/contractor/event/constant/event-interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { ContractorEvent } from 'src/app/modules/contractor/event/data.model';
import { IDropdownOption } from '@xrm-shared/models/common.model';

@Injectable({
	providedIn: 'root'
})
export class ContractorService extends HttpMethodService{

	public saveContractor = new BehaviorSubject<boolean>(false);
	public _saveContractor = this.saveContractor.asObservable();
	public showAddButtonContractor = new BehaviorSubject(true);

	constructor(private http: HttpClient) {
		super(http);
	}

	public getContractorById(Ukey: string): Observable<GenericResponseBase<ContractorData>> {
		 return this.GetAll<GenericResponseBase<ContractorData>>(`/clp-ukey/${Ukey}`);
	}

	public updateContractor(data: ContractorData): Observable<CustomResponse> {
		return this.Put(`/clp/edit`, data);
	}
	public getUserLoginIdByEmail(Email: string): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/clp/username-by-email/${Email}`);
	}

	getContractorEvent(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/Contractor/GetAllEvent');
	}

	checkDublicateUserName(name: string): Observable<DuplicateData> {
		return this.GetAll<DuplicateData>(`/user-detail/check-duplicate/${name}`);
	}

	getSectorBasedOnContractorId(contractorId: number): Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>(`/assignment/select-sector-by-contractor/${contractorId}`);
	}

	getAssignmentBasedOnSectorId(sectorId: number, contractorId:number): Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>(`/assignment/select-sector-assignment/${sectorId}/${contractorId}`);
	}

	getContractorEventById(assignmentId: number): Observable<GenericResponseBase<IEventNameDropdown[]>> {
		return this.GetAll<GenericResponseBase<IEventNameDropdown[]>>(`/evcf/select-event-name/${assignmentId}`);
	}
	getContractorEventReasonBasedOnAssignmentId(assignmentId: number): Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>(`/evtr/select-reason/${assignmentId}`);
	}
	getEventConfigBasedOnEventId(eventId: number): Observable<GenericResponseBase<EventConfigData>> {
		return this.GetAll<GenericResponseBase<EventConfigData>>(`/evcf-id/${eventId}`);
	}
	saveContractorEvent(data: ContractorEvent): Observable<GenericResponseBase<number | null>> {
		return this.Post('/contr-event/save', data);
	}

	public updateContactEventStatus(data: ActivateDeactivate[]): Observable<ApiResponseBase> {
	   return this.PutBulk(`/contr-event/bulk-status`, data);
	}

	public getContractorEventByUkey(ukey: string): Observable<GenericResponseBase<ContractorEventData>> {
		return this.GetAll<GenericResponseBase<ContractorEventData>>(`/contr-event-ukey/${ukey}`);
	}

	public getAssignmentDetailsbasedOnAssignmentId(assignmentId: number): Observable< GenericResponseBase<AssignmentDetails>> {
		return this.GetAll< GenericResponseBase<AssignmentDetails>>(`/assgmt-id/${assignmentId}`);
	}
	public getStaffingAgency(data: IGetStaffingAgency): Observable<GenericResponseBase<IGetStaffingAgencies>> {
		return this.Post('/staf/eligible-agencies-event', data);
	}
	generateDaysInfo(data: Record<string, boolean>): DayInfo[] {
		const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		return days.map((day) =>
			({ day, isSelected: data[day.substring(magicNumber.zero, magicNumber.three)] || false }));
	}

	public getHoursBreakdownData(clpId: number): Observable<GenericResponseBase<PoData>> {
		return this.Get(`/contr/hours-breakdown`, clpId);
	}

	public resendActivationLink(userId: string):Observable<ApiResponseBase> {
		return this.Post<string, ApiResponseBase>(`/acc/send-user-activation-email/${userId}`, userId);
	}

}
interface DayInfo {
	day: string;
	isSelected: boolean;
}
