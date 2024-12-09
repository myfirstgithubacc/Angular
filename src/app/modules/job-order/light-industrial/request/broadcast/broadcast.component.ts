import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SectorService } from 'src/app/services/masters/sector.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LightIndustrialService } from '../../services/light-industrial.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { NavigationPaths } from '../../constant/routes-constant';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage.enum';
import { LocationService } from '@xrm-master/location/services/location.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { Subject, takeUntil } from 'rxjs';
import { BroadcastInterface, DropdownItem } from '../../models/broadcast.model';
import { LightIndustrialUtilsService } from '../../services/light-industrial-utils.service';
import { LocationDetails, OrgTypeData, RequestDetails, SectorDetails, SectorOrgLevelConfigDto, ShiftDetails, TimeRange } from '../../interface/li-request.interface';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { SharedVariablesService } from '../../services/shared-variables.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IBroadcastComments, IBroadcastDetails, IOriginalDataSetItem, IStaffingAgencyItem, IStaffingAgencyListPayload, ITieredStaffingAgenciesList } from '../../interface/broadcast.interface';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { approvalStage } from '@xrm-shared/widgets/approval-widget-v2/enum';

@Component({
	selector: 'app-broadcast',
	templateUrl: './broadcast.component.html',
	styleUrls: ['./broadcast.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class BroadcastComponent implements OnInit, OnDestroy {
	public broadcastForm: FormGroup;
	public entityId: number = XrmEntities.LightIndustrialRequest;
	public recordId: number = magicNumber.zero;
	public recordUKey: string = '';
	public statusId: number;
	public broadCastRound: number = magicNumber.zero;
	public broadCastRoundDropdown: DropdownItem[] = [];
	public sectorId: number = magicNumber.zero;
	public locationId: number = magicNumber.zero;
	public reqLibraryId: number = magicNumber.zero;
	private orgLevel1Id: number = magicNumber.zero;
	private orgLevel2Id: number = magicNumber.zero;
	private orgLevel3Id: number = magicNumber.zero;
	private orgLevel4Id: number = magicNumber.zero;
	private laborCategoryId: number = magicNumber.zero;
	private jobCategoryId: number = magicNumber.zero;
	private reasonForRequestId: number = magicNumber.zero;
	public actionTypeId: number = ActionType.View;
	public userGroupId: number = magicNumber.three;
	public uploadStageId: number = DocumentUploadStage.Request_Creation;
	public processingId: number = magicNumber.five;
	public liRequestDetails: any = null;
	private locationDetails: LocationDetails | null;

	public startDate: any;
	public submissionDate: any;
	public startNoLaterThan: Date | string | null;
	public shiftDetails: ShiftDetails;
	public daysInfo: IDayInfo[] = [];
	private orgLevelConfig: SectorOrgLevelConfigDto[] = [];
	public contractorGridData: any[] = [];
	public weekDaysArray: boolean[];
	public benefitAdderList: IBenefitData[] = [];
	public baseWageRate: any;
	public tenurePolicyApplicable: boolean = false;
	public tenureLimitType: number | null = null;
	public requsitionTenure: any;
	public totalContractors: number = magicNumber.zero;
	public totalEstimatedCost: number = magicNumber.zero;
	public lastTbdSequenceNo: number = magicNumber.zero;
	private sectorDetails: SectorDetails;
	public approvalConfigWidgetData: any;
	public hasApproverDataLength: boolean = true;
	public approverDataLength: any;
	public navigationPaths: any = NavigationPaths;
	public hasUDFLength: boolean = false;
	public hasDMSLength: boolean = false;
	public isEditMode: boolean = false;
	public approverLength: boolean = false;

	public timeRange: TimeRange = this.sharedVariablesService.timeRange;

	public orgType1Data: OrgTypeData = {
		OrgName: '',
		IsVisible: true,
		IsMandatory: false
	};

	public orgType2Data: OrgTypeData = {
		OrgName: '',
		IsVisible: false,
		IsMandatory: false
	};

	public orgType3Data: OrgTypeData = {
		OrgName: '',
		IsVisible: false,
		IsMandatory: false
	};

	public orgType4Data: OrgTypeData = {
		OrgName: '',
		IsVisible: false,
		IsMandatory: false
	};

	// broadcast properties
	public staffingAgencyList: any[] = [];
	public checkedKeys: any[] = [];
	public expandedKeys: any = [""];
	private requestBroadcastDetails: any = [];
	private broadCastUKey: string | null = null;
	public isOverrideConfiguredDelayedNotification: boolean = true;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	private isSuccessToast: boolean = false;
	public broadcastComments: IBroadcastComments[];

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private route: Router,
		private sectorService: SectorService,
		private locationService: LocationService,
		private activatedRoute: ActivatedRoute,
		public udfCommonMethods: UdfCommonMethods,
		private elementRef: ElementRef,
		private cdr: ChangeDetectorRef,
		private localizationService: LocalizationService,
		private lightIndustrialService: LightIndustrialService,
		private toasterService: ToasterService,
		private customValidators: CustomValidators,
		private lightIndustrialUtilsService: LightIndustrialUtilsService,
		private sharedVariablesService: SharedVariablesService
	) {
		this.initializeBroadcastForm();
	}

	ngOnInit(): void {
		this.makeScreenScrollOnTop();
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			if (param['uKey']) {
				this.getLiRequestDetails(param['uKey']);
				this.recordUKey = param['uKey'];
			}
		});
		this.broadcastForm.get('broadcastRound')?.valueChanges.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(() => {
			this.checkCondition();
		});
		this.broadcastForm.statusChanges.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((status) => {
			if (this.isVisited === Number(magicNumber.one)) {
				if (this.panelClass1 === 'card--success') {
					// Form became invalid after being in the 'card--success' state
					if (status === 'INVALID') {
						this.panelClass1 = 'card--error';
						this.Validationcheck1 = false;
					}
				} else if (this.panelClass1 === 'card--error' && status === 'VALID') {
					// Form became valid after being in the 'card--error' state
					this.panelClass1 = 'card--success';
					this.Validationcheck1 = true;
				}
				this.cdr.detectChanges();
			}
		});
	}

	private initializeBroadcastForm(): void {
		this.broadcastForm = this.formBuilder.group({
			startTimeControlName: [null],
			endTimeControlName: [null],
			comments: [null],
			overrideConfiguredDelayedNotification: [false],
			broadcastRound: [null, [this.customValidators.RequiredValidator('BroadcastRoundValidation')]],
			selectedNode: [null]
		});
	}

	private getLiRequestDetails(uKey: string): void {
		this.lightIndustrialService.getLIReqViewById(uKey).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<RequestDetails>) => {
				if (res.Succeeded) {
					this.liRequestDetails = res.Data;
					this.getSectorDataById(this.liRequestDetails?.SectorId);
					this.getLocationDetails(this.liRequestDetails?.WorkLocationId);
					this.recordId = this.liRequestDetails?.RequestId;
					this.sectorId = this.liRequestDetails?.SectorId;
					this.locationId = this.liRequestDetails?.WorkLocationId;
					this.reqLibraryId = this.liRequestDetails?.ReqLibraryId;
					this.orgLevel1Id = this.liRequestDetails?.OrgLevel1Id;
					this.orgLevel2Id = this.liRequestDetails?.OrgLevel2Id;
					this.orgLevel3Id = this.liRequestDetails?.OrgLevel3Id;
					this.orgLevel4Id = this.liRequestDetails?.OrgLevel4Id;
					this.laborCategoryId = this.liRequestDetails?.LaborCategoryId;
					this.jobCategoryId = this.liRequestDetails?.JobCategoryId;
					this.reasonForRequestId = this.liRequestDetails?.ReasonForRequestId;
					this.startDate = this.localizationService.TransformDate(this.liRequestDetails?.StartDate);
					this.shiftDetails = this.liRequestDetails.RequestShiftDetailGetAllDto;
					this.weekDaysArray = this.lightIndustrialService.formatWeekData(this.shiftDetails);
					this.submissionDate = this.localizationService.TransformDate(this.liRequestDetails?.CreatedDate);
					this.startNoLaterThan = this.localizationService.TransformDate(this.liRequestDetails?.StartDateNoLaterThan);
					this.daysInfo = this.lightIndustrialService.generateDaysInfo(this.liRequestDetails.RequestShiftDetailGetAllDto);
					this.broadcastForm.patchValue({
						startTimeControlName: this.liRequestDetails.RequestShiftDetailGetAllDto.StartTime,
						endTimeControlName: this.liRequestDetails.RequestShiftDetailGetAllDto.EndTime
					});
					this.contractorGridData = this.liRequestDetails?.RequestPositionDetailGetAllDtos;
					this.baseWageRate = this.liRequestDetails?.RequestPositionDetailGetAllDtos.STWageRate;
					this.generateDropdownOptions(this.broadCastRound);
					this.getApprovalWidgetData();
					this.getAllStaffingAgencies();
				} else if(res.StatusCode == Number(HttpStatusCode.Unauthorized)) {
					this.route.navigate(['unauthorized']);
				}
			});
	}


	private getSectorDataById(sectorId: number): void {
		this.sectorService.getSectorData(sectorId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<SectorDetails>) => {
				if (data.Succeeded && data.Data) {
					this.sectorDetails = data.Data;
					this.orgLevelConfig = this.sectorDetails.SectorOrgLevelConfigDtos;
					this.tenureLimitType = this.sectorDetails.TenureLimitType;
					this.tenurePolicyApplicable = this.sectorDetails.TenurePolicyApplicable;
					this.requsitionTenure = this.tenurePolicyApplicable
						? this.sectorDetails.RequisitionTenureLimit
						: magicNumber.zero;
					const orgTypes = [magicNumber.one, magicNumber.two, magicNumber.three, magicNumber.four];
					orgTypes.forEach((orgType) => {
						const org = this.sectorDetails.SectorOrgLevelConfigDtos.find((orgData: any) =>
							orgData.OrgType === orgType);
						this.assignOrgTypeData(orgType, org);
					});
				}
			}
		});
	}

	private getLocationDetails(val: any): void {
		this.locationService.getLocationData(val).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<LocationDetails>) => {
				if (data.Succeeded && data.Data) {
					this.locationDetails = data.Data;
				}
			}
		});
	}

	// set orgs level
	private assignOrgTypeData(orgType: number, org: any): void {
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


	public handleTotalContractors(total: number): void {
		this.totalContractors = total;
	}


	public getContractorData(data: any): void {
		this.contractorGridData = data;
	}


	public getBenefitAdderData(data: any): void {
		this.benefitAdderList = data;
	}


	private getApprovalWidgetData(): void {
		this.approvalConfigWidgetData = {
			"actionId": approvalStage.LiCreation,
			"entityId": this.entityId,
			"sectorId": this.sectorId,
			"locationId": this.locationId,
			"orgLevel1Id": this.orgLevel1Id,
			"orgLevel2Id": this.orgLevel2Id,
			"orgLevel3Id": this.orgLevel3Id,
			"orgLevel4Id": this.orgLevel4Id,
			"laborCategoryId": this.laborCategoryId,
			"jobCategoryId": this.jobCategoryId,
			"reasonsForRequestId": this.reasonForRequestId
		};
	}


	public onApproverSubmit(data: any): void {
		this.approverDataLength = data;
		this.approverLength = !(this.lightIndustrialUtilsService.isAllValuesZero(this.approverDataLength.data));

		if (this.approverDataLength.data.length > magicNumber.zero) {
			this.hasApproverDataLength = false;
		} else {
			this.hasApproverDataLength = true;
		}
		this.statusId = this.liRequestDetails?.StatusId;
	}

	public showControl(): boolean {
		return this.sectorDetails.CostAccountingCodeHaveSpecificApprovers;
	}


	public showDrugField(): boolean {
		return this.locationDetails?.IsAltDrugandbackgConfigurations
			? this.locationDetails.IsDrugResultVisible
			: this.sectorDetails.IsDrugResultVisible;
	}


	public showaBackgroundField(): boolean {
		return this.locationDetails?.IsAltDrugandbackgConfigurations
			? this.locationDetails.IsBackGroundCheckVisible
			: this.sectorDetails.IsBackGroundCheckVisible;
	}


	private generateDropdownOptions(broadcastround: number): void {
		const dropdownOptions: any[] = [];
		// If broadcastround is greater than 0, add option with Text and Value equal to broadcastround
		if (broadcastround > Number(magicNumber.zero)) {
			dropdownOptions.push({
				Text: broadcastround,
				Value: broadcastround
			});
		}
		// Add option with Text and Value one greater than broadcastround
		const nextValue: number = Number(broadcastround) + magicNumber.one;
		dropdownOptions.push({
			Text: nextValue,
			Value: nextValue
		});
		this.broadCastRoundDropdown = dropdownOptions;
		this.patchBroadcastRoundDropdownForSingleOption();
	}

	// craete a function to set the default value of the dropdown if broadcastrounddropdown contains only one option
	private patchBroadcastRoundDropdownForSingleOption(): void {
		this.broadcastForm.patchValue({
			broadcastRound: this.broadCastRoundDropdown[this.broadCastRoundDropdown.length - magicNumber.one]
		});
	}

	public checkCondition(): boolean {
		const selectedValue = this.broadcastForm.get('broadcastRound')?.value?.Value,
			conditionMet = selectedValue === this.broadCastRound;
		return conditionMet;
	}


	private getAllStaffingAgencies(): void {
		const reqIds: IStaffingAgencyListPayload = {
			"sectorId": this.sectorId,
			"locationId": this.locationId,
			"laborCategoryId": this.laborCategoryId,
			"isSelected": null,
			"xrmEntityId": this.entityId
		};
		this.lightIndustrialService.getStaffingAgenciesList(reqIds)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
				next: (data: GenericResponseBase<ITieredStaffingAgenciesList>) => {
					if (data.Succeeded) {
						const staffingAgencyList = data.Data ?? [];
						if('Tier3' in staffingAgencyList)
							delete staffingAgencyList.Tier3;
						this.transformDataForTreeView(staffingAgencyList);
						this.getRequestBroadcastedDetails(this.recordUKey);
						this.cdr.markForCheck();
					} else {
						this.staffingAgencyList = [];
					}
				}
			});
	}

	private transformDataForTreeView(originalData: any): void {
		const transformedData: any = Object.entries(originalData).map(([key, agencies]: any, index) => {
			if (agencies.length > magicNumber.zero) {
				return {
					text: this.localizationService.GetLocalizeMessage(key),
					Index: index.toString(),
					items: agencies.map((agency: any, innerIndex: any) =>
						({
							Index: `${index}_${innerIndex}`,
							text: agency.StaffingAgencyName,
							staffingAgencyId: agency.StaffingAgencyId,
							isSelected: agency.IsSelected,
							staffingAgencyTier: agency.StaffingAgencyTier
						}))
				};
			} else {
				return null;
			}
		}).filter((item) =>
			item !== null);
		this.staffingAgencyList = transformedData;
		this.checkedKeys = this.initializeCheckedKey(transformedData);
		this.getSelectedStaffingAgencies({ checkedKey: this.checkedKeys });
	}

	private initializeCheckedKey(data: any): string[] {
		const prePatchCheckedKeys: string[] = [];
		data.forEach((outerItem: any, outerIndex: any) => {
			outerItem.items.forEach((innerItem: any, innerIndex: any) => {
				if (innerItem.isSelected) {
					prePatchCheckedKeys.push(`${outerIndex}_${innerIndex}`);
				}
			});
			// Include the outer index if any item inside it is isSelected
			if (outerItem.items.some((item: any) =>
				item.isSelected)) {
				prePatchCheckedKeys.push(outerIndex.toString());
			}
		});
		return prePatchCheckedKeys;
	}


	public selectedStaffingAgency(event: any): void {
		this.getSelectedStaffingAgencies(event);
		if (event.checkedKey.length > magicNumber.zero) {
			this.broadcastForm.setErrors(null);
		} else {
			this.broadcastForm.setErrors({ 'invalid': true });
		}
	}


	private getSelectedStaffingAgencies(data: any): void {
		const checkedKey = data.checkedKey,
			// Flatten the original dataset to a one-dimensional array
			flattenedDataSet = this.staffingAgencyList.flatMap((outerItem, outerIndex) =>
				outerItem.items.map((innerItem: any, innerIndex: any) =>
					({
						...innerItem,
						Index: `${outerIndex}_${innerIndex}`
					}))),
			// Filter the flattened dataset based on the checkedKey array
			filteredDataSet = flattenedDataSet.filter((item: any) =>
				checkedKey.includes(item.Index));
		this.createRequestBroadcastDetails(filteredDataSet);
	}


	private createRequestBroadcastDetails(filteredSelectedItems: any): void {
		const requestBroadcastDetails = filteredSelectedItems.map((item: any) =>
			({
				staffingAgencyId: item.staffingAgencyId
			}));
		this.requestBroadcastDetails = requestBroadcastDetails;
	}


	private validateStaffingAgency(): boolean {
		if (this.staffingAgencyList.length == Number(magicNumber.zero)) {
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Error, 'NoStaffingAgencyAvail');
			return false;
		}
		if (this.staffingAgencyList.length && this.staffingAgencyList[magicNumber.zero]?.items?.length == Number(magicNumber.zero)) {
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Error, 'NoStaffingAgencyForPreferredLevel', [{ Value: 'Preferred', IsLocalizeKey: true }]);
			return false;
		}
		if (this.requestBroadcastDetails.length == Number(magicNumber.zero)) {
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Error, 'SelectStaffingAgency');
			return false;
		}
		return true;
	}

	private prepareRequestData(): BroadcastInterface {
		return {
			"broadcastUkey": this.checkCondition()
				? this.broadCastUKey
				: null,
			"requestUkey": this.recordUKey,
			"xrmEntitityId": this.entityId,
			"sectorId": this.sectorId,
			"locationId": this.locationId,
			"laborCategoryId": this.laborCategoryId,
			"selectedBroadcastedRound": this.broadcastForm.get('broadcastRound')?.value?.Value,
			"requestBroadcastReasonId": 1,
			"comments": this.broadcastForm.get('comments')?.value,
			"OverrideDelayedNotification": this.broadcastForm.get('overrideConfiguredDelayedNotification')?.value,
			"requestBroadcastDetails": this.requestBroadcastDetails
		};
	}

	public submitForm(isRebroadcast: boolean = false): void {
		this.openExpensionPanel();
		const payload = this.prepareRequestData();
		if (!this.validateStaffingAgency()) {
			return;
		}
		if (this.broadcastForm.valid) {
			const requestObservable = isRebroadcast
				? this.lightIndustrialService.requestRebroadcast(payload)
				: this.lightIndustrialService.requestBroadcast(payload);

			requestObservable.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data: any) => {
				this.toasterService.resetToaster();
				if (!data.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Error, data.Message);
				} else if (data.StatusCode == HttpStatusCode.Ok) {
					this.isSuccessToast = true;
					this.route.navigate([this.navigationPaths.list]);
					this.toasterService.showToaster(
						ToastOptions.Success,
						'Broadcastedsubmittedmsg', [{ Value: this.liRequestDetails.RequestCode, IsLocalizeKey: false }]
					);
				}
			});
		} else {
			this.panelClass1 = 'card--error';
		}
	}

	private openExpensionPanel() {
		if (this.panelClass1 == 'card--error') {
			this.isPanelOpen1 = true;
		}
	}

	private makeScreenScrollOnTop() {
		const field = this.elementRef.nativeElement.querySelector('.app-content__body');
		if (field != null) {
			setTimeout(() => {
				field.scrollIntoView({ block: 'center' });
				window.scrollTo(magicNumber.zero, magicNumber.zero);
			}, magicNumber.zero);
		}
	}

	private getRequestBroadcastedDetails(recordUKey: string): void {
		this.lightIndustrialService.getRequestBroadcast(recordUKey)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data: GenericResponseBase<IBroadcastDetails>) => {
				if (data.StatusCode == Number(HttpStatusCode.Ok) && data.Data) {
					this.broadcastComments = data.Data.BroadcastComments;
					this.patchRequestBroadcastedDetails(data.Data);
				}
			});
	}

	// in case of broadcast request is already created
	private patchRequestBroadcastedDetails(data: IBroadcastDetails): void {
		this.broadCastUKey = data.UKey;
		this.broadcastForm.patchValue({
			broadcastRound: { Value: data.BroadcastRound },
			overrideConfiguredDelayedNotification: data.OverrideConfiguredDelayedNotification
		});
		// hide the overrideConfiguredDelayedNotification checkbox if the request is already broadcasted
		this.isOverrideConfiguredDelayedNotification = false;

		this.broadCastRound = data.BroadcastRound;
		this.generateDropdownOptions(this.broadCastRound);
		// patch the staffing agencies
		const prePatchCheckedKeysByStaffingAgencyId =
			this.initializeCheckedKeyByStaffingAgencyId(this.staffingAgencyList, data.RequestBroadcastDetailsGetAll);
		this.checkedKeys = prePatchCheckedKeysByStaffingAgencyId;
		this.getSelectedStaffingAgencies({ checkedKey: this.checkedKeys });
		this.cdr.markForCheck();
	}

	private initializeCheckedKeyByStaffingAgencyId(dataSet: IOriginalDataSetItem[], agencies: IStaffingAgencyItem[]): string[] {
		const prePatchCheckedKeys: string[] = [];
		dataSet.forEach((outerItem, outerIndex) => {
			// Check if all child items have matching staffingAgencyId in the agencies list
			const allChildItemsMatched = outerItem.items.every((innerItem) =>
				agencies.some((agency) =>
					agency.StaffingAgencyId === innerItem.staffingAgencyId));
			if (allChildItemsMatched) {
				// Include the outer index only if all child items have matching staffingAgencyId
				prePatchCheckedKeys.push(outerIndex.toString());
			}
			outerItem.items.forEach((innerItem, innerIndex) => {
				if (agencies.some((agency) =>
					agency.StaffingAgencyId === innerItem.staffingAgencyId)) {
					prePatchCheckedKeys.push(`${outerIndex}_${innerIndex}`);
				}
			});
		});
		return prePatchCheckedKeys;
	}


	isVisited: number = magicNumber.one;

	public Validationcheck1 = false;
	public panelClass1 = '';
	public isPanelOpen1 = true;

	public togglePanelState1() {
		if (!this.isVisited) {
			// Set the initial class when the panel is first opened
			this.panelClass1 = 'card--info';
			this.isVisited = 1;
		} else if (this.isVisited === Number(magicNumber.one)) {
			// Check the validity of the form and set the class accordingly
			if (this.broadcastForm.valid && this.requestBroadcastDetails.length != Number(magicNumber.zero)) {
				this.panelClass1 = 'card--success';
			} else {
				this.panelClass1 = 'card--error';
			}
		} else {
			// Toggle between 'card--success' and 'card--error' based on broadcastForm validity
			this.panelClass1 = this.broadcastForm.valid
				? 'card--success'
				: 'card--error';
		}
		// Toggle the state of isPanelOpen1
		this.isPanelOpen1 = !this.isPanelOpen1;
		// Update Validationcheck1 based on the current class
		this.Validationcheck1 = this.panelClass1 === 'card--success';
	}

	public getUDFLength(isUDFLength: boolean): void {
		this.hasUDFLength = isUDFLength;
	}

	public getDMSLength(isDMSLength: boolean): void {
		this.hasDMSLength = isDMSLength;
	}

	public cancelForm(): void {
		this.toasterService.resetToaster();
		if (this.route.url.includes('global-search')) {
			this.route.navigate(['/xrm/landing/global-search']);
		} else {
			this.route.navigate(['/xrm/job-order/light-industrial/list']);
		}
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		if (!this.isSuccessToast)
			this.toasterService.resetToaster();
	}

}
