import { Injectable } from '@angular/core';
import { AdvanceSearchComponent } from '@xrm-widgets';
import { BehaviorSubject } from 'rxjs';
import { magicNumber } from './magic-number.enum';

@Injectable({
	providedIn: 'root'
})
export class AdvanceSearchAutoApply {

	isCodeExecuted:boolean=false;
	public isCodeExec = new BehaviorSubject<boolean>(false);
	isCodeExecutedObs = this.isCodeExec.asObservable();

	constructor() {
		this.subscribeToCodeExec();
	  }

	public applyAdvSearchFilter(advanceSearch: AdvanceSearchComponent, formControls: string[], values: string[]) {
		const columnInfo: string[] = Object.keys(advanceSearch.filterForm.value),
		 checkControlName = formControls[0];
		if (!this.isCodeExecuted && columnInfo.length > Number(magicNumber.zero)) {
			const checkControls = advanceSearch.filterForm.contains(checkControlName);

			if (checkControls) {
				formControls.forEach((formControl, index) => {
					const value = values[index];
					columnInfo.forEach((element: string) => {
						if (advanceSearch.formData[element] !== undefined) {
							advanceSearch.filterForm.get(element)?.setValue(advanceSearch.formData[element]);
						}
						if (element.includes(formControl)) {
							advanceSearch.filterForm.get(element)?.setValue([{ Text: value, Value: value }]);
						}
					});
				});
				advanceSearch.applyFilter('');
			}
			this.isCodeExecuted=true;
		}
	}

	public setCodeExec(value: boolean) {
		this.isCodeExec.next(value);
	  }

	private subscribeToCodeExec() {
		this.isCodeExecutedObs.subscribe((value) => {
		  if (value) {
				this.isCodeExecuted = true;
		  }
		  else{
				this.isCodeExecuted = false;
		  }
		});
	  }


	public applyAdvSearchDateFilter( advanceSearch: AdvanceSearchComponent, formControl: string, fromDate: Date, toDate: Date) {
		const columnInfo: string[] = Object.keys(advanceSearch.filterForm.value),
		 checkControlName = formControl;
		if (!this.isCodeExecuted && columnInfo.length > Number(magicNumber.zero)) {
			const checkControls = advanceSearch.filterForm.contains(checkControlName);

			if (checkControls) {

				columnInfo.forEach((element: string) => {

					if (advanceSearch.formData[element] !== undefined) {
						advanceSearch.filterForm.get(element)?.setValue(advanceSearch.formData[element]);
					}
					if (element.includes(formControl)) {
						if (!element.endsWith('S')) {
							advanceSearch.filterForm.get(element)?.setValue(toDate);
						} else {
							advanceSearch.filterForm.get(element)?.setValue(fromDate);
						}
					}
				});
				advanceSearch.applyFilter('');
			}
			this.isCodeExecuted=true;
		}
	}

}


