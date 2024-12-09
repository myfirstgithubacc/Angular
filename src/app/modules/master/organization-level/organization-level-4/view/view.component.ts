import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationLevelService } from '../../service/organization-level.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { OrgLevel, OrgLevelCode, RequiredStrings } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { ClientDetails, OrgLevelDetailsBySectorId, OrganizationLevel, ParentData } from '@xrm-master/organization-level/Interfaces/Interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public OrganizationLevel4: OrganizationLevel;
	public entityId: number = XrmEntities.OrgLevel4;
	private id: string;
	public sectorId: number = magicNumber.zero;
	public recordUKey: string = RequiredStrings.EmptyString;
	public actionTypeId: number = ActionType.View;
	public SectorLabel:string = RequiredStrings.Sector;
	public orgLabelName:string = OrgLevel.Four;
	public OrgLevelID:string = OrgLevelCode.Four;
	private unsubscribe$: Subject<void> = new Subject<void>();


	constructor(
	private activatedroute: ActivatedRoute,
    private loaderService: LoaderService,
    public udfCommonMethods: UdfCommonMethods,
    private eventLog: EventLogService,
    private toasterService: ToasterService,
    private localizationService: LocalizationService,
    private organizationLevelService: OrganizationLevelService
	) {}

	ngOnInit(): void {
		this.loaderService.setState(true);
		this.id = this.activatedroute.snapshot.params['id'];
		forkJoin([
			this.organizationLevelService.getConfigureClient(),
			this.organizationLevelService.getOrgLvl4Byukey(this.id)
		]).pipe(takeUntil(this.unsubscribe$)).subscribe(([clientDetails, org4Data]) => {
			this.updateSectorName(clientDetails);
			this.setOrgDetails(org4Data);
		});
	}

	private setOrgDetails(x: GenericResponseBase<OrganizationLevel>):void {
		if (x.Succeeded && x.Data) {
			this.OrganizationLevel4 = x.Data;
			this.sectorId = this.OrganizationLevel4.SectorId;
			this.recordUKey = this.OrganizationLevel4.UKey;
			this.updateEventLog();
			this.loaderService.setState(false);
			this.updateorgLabelName(this.sectorId);
		}
	}
	private setParentData(): void{
		const parentData:ParentData = {
			recordCode: this.OrganizationLevel4.OrganizationCode,
			uKey: this.recordUKey,
			Disabled: this.OrganizationLevel4.Disabled,
			recordId: this.OrganizationLevel4.Id,
			recordCodeLabel: this.OrgLevelID
		};
		this.organizationLevelService.OrgLevel4ParentData.next(parentData);
	}

	private updateEventLog():void {
		this.eventLog.isUpdated.next(true);
		this.eventLog.recordId.next(this.OrganizationLevel4?.Id);
		this.eventLog.entityId.next(XrmEntities.OrgLevel4);
	}

	private updateSectorName(res:GenericResponseBase<ClientDetails>):void {
		if (res.Succeeded) {
			this.SectorLabel = res.Data?.OrganizationLabel ?? "Sector";
		}
	}

	private updateorgLabelName(sectorId: number):void {
		this.organizationLevelService.getOrgLevelNameBySectorId(sectorId, magicNumber.four)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrgLevelDetailsBySectorId>) => {
				if (res.Succeeded) {
					this.orgLabelName = res.Data?.LocalizedKey ?? OrgLevel.Four;
					this.OrgLevelID = res.Data?.LocalizedKey != null && res.Data?.LocalizedKey != RequiredStrings.EmptyString.toString()
						? `${this.localizationService.GetLocalizeMessage(res.Data?.LocalizedKey) } ID`
						: OrgLevelCode.Four;
					this.setParentData();
				}
			});
	}
	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
