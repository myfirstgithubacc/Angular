import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationLevelService } from '../../service/organization-level.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { OrgLevel, OrgLevelCode, RequiredStrings } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { ClientDetails, OrgLevelDetailsBySectorId, OrganizationLevel, ParentData } from '@xrm-master/organization-level/Interfaces/Interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public OrganizationLevel1: OrganizationLevel;
	private id: string;
	public sectorId: number = magicNumber.zero;
	public recordUKey: string = RequiredStrings.EmptyString;
	public actionTypeId: number = ActionType.View;
	public entityId: number = XrmEntities.OrgLevel1;
	public SectorLabel:string = RequiredStrings.Sector;
	public orgLevelLabel:string = OrgLevel.One;
	public OrgLevelID: string = OrgLevelCode.One;
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
    private activatedroute: ActivatedRoute,
    public udfCommonMethods: UdfCommonMethods,
    private organizationLevelService: OrganizationLevelService,
    private eventLog: EventLogService,
    private toasterService: ToasterService
	) {}

	ngOnInit(): void {
		this.id = this.activatedroute.snapshot.params['id'];
		forkJoin([
			this.organizationLevelService.getConfigureClient(),
			this.organizationLevelService.getOrgLvl1Byukey(this.id)
		]).pipe(takeUntil(this.unsubscribe$)).subscribe(([clientDetails, org1Data]) => {
			this.updateSectorName(clientDetails);
			this.setorgdetails(org1Data);
		});
	}

	private updateSectorName(data:GenericResponseBase<ClientDetails>):void {
		if (data.Succeeded) {
			this.SectorLabel = data.Data?.OrganizationLabel ?? "Sector";
		}
	}

	private updateOrgLevelName(sectorId: number):void {
		this.organizationLevelService.getOrgLevelNameBySectorId(sectorId, magicNumber.one)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<OrgLevelDetailsBySectorId>) => {
				if (res.Succeeded) {
					this.OrgLevelID =
        	    	(res.Data?.OrgName != null && res.Data.OrgName != '')
        	    		? `${res.Data.OrgName} ID`
        	    		: OrgLevelCode.One;
					this.orgLevelLabel = res.Data?.OrgName ?? OrgLevel.One;
				}
				this.setParentData();
			});
	}

	private setParentData(): void{
		const parentData: ParentData = {
			recordCode: this.OrganizationLevel1.OrganizationCode,
			uKey: this.recordUKey,
			Disabled: this.OrganizationLevel1.Disabled,
			recordId: this.OrganizationLevel1.Id,
			recordCodeLabel: this.OrgLevelID
		};
		this.organizationLevelService.OrgLevel1ParentData.next(parentData);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	private setorgdetails(res:GenericResponseBase<OrganizationLevel>):void {
		if(res.Succeeded && res.Data){
			this.OrganizationLevel1 = res.Data;
			this.sectorId = this.OrganizationLevel1.SectorId;
			this.recordUKey = this.OrganizationLevel1.UKey;
			this.updateEventLog();
			this.updateOrgLevelName(this.sectorId);
		}
	}

	private updateEventLog():void {
		this.eventLog.recordId.next( this.OrganizationLevel1?.Id);
		this.eventLog.entityId.next(XrmEntities.OrgLevel1);
		this.eventLog.isUpdated.next(true);
	}

}
