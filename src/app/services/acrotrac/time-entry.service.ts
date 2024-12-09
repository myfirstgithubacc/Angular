import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApproveDecline } from '@xrm-core/models/acrotrac/expense-entry/view-review/approve-decline';
import { PayloadItem, WeekendingObject } from '@xrm-core/models/acrotrac/time-adjustment/adjustment-interface';
import { TimeConfigDetails } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-config-details';
import { TimeEntryAddEdit } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-add-edit';
import { TimeEntryConfigDetails } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-config-details';
import { TimeEntryCoreData } from '@xrm-core/models/acrotrac/time-entry/common-interface/common-core-data';
import { TimesheetStatus } from '@xrm-core/models/acrotrac/time-entry/common-interface/time-sheet-status';
import { WeekendingSettings } from '@xrm-core/models/acrotrac/time-entry/common-interface/weekending-settings';
import { ExpandedTimeSheetDetails } from '@xrm-core/models/acrotrac/time-entry/expanded-time-sheet-model';
import { IDropdown } from "@xrm-shared/models/common.model";
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AssignmentDetail } from 'src/app/modules/acrotrac/common/view-review/approve-decline.model';
import { TimeEntryStatus } from 'src/app/modules/acrotrac/Time/enum-constants/enum-constants';
import { GetMealBreakResponse, TimeAdjResponse, timeAdjustConst } from 'src/app/modules/acrotrac/Time/timesheet/adjustment-manual/enum';
import { NavigationPaths } from 'src/app/modules/acrotrac/Time/timesheet/route-constants/route-constants';
import { TimeSheetStatus } from '@xrm-core/models/acrotrac/common/time-sheet-status';
import { TimeEntryUkeyResponse } from '@xrm-core/models/acrotrac/time-entry/common-interface/common-time-entry-details';
@Injectable({
	providedIn: 'root'
})
export class TimeEntryService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}
	public dataHold = new BehaviorSubject<TimeEntryCoreData | null>(null);
	public dataRelease = this.dataHold.asObservable();
	updateHoldData(newData: TimeEntryCoreData | null) {
		if(newData) {
			const currentData = this.dataHold.getValue() ?? {},
				updatedData = { ...currentData, ...newData };
			this.dataHold.next(updatedData);
		} else {
			this.dataHold.next(null);
		}
	}

	getTimeEntryByUkey(Ukey: string): Observable<ApiResponse> {
		return this.Get<ApiResponse>('/time-ukey', Ukey);
	}

	getTimeReviewByUkey(Ukey: string): Observable<ApiResponse> {
		return this.Get<ApiResponse>('/time-review-ukey', Ukey);
	}

	submitTimeEntry(payload: TimeEntryAddEdit): Observable<GenericResponseBase<AssignmentDetail[]>> {
		return this.Post('/time/save', payload);
	}

	updateTimeEntry(payload: TimeEntryAddEdit): Observable<GenericResponseBase<AssignmentDetail[]>> {
		return this.Put('/time/edit', payload);
	}

	submitApproveDecline(payload: ApproveDecline[]): Observable<GenericResponseBase<AssignmentDetail[]>> {
		return this.PutBulk('/Time-review', payload);
	}

	getTimeSheetByUkey(Ukey: string): Observable<TimeEntryUkeyResponse> {
		return this.Get('/time/get-meal-details', Ukey);
	}

	getTimeEntryDetailsByUkey(Ukey:string):Observable<GenericResponseBase<ExpandedTimeSheetDetails[]>>{
		return this.Get('/time/time-detail', Ukey);
	}

	getCalculatedTimeEntryDetails(payload: TimeEntryAddEdit):Observable<GenericResponseBase<ExpandedTimeSheetDetails[]>>{
		return this.Post('/time/calc-time-detail', payload);
	}

	massApproveDeclineTimeSheet(payload: PayloadItem[]): Observable<GenericResponseBase<null>> {
		return this.PutBulk('/time-mass-review', payload);
	}

	getTimesheetConfigDetails(assignmentId: number, weekendingDate: string): Observable<GenericResponseBase<TimeConfigDetails>> {
		const payload: TimeEntryConfigDetails = {
			'AssignmentId': assignmentId,
			'WeekendingDate': weekendingDate,
			'toJson': function() {
				return JSON.stringify(this);
			}
		};
		return this.Post(`/time/get-time-config/${payload.AssignmentId}/${payload.WeekendingDate}`, payload);
	}

	getTimesheetStatus(
		{AssignmentId, WeekendingDate}: {AssignmentId: {Value:number}, WeekendingDate:IDropdown},
		StartPoint: WeekendingSettings
	): Observable<string> {
		if (StartPoint.Action?.includes("time-adjustment")) {
			return this.navigateToAdjustment({AssignmentId, WeekendingDate}, StartPoint);
		}

		const payload: TimeEntryConfigDetails = {
			'AssignmentId': AssignmentId?.Value,
			'WeekendingDate': WeekendingDate?.Value,
			'toJson': function() {
				// Implement your JSON conversion logic here...
				return JSON.stringify(this);
			}
		},
			responsee: Observable<string> =
		this.Post(`/time/get-time-status/${payload.AssignmentId}/${payload.WeekendingDate}`, payload)
			.pipe(map((res: GenericResponseBase<unknown>) => {
				if (!res.Succeeded) {
					return '';
				}

				const Data = res.Data as TimeSheetStatus;

				if (Data.StatusId === Number(magicNumber.zero)) {
					return NavigationPaths.addEdit;
				}

				if (StartPoint.RouteOrigin === 'List') {
					return this.handleListRoute(StartPoint, Data);
				}

				if (StartPoint.RouteOrigin === 'SideBar' && StartPoint.Action === 'addedit') {
					return this.handleSideBarRoute(Data);
				}

				return NavigationPaths.addEdit;
			}));

		return responsee;
	}

	private handleListRoute(StartPoint: WeekendingSettings, Data: TimesheetStatus): string {
		switch (StartPoint?.Action) {
			case 'view':
				return `/xrm/time-and-expense/timesheet/${StartPoint?.Action}/${Data?.Ukey}`;
			case 'addedit':
				return `${NavigationPaths.addEdit}/${Data?.Ukey}`;
			case 'adjust-add-edit':
				return `${NavigationPaths.timeAdjustmentAddEdit}/${Data?.Ukey}`;
			case 'review':
				return this.handleReviewAction(Data);
			default:
				return NavigationPaths.addEdit;
		}
	}

	private handleReviewAction(Data: TimesheetStatus): string {
		if (Data?.StatusId !== Number(TimeEntryStatus.Draft) && Data?.StatusId !== Number(TimeEntryStatus.Declined)) {
			return `${NavigationPaths.review}/${Data?.Ukey}`;
		} else {
			return `/xrm/time-and-expense/timesheet/view/${Data?.Ukey}`;
		}
	}

	private handleSideBarRoute(Data: TimesheetStatus): string {
		if (Data?.StatusId === Number(TimeEntryStatus.Draft) || Data?.StatusId === Number(TimeEntryStatus.Declined)) {
			return `${NavigationPaths.addEdit}/${Data?.Ukey}`;
		} else {
			return `/xrm/time-and-expense/timesheet/view/${Data?.Ukey}`;
		}
	}

	navigateToAdjustment({ AssignmentId, WeekendingDate }: WeekendingObject, StartPoint: WeekendingSettings): Observable<string> {
		const assignmentIdValue = AssignmentId.Value,
			weekendingDateValue = WeekendingDate.Value,
			url = `/tadj/weekending/${assignmentIdValue}`,
			responsee: Observable<string> = this.Get<ApiResponse>(url, weekendingDateValue).pipe(map((res: ApiResponse) => {

				if (res.Succeeded) {
					const Data = res.Data;

					if (Data?.StatusId === magicNumber.zero) {
						return NavigationPaths.addEdit;
					}

					if (StartPoint.RouteOrigin === 'List' && StartPoint.Action === 'time-adjustment-view') {
						return `/xrm/time-and-expense/timesheet/${StartPoint.Action}/${Data?.UKey}`;
					} else if (StartPoint.RouteOrigin === 'List' && StartPoint.Action === 'time-adjustment-review') {
						if (Data?.StatusId == timeAdjustConst.Submitted || Data?.StatusId == timeAdjustConst.ReSubmitted
							|| Data?.StatusId == timeAdjustConst.PartiallyApproved) {
							return `${NavigationPaths.timeAdjustmentReview}/${Data?.UKey}`;
						} else {
							return `${NavigationPaths.timeAdjustmentView}/${Data?.UKey}`;
						}
					}
					else if (StartPoint.RouteOrigin === 'List' && StartPoint.Action === 'adjust-add-edit') {
						return `${NavigationPaths.timeAdjustmentAddEdit}/${Data?.Ukey}`;
					}
					else {
						return NavigationPaths.list;
					}
				} else {
					return '';
				}
			}));

		return responsee;
	}

	getRecentTimesheetEntry(assignmentId: number, weekendingDate: string): Observable<GenericResponseBase<TimeEntryAddEdit>> {
		const payload: TimeEntryConfigDetails = {
			'AssignmentId': assignmentId,
			'WeekendingDate': weekendingDate,
			'toJson': function() {
				// Implement your JSON conversion logic here...
				return JSON.stringify(this);
			}
		};
		return this.Post(`/time/get-recent-time-copy/${payload.AssignmentId}/${payload.WeekendingDate}`, payload);
	}
	getTimeAdjustBasedUkey(Url:string, Ukey: string): Observable<TimeAdjResponse> {
		return this.Get(`${Url}`, Ukey);
	}

	getMealBreakDataBasedOnAssigId(assignmentid:number, weekeningdate:string): Observable<GetMealBreakResponse>{
		return this.GetAll(`/rmbc/mealby-assign-weekending/${assignmentid}/${weekeningdate}`);
	}

}
