import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { magicNumber } from './common-constants/magic-number.enum';
import { HttpMethodService } from './http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActionItemsList, FavoritesList } from 'src/app/modules/extras/landing-page/constants/constants';

@Injectable({
	providedIn: 'root'
})
export class FavoritesService extends HttpMethodService{

	getFavorites(){
		return this.GetAll<GenericResponseBase<FavoritesList[]>>('/fav');
	}

	submitFavorites(entityId: {entityId : number}){
		return this.Post('/fav/submit-data', entityId);
	}

	getMyActionItems(){
		return this.GetAll<GenericResponseBase<ActionItemsList[]>>('/MyActionItem/select-actions');
	}

	getCountOfEachActionItem(api : string)
	{
		const list = api.split('/').slice(magicNumber.three),
			apiUrl = list.join('/');

		return this.http.get<ApiResponse>(`${environment.GATEWAY_URL}/${environment.APIVERSION}/${apiUrl}`, { withCredentials: true });
	}

	constructor(private http: HttpClient) {
		super(http);
	}
}
