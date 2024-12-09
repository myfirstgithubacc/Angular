import { ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import { ParentData, StatusUpdatePayload } from './Interfaces';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RqccrKeys, RqccrNavigationUrls, Status, ToastMessages } from './Enums.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { Router } from '@angular/router';
import { RequestCancelCloseRequestService } from 'src/app/services/masters/request-cancel-close-request.service';
import { Subject, takeUntil } from 'rxjs';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { FormGroup } from '@angular/forms';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { IRecordButton, IStatusCardData } from '@xrm-shared/models/common.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({selector: 'app-core-request-cancel-reason',
	templateUrl: './core-request-cancel-reason.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreRequestCancelReasonComponent implements OnInit, OnDestroy {
	public entityId = XrmEntities.RequestCancelCloseReason;
	public buttonSet: IRecordButton[];
	public statusData:IStatusCardData = {
		items: []
	};
	private ukey: string;
	public recordId:string = RqccrKeys.EmptyString;
	public recordCode:string = RqccrKeys.EmptyString;
	public disabled:boolean;
	private unsubscribe$: Subject<void> = new Subject<void>();
	public statusForm:FormGroup;
	public isShowHeader:boolean = false;
	private isEditMode:boolean = true;

	constructor
	(
		private commonHeaderIcon: CommonHeaderActionService,
		private router: Router,
		public requestCancelreason: RequestCancelCloseRequestService,
		private toasterService: ToasterService,
		private global: PageTitleService,
		private eventlog: EventLogService,
		private localizationService: LocalizationService
	){}

	ngOnInit(): void {
		this.global.getRouteObs.pipe(takeUntil(this.unsubscribe$)).subscribe((url:string) => {
			if(url.includes(RqccrNavigationUrls.View)){
				this.isEditMode = false;
				this.isShowHeader = true;
			}else if(url.includes(RqccrNavigationUrls.AddEdit)){
				this.isEditMode = true;
				this.isShowHeader=true;
			}else{
				this.isShowHeader = false;
				return;
			}
			this.setHeaderData();
		});
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	private setHeaderData(): void{
		this.requestCancelreason.RQCCRParentData.pipe(takeUntil(this.unsubscribe$)).subscribe((res:ParentData|null) => {
			if(res != null){
				this.ukey = res.ukey;
				this.recordCode = res.recordCode;
				this.disabled = res.Disabled;
				this.recordId = res.recordId.toString();
				this.getCommonHeaderData();
				this.setButtonSet();
			}
		});
	}

	public getUserStatus():string {
		return this.disabled
			? Status.Inactive
			: Status.Active;
	}

	private setButtonSet():void {
		this.buttonSet=[
			{
				status: Status.Active,
				items: this.isEditMode
					? this.commonHeaderIcon.commonActionSetOnEditActive(this.onActivate)
					: this.commonHeaderIcon.commonActionSetOnActive(this.onEdit, this.onActivate)
			},
			{
				status: Status.Inactive,
				items: this.isEditMode
					? this.commonHeaderIcon.commonActionSetOnDeactive(this.onActivate)
					: this.commonHeaderIcon.commonActionSetOnDeactiveView(this.onEdit, this.onActivate)
			}
		];
	}

	private onEdit = ():void => {
		this.router.navigate([`${RqccrNavigationUrls.AddEdit}${this.ukey}`]);
	};

	private onActivate = ():void => {
		this.updateRecord([
  		{
  			uKey: this.ukey,
  			disabled: !this.disabled,
  			reasonForChange: RqccrKeys.EmptyString
  		}
  	]);
	};

	private updateRecord(data: StatusUpdatePayload[]):void {
		this.requestCancelreason.updateRequestCancelCloseRequestStatus(data)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<null>) => {
				if (res.Succeeded) {
					if (data.length != Number(magicNumber.zero)) {
						this.disabled=data[magicNumber.zero].disabled;
						const message = this.localizationService.GetLocalizeMessage(RqccrKeys.RequestCancelCloseReason),
							orgDynamicParam: DynamicParam[] = [{ Value: message.toLowerCase(), IsLocalizeKey: false }];
						this.toasterService.displayToaster(
							ToastOptions.Success, data[magicNumber.zero].disabled
								? ToastMessages.EntityHasBeenDeactivatedSuccessfully
								: ToastMessages.EntityHasBeenActivatedSuccessfully,
							orgDynamicParam
						);
						this.getCommonHeaderData();
						this.updateEventLog();
					}
				} else {
					this.toasterService.showToaster(ToastOptions.Error, ToastMessages.Somethingwentwrong);
				}
			});
	}
	private getCommonHeaderData():void{
		this.statusData.items=[
			{
				title: RqccrKeys.RequestCancelCloseID,
				titleDynamicParam: [],
				item: this.recordCode,
				itemDynamicParam: [],
				cssClass: [RqccrKeys.BasicTitle],
				isLinkable: false,
				link: RqccrKeys.EmptyString,
				linkParams: RqccrKeys.EmptyString
			},
			{
				title: RqccrKeys.Status,
				titleDynamicParam: [],
				item: this.disabled
					?Status.Inactive
					:Status.Active,
				itemDynamicParam: [],
				cssClass: this.disabled
					?[Status.Inactive.toLowerCase()]
					:[Status.Active.toLowerCase()],
				isLinkable: false,
				link: RqccrKeys.EmptyString,
				linkParams: RqccrKeys.EmptyString
			}
		];
	}

	private updateEventLog():void {
		this.eventlog.recordId.next(this.recordId);
		this.eventlog.entityId.next(this.entityId);
		this.eventlog.isUpdated.next(true);
	}

}
