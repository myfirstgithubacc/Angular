import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpMethodService } from './http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { magicNumber } from './common-constants/magic-number.enum';

@Injectable({
	providedIn: 'root'
})
export class HeaderService extends HttpMethodService {
	public isMenuVisible = new BehaviorSubject<boolean>(false);
	public profilePicture = new BehaviorSubject<number>(magicNumber.zero);

	private isDropdownOpenSubject = new BehaviorSubject<boolean>(false);
	isRecentAlertListOpen$ = this.isDropdownOpenSubject.asObservable();

	private isUGDropdownOpenSubject = new BehaviorSubject<boolean>(false);
	isUserGuideListOpen$ = this.isUGDropdownOpenSubject.asObservable();

	private isProfileDropdownOpenSubject = new BehaviorSubject<boolean>(false);
	isProfileListOpen$ = this.isProfileDropdownOpenSubject.asObservable();

	public profilePictureObs =
		this.profilePicture.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	public getUserGuide()
	{
		return this.GetAll<ApiResponse>('/usr-guide/get-guide');
	}

	public getClientProfilePicture(id: number | string): Observable<GenericResponseBase<string>>{
		return this.Post('/dms/get-doc', {Id: id});
	}

	removeClientProfilePicture(payload : FormData){
		return this.Post('/UserDetail-rmv/rmv-profile', payload);
	}

	public downloadUserGuide(id:number) {
		const response = this.http.post(`${this.baseUrl}/docconfig`, {Id: id}, { responseType: 'blob', withCredentials: true, observe: 'response' });
		return response;
	}

	public uploadUserProfilePicture(payload: FormData): Observable<GenericResponseBase<number>>{
		return this.Post('/UserDetail/upld-profile', payload);
	}

	public setDropdownState(dropdownType: string, isOpen: boolean) {
		if (dropdownType === 'recentAlert') {
			  this.isDropdownOpenSubject.next(isOpen);
			  if (isOpen) {
				this.isUGDropdownOpenSubject.next(false);
				this.isProfileDropdownOpenSubject.next(false);
			  }
		} else if (dropdownType === 'userGuide') {
			  this.isUGDropdownOpenSubject.next(isOpen);
			  if (isOpen) {
				this.isDropdownOpenSubject.next(false);
				this.isProfileDropdownOpenSubject.next(false);
			  }
		} else if (dropdownType === 'profile') {
			  this.isProfileDropdownOpenSubject.next(isOpen);
			  if (isOpen) {
				this.isDropdownOpenSubject.next(false);
				this.isUGDropdownOpenSubject.next(false);
			  }
		}
	  }
}
