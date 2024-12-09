import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { BusinessClassificationService } from 'src/app/services/masters/business-classification.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { BusinessClassification } from '@xrm-core/models/business-classification';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { NavigationPaths } from '../constants/routes-constants';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent implements OnInit, OnDestroy {

	public recordStatus: string;
	public businessClassification: BusinessClassification;
	public entityId: number = XrmEntities.BusinessClassification;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private businessClassificationService: BusinessClassificationService,
		private route: Router,
		private toasterService: ToasterService
	) {
	}

	ngOnInit(): void {
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getBusinessClassificationyId(param['id']);
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

	private getBusinessClassificationyId(id: string) {
		this.businessClassificationService.getBusinessClassificationById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<BusinessClassification>) => {
				if (isSuccessfulResponse(data)) {
					this.businessClassification = data.Data;
					this.businessClassificationService.businessClassificationData.next({ 'Disabled': this.businessClassification.Disabled, 'RuleCode': this.businessClassification.Code, 'Id': this.businessClassification.Id });
				}
			});
	}

	public listNavigation() {
		return this.route.navigate([`${NavigationPaths.list}`]);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
