import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { NavigationPaths } from '../constant/routes-constant';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { RequisitionLibraryGatewayService } from 'src/app/services/masters/requisition-library-gateway.service';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { Subject, takeUntil } from 'rxjs';
import { BenefitAdderForView, CostEstimationDetail, RateType, ReqLibraryBenefitAdder, RequisitionDataAddEdit } from '../constant/rate-enum';
import { NavPathsType } from '@xrm-master/event configuration/constant/event-configuration.enum';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IBenefitAdderData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public requisitionLibrary: RequisitionDataAddEdit;
	public navigationPaths: NavPathsType = NavigationPaths;
	public entityID = XrmEntities.RequisitionLibrary;
	public ukey: string;
	private ngUnsubscribe$ = new Subject<void>();
	public slResponse: IBenefitAdderData[];
	public benefitAdderData: BenefitAdderForView[] = [];
	public countryVal: number;
	public sectorDetails: CostEstimationDetail;
	public billRateLabel: string;
	public labCatTypeData: number;
	public hideNtePreLaunchRate:boolean= false;
	public sectorIdUDF: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.View;

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private requisitionLibraryService: RequisitionLibraryGatewayService,
		public udfCommonMethods: UdfCommonMethods,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((param) => {
			if (param['id']) {
				this.getRequisitionLibraryById(param['id']);
				this.ukey = param["id"];
			}
		});

	}

	private getRequisitionLibraryById(id: string) {
		this.requisitionLibraryService.getRequisitionLibraryById(id).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((res: GenericResponseBase<RequisitionDataAddEdit>) => {
				if (isSuccessfulResponse(res)) {
					this.requisitionLibrary = res.Data;
					this.getCountryIdBySector(this.requisitionLibrary.SectorId);
					this.getLaborCatTypeValue(this.requisitionLibrary.LaborCategoryId);
					this.getBenefitAdder();
					this.cdr.markForCheck();
					this.sectorIdUDF = this.requisitionLibrary.SectorId;
					this.recordUKey = this.requisitionLibrary.UKey;
					this.requisitionLibraryService.laborDataSubject.next({
						'Disabled': this.requisitionLibrary.Disabled,
						'ReqLibraryCode': this.requisitionLibrary.RequisitionLibraryCode,
						'ReqLibraryID': this.requisitionLibrary.Id
					});
				}
			});
	}

	getLaborCatTypeValue(id:number){
		this.requisitionLibraryService.getLaborCategoryType(id).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((res: GenericResponseBase<number>) => {
				if(isSuccessfulResponse(res)){
					this.labCatTypeData = res.Data;
					this.cdr.markForCheck();
					if(this.labCatTypeData == Number(dropdown.LightIndustrial)){
						this.hideNtePreLaunchRate = true;
					}
				}
			});
	}

	public getBenefitAdder(): void{
		this.requisitionLibraryService.getIsBenefitAdder(this.requisitionLibrary.SectorId, this.requisitionLibrary.LocationId)
			.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((slData: GenericResponseBase<IBenefitAdderData[]>) => {
				if(isSuccessfulResponse(slData)){
					this.slResponse = slData.Data;
					this.cdr.markForCheck();
				}
				if(this.slResponse.length === Number(magicNumber.zero)){
					this.requisitionLibraryService.getIsBenefitAdder(this.requisitionLibrary.SectorId, magicNumber.zero).
						pipe(takeUntil(this.ngUnsubscribe$)).subscribe((sdata: GenericResponseBase<IBenefitAdderData[]>) => {
							if(isSuccessfulResponse(sdata)){
								this.cdr.markForCheck();
		   						this.slResponse = sdata.Data;
								this.benefitAdderData = this.comparisonMethod();
							}
						});
				}else{
					this.benefitAdderData = this.comparisonMethod();
				}
			});
	}

	comparisonMethod() {
		return this.slResponse.map((sl: IBenefitAdderData) => {
			const { LabelLocalizedKey, ...rest } = sl,
				matchingSecondItem = this.requisitionLibrary.ReqLibraryBenefitAdders.find((benefit: ReqLibraryBenefitAdder) =>
					benefit.LocalizedLabelKey == sl.LabelLocalizedKey);
			return {
				LabelLocalizedKey: LabelLocalizedKey,
				ReqLibraryBenefitAdderId: matchingSecondItem
					? matchingSecondItem.ReqLibraryBenefitAdderId
					: magicNumber.zero,
				Value: matchingSecondItem
					? matchingSecondItem.Value
					: magicNumber.zero,
				...rest
			};
		});
	}

	public isBenefitAdderDataValid(): boolean {
		return Array.isArray(this.benefitAdderData) && this.benefitAdderData.length > Number(magicNumber.zero);
	  }

	public getCountryIdBySector(id: number): void {
		this.requisitionLibraryService.getCountryIdBySector(id).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((res: GenericResponseBase<CostEstimationDetail>) => {
				if (isSuccessfulResponse(res)) {
					this.countryVal = res.Data.CountryId;
					this.sectorDetails = res.Data;
					this.cdr.markForCheck();
					if(this.sectorDetails.BillRateValidation == Number(magicNumber.sixteen)){
						this.billRateLabel = RateType.BillRateNte;
					}
					else if(this.sectorDetails.BillRateValidation == Number(magicNumber.seventeen)){
						this.billRateLabel = RateType.BillRateTarget;
					}else{
						this.billRateLabel =RateType.BillRateNteTarget;
					}
				}
			});
	}

	ngOnDestroy() {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}
}
