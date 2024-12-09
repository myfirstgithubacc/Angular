
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import {Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DayInfo } from '../service/dayInfo';
import { ShiftDetailsGetDto } from './my-event.interface';

@Injectable({
	providedIn: 'root'
})
export class ShiftScedulerService extends HttpMethodService{

	constructor(private http: HttpClient) {
		super(http);
	}
	 public getSchedulerBasedOnAssignemnt(assgnId:number|string, year:number, month:number): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/schdl-dt/schedate-by-assignid-yrmonth/${assgnId}/${year}/${month}`);
	 }

	 public getEventByRecordId(recordId:number): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/contr-event-id/${recordId}`);
	 }

	public generateDaysInfo(data: ShiftDetailsGetDto): DayInfo[] {
		const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			dayMap: Record<string, keyof ShiftDetailsGetDto> = {
		  Sun: 'Sun',
		  Mon: 'Mon',
		  Tue: 'Tue',
		  Wed: 'Wed',
		  Thu: 'Thu',
		  Fri: 'Fri',
		  Sat: 'Sat'
			};

		return days.map((day) => {
		  const dayKey = day.substring(magicNumber.zero, magicNumber.three);
		  return { day, isSelected: data[dayMap[dayKey]] as boolean };
		});
	}}
