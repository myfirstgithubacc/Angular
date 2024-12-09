import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
	providedIn: 'root'
})
export class ConfirmationpopupService {
	onconfirm: BehaviorSubject<any>;
	constructor() {
		this.onconfirm = new BehaviorSubject<any>(null);
	}
	setonconfirm(isconfirm:any) {
		return this.onconfirm.next(isconfirm);
	}
	getonconfirm():Observable<any>{
		return this.onconfirm.asObservable();
	}
}
