import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationLevelService } from '../../service/organization-level.service';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ClientDetails, OrgLevelDetailsBySectorId, OrganizationLevel, ParentData } from '@xrm-master/organization-level/Interfaces/Interface';
import { OrgLevel, OrgLevelCode, RequiredStrings } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public OrganizationLevel2: OrganizationLevel;
	public entityId: number = XrmEntities.OrgLevel2;
	private id: string;
	public SectorLabel = "Sector";
	public orgLabelName:string = OrgLevel.Two;
	public OrgLevelID:string = OrgLevelCode.Two;
	public sectorId: number = magicNumber.zero;
	public recordUKey: string = RequiredStrings.EmptyString;
	public actionTypeId: number = ActionType.View;
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
		private activatedroute: ActivatedRoute,
		public udfCommonMethods: UdfCommonMethods,
		private organizationLevelService: OrganizationLevelService,
		private loaderService: LoaderService,
		private eventLog: EventLogService,
		private toasterService: ToasterService
	) {}

	ngOnInit(): void {
		this.loaderService.setState(true);
		this.id = this.activatedroute.snapshot.params['id'];
		forkJoin([
			this.organizationLevelService.getConfigureClient(),
			this.organizationLevelService.getOrgLvl2Byukey(this.id)
		]).pipe(takeUntil(this.unsubscribe$)).subscribe(([clientDetails, org2Data]) => {
			this.updateSectorName(clientDetails);
			this.setOrgDetails(org2Data);
		});
	}

	private setParentData(): void{
		const parentData:ParentData = {
			recordCode: this.OrganizationLevel2.OrganizationCode,
			uKey: this.recordUKey,
			Disabled: this.OrganizationLevel2.Disabled,
			recordId: this.OrganizationLevel2.Id,
			recordCodeLabel: this.OrgLevelID
		};
		this.organizationLevelService.OrgLevel2ParentData.next(parentData);
	}

	private updateSectorName(data: GenericResponseBase<ClientDetails>):void {
		if (data.Succeeded) {
			this.SectorLabel = data.Data?.OrganizationLabel ?? "Sector";
		}
	}

	private setOrgDetails(data: GenericResponseBase<OrganizationLevel>):void {
		if (data.Succeeded && data.Data) {
			this.OrganizationLevel2 = data.Data;
			this.sectorId = this.OrganizationLevel2.SectorId;
			this.recordUKey = this.OrganizationLevel2.UKey;
			this.loaderService.setState(false);
			this.updateorgLabelName(this.sectorId);
			this.updateEventLog();
		}
	}

	private updateorgLabelName(sectorId: number):void {
		this.organizationLevelService.getOrgLevelNameBySectorId(sectorId, magicNumber.two)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrgLevelDetailsBySectorId>) => {
				if (res.Succeeded) {
					this.orgLabelName = res.Data?.OrgName ?? OrgLevel.Two;
					this.OrgLevelID =
            		res.Data?.OrgName != null && res.Data.OrgName != RequiredStrings.EmptyString.toString()
            		? `${res.Data?.OrgName} ID`
            		: OrgLevelCode.Two;
					this.setParentData();
				}
			});
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		this.toasterService.resetToaster();
	}

	private updateEventLog():void {
		this.eventLog.recordId.next(this.OrganizationLevel2.Id);
		this.eventLog.entityId.next(XrmEntities.OrgLevel2);
		this.eventLog.isUpdated.next(true);
	}

}
