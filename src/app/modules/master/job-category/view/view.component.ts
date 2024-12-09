import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { JobCategoryService } from 'src/app/services/masters/job-category.service';
import { NavigationPaths } from '../route-constants/routes-constant';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { JobCategory } from '@xrm-core/models/job-category.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent implements OnInit, OnDestroy {

	public jobCategory: JobCategory;
	private destroyAllSubscribtion$ = new Subject<void>();
	public sectorId: number;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.View;
	public entityId: number = XrmEntities.JobCategory;

	// eslint-disable-next-line max-params
	constructor(
    private activatedRoute: ActivatedRoute,
    private route: Router,
    public udfCommonMethods: UdfCommonMethods,
	private toasterService: ToasterService,
	private jobCategoryService: JobCategoryService
	) {}

	ngOnInit(): void {
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getJobCategoryById(param['id']);
					}
					return of(null);
				}),
				catchError(() => {
					return EMPTY;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();
	}

	private getJobCategoryById(id: string) {
		this.jobCategoryService.getJobCategoryById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<JobCategory>) => {
				if(isSuccessfulResponse(data)){
					this.jobCategory = data.Data;
					this.sectorId = this.jobCategory.SectorId;
					this.recordUKey = this.jobCategory.Ukey ?? '';
					this.jobCategoryService.jobCategoryData.next({'Disabled': this.jobCategory.Disabled, 'RuleCode': this.jobCategory.JCCode, 'Id': this.jobCategory.Id});
				}
			});
	}

	navigateToList() {
		this.route.navigate([NavigationPaths.list]);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}

