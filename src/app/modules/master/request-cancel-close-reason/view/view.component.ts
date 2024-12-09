import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { RequestCancelCloseRequestService } from 'src/app/services/masters/request-cancel-close-request.service';
import { ParentData, RQCCR } from '../Interfaces';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { RqccrKeys } from '../Enums.enum';

@Component({selector: 'app-reason-cancel-reason-view',
	templateUrl: './view.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public recordCode:string = RqccrKeys.EmptyString;
	private entityId = XrmEntities.RequestCancelCloseReason;
	private ukey: string;
	public currentObject:RQCCR;
	public isICSOWVisible: boolean;
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
		private toasterService: ToasterService,
		public requestCancelreason: RequestCancelCloseRequestService,
		private routes:ActivatedRoute,
		private eventlog: EventLogService,
		private cdr: ChangeDetectorRef
	){}

	ngOnInit(): void {
		this.ukey = this.routes.snapshot.params['id'];
		if(this.ukey)
		{
			this.getReasonDetails();
		}
	}

	private getReasonDetails():void
	{
		this.requestCancelreason.getRequestCancelCloseRequestId(this.ukey)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res:GenericResponseBase<RQCCR>) => {
	    	    if(res.Succeeded && res.Data)
				{
					this.currentObject = res.Data;
					this.recordCode = this.currentObject.CancelCloseReasonCode;
					if(res.Data.IcSowRequest == RqccrKeys.NA)
						this.isICSOWVisible = false;
					else
						this.isICSOWVisible = true;
					this.cdr.markForCheck();
					this.updateEventLog();
					this.setParentData();
				}
			});
	}

	private setParentData(): void{
		const parentData:ParentData = {
			recordCode: this.recordCode,
			ukey: this.ukey,
			Disabled: this.currentObject.Disabled,
			recordId: this.currentObject.Id
		};
		this.requestCancelreason.RQCCRParentData.next(parentData);
	}

	private updateEventLog():void {
		this.eventlog.recordId.next(this.currentObject.Id);
		this.eventlog.entityId.next(this.entityId);
		this.eventlog.isUpdated.next(true);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
    	this.unsubscribe$.complete();
	}

}
