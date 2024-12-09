/* eslint-disable @typescript-eslint/prefer-includes */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { controltype } from './common-constants/controltypes';
import { Store } from '@ngxs/store';
import { AdvanceFilterState } from '@xrm-core/store/states/advance-filter.state';
import { SmartSearchState } from '@xrm-core/store/states/smart-search.state';
import { AdvanceFilterSet } from '@xrm-core/store/actions/advance-filter.action';
import { SmartSearchSet } from '@xrm-core/store/actions/smart-search.action';
import { magicNumber } from './common-constants/magic-number.enum';
@Injectable({
	providedIn: 'root'
})
export class SmartSearchService {
	public controltype = controltype;
	public AdvanceFilterPersistencey$!: Observable<any[]>;
	public SmartSearchPersistencey$!: Observable<any[]>;
	constructor(private store: Store) {
		this.AdvanceFilterPersistencey$ = this.store.select(AdvanceFilterState.get_AdvanceFilter);
		this.SmartSearchPersistencey$ = this.store.select(SmartSearchState.get_SmartSearch);
	}
	public needtosearch = new BehaviorSubject<any>(null);
	_needtosearch = this.needtosearch.asObservable();
	private unsubscribe$ = new Subject<void>();

	ApplyAdvanceFilterSmartSearch(entityId: any) {
		let SelectedFilterData, selectTextsearch,
			needToTriggerAF: boolean = true,
			needToTriggerSE: boolean = true;
		this.SmartSearchPersistencey$.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data: any) => {
				if (data.search && data.search != '' && data.key == entityId && needToTriggerSE) {
					selectTextsearch = data.search;
					this.store.dispatch(new SmartSearchSet({ key: entityId, search: data.search }));
					needToTriggerSE = false;
				}
			});
		this.AdvanceFilterPersistencey$.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data: any) => {
				if (needToTriggerAF) {
					const af = data.filter((a: any) =>
						a.key == entityId);
					if (af?.length > magicNumber.zero) {
						SelectedFilterData = af[0].advanceFilter;
						this.store.dispatch(new AdvanceFilterSet({ key: entityId,
							type: af[0].type, advanceFilter: SelectedFilterData, advanceFilterFields: af[0].advanceFilterFields}));
					 needToTriggerAF = false;
					}
				}
			});
	}


	SmartSearch(text:any, allData:any){
		if (text != '' && text != null) {
			const searchData: any = [],
				val:any = [];
			let index:any;
			allData.forEach((a: any) => {

				for (const key in a) {
					if(key != "Id" && key != "UKey" && key != "LastModifiedOn" && key != "CreatedOn"){
						val.push(a[key]);
					}
				}
				val.forEach((b: any) => {
					if (typeof b == 'string') {
						if (b.toLowerCase().indexOf(text.toLowerCase()) > magicNumber.minusOne) {
							index = searchData.findIndex((x:any) =>
								x.UKey == a.UKey);
							if(index<magicNumber.zero){
								searchData.push(a);
							}
						}
					}
				});
			});

			return searchData;
		}
	}
	
	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
