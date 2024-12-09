import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LightIndustrialService } from '../../services/light-industrial.service';
import { ActivatedRoute, Router } from '@angular/router';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { NavigationPaths } from '../../constant/routes-constant';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { LocationService } from '@xrm-master/location/services/location.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { AssingmentDetailsService } from 'src/app/modules/contractor/assignment-details/service/assingmentDetails.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { LightIndustrialUtilsService } from '../../services/light-industrial-utils.service';
import { SharedVariablesService } from '../../services/shared-variables.service';
import { EntityActionID } from '../../constant/entity-action';
import { IApprovalConfigWidgetPayload, INavigationPaths, LocationDetails, OrgTypeData, RequestPositionDetailGetAllDto, RequestShiftDetailGetAllDto, SectorDetails, SectorOrgLevelConfigDto, TimeRange, RequestDetails } from '../../interface/li-request.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { IPermissionInfo } from '@xrm-shared/models/common.model';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { ApprovalInfoDetails } from '@xrm-master/approval-configuration/constant/enum';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';

@Component({
	selector: 'app-view-li',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiViewComponent implements OnInit, OnDestroy {
	@Input() isVisible: boolean = true;
	@Input() ukey: string;
	public liRequestForm: FormGroup;
	public liRequestDetails: RequestDetails;
	private sectorDetails: SectorDetails;
	private locationDetails: LocationDetails;
	public hasUDFLength: boolean;
	public hasDMSLength: boolean;
	private entityActionList: IPermissionInfo[] = [];
	public isBroadcastActionAllowed: boolean = false;
	public shiftDetails: RequestShiftDetailGetAllDto;
	public tenurePolicyApplicable: boolean = false;
	public tenureLimitType: number | null = null;
	public requsitionTenure: number;
	public hasApproverDataLength: boolean = true;
	private approverDataLength: IApprovalConfigWidgetPayload;
	public approverLength: boolean = false;
	public isStaffingUser: boolean = false;
	public isCACHaveSpecificApprovers: boolean = false;

	public orgType1Data: OrgTypeData = this.sharedVariablesService.orgType1Data;
	public orgType2Data: OrgTypeData = this.sharedVariablesService.orgType2Data;
	public orgType3Data: OrgTypeData = this.sharedVariablesService.orgType3Data;
	public orgType4Data: OrgTypeData = this.sharedVariablesService.orgType4Data;
	private navigationPaths: INavigationPaths = NavigationPaths;
	public approvalConfigWidgetData: ApprovalInfoDetails;
	public entityId: number = XrmEntities.LightIndustrialRequest;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.View;

	public userGroupId: number = magicNumber.three;
	public uploadStageId: number = DocumentUploadStage.Request_Creation;
	public processingId: number = magicNumber.five;

	public contractorGridData: RequestPositionDetailGetAllDto[] = [];
	public benefitAdderList: IBenefitData[] = [];
	public weekDaysArray: boolean[];
	public daysInfo: IDayInfo[] = [];
	public timeRange: TimeRange = this.sharedVariablesService.timeRange;
	public statusId: number;
	private navigateBackUrl$: Subscription;
	public startDate: string;
	public startNoLaterThan: string;
	public baseWageRate: number| null;

	navigate() {
		if (this.route.url.includes('global-search')) {
			this.route.navigate([this.navigationPaths.globalPath]);
		}
		else {
			this.navigateBackUrl$ = this.assignmentDetailsService.navigateBackUrl.subscribe((url: string) => {
				if (url.length > Number(magicNumber.zero)) {
					this.route.navigate([url]);
				}
				else {
					this.route.navigate([this.navigationPaths.list]);
				}
			});
			this.navigateBackUrl$.unsubscribe();
		}
	}

	public showJobDetailscard: boolean = false;
	public showCompanyDetailscard: boolean = false;
	public showApproverscard: boolean = false;
	public showCommentsUploadscard: boolean = false;
	public showDocumentUploadscard: boolean = false;

	public jobiconDown: boolean = false;
	public jobiconUp: boolean = true;
	public isjobCardOpen: boolean = true;

	public approvericonDown: boolean = false;
	public approvericonUp: boolean = true;
	public isapproverCardOpen: boolean = false;

	public companyiconDown: boolean = false;
	public companyiconUp: boolean = true;
	public isCompanyDetailsCardOpen: boolean = false;
	public hideIcon: boolean = true;

	public commenticonDown: boolean = false;
	public commenticonUp: boolean = true;
	public iscommentCardOpen: boolean = false;

	public documenticondown: boolean = false;
	public documenticonup: boolean = true;

	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private eventLog: EventLogService,
		private sectorService: SectorService,
		private locationService: LocationService,
		private lightIndustrialServices: LightIndustrialService,
		public udfCommonMethods: UdfCommonMethods,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef,
		private route: Router,
		private assignmentDetailsService: AssingmentDetailsService,
		private lightIndustrialUtilsService: LightIndustrialUtilsService,
		private sharedVariablesService: SharedVariablesService
	) {}

	ngOnInit(): void {
		this.getUserType();
		this.initializeForm();
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			const ukeyFromInput = this.ukey,
				idToUse = ukeyFromInput ?? param["uKey"];
			if (idToUse != null && idToUse !== '') {
				this.getLiRequestDetails(idToUse);
				this.ukey = idToUse;
				this.recordUKey = this.ukey;
				this.entityActionList = param['permission'];
				this.isBroadcastActionAllowed = this.entityActionList.length ?
					this.entityActionList.some((permission: IPermissionInfo) =>
						permission.ActionId === Number(Permission.PROCESS_AND_BROADCAST)) :
					false;
			}
		});
	}

	private initializeForm(): void {
		this.liRequestForm = this.formBuilder.group({
			startTimeControlName: [null],
			endTimeControlName: [null]
		});
	}

	private getSectorDataById(sectorId: number): void {
		this.sectorService.getSectorData(sectorId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<SectorDetails>) => {
				if (data.Succeeded && data.Data) {
					this.sectorDetails = data.Data;
					this.tenureLimitType = this.sectorDetails.TenureLimitType;
					this.tenurePolicyApplicable = this.sectorDetails.TenurePolicyApplicable;
					this.requsitionTenure = this.tenurePolicyApplicable
						? this.sectorDetails.RequisitionTenureLimit
						: magicNumber.zero;
					this.isCACHaveSpecificApprovers = this.sectorDetails.CostAccountingCodeHaveSpecificApprovers;
					const orgTypes = [magicNumber.one, magicNumber.two, magicNumber.three, magicNumber.four];
					orgTypes.forEach((orgType) => {
						const org = this.sectorDetails.SectorOrgLevelConfigDtos.find((orgData: SectorOrgLevelConfigDto) =>
							orgData.OrgType === Number(orgType));
						if(org){
							this.assignOrgTypeData(orgType, org);
						}
					});
				}
				this.cdr.detectChanges();
			}
		});
	}

	private getLocationData(locationId: number): void {
		this.locationService.getLocationData(locationId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<LocationDetails>) => {
				if (data.Succeeded && data.Data) {
					this.locationDetails = data.Data;
				}
			}
		});
	}

	private assignOrgTypeData(orgType: number, org: SectorOrgLevelConfigDto | null): void {
		const orgTypeData = {
			OrgName: org
				? this.localizationService.GetLocalizeMessage(org.LocalizedKey)
				: '',
			IsVisible: org
				? org.IsVisible
				: false,
			IsMandatory: org
				? org.IsMandatory
				: false
		};
		switch (orgType) {
			case magicNumber.one:
				this.orgType1Data = orgTypeData;
				break;
			case magicNumber.two:
				this.orgType2Data = orgTypeData;
				break;
			case magicNumber.three:
				this.orgType3Data = orgTypeData;
				break;
			case magicNumber.four:
				this.orgType4Data = orgTypeData;
				break;
			default:
				break;
		}
	}

	private getLiRequestDetails(uKey: string): void {
		this.lightIndustrialServices.getLIReqViewById(uKey).pipe(takeUntil(this.destroyAllSubscriptions$)).
			subscribe((res: GenericResponseBase<RequestDetails>) => {
				if (res.Succeeded && res.Data) {
					this.liRequestDetails = res.Data;
					this.getSectorDataById(Number(this.liRequestDetails.SectorId));
					this.getLocationData(Number(this.liRequestDetails.WorkLocationId));
					this.eventLog.recordId.next(this.liRequestDetails.RequestId);
					this.eventLog.entityId.next(this.entityId);
					this.shiftDetails = this.liRequestDetails.RequestShiftDetailGetAllDto;
					this.weekDaysArray = this.lightIndustrialServices.formatWeekData(this.liRequestDetails.RequestShiftDetailGetAllDto);
					this.liRequestForm.controls['startTimeControlName'].patchValue(this.liRequestDetails.RequestShiftDetailGetAllDto.StartTime);
					this.liRequestForm.controls['endTimeControlName'].patchValue(this.liRequestDetails.RequestShiftDetailGetAllDto.EndTime);
					this.daysInfo = this.lightIndustrialServices.generateDaysInfo(this.liRequestDetails.RequestShiftDetailGetAllDto);
					this.contractorGridData = this.liRequestDetails.RequestPositionDetailGetAllDtos;
					this.startDate = this.localizationService.TransformDate(this.liRequestDetails.StartDate);
					this.startNoLaterThan = this.localizationService.TransformDate(this.liRequestDetails.StartDateNoLaterThan);
					this.baseWageRate = null;
					this.getApprovalWidgetData();
				} else if(res.StatusCode == Number(HttpStatusCode.Unauthorized)){
					this.route.navigate(['unauthorized']);
				}
			});
	}

	public getApprovalWidgetData(): void {
		this.approvalConfigWidgetData = {
			"actionId": EntityActionID.Create,
			"entityId": this.entityId,
			"sectorId": this.liRequestDetails.SectorId,
			"locationId": this.liRequestDetails.WorkLocationId,
			"orgLevel1Id": this.liRequestDetails.OrgLevel1Id,
			"orgLevel2Id": this.liRequestDetails.OrgLevel2Id,
			"orgLevel3Id": this.liRequestDetails.OrgLevel3Id,
			"orgLevel4Id": this.liRequestDetails.OrgLevel4Id,
			"laborCategoryId": this.liRequestDetails.LaborCategoryId,
			"jobCategoryId": this.liRequestDetails.JobCategoryId,
			"reasonsForRequestId": this.liRequestDetails.ReasonForRequestId
		};
	}

	public showDrugField(): boolean {
		return this.locationDetails.IsAltDrugandbackgConfigurations
			? this.locationDetails.IsDrugResultVisible
			: this.sectorDetails.IsDrugResultVisible;
	}


	public showaBackgroundField(): boolean {
		return this.locationDetails.IsAltDrugandbackgConfigurations
			? this.locationDetails.IsBackGroundCheckVisible
			: this.sectorDetails.IsBackGroundCheckVisible;
	}

	public getBenefitAdderData(data: IBenefitData[]): void {
		this.benefitAdderList = data;
	}

	private getUserType(): void {
		const userType = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
		if (userType == magicNumber.three)
			this.isStaffingUser = true;
	}

	public getUDFLength(isUDFLength: boolean): void {
		this.hasUDFLength = isUDFLength;
	}

	public getDMSLength(isDMSLength: boolean): void {
		this.hasDMSLength = isDMSLength;
	}

	public onApproverSubmit(data: IApprovalConfigWidgetPayload): void {
		this.approverDataLength = data;
		this.approverLength = !(this.lightIndustrialUtilsService.isAllValuesZero(this.approverDataLength.data));
		this.hasApproverDataLength = this.approverDataLength.data.length === Number(magicNumber.zero);
		this.statusId = this.liRequestDetails.StatusId;
	}

	public onJobAction() {
		this.showJobDetailscard = !this.showJobDetailscard;
		this.jobiconDown = !this.jobiconDown;
		this.jobiconUp = !this.jobiconUp;
		this.isjobCardOpen = !this.isjobCardOpen;
	}
	public onApproverAction() {
		this.showApproverscard = !this.showApproverscard;
		this.approvericonDown = !this.approvericonDown;
		this.approvericonUp = !this.approvericonUp;
		this.isapproverCardOpen = !this.isapproverCardOpen;
	}
	public onCompanyAction() {
		this.showCompanyDetailscard = !this.showCompanyDetailscard;
		this.companyiconDown = !this.companyiconDown;
		this.companyiconUp = !this.companyiconUp;
		this.hideIcon = !this.hideIcon;
	}
	public onCommentAction() {
		this.showCommentsUploadscard = !this.showCommentsUploadscard;
		this.commenticonDown = !this.commenticonDown;
		this.commenticonUp = !this.commenticonUp;
		this.iscommentCardOpen = !this.iscommentCardOpen;
	}
	public onDocumentAction() {
		this.showDocumentUploadscard = !this.showDocumentUploadscard;
		this.documenticondown = !this.documenticondown;
		this.documenticonup = !this.documenticonup;
	}


	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

}
