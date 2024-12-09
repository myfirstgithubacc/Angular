import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ParentData, StatusUpdatePayload } from '../Interfaces/Interface';
import { NavigationUrls, OrgLevel, OrgLevelCode, RequiredStrings, Status, ToastMessages } from '../Constants/OrgLevels.enum';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { OrganizationLevelService } from '../service/organization-level.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { IRecordButton, IStatusCardData } from '@xrm-shared/models/common.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-core-organization-level1',
	templateUrl: './core-organization-level1.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreOrganizationLevel1Component implements OnInit, OnDestroy {

	public AddEditEventReasonForm: FormGroup;
	public entityId: number = XrmEntities.OrgLevel1;
	public buttonSet: IRecordButton[];
	public statusData:IStatusCardData = {
		items: []
	};
	private recordCode:string;
	public recordCodeLabel:string = OrgLevelCode.One;
	private uKey:string = '';
	private disabled:boolean;
	private recordId:number;
	private isEditMode:boolean;
	public isShowHeader:boolean;
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
		private router: Router,
		private organizationLevelService: OrganizationLevelService,
		private toasterService: ToasterService,
		private commonHeaderIcon: CommonHeaderActionService,
		private global: PageTitleService,
		private eventLog: EventLogService,
		private cdr: ChangeDetectorRef,
		private localizationService: LocalizationService
	){}

	ngOnInit(): void {
		this.global.getRouteObs.pipe(
			switchMap((url:string) => {
				if(url.includes(NavigationUrls.Org1View)){
					this.isEditMode = false;
					this.isShowHeader = true;
				}else if(url.includes(NavigationUrls.Org1Edit)){
					this.isEditMode = true;
					this.isShowHeader=true;
				}else{
					this.isShowHeader = false;
					return of(null);
				}
				return this.organizationLevelService.OrgLevel1ParentData;
			}), takeUntil(this.unsubscribe$)).subscribe((res:ParentData|null) => {
			this.setHeaderData(res);
		});
	}

	private setHeaderData(res:ParentData|null){
		if(res != null){
			this.recordId = res.recordId;
			this.recordCode = res.recordCode;
			this.disabled = res.Disabled;
			this.uKey = res.uKey;
			this.recordCodeLabel = res.recordCodeLabel;
			this.setButtonSet();
			this.getCommonHeaderData();
			this.cdr.detectChanges();
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
	public getOrgLevelStatus():string {
		return this.disabled
			? Status.Inactive
			: Status.Active;
	}

	private getCommonHeaderData():void {
		this.statusData.items=[
			{
				title: this.recordCodeLabel,
				titleDynamicParam: [],
				item: this.recordCode,
				itemDynamicParam: [],
				cssClass: [`${RequiredStrings.EmptyString}`],
				isLinkable: false,
				link: RequiredStrings.EmptyString,
				linkParams: RequiredStrings.EmptyString
			},
			{
				title: Status.Status,
				titleDynamicParam: [],
				item: this.getOrgLevelStatus(),
				itemDynamicParam: [],
				cssClass: [this.getOrgLevelStatus().toLowerCase()],
				isLinkable: false,
				link: RequiredStrings.EmptyString,
				linkParams: RequiredStrings.EmptyString
			}
		];
	}

	private onEdit = ():void => {
		this.router.navigate([`${NavigationUrls.Org1Edit}${this.uKey}`]);
	};
	private onActivate = (actionName: string):void => {

		this.updateRecord([
			{
				uKey: this.uKey,
				disabled: actionName !== Status.Activate.toString(),
				reasonForChange: RequiredStrings.EmptyString
			}
		]);
	};

	private updateRecord(data: StatusUpdatePayload[]):void {
		this.organizationLevelService.updateOrgLvl1BulkStatus(data).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<null>) => {
			if (res.Succeeded) {
				this.disabled = data[magicNumber.zero].disabled;
				const message = this.localizationService.GetLocalizeMessage(OrgLevel.One),
					orgDynamicParam: DynamicParam[] = [{ Value: message.toLowerCase(), IsLocalizeKey: false }];
				this.toasterService.displayToaster(
					ToastOptions.Success,
					data[magicNumber.zero].disabled
						? ToastMessages.EntityHasBeenDeactivatedSuccessfully
						: ToastMessages.EntityHasBeenActivatedSuccessfully,
					orgDynamicParam
				);
				this.getCommonHeaderData();
				this.updateEventLog();
			} else {
				this.toasterService.showToaster(ToastOptions.Error, res.Message);
			}
		});
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

	private updateEventLog():void {
		this.eventLog.isUpdated.next(true);
		this.eventLog.recordId.next(this.recordId);
		this.eventLog.entityId.next(XrmEntities.OrgLevel1);
	}
}
