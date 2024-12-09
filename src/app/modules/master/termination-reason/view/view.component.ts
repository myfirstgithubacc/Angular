
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { TerminationReason } from '@xrm-core/models/termination-reason';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { TerminationReasonService } from 'src/app/services/masters/termination-reason.service';
import { NavigationPaths } from '../route-constants/routes-constants';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent implements OnInit, OnDestroy{

	public entityId: number = XrmEntities.TerminationReason;
	public terminationDetails: TerminationReason;
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private activatedRoute: ActivatedRoute,
		private terminationReasonServ: TerminationReasonService,
  		private toasterServ: ToasterService,
		private router: Router
	) {
	}

	ngOnInit(): void {
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getTerminationReasonById(param['id']);
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

	private getTerminationReasonById(id:string){
		this.terminationReasonServ.getTerminationReasonById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<TerminationReason>) => {
				if(isSuccessfulResponse(data)){
					this.terminationDetails= data.Data;
					this.terminationReasonServ.terminationReasonData.next({'Disabled': data.Data.Disabled, 'RuleCode': data.Data.TerminationReasonCode, 'Id': data.Data.Id});
				}
			});
	}

	public listNavigation(){
		return this.router.navigate([`${NavigationPaths.list}`]);
	}

	ngOnDestroy(): void {
		this.toasterServ.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
