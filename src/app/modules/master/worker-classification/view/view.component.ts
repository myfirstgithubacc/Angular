import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NavigationPaths } from '../route-constants/routes-constants';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { WorkerClassificationService } from 'src/app/services/masters/worker-classification.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { WorkerClassification } from '@xrm-core/models/worker-classification.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrl: './view.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent implements OnInit, OnDestroy{

	public entityId: number = XrmEntities.WorkerClassification;
	public WorkerClassificationDetails: WorkerClassification;
	private destroyAllSubscribtion$ = new Subject<void>();
	public isSubCategoryReq: boolean = false;

	constructor(
		private activatedRoute: ActivatedRoute,
		private workerClassificationServ: WorkerClassificationService,
  		private toasterServ: ToasterService,
		private router: Router
	) {
	}

	ngOnInit(){
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getWorkerClassificationnById(param['id']);
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

	private getWorkerClassificationnById(id:string){
		this.workerClassificationServ.getWorkerClassificationById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<WorkerClassification>) => {
				if(isSuccessfulResponse(data)){
					this.WorkerClassificationDetails= data.Data;
					if(this.getBooleanValue(data.Data.IsAdditionalDetailsRequired) === true){
						this.isSubCategoryReq = true;
					}
					this.workerClassificationServ.workerClassificationData.next({'Disabled': data.Data.Disabled, 'RuleCode': data.Data.Code, 'Id': data.Data.Id});
				}
			});
	}

	private getBooleanValue(value: string | boolean): boolean | string {
		if (value === 'Yes') {
			return true;
		} else if (value === 'No') {
			return false;
		} else {
			return value;
		}
	};

	public navigateToList(){
		this.router.navigate([NavigationPaths.list]);
	}

	ngOnDestroy(): void {
		this.toasterServ.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
