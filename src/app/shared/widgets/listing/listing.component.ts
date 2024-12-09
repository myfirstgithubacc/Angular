import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { JSONData } from '@xrm-shared/models/list-view.model';

@Component({selector: 'app-listing',
	templateUrl: './listing.component.html',
	styleUrls: ['./listing.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingComponent {
	 @Input() listingData: ListingData; // not required 

	@Input() gridData: GridData;

	@Input() columnOptions: ColumnOptions;

	 @Input() actionSet: ActionSet;

	@Input() JsonData: JSONData[];
    @Input() placeholder: string;

	@Input() buttonNameSearch: string;

	  @Input() buttonName: string;

	@Input() buttonIcon: string;

	@Input() addBtnName: string;

	@Input() tabOptions: TabOptions;

	@Input() gridSelectedBy: string;

	@Output() OnFilter: EventEmitter<any>;

	@Output() OnSearch: EventEmitter<any>;

	@Output() OnClick: EventEmitter<any>;

	public path: string = "/xrm/temp/listing-add-edit";

	constructor(private router: Router, private cdr: ChangeDetectorRef) {
		this.OnFilter = new EventEmitter<any>();
		this.OnSearch = new EventEmitter<any>();
		this.OnClick = new EventEmitter<any>();
	}


	onSearch(text: string) {
		this.OnSearch.emit(text);
	}

	selectedFilter(formValue: any) {
		this.OnFilter.emit(formValue);
	}

	navigate() {
		this.router.navigate(['xrm/master/labor-category/add-edit']);
	}

	Click(isClicked: any) {
		this.OnClick.emit(isClicked);
	}

}
interface ListingData {
  // Define the structure of listingData here
}

interface GridData {
  // Define the structure of gridData here
}

interface ColumnOptions {
  // Define the structure of columnOptions here
}

interface ActionSet {
  // Define the structure of actionSet here
}

interface TabOptions {
  // Define the structure of tabOptions here
}
