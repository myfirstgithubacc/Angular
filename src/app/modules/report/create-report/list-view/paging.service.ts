import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { toODataString, State } from "@progress/kendo-data-query";
import { Observable, BehaviorSubject, of } from "rxjs";
import { map, tap } from "rxjs/operators";
// import { Product } from "./model";

export abstract class NorthwindService extends BehaviorSubject<any[]> {
	public loading: boolean = false;

	private BASE_URL = "https://demos.telerik.com/kendo-ui/service-v4/odata/";

	constructor(private http: HttpClient, protected tableName: string) {
		super([]);
	}

	public query(state: State, data:any, totalItemCount:number): void {
		this.fetch(this.tableName, state, data, totalItemCount).subscribe((x) =>
			super.next(x));
	}

	protected fetch(tableName: string, state: State, data:any, totalItemCount:number) {
		const queryStr = `${toODataString(state)}&$count=true`;
		this.loading = true;

		if(totalItemCount){

			return of({
				data: data,
				total: totalItemCount
			});
		}
		else{
			return this.http.get(`${this.BASE_URL}${tableName}?${queryStr}`).pipe(
				map((response: any) =>
						<any>
						{
							data: response['value'],
							total: parseInt(response['@odata.count'], 10)
						}
						
				),
				tap(() => (this.loading = false))
			);
		}
		
	}
}

@Injectable()
export class CategoriesService extends NorthwindService {
	constructor(http: HttpClient) {
		super(http, "Categories");
	}
}
