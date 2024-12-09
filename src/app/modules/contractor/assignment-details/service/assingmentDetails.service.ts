/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { DayInfo } from './dayInfo';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AssignmentCostAccountingCode, AssignmentRevision, assignmentSchedulePayload, CostCenterConfig, IAssignmentDetails, IDropdownItems, OrgDetail, reqChanges, RequestDetail, workLocationConfiguration } from '../interfaces/interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { AssignmentData, AssignmentDetail, assignmentTanureDetails, ComplianceDetail, DropdownItem, ITerminationReason } from '../interfaces/editAssignmentInterface';

@Injectable({
	providedIn: 'root'
})
export class AssingmentDetailsService extends HttpMethodService {
	public navigationUrlCancel : BehaviorSubject<any>;
	public navigateBackUrl = new BehaviorSubject('');
	public openRightPanel = new BehaviorSubject({status: false, type: '', ukey: ''});
	public navigationUrlRevision = new BehaviorSubject<AssignmentRevision>({index: magicNumber.zero, assignmentId: '', revisionId: '', isOpen: false});

	constructor(private http: HttpClient) {
		super(http);
		this.navigationUrlCancel = new BehaviorSubject<string>('/xrm/contractor/assignment-details/list');

	}

	setRevisionPageIndex(index: number, assignmentId: string|number|null, revisionId: string, isOpen: boolean){
		this.navigationUrlRevision.next({index: index, assignmentId: assignmentId, revisionId: revisionId, isOpen: isOpen});
	}

	resetRevisionPageIndex(index: number = magicNumber.zero, isOpen: boolean = false){
		this.navigationUrlRevision.next({index: index, assignmentId: '', revisionId: '', isOpen: isOpen});
	}

	getAssingmentDetailsByUkey(uKey?: number | string): Observable<GenericResponseBase<IAssignmentDetails>> {
		return this.GetAll<GenericResponseBase<IAssignmentDetails>>(`/assgmt-ukey/${uKey}`);
	}
	getWeekEndingDate(sectotId: any, startDate:any, endDate:any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/week-ending/select-weekending-sector/${sectotId}/${startDate}/${endDate}`);
	}

	getOrgLevel1(sectorId: number|string): Observable<GenericResponseBase<DropdownItem>> {
		return this.GetAll<GenericResponseBase<DropdownItem>>(`/org1-select-sector-id/${sectorId}`);
	}
	getOrgLevel2(sectorId: number|string): Observable<GenericResponseBase<DropdownItem>> {
		return this.GetAll<GenericResponseBase<DropdownItem>>(`/org2-select-sector-id/${sectorId}`);
	}
	getOrgLevel3(sectorId: number|string): Observable<GenericResponseBase<DropdownItem>> {
		return this.GetAll<GenericResponseBase<DropdownItem>>(`/org3-select-sector-id/${sectorId}`);
	}
	getOrgLevel4(sectorId: number|string): Observable<GenericResponseBase<DropdownItem>> {
		return this.GetAll<GenericResponseBase<DropdownItem>>(`/org4-select-sector-id/${sectorId}`);
	}
	getHireCode(typeName: string): Observable<GenericResponseBase<DropdownItem>> {
		return this.GetAll<GenericResponseBase<DropdownItem>>(`/StaticType/StaticTypesDropdownWithId/${typeName}`);
	}
	getLocations(sectorId: string|number): Observable<GenericResponseBase<DropdownItem>> {
		return this.GetAll<GenericResponseBase<DropdownItem>>(`/rlib/select-loc-ddl/${sectorId}`);
	}
	getLaborCategory(locationId: string|number): Observable<GenericResponseBase<IDropdownItems[]>> {
		return this.GetAll<GenericResponseBase<IDropdownItems[]>>(`/rlib/select-lab-cat/${locationId}`);
	}
	getJobCategory(locationId: number, laborcategoryid:number): Observable<GenericResponseBase<IDropdownItems[]>> {
		return this.GetAll<GenericResponseBase<IDropdownItems[]>>(`/rlib/select-job-catgory/${locationId}/${laborcategoryid}`);
	}
	getSecurityClearance(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/ccl/select-security-clearance`);
	}
	getShift(sectorid: any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/sft/sfts-by-sectid/${sectorid}`);
	}

	getShiftByLocation(sectorid: string|number, locationid: string|number): Observable<GenericResponseBase<IDropdownItems[]>> {
		return this.GetAll<GenericResponseBase<IDropdownItems[]>>(`/sft-sector-li/${sectorid}/${locationid}`);
	}

	getTerminationReason(sectorid: any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/trmrsn/select-sectorid/${sectorid}`);
	}

	getTerminationReasonAssgnmtType(sectorId: string|number, assignmentType:string|number): Observable<GenericResponseBase<DropdownItem>> {
		return this.GetAll<GenericResponseBase<DropdownItem>>(`/trmrsn/select-assgnmt-type/${sectorId}/${assignmentType}`);
	}

	getWorkAddress(WorkLocationId: number|string |IDropdownItems): Observable<GenericResponseBase<workLocationConfiguration>> {
		return this.GetAll<GenericResponseBase<workLocationConfiguration>>(`/loc/select-loc-detail/${WorkLocationId}`);
	}


	generateDaysInfo(data: Record<string, boolean>): DayInfo[] {
		const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		return days.map((day) =>
			({ day, isSelected: data[day.substring(magicNumber.zero, magicNumber.three)] || false }));
	}

	getRequestingManager(sectorId: string|number): Observable<GenericResponseBase<DropdownItem>> {
		const data = {
			"roleGroupDtos": [
				{
					"roleGroupId": 4,
					"roleNos": []
				}
			],
			"xrmEntityActionIds": [magicNumber.threeHundredTwenty, magicNumber.fourHundredNintyEight],
			"sectorIds": [sectorId],
			"locationIds": [],
			"orgLevel1Ids": []
		};
		return this.Post(`/user-detail/user-role-grp-entity-action`, data);
	}

	getPOOWner(sectorId: string|number): Observable<GenericResponseBase<DropdownItem>> {
		const data = {
			"roleGroupDtos": [
				{
					"roleGroupId": 2,
					"roleNos": []
				},
				{
					"roleGroupId": 4,
					"roleNos": []
				}
			],
			"xrmEntityActionIds": [],
			"sectorIds": [sectorId],
			"locationIds": [],
			"orgLevel1Ids": []
		};
		return this.Post(`/user-detail/user-role-grp-entity-action`, data);
	}
	getCostCenter(sectorId: any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/cost-code/select-sector-id/${sectorId}`);
	}
	getCostCenterDetails(sectorId: number|string): Observable<GenericResponseBase<AssignmentCostAccountingCode>> {
		return this.GetAll<GenericResponseBase<AssignmentCostAccountingCode>>(`/cost-code/assgnmt/${sectorId}`);
	}
	getHourDistribution(locationid: string|number): Observable<GenericResponseBase<IDropdownItems[]>> {
		return this.GetAll<GenericResponseBase<IDropdownItems[]>>(`/loc/select-hdr-by/${locationid}`);
	}

	getRestMealBreak(locationid: number|string): Observable<GenericResponseBase<IDropdownItems[]>> {
		return this.GetAll<GenericResponseBase<IDropdownItems[]>>(`/meal-break-loc-id/${locationid}`);
	}

	getSectorLabelName(sectorId: any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/sector/select-sector-name/${sectorId}`);
	}
	getOrgLevelNameBySectorId(sectorId: any, orgType: any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/sector/OrgLevelDetailsBySectorIdAndOrgLevelType/${sectorId}/${orgType}`);
	}

	getStaticDataType(typeName: string): Observable<GenericResponseBase<DropdownItem>> {
		return this.GetAll<GenericResponseBase<DropdownItem>>(`/StaticType/StaticTypesDropdownWithId/${typeName}`);
	}

	getGetSectorCostCenterConfigsValue(sectorId: string|number): Observable<GenericResponseBase<CostCenterConfig>> {
		return this.GetAll<GenericResponseBase<CostCenterConfig>>(`/cost-code/sector-cost-config/${sectorId}`);
	}

	getOnBoardingData(xrmEntityId: number, recordId: string|number|null|undefined):Observable<GenericResponseBase<ComplianceDetail>>{
		return this.GetAll<GenericResponseBase<ComplianceDetail>>(`/onboarding/select-onboarding-compliance/${xrmEntityId}/${recordId}`);
	}
	getSectorOrgLevelConfigs(sectorid: string):Observable<GenericResponseBase<OrgDetail[]>> {
		return this.GetAll<GenericResponseBase<OrgDetail[]>>(`/sector/SectorOrgLevelConfigsBySectorId/${sectorid}`);
	}

	updateAssingmentRecord(payload: any) {
		return this.Post(`/Assignment/UpdateAssignmentDetails`, payload);
	}


	calculateRateByAssignment(payLoad:any) :Observable<ApiResponse>{
		return this.Post('/rate-calculate-assignment', payLoad);
	}

	updateAssignmentDetails(payLoad:any):Observable<GenericResponseBase<string>>{
		return this.PutBulk('/assgmt/edit', payLoad);
	}

	getCustomStaffinfgAgency(payload:any){
		return this.Post('/staf/broadcast-eligible-agencies', payload);
	}
	getAssignmentRevisionFields():Observable<GenericResponseBase<IDropdownItems[]>>{
		return this.GetAll<GenericResponseBase<IDropdownItems[]>>(`/assign-revision/revision-fields`);
	}

	calculateEstimateCost(payload:any){
		return this.Post('/assgmt-est-cost', payload);
	}

	poApprovedAmountOnEndDateChange(payload:assignmentSchedulePayload):Observable<GenericResponseBase<assignmentSchedulePayload>>{
		return this.Post('/assgmt-est-cost', payload);
	}

	assignmentRequistionData(workLocationId:number, laborCategoryId:number, jobCategoryId:number):Observable<GenericResponseBase<reqChanges>>{
		return this.GetAll<GenericResponseBase<reqChanges>>(`/rlib/req-details/${workLocationId}/${laborCategoryId}/${jobCategoryId}`);
	}
	terminationReasonSelection(id:string):Observable<GenericResponseBase<ITerminationReason>>{
		return this.GetAll<GenericResponseBase<ITerminationReason>>(`/trmrsn-id/${id}`);
	}

	assignmentWeekendingDay(assignmentId:string|number|null|undefined):Observable<GenericResponseBase<AssignmentData>>{
		return this.GetAll<GenericResponseBase<AssignmentData>>(`/assgmt/select-time-exp/${assignmentId}`);
	}

	assignmentWeekendingDaysList(sectorId:number|string, assignmentStartDate:number|string|Date, assignmentEndDate: number|string|Date)
	:Observable<GenericResponseBase<IDropdownItems[]>>{
		return this.GetAll<GenericResponseBase<IDropdownItems[]>>(`/assgmt/select-weekend/${sectorId}/${assignmentStartDate}/${assignmentEndDate}`);
	}

	getTenureLimit(startDate: any, tenureLimit: any, tenureLimitTypeId: any){
		return this.GetAll(`/assign-tenure/${startDate}/${tenureLimit}/${tenureLimitTypeId}`);
	}

	getTenureValidation(payload: assignmentTanureDetails, controlName: string): Observable<GenericResponseBase<null>>{
		return this.Post(controlName=="AssignmentStartDate" ?
			`/assgmt/val-ten-start` :
			'/assgmt/val-ten-end', payload);
	}

	getLiRequestData(ukey: string):Observable<GenericResponseBase<RequestDetail>>{
		return this.GetAll<GenericResponseBase<RequestDetail>>(`/lireq-ukey/${ukey}`);
	}

}
