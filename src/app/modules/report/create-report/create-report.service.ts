import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ReportService {
	public baseDataEntity = new BehaviorSubject<any>(null);
	public buildDataEntity = new BehaviorSubject<any>(null);

	setBaseDataEntity(data: any) {
		this.baseDataEntity.next(data);
	}
	getBaseDataEntity() {
		return this.baseDataEntity.asObservable();
	}
	setBuildDataEntity(data: any) {
		this.buildDataEntity.next(data);
	}
	getBuildDataEntity() {
		return this.buildDataEntity.asObservable();
	}
}
