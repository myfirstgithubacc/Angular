/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class WidgetServiceService {
	public listViewData = new BehaviorSubject<any>({});
	listViewDataObs = this.listViewData.asObservable();

	public updateForm = new BehaviorSubject<boolean>(false);
	updateFormObs = this.updateForm.asObservable();

	public reloadJson = new BehaviorSubject<boolean>(false);
	reloadJson1 = this.reloadJson.asObservable();

	public addMoreFormData = new BehaviorSubject<any>({});
	addMoreFormDataObs = this.addMoreFormData.asObservable();

	public dataPersist = new BehaviorSubject<string>('');
	public dataPersistObs = this.dataPersist.asObservable();

	formData: any;


	setFormData(data: any) {
		this.formData = data;
	}

	getFormData() {
		return this.formData;
	}

}
