import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { BehaviorSubject, Observable, map, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonService } from './common.service';
import { IExportDataModel } from '@xrm-shared/models/export-data.model';

@Injectable({
	providedIn: 'root'
})
export class GridService extends BehaviorSubject<GridDataResult> {
	private unsubscribe$ = new Subject<void>();
	baseGatewayUrl = `${environment.GATEWAY_URL}/${environment.APIVERSION}/`;

	constructor(private http: HttpClient, private commonSrv: CommonService) {
		const emptyDataResult = {
			data: [],
			total: 0
		};
		super(emptyDataResult);
	}

	public query(apiAddress: string, payload: any): void {
		this.fetch(apiAddress, payload).pipe(takeUntil(this.unsubscribe$))
			.subscribe((x) =>
				super.next(x));
	}

	public exportData(payload: IExportDataModel, fileName : string): void {
		const url = `${this.baseGatewayUrl}pagination/export`;
		this.http.post(url, payload, { withCredentials: true, responseType: 'blob' })
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: any) => {
				this.commonSrv.downloadFile(res, fileName);
			});
	}

	protected fetch(apiAddress: string, payload: any): Observable<GridDataResult> {
		const url = this.baseGatewayUrl + apiAddress;

		return this.http.post(url, payload, { withCredentials: true }).pipe(map((response: any) =>
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			<GridDataResult>{
				data: response.Data.Data,
				total: response.Data.Count
			}));
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
