import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericService } from '@xrm-shared/services/generic.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ApiResponse } from '../../core/models/responseTypes/api-response.model';
import { CultureFormat } from './Localization/culture-format.enum';
import { LocalizationService } from './Localization/localization.service';
import { magicNumber } from './common-constants/magic-number.enum';
import { GlobalService } from './global.service';

@Injectable({
	providedIn: 'root'
})
export class GridViewService extends GenericService {

	private unSubscribe$ = new Subject<void>();
	public searchreset = new BehaviorSubject<any>(null);
	searchreset1 = this.searchreset.asObservable();


	private updatedColumnOptions = new BehaviorSubject<any[]>([]);
	getUpdatedColumnOptions = this.updatedColumnOptions.asObservable();

	private clearCheckboxSubject = new Subject<void>();
	clearCheckbox$ = this.clearCheckboxSubject.asObservable();

	constructor(
		private http: HttpClient,
		private globalSer: GlobalService,
		private localizationService: LocalizationService
	) {
		super(http);
	}


	triggerClearCheckbox() {
		this.clearCheckboxSubject.next();
	}

	resetColumnOption(data: any) {
		data.userId = this.globalSer.getXUIDValue();
		return this.PutBulk("/xrm-user-grid-detail/reset", data);
	}

	updateColumnDataAfterReorder(data: any): Observable<ApiResponse> {
		return this.PutBulk("/xrm-user-grid-detail/range", data);
	}

	updateSorting(data: any): Observable<ApiResponse> {
		return this.PutBulk("/xrm-user-grid-sort/edit", data);
	}

	getColumnOption(entityId: number | null, entityType: string | null = null, menuId: number | null = null) {
		const payload = {
			userId: this.globalSer.getXUIDValue(),
			xrmEntityId: entityId,
			entityType: entityType,
			menuId: menuId
		};

		return this.http.post<ApiResponse>(`${this.baseUrl}/xrm-user-grid-detail/grid`, payload, {
			withCredentials: true
		}) as Observable<GenericResponseBase<GridColumnCaption[]>>;
	}

	getPageSizeforGrid(entityId: number, menuId: number | null = null) {
		const userId = this.globalSer.getXUIDValue();
		return this.GetAll<any>(`/xrm-user-grid-config/${userId}/${entityId}/${menuId}`);
	}

	updatePageNumber(data: any) {
		return this.PutBulk("/xrm-user-grid-config/edit", data);
	}

	getColumnOptionValue(entityId: number | null, entityType: string | null = null, menuId: number | null = null) {
		const userId = this.globalSer.getXUIDValue();
		if (!entityType)
			entityType = ' ';

		return this.GetAll<any>(`/xrm-user-grid-detail/${userId}/${entityId}/${entityType}/${menuId}`).pipe(map((res: any) => {
			res.Data.map((e: any) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
			return res;
		}));

	}

	advanceFilterFieldsGet(entityId: number, entityType: string | null): Observable<ApiResponse> {
		if (!entityType)
			entityType = ' ';

		return this.GetAll(`/xrm-entity-act-col-cap-user/entity-id-type/${entityId}/${entityType}`);
	}

	advanceFilterFieldsGetAll(entityId: number, entityType: string | null, menuId: number | null = null): Observable<ApiResponse> {
		if (!entityType)
			entityType = ' ';

		return this.GetAll(`/xrm-entity-act-col-cap-user/all-entity-id-type/${entityId}/${entityType}/${menuId}`);
	}


	callGetApi(endPoint: any): Observable<ApiResponse> {
		return this.GetAll<any>(endPoint);
	}

	/* pass the keys in the array for Yes/No put keys in YesNo array and for On/Off put the keys in OnOff array
		 and pass this object in your reshaper function */
	public reShaper(data: any[], reShaperKeysValueOnView: any) {
		return data.map((obj: any) => {
			const newObj = Object.assign({}, obj),
				keys = Object.keys(newObj);
			keys.forEach((key: string) => {
				if (typeof newObj[key] === 'boolean' && key !== 'Disabled') {
					if (reShaperKeysValueOnView.YesNo.length && reShaperKeysValueOnView.YesNo.includes(key)) {
						newObj[key] = newObj[key]
							? 'Yes'
							: 'No';
					} else if (reShaperKeysValueOnView.OnOff.length && reShaperKeysValueOnView.OnOff.includes(key)) {
						newObj[key] = newObj[key] ?
							'On' :
							'Off';
					}
				}
				if (obj.CreatedOn || obj.LastModifiedOn) {
					obj.CreatedOn = this.localizationService.TransformData(obj.CreatedOn, CultureFormat.DateFormat);
					obj.LastModifiedOn = this.localizationService.TransformData(obj.LastModifiedOn, CultureFormat.DateFormat);
				}
			});
			return newObj;
		});
	}


	updateColumnOptions(entityId: number | null, recorderedData: any[]) {
		let columnsData: any[] = [];
		this.getUpdatedColumnOptions.pipe(takeUntil(this.unSubscribe$)).subscribe((data: any) => {
			columnsData = data;
		});
		const index = columnsData.findIndex((x: any) =>
			x.entityId == entityId);
		if (index == Number(magicNumber.minusOne)) {
			columnsData.push({ entityId: entityId, recorderedData: recorderedData });
		} else {
			columnsData[index].recorderedData = recorderedData;
		}

		this.updatedColumnOptions.next(columnsData);
	}


	// eslint-disable-next-line max-params, max-len
	public getAdvFilterDropdownData(apiAddress: any, payload: any, isApiGateway: boolean = false) {
		apiAddress = `${this.baseUrl}/${apiAddress}`;

		return this.http.post<ApiResponse>(`${apiAddress}`, payload, {
			withCredentials: true
		}) as Observable<ApiResponse>;
	}

	public RenewToken(payload: any) {
		const apiAddress = `${this.baseUrl}/auth/renew-token`;
		return this.http.post<ApiResponse>(`${apiAddress}`, payload, {
			withCredentials: true
		}) as Observable<ApiResponse>;
	}

	public loadDropdownDataOnDemand(apiAddress: any, payload: any, isApiGateway: boolean = false) {
		apiAddress = `${this.baseUrl}/${apiAddress}`;

		return this.http.post<ApiResponse>(apiAddress, payload, {
			withCredentials: true
		}) as Observable<ApiResponse>;
	}

	public cancelloadDropdownDataOnDemandRequest() {
		this.unSubscribe$.next();
		this.unSubscribe$.complete();
		this.unSubscribe$ = new Subject<void>();
	}

}

