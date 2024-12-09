import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { SectorService } from 'src/app/services/masters/sector.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { SectorCostCenterConfig } from '@xrm-core/models/Sector/sector-cost-center-configs.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { CostAccountingCodeApproverConfig } from '@xrm-core/models/cost-accounting-code/cost-accounting-code-approver-config.model';
import { CostAccountingCodeService } from 'src/app/services/masters/cost-accounting-code.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { CostAccountingCodeSubmit } from '@xrm-core/models/cost-accounting-code/cost-accounting-code.add-edit';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { getColumnOption, getTabOptions } from '../utils/cost-accounting-code-utility';
import { SharedModule } from '@xrm-shared/shared.module';
import { CommonModule } from '@angular/common';
import { NavigationPaths } from '../route-constants/route-constants';
@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	standalone: true,
	imports: [SharedModule, CommonModule]
})

export class ViewComponent implements OnInit, OnDestroy {
	public costAccountingCode: CostAccountingCodeSubmit;
	public entityId: number = XrmEntities.CostAccountingCode;
	public isEffectivedateOn: boolean;
	public recordId: string;
	public IsMultipleApprover: boolean;
	public gridData: CostAccountingCodeApproverConfig[] = [];
	public labelName: SectorCostCenterConfig[];
	public tabOptions = {};
	public columnOptions = {};

	public pageSize: number = magicNumber.fiveHundred;
	private destroyAllSubscribtion$ = new Subject<void>();
	public dateFormat: string;

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private sector: SectorService,
		private toasterService: ToasterService,
		private costAccountingCodeService: CostAccountingCodeService,
		private sessionStore: SessionStorageService,
		private commonHeaderService: CommonHeaderActionService,
		private route: Router,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.columnOptions = getColumnOption();
		this.tabOptions = getTabOptions();
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((param: Params) => {
			this.getCostAccountingCodeByUKey(param['id']);
		});
		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
	}

	private getCostAccountingCodeByUKey(uKey: string) {
		this.costAccountingCodeService.getAllCostAccountingCodeByUkey(uKey)
			.pipe(
				switchMap((response: GenericResponseBase<CostAccountingCodeSubmit>) => {
					if (isSuccessfulResponse(response)) {
						const { Data } = response;
						this.costAccountingCode = Data;
						this.bindGrid(Data.CostAccountingCodeApproverConfiguration);
						this.createCommonHeader(this.costAccountingCode);

						return this.sector.getSectorById(Data.SectorId);
					} else {
						return of(null);
					}
				}),
				takeUntil(this.destroyAllSubscribtion$)
			).subscribe((response) => {
				if (response) {
					const sectorData = new Sector(response.Data);
					this.IsMultipleApprover = sectorData.ChargeNumberConfiguration.IsMultipleTimeApprovalNeeded ?? false;
					this.labelName = sectorData.ChargeNumberConfiguration.SectorCostCenterConfigs;
					this.isEffectivedateOn = sectorData.ChargeNumberConfiguration.HasChargeEffectiveDate || false;
					this.cdr.markForCheck();
				}
			});
	}

	private createCommonHeader({ Disabled, CostCode, Id }: CostAccountingCodeSubmit) {
		this.commonHeaderService.holdData.next({ 'Disabled': Disabled, 'RuleCode': CostCode, 'Id': Id });
	}

	private bindGrid(list: CostAccountingCodeApproverConfig[]) {
		this.gridData = list;
	}

	public backToList = () => {
		this.route.navigateByUrl(NavigationPaths.list);
	};
	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
