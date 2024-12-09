import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({selector: 'app-load-on-demand',
	templateUrl: './load-on-demand.component.html',
	styleUrls: ['./load-on-demand.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadOnDemandComponent {

	public searchForm: FormGroup;
	public advApiAddress: string ='LaborCategory/GetAdvanceSearchDropDownValue';


	constructor(private formBuilder: FormBuilder) {
		this.searchForm = this.formBuilder.group({
			LaborCategoryName1: [null],
			SectorName1: [null],
			LaborCategoryName2: [null],
			SectorName2: [null]
		});
	}


}
