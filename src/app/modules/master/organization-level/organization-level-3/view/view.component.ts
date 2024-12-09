import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationLevelService } from '../../service/organization-level.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { OrgLevel, OrgLevelCode, RequiredStrings } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ClientDetails, OrgLevelDetailsBySectorId, OrganizationLevel, ParentData } from '@xrm-master/organization-level/Interfaces/Interface';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {

	public OrganizationLevel3: OrganizationLevel;
	public entityId: number = XrmEntities.OrgLevel3;
	private id: string;
	public sectorId: number = magicNumber.zero;
	public recordUKey: string = RequiredStrings.EmptyString;
	public actionTypeId: number = ActionType.View;
	public SectorLabel:string = RequiredStrings.Sector;
	public orgLabelName:string = OrgLevel.Three;
	public OrgLevelID:string = OrgLevelCode.Three;
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
    	private activatedroute: ActivatedRoute,
    	public udfCommonMethods: UdfCommonMethods,
    	private organizationLevelService: OrganizationLevelService,
    	private loaderService: LoaderService,
    	private eventLog: EventLogService,
    	private toasterService: ToasterService,
    	private localizationService: LocalizationService
	) {}

	ngOnInit(): void {
		this.loaderService.setState(true);
		this.id = this.activatedroute.snapshot.params['id'];
		forkJoin([
			this.organizationLevelService.getConfigureClient(),
			this.organizationLevelService.getOrgLvl3Byukey(this.id)
		]).pipe(takeUntil(this.unsubscribe$)).subscribe(([clientDetails, org3Data]) => {
			this.updateSectorName(clientDetails);
			this.setOrgDetails(org3Data);
		});
	}

	private setOrgDetails(x:GenericResponseBase<OrganizationLevel>):void {
		if (x.Succeeded && x.Data) {
			this.OrganizationLevel3 = x.Data;
			this.sectorId = this.OrganizationLevel3.SectorId;
			this.recordUKey = this.OrganizationLevel3.UKey;
			this.eventLog.recordId.next(this.OrganizationLevel3?.Id);
			this.eventLog.entityId.next(XrmEntities.OrgLevel3);
			this.eventLog.isUpdated.next(true);
			this.loaderService.setState(false);
			this.updateorgLabelName(this.sectorId);
			this.updateEventLog();
		}
	}

	private setParentData(): void{
		const parentData:ParentData = {
			recordCode: this.OrganizationLevel3.OrganizationCode,
			uKey: this.recordUKey,
			Disabled: this.OrganizationLevel3.Disabled,
			recordId: this.OrganizationLevel3.Id,
			recordCodeLabel: this.OrgLevelID
		};
		this.organizationLevelService.OrgLevel3ParentData.next(parentData);
	}

	private updateSectorName(res:GenericResponseBase<ClientDetails>):void {
		if (res.Succeeded) {
			this.SectorLabel = res.Data?.OrganizationLabel ?? "Sector";
		}
	}

	private updateorgLabelName(sectorId: number):void {
		this.organizationLevelService.getOrgLevelNameBySectorId(sectorId, magicNumber.three)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrgLevelDetailsBySectorId>) => {
				if (res.Succeeded) {
					this.orgLabelName = res.Data?.LocalizedKey ?? OrgLevel.Three;
					this.OrgLevelID = res.Data?.LocalizedKey != null && res.Data.LocalizedKey != RequiredStrings.EmptyString.toString()
						? `${this.localizationService.GetLocalizeMessage(res.Data.LocalizedKey)} ID`
						: OrgLevelCode.Three;
					this.setParentData();
				}
			});
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	private updateEventLog():void {
		this.eventLog.recordId.next(this.OrganizationLevel3.Id);
		this.eventLog.entityId.next(XrmEntities.OrgLevel3);
		this.eventLog.isUpdated.next(true);
	}
}
