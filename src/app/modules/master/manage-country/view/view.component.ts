import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { ManageCountry } from '@xrm-core/models/manage-country.model';
import { ManageCountryService } from 'src/app/services/masters/manage-country.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { NavigationPaths } from '../navigation-paths/NavigationPaths';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {

	public currentRecord: ManageCountry;
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
   		private activatedRoute: ActivatedRoute,
    	private route: Router,
		private toasterService: ToasterService,
		private manageCountryService: ManageCountryService
	) {}

	ngOnInit(): void {

		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getManageCountryById(param['id']);
					}
					return of(null);
				}),
				catchError((error: Error) => {
					return EMPTY;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();
	}

	private getManageCountryById(id: string) {
		this.manageCountryService.getManageCountryById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<ManageCountry>) => {
				if(isSuccessfulResponse(response)){
					this.currentRecord = response.Data;
					this.manageCountryService.manageCountryData.next({'Disabled': this.currentRecord.Disabled, 'RuleCode': this.currentRecord.AutoGeneratedCode, 'Id': this.currentRecord.Id});
				}
			});
	}

	public redirectToList(){
		return this.route.navigate([`${NavigationPaths.list}`]);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
