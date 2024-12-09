import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { FetchRevisionDetailsResponse, RevisionActionPay, RevisionData, StatusData, Timeresponse } from '@xrm-master/role/Generictype.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable, Subject, forkJoin, of, switchMap, takeUntil } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class RevisionService extends HttpMethodService{

	constructor(private http: HttpClient, private eventLog: EventLogService, private localization : LocalizationService) {
		super(http);
	}

	public getRevisionById(uKey: string): Observable<RevisionData> {
		return this.GetAll(`/assign-revision-uKey/${uKey}`);
	}

	public submitRevisionPayload(payload: RevisionActionPay): Observable<GenericResponseBase<null>> {
		return this.Post(`/assgmt-rev-action`, payload);
	}

	updateEventLog(entityId: any, recordId: any) {
		this.eventLog.entityId=entityId;
		this.eventLog.recordId=recordId;
		this.eventLog.isUpdated.next(true);
	}

	public getTimeEntryDate(assignmentId: number|string): Observable<GenericResponseBase<Timeresponse>> {
		return this.GetAll(`/assgmt/select-time-exp/${assignmentId}`) as Observable<GenericResponseBase<Timeresponse>>;
	}

	compareTimeEntryDate(data: Date|null|undefined, revisedRateEffentiveDate: string|Date|null): string {
		try{
			if(data == null)
				return '';
			const date = new Date(this.localization.TransformDate(data)),
				revisedRateEffentiveDateNew = new Date(this.localization.TransformDate(revisedRateEffentiveDate));
			if(revisedRateEffentiveDateNew < date)
    	return 'TimeExpenseRecordFoundAfterDate';
    	return '';
		}
		catch(e){
			return '';
		}
	}
	private unsubscribe$ = new Subject<void>();
	public fetchRevisionDetails
	(uKey: string, shouldFetchTimeEntryDate: boolean, assingmentId:number|string|null): Observable<FetchRevisionDetailsResponse> {
		return this.getRevisionById(uKey).pipe(
		  takeUntil(this.unsubscribe$),
		  switchMap((response: RevisionData) => {
				const revisionObject = response,
				 timeEntry$ = shouldFetchTimeEntryDate
			  ? this.getTimeEntryDate(revisionObject?.RevisionDetails?.AssignmentId).pipe(takeUntil(this.unsubscribe$))
			  : of(null);

				// eslint-disable-next-line max-len
				return forkJoin({ timeResponse: timeEntry$ }).pipe(switchMap(({ timeResponse }: { timeResponse: GenericResponseBase<Timeresponse>|null }) => {
					this.sharedUpdateEventLog(revisionObject);
					const statusData = this.updateStatusData(revisionObject, assingmentId);
					return of({
				  revisionObject,
				  timeExpense: timeResponse?.Data??null,
				  statusData
					});
			  }));
		  })
		);
	  }

	  private sharedUpdateEventLog(revisionObject: RevisionData) {
		this.eventLog.recordId.next(revisionObject?.RevisionDetails?.Id);
		this.eventLog.entityId.next(XrmEntities.AssignmentRevision);
		this.eventLog.isUpdated.next(true);
	  }

	  private updateStatusData(revisionObject: RevisionData, assingmentId:number|string|null) {
		const statusData: StatusData = {
			items: []
		  };
		statusData.items = [
		  {
				title: 'Revision ID',
				titleDynamicParam: [],
				item: revisionObject.RevisionDetails.RevisionId,
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: '',
				linkParams: ''
		  }
		];
		if (!assingmentId) {
		  statusData.items.push({
				title: 'Assignment ID',
				titleDynamicParam: [],
				item: revisionObject.RevisionDetails.AssignmentCode,
				itemDynamicParam: [],
				cssClass: [''],
				isLinkable: true,
				link: '',
				linkParams: '#assignment'
		  });
		}
		statusData.items.push({
		  title: 'Revision Status',
		  titleDynamicParam: [],
		  item: revisionObject.RevisionDetails.StatusName,
		  itemDynamicParam: [],
		  cssClass: [''],
		  isLinkable: false,
		  link: '',
		  linkParams: ''
		});
		return statusData;
	  }

}
