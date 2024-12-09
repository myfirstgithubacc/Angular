import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
export abstract class NorthwindService extends BehaviorSubject<GridDataResult> {
  public loading: boolean;
  private BASE_URL = 'https://localhost:5001/api/v1/LaborCategory/GetAllPaged';

  constructor(private http: HttpClient) {
    const emptyDataResult = {
      data: [],
      total: 0
    }
    super(emptyDataResult);
  }

  public query(state: any): void {
    let data = this.fetch(state).subscribe((x) => super.next(x));
    console.log("Akash ", data);
  }

  protected fetch(state: any): Observable<GridDataResult> {
    const queryStr = environment.APIURL + "/" + environment.APIVERSION + "/LaborCategory/GetAllPaged?PageSize=" + state.take + "&StartIndex=" + state.skip;
    this.loading = true;

    return this.http.get(queryStr).pipe(
      map(
        (response: any) =>
          <GridDataResult>{
            data: response["data"],
            total: parseInt(response["@odata.count"], 10),
          }
      ),
      tap(() => (this.loading = false))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService extends NorthwindService {
  constructor(http: HttpClient) {
    super(http);
  }

  queryAll(st?: any): Observable<GridDataResult> {
    const state = Object.assign({}, st);
    delete state.skip;
    delete state.take;

    return this.fetch(state);
  }
}
