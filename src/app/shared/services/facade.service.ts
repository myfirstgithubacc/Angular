import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth } from 'src/app/auth/models/auth.model';
import { environment } from 'src/environments/environment';
export const skipLoader = new HttpContextToken<boolean>(() =>
	false);

@Injectable({
	providedIn: 'root'
})
export class FacadeService {
	constructor(private http: HttpClient) {

	}

	getData(isLoaderskip?: boolean): Observable<Auth> {
		return this.http.get<Auth>(`${environment.APIURL }/todos1`, {
			context: new HttpContext().set(skipLoader, isLoaderskip)
		});
	}

}
