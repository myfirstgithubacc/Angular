import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { DayWiseDetail, ExpandedObj, SummaryDetail, WeeklyHoursObj } from '@xrm-core/models/acrotrac/time-adjustment/adjustment-interface';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TimeAdjustmentService } from 'src/app/services/acrotrac/time-adjustment.service';
import { ExpandedTimeSheetObj, convertApprovalObjData, timeAdjustConst } from '../adjustment-manual/enum';
import { TimeEntryDetailGrid } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-grid';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { TimeAdjustmentAddEdit } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-add-edit';

@Component({selector: 'app-expanded-timeadjustment',
	templateUrl: './expanded-timeadjustment.component.html',
	styleUrls: ['./expanded-timeadjustment.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpandedTimeadjustmentComponent implements OnInit, OnChanges, OnDestroy{

	@Input() public ukey: string = '';
	@Input() public currencyCode: string = '';
	@Input() public isAdjustmentManual: boolean = false;
	@Input() public adjusmentPayload: TimeAdjustmentAddEdit;
	@Input() public penaltyHoursObject: WeeklyHoursObj;
	@Input() public isExpandedDetails : boolean = false;
	@Input() public isInOut: boolean = false;
	@Input() public isPenaltyEnable: boolean = false;
	@Output() public onClose = new EventEmitter<void>();
	@Input('TimesheetPeriodRange') periodHeading: string = '';
	public isDisabled = false;
	public expandedObjList: ExpandedObj[] = [];
	private expandSheetData: ExpandedTimeSheetObj[];
	public totalSt: number;
	public totalOt: number;
	public totalDt: number;
	public totalPt: number;
	public totalTotalHours: number;
	public totalEstimatedCost: number;
	public expandDetailsBy = 'Index';
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
    private localizationService: LocalizationService,
    private timeAdjustService: TimeAdjustmentService,
	private cdr: ChangeDetectorRef
	) { }

	ngOnInit() {
	}

	ngOnChanges() {
		if(this.isAdjustmentManual){
			this.getExpandedTimeSheetAdjustmentData(this.convertApprovalObj(this.adjusmentPayload));
		}
		else{
			this.getExpandedTimesheetData(this.ukey);
		}
	}

	public getCurrencyValue(key: string): string {
		const dynamicParam: DynamicParam[] = [{ Value: this.currencyCode, IsLocalizeKey: false }];
		return this.localizationService.GetLocalizeMessage(key, dynamicParam);
	}

	private getExpandedTimesheetData(id: string){
		this.expandedObjList = [] as ExpandedObj[];
		this.timeAdjustService.getTimesheetSummaryData(id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: ApiResponse) => {
			this.expandSheetData = res.Data;
			if(	this.expandSheetData.length > Number(magicNumber.zero)){
				this.bindingExpandedData();
				this.cdr.detectChanges();
			}

		});
	}

	private getExpandedTimeSheetAdjustmentData(payload:any){
		this.expandedObjList = [] as ExpandedObj[];
		 this.timeAdjustService.getTimesheetAdjSummaryData(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: ApiResponse) => {
		   	this.expandSheetData = res.Data;
			   if(this.expandSheetData.length > Number(magicNumber.zero)){
				this.bindingExpandedData();
			}
			this.cdr.markForCheck();
		   });
	}

	public bindingExpandedData(){
		let index = magicNumber.zero;
		this.expandedObjList = this.expandSheetData.map((detail: any) => {
			const summObj: ExpandedObj = {
				Index: index++,
				Date: detail.Date,
				CostAccountingCodeId: detail.CostAccountingCodeId,
				CostAccountingName: detail.CostAccountingName,
				ShiftName: detail.ShiftName,
				St: magicNumber.zero,
				Ot: magicNumber.zero,
				Dt: magicNumber.zero,
				Pt: magicNumber.zero,
				TotalHours: magicNumber.zero,
				EstimatedCost: magicNumber.zero,
				entryTypeData: detail.DayWiseDetails
			};
			detail.DayWiseDetails.some((eachDay: DayWiseDetail) => {
				if (eachDay.EntryType === timeAdjustConst.Adjustment) {
					summObj.St = Number(eachDay.StHours.toFixed(magicNumber.two));
					summObj.Ot = Number(eachDay.OtHours.toFixed(magicNumber.two));
					summObj.Dt = Number(eachDay.DtHours.toFixed(magicNumber.two));
					summObj.Pt = Number(eachDay.PtHours.toFixed(magicNumber.two));
					summObj.TotalHours = Number(eachDay.TotalHours.toFixed(magicNumber.two));
					summObj.EstimatedCost = Number(eachDay.EstimatedCost.toFixed(magicNumber.two));
					return true;
				}

				if (eachDay.EntryType === 'Original') {
					summObj.St = Number(eachDay.StHours.toFixed(magicNumber.two));
					summObj.Ot = Number(eachDay.OtHours.toFixed(magicNumber.two));
					summObj.Dt = Number(eachDay.DtHours.toFixed(magicNumber.two));
					summObj.Pt = Number(eachDay.PtHours.toFixed(magicNumber.two));
					summObj.TotalHours = Number(eachDay.TotalHours.toFixed(magicNumber.two));
					summObj.EstimatedCost = Number(eachDay.EstimatedCost.toFixed(magicNumber.two));
				}
				return false;
			});
			summObj.entryTypeData = this.adjustEntryTypeData(detail.DayWiseDetails);
			return summObj;
		});
		this.calculateFooterTotalExpandedSheet(this.expandedObjList);
		this.cdr.detectChanges();
	}

	private adjustEntryTypeData(data: DayWiseDetail[]) {
		return data.map((item: DayWiseDetail) => {
			if(item.EntryType == 'Adjusted'){
				item.EntryType = 'Adjustment';
			};
			return item;
		});
	}


	private calculateFooterTotalExpandedSheet(list: ExpandedObj[]) {
		this.totalSt = list.reduce((acc: number, item: ExpandedObj) =>
			acc + (item.St || magicNumber.zero), magicNumber.zero);
		this.totalOt = list.reduce((acc: number, item: ExpandedObj) =>
			acc + (item.Ot || magicNumber.zero), magicNumber.zero);
		this.totalDt = list.reduce((acc: number, item: ExpandedObj) =>
			acc + (item.Dt || magicNumber.zero), magicNumber.zero);
		this.totalPt = list.reduce((acc: number, item: ExpandedObj) =>
			acc + (item.Pt || magicNumber.zero), magicNumber.zero);
		this.totalTotalHours = list.reduce((acc: number, item: ExpandedObj) =>
			acc + (item.TotalHours || magicNumber.zero), magicNumber.zero);
		this.totalEstimatedCost = list.reduce((acc: number, item: ExpandedObj) =>
			acc + (item.EstimatedCost || magicNumber.zero), magicNumber.zero);
	}

	convertApprovalObj(data: TimeAdjustmentAddEdit) {
		return {
			ukey: this.ukey,
			weekendingDate: data.WeekendingDate,
			assignmentId: Number(data.AssignmentId),
			timeAdjustmentDetails: this.updateTimeAdjDetail(data.TimeAdjustmentDetails),
			penaltyHourDetails: this.penaltyHoursObject
		};
	}

	closed(){
		this.onClose.emit();
	}

	updateTimeAdjDetail(data: any) {
		return data
			.filter((item: TimeEntryDetailGrid) =>
				item.ShiftId && item.CostAccountingCodeId)
			.map((item: TimeEntryDetailGrid) => {
				return {
					"id": item.Id,
					"costAccountingCodeId": item.CostAccountingCodeId,
					"shiftId": item.ShiftId,
					"jobTitle": item.JobTitle,
					"statusId": item.StatusId,
					"sunday": this.returnZeroIfNull(item.Sunday),
					"monday": this.returnZeroIfNull(item.Monday),
					"tuesday": this.returnZeroIfNull(item.Tuesday),
					"wednesday": this.returnZeroIfNull(item.Wednesday),
					"thursday": this.returnZeroIfNull(item.Thursday),
					"friday": this.returnZeroIfNull(item.Friday),
					"saturday": this.returnZeroIfNull(item.Saturday),
					"preFriday": null,
					"hoursTypeId": item.HoursTypeId
				};
			});
	}


	returnZeroIfNull(value: number | null | undefined) {
		return value ?? magicNumber.zero;
	}

	ngOnDestroy() {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
