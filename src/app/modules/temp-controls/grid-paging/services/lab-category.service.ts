import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { BehaviorSubject, Observable, map } from 'rxjs';

export abstract class GridService extends BehaviorSubject<GridDataResult>
{
	//private BASE_URL = "https://odatasampleservices.azurewebsites.net/V4/Northwind/Northwind.svc/";
	private BASE_URL = 'https://xrmqa.acrocorp.com/XRMV2DevAPI/api/v1/LaborCategory/GetAllSearchPaged';

	constructor(private http: HttpClient, protected tableName: string) {
		const emptyDataResult = {
			data: [],
			total: 0
		};
		super(emptyDataResult);
	}

	public query(state: State): void {
		this.fetch(this.tableName, state).subscribe((x) =>
			super.next(x));
	}

	protected fetch(tableName: string, state: State): Observable<GridDataResult> {
		console.log("Akash State ", state);
		const index=Number(state.skip)/Number(state.take);
		let queryStr=`${this.BASE_URL}?PageSize=${state.take}&StartIndex=${index}`
		if(state.sort!=undefined && state.sort?.length>0)
		{
			queryStr = queryStr + "&CoulmnName=" + state.sort[0].field + "&Sorting="+ state.sort[0].dir;
		}		
		return this.http.get(queryStr,{ withCredentials: true }).pipe(
			map((response: any) =>
          <GridDataResult>{
          	data: response["Data"],
          	total: 365 //parseInt(response["@odata.Total"], 100)
          })
		);

		// return this.http.get(`${this.BASE_URL}${tableName}?${queryStr}`).pipe(
		// 	map((response: any) =>
    //       <GridDataResult>{
    //       	data: response["value"],
    //       	total: parseInt(response["@odata.count"], 10)
    //       }),
		// 	tap(() =>
		// 		(this.loading = false))
		// );
	}

}

@Injectable({
	providedIn: 'root'
})
export class LabCategoryService extends GridService {

	constructor(http: HttpClient) {
		super(http, "Products");
	}

	public queryForCategory({ CategoryID }: { CategoryID: number }, state?: State): void {
		this.query({
			...state,
			filter: {
				filters: [
					{
						field: "CategoryID",
						operator: "eq",
						value: CategoryID
					}
				],
				logic: "and"
			}
		});
	}
}
