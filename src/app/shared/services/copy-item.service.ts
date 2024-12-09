import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CopyItemService {

	public submitButtonClicked = new BehaviorSubject<any>(false);
	submitButtonClickedObs = this.submitButtonClicked.asObservable();

	// for source and destination in copy widget
	entityListForCopyItems: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	setEntityListForCopyItems(entityList: any) {
		this.entityListForCopyItems.next(entityList);
	}
	// for items in copy widgets
	itemListForCopyItems: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	setItemListForCopyItems(entityList: any) {
		this.itemListForCopyItems.next(entityList);

	}
	getItemListForCopyItems() {
		return this.itemListForCopyItems;
	}

	// on source change
	sourceId: Subject<any> = new Subject<any>();
	setSourceId(id: any) {
		this.sourceId.next(id);
	}
	getSourceId() {
		return this.sourceId.asObservable();
	}

	dialogData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	setDialogData(newData: any) {
		this.dialogData.next(newData);
	}
	getDialogData() {
		return this.dialogData.asObservable();
	}

	Changes: Subject<any> = new Subject<any>();
	setChanges(changes: any) {
		this.Changes.next(changes);
	}
	getChanges() {
		return this.Changes.asObservable();
	}

}
