import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EventReason } from '@xrm-core/models/event-reason.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { EventReasonService } from 'src/app/services/masters/event-reason.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { NavigationPaths } from '../routes/routeConstants';
@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent implements OnInit, OnDestroy{

	public eventReason: EventReason;
	public entityId = XrmEntities.EventReason;
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private eventReasonService: EventReasonService,
		private toasterService: ToasterService,
		private activatedRoute: ActivatedRoute,
		private route: Router
	) {
	}

	ngOnInit(): void {
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getEventReasonById(param['id']);
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

	private getEventReasonById(id: string) {
		this.eventReasonService.getEventReasonById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<EventReason>) => {
				if(isSuccessfulResponse(data)){
					this.eventReason = data.Data;
					this.eventReasonService.eventReasonData.next({'Disabled': this.eventReason.Disabled, 'RuleCode': this.eventReason.EventReasonCode, 'Id': this.eventReason.Id});
				}
			});
	}

	public listNavigation(){
		return this.route.navigate([`${NavigationPaths.list}`]);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}


