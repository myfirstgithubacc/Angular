import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { EventConfigurationService } from 'src/app/services/masters/event-configuration.service';
import { ActivatedRoute } from '@angular/router';
import { NavigationPaths } from '../constant/routes-constant';
import { EditEventConfigData, EventAndNotifyValue, EventEnteredAndNotify, NavPathsType } from '../constant/event-configuration.enum';
import { Subject, takeUntil } from 'rxjs';
import { ApiResponse } from '@xrm-core/models/event-configuration.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy{
	public navigationPaths: NavPathsType = NavigationPaths;
	public isEditMode: boolean = false;
	public isEdit: boolean = false;
	public eventConfigData: EditEventConfigData;
	public ukey: string;
	private ngUnsubscribe$ = new Subject<void>();
	public enteredByText: string;
	public notifyToText: string;
	public editEventConfigData: EditEventConfigData;

	// eslint-disable-next-line max-params
	constructor(
  private activatedRoute: ActivatedRoute,
  private eventConfigServc:EventConfigurationService,
  private toasterServc: ToasterService,
  public commonHeaderIcons: CommonHeaderActionService
	) {}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((param) => {
			if (param['id']) {
				this.getById(param['id']);
				this.ukey = param['id'];
			}
		});
	}

	private getEventEnteredAndNotifyText(value: string | string[]): string {
		const values = Array.isArray(value)
			? value
			: value.split(',');
		return values
			.map((v) => {
				const numericValue = parseInt(v.trim(), Number(magicNumber.ten));
				switch (numericValue) {
					case EventAndNotifyValue.ClientUser:
						return EventEnteredAndNotify.ClientUser;
					case EventAndNotifyValue.StaffingAgencyUser:
						return EventEnteredAndNotify.StaffingAgencyUser;
					default:
						return '';
				}
			})
			.join(', ');
	}

	private getById(id: string) {
		this.eventConfigServc.getEventConfigById(id).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res:ApiResponse) => {
				if(res.Succeeded){
					this.eventConfigData = res.Data;
					this.eventConfigServc.eventConfigSubject.next({
						"EventConfigrationID": res.Data.ID,
						"Disabled": res.Data.Disabled,
						"EventConfigrationCode": res.Data.EventCode
					});
					this.eventConfigData.DelayNotificationBeforeEvent = false;
					this.enteredByText = this.getEventEnteredAndNotifyText(this.eventConfigData.EventEnteredBy);
					this.notifyToText = this.getEventEnteredAndNotifyText(this.eventConfigData.NotifyTo);
				}
			}
		});
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.toasterServc.resetToaster();
	}
}


