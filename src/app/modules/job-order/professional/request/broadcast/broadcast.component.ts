import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StepperID } from '../../constant/stepper';
import { ProfessionalRequestService } from '../../services/professional-request.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ILaborCategoryDetails, IProfRequestAssignment, IProfRequestData } from '../../interface/shared-data.interface';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ApprovalReq } from '@xrm-master/approval-configuration/constant/enum';
import { LightIndustrialUtilsService } from '../../../light-industrial/services/light-industrial-utils.service';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { NavigationPaths } from '../../constant/routes-constant';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { LightIndustrialService } from '../../../light-industrial/services/light-industrial.service';
import { SharedVariablesService } from '../../../light-industrial/services/shared-variables.service';
import { LocationDetails, SectorDetails, SectorOrgLevelConfigDto, TimeRange } from '../../../light-industrial/interface/li-request.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { ChildDataItem, IBroadcastComments, IBroadcastDetails, ICheckedKeys, IOriginalDataSetItem, IRequestBroadcastDetails, ISelectedStaffingAgency, IStaffingAgencies, IStaffingAgencyItem, IStaffingAgencyListPayload, ITieredStaffingAgenciesList } from '../../../light-industrial/interface/broadcast.interface';
import { IDropdownOption } from '@xrm-shared/models/common.model';
import { BroadcastInterface } from '../../../light-industrial/models/broadcast.model';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { EMPTY, forkJoin, map, Observable, switchMap } from 'rxjs';
import { StatusID } from '../../constant/request-status';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { CostEstimationTypes } from '@xrm-shared/services/common-constants/static-data.enum';
import { SectorService } from 'src/app/services/masters/sector.service';
import { LocationService } from '@xrm-master/location/services/location.service';
import { OrgTypeData } from '../../../common-models/org-type.model';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';

@Component({
	selector: 'app-broadcast',
	templateUrl: './broadcast.component.html',
	styleUrls: ['./broadcast.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class BroadcastComponent implements OnInit {

	public statusId: number = magicNumber.zero;
	public approverLength: boolean = false;
	public entityId: number = XrmEntities.ProfessionalRequest;
	private approverDataLength: ApprovalReq;
	public hasApproverDataLength: boolean = false;
	public actionTypeId: number = ActionType.View;
	public hasUDFLength: boolean = false;
	public userGroupId: number = magicNumber.three;
	public uploadStageId: number = DocumentUploadStage.Request_Creation;
	public processingId: number = magicNumber.five;
	public hasDMSLength: boolean = false;
	public daysInfo: IDayInfo[] = [];
	public timeRange: TimeRange = this.sharedVariablesService.timeRange;
	private currencyVal: string = '';
	private countryId: number;
	public hasBenefitAdderLength: boolean;
	public professionalReqBroadcastForm: FormGroup;
	public broadcastReasonList: IDropdownOption[] = [];
	public staffingAgencyList: IOriginalDataSetItem[] = [];
	public checkedKeys: string[] = [];
	public disabledKeys: string[]= [];
	public expandedKeys: string[] = [""];
	private requestBroadcastDetails: IRequestBroadcastDetails[] = [];
	private broadCastUKey: string | null = null;
	public isOverrideConfiguredDelayedNotification: boolean = true;
	// needed to make this string, as label widget does not show 0 if it's a number
	public lastBroadcastRound: string = '0';
	private isSuccessToast: boolean = false;
	public recordUKey: string = '';
	public broadcastRoundDropdown: IDropdownOption[] = [];
	public lastBroadcastDate: string = '';
	public isPreIdentifiedRequest: boolean = false;
	public proffUkeyData: IProfRequestData;

	public isBudgetedHour: boolean = false;
	private locationDetails: LocationDetails | null;
	public sectorDetails: SectorDetails;
	private labourCatData: ILaborCategoryDetails;
	public isOTHousBilledAtShow: boolean = true;
	public isSecurityClearanceRequired: boolean = false;
	public orgType1Data: OrgTypeData = this.sharedVariablesService.orgType1Data;
	public orgType2Data: OrgTypeData = this.sharedVariablesService.orgType2Data;
	public orgType3Data: OrgTypeData = this.sharedVariablesService.orgType3Data;
	public orgType4Data: OrgTypeData = this.sharedVariablesService.orgType4Data;
	public broadcastComments: IBroadcastComments[];
	public openBroadcastPanel: boolean = true;
	public multipleStaffingsForPSR: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private destroyRef: DestroyRef,
		private professionalRequestService: ProfessionalRequestService,
		private cdr: ChangeDetectorRef,
		private lightIndustrialUtilsService: LightIndustrialUtilsService,
		private toasterService: ToasterService,
		private lightIndustrialService: LightIndustrialService,
		private sharedVariablesService: SharedVariablesService,
		private formBuilder: FormBuilder,
		private route: Router,
		private localizationService: LocalizationService,
		private customValidators: CustomValidators,
		private sectorService: SectorService,
		private locationService: LocationService
	) { }

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((param) => {
			this.recordUKey = param['uKey'];
			if (!this.recordUKey) return;
			this.getProffRequestDetails(this.recordUKey, StepperID.GetByUkey);
		});
		this.initializeBroadcastForm();
		this.getBroadcastReasonList();
		this.destroyRef.onDestroy(() => {
			if (!this.isSuccessToast)
				this.toasterService.resetToaster();
		});
	}

	private getProffRequestDetails(uKey: string, stepperId: number): void {
		this.professionalRequestService.getReqViewById(uKey, stepperId)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap((res: GenericResponseBase<IProfRequestData>) => {
					if (!res.Succeeded || !res.Data) {
						return EMPTY;
					} else if (res.StatusCode === Number(HttpStatusCode.Unauthorized)) {
						this.route.navigate(['unauthorized']);
						return EMPTY;
					}
					this.assignProffRequestData(res.Data);
					return this.fetchAdditionalDetails();
				}),
				switchMap(() =>
					this.getRequestBroadcastedDetails(this.recordUKey))
			).subscribe();
	}

	private assignProffRequestData(requestData: IProfRequestData): void {
		this.proffUkeyData = requestData;
		this.statusId = this.proffUkeyData.ProfRequest.RequestDetail.StatusId;
		this.setShiftDetails(this.proffUkeyData.ProfRequestAssignment);
		this.generateDropdownOptions(Number(this.lastBroadcastRound));
		this.isPreIdentifiedRequest = this.proffUkeyData.ProfRequest.RequestDetail.IsPreIdentifiedRequest;
	}

	private fetchAdditionalDetails(): Observable<void> {
		return forkJoin({
			sectorData: this.getSectorDataById(this.proffUkeyData.ProfRequest.RequestDetail.SectorId),
			locationData: this.getLocationData(this.proffUkeyData.ProfRequest.RequestDetail.WorkLocationId),
			labourCatData: this.getLabourCatData(this.proffUkeyData.ProfRequest.PositionDetail.LaborCategoryId)
		}).pipe(switchMap(({ sectorData, locationData, labourCatData }) => {
			this.handleSectorData(sectorData);
			this.locationDetails = locationData.Data ?? null;
			this.handleLabourCatData(labourCatData);
			this.cdr.markForCheck();

			return this.handleStatusCheck();
		}));
	}

	private handleStatusCheck(): Observable<void> {
		if (this.statusId === Number(StatusID.Approved)) {
			return this.setAcknowledgeStatus(this.proffUkeyData.ProfRequest.RequestDetail.RequestId)
				.pipe(switchMap(() =>
					this.getAllStaffingAgencies()));
		}
		return this.getAllStaffingAgencies();
	}


	private setAcknowledgeStatus(recordId: number): Observable<ApiResponseBase> {
		return this.professionalRequestService.setAcknowledgeByMspStatus({
			XrmEntityId: this.entityId,
			RecordId: recordId,
			CurrentStatusId: StatusID.Approved
		}).pipe(takeUntilDestroyed(this.destroyRef));
	}

	private getAllStaffingAgencies(): Observable<void> {
		const staffingAgencyListPayload: IStaffingAgencyListPayload = {
			"sectorId": this.proffUkeyData.ProfRequest.RequestDetail.SectorId,
			"locationId": this.proffUkeyData.ProfRequest.RequestDetail.WorkLocationId,
			"laborCategoryId": this.proffUkeyData.ProfRequest.PositionDetail.LaborCategoryId,
			"isSelected": null,
			"xrmEntityId": this.entityId,
			"securityClearanceId": this.proffUkeyData.ProfRequest.PositionDetail.SecurityClearanceId
		};

		return this.lightIndustrialService.getStaffingAgenciesList(staffingAgencyListPayload).pipe(
			takeUntilDestroyed(this.destroyRef),
			map((data: GenericResponseBase<ITieredStaffingAgenciesList>) => {
				if (!data.Succeeded || !data.Data) {
					this.staffingAgencyList.length = magicNumber.zero;
					return;
				}
				const staffingAgencyList = data.Data;
				if ('Tier3' in staffingAgencyList) delete staffingAgencyList.Tier3;
				this.transformDataForTreeView(staffingAgencyList);
				this.cdr.markForCheck();
			})
		);
	}

	private getRequestBroadcastedDetails(recordUKey: string): Observable<void> {
		return this.lightIndustrialService.getRequestBroadcast(recordUKey).pipe(
			takeUntilDestroyed(this.destroyRef),
			map((data: GenericResponseBase<IBroadcastDetails>) => {
				if (!data.Succeeded || !data.Data) return;
				this.patchRequestBroadcastedDetails(data.Data);
			})
		);
	}

	private initializeBroadcastForm(): void {
		this.professionalReqBroadcastForm = this.formBuilder.group({
			overrideConfiguredNotif: [null],
			submittalCutOffDate: [null],
			broadcastReason: [null, this.broadcastReasonFieldValidation()],
			broadcastComments: [null],
			startTimeControlName: [null],
			endTimeControlName: [null],
			broadcastRound: [null, this.broadcastRoundFieldValidation()]
		});
	}

	private broadcastReasonFieldValidation(): ValidatorFn {
		return this.customValidators.RequiredValidator('BroadcastReasonValidation');
	}

	private broadcastRoundFieldValidation(): ValidatorFn {
		return this.customValidators.RequiredValidator('BroadcastRoundValidation');
	}

	private setShiftDetails(data: IProfRequestAssignment): void {
		this.daysInfo = this.lightIndustrialService.generateDaysInfo(data.ShiftRequirement);
		this.professionalReqBroadcastForm.controls['startTimeControlName'].patchValue(data.ShiftRequirement.StartTime);
		this.professionalReqBroadcastForm.controls['endTimeControlName'].patchValue(data.ShiftRequirement.EndTime);
	}

	private generateDropdownOptions(broadcastround: number): void {
		this.broadcastRoundDropdown.length = magicNumber.zero;
		// If broadcastround is greater than 0, add option with Text and Value equal to broadcastround
		if (broadcastround > Number(magicNumber.zero)) {
			this.broadcastRoundDropdown.push({
				Text: broadcastround.toString(),
				Value: broadcastround,
				IsSelected: false,
				TextLocalizedKey: broadcastround.toString()
			});
		}
		// Add option with Text and Value one greater than broadcastround
		this.broadcastRoundDropdown.push({
			Text: (Number(broadcastround) + magicNumber.one).toString(),
			Value: Number(broadcastround) + magicNumber.one,
			IsSelected: false,
			TextLocalizedKey: (Number(broadcastround) + magicNumber.one).toString()
		});
		this.patchBroadcastRoundDropdownForSingleOption();
	}

	// craete a function to set the default value of the dropdown if broadcastrounddropdown contains only one option
	private patchBroadcastRoundDropdownForSingleOption(): void {
		this.professionalReqBroadcastForm.patchValue({
			broadcastRound: this.broadcastRoundDropdown[this.broadcastRoundDropdown.length - magicNumber.one]
		});
	}

	public isRebroadcasting(): boolean {
		const selectedValue: number = this.professionalReqBroadcastForm.get('broadcastRound')?.value?.Value,
			showRebroadcast = selectedValue === Number(this.lastBroadcastRound);
		return showRebroadcast;
	}

	private transformDataForTreeView(originalData: ITieredStaffingAgenciesList): void {
		this.staffingAgencyList = Object.entries(originalData)
			.map(([key, agencies], index) => {
				if (agencies.length == magicNumber.zero) return undefined;
				return {
					text: this.localizationService.GetLocalizeMessage(key),
					Index: index.toString(),
					items: agencies.map((agency: IStaffingAgencies, innerIndex: number) =>
						({
							Index: `${index}_${innerIndex}`,
							text: agency.StaffingAgencyName,
							staffingAgencyId: agency.StaffingAgencyId,
							isSelected: this.isPreIdentifiedRequest
								? false
								 : agency.IsSelected,
							staffingAgencyTier: agency.StaffingAgencyTier
						}))
				};
			})
			.filter((item): item is IOriginalDataSetItem =>
				item !== undefined);
		this.checkedKeys = this.initializeCheckedKey(this.staffingAgencyList);
		this.getSelectedStaffingAgencies({ checkedKey: this.checkedKeys });
	}

	private initializeCheckedKey(data: IOriginalDataSetItem[]): string[] {
		const prePatchCheckedKeys: string[] = [];
		data.forEach((outerItem: IOriginalDataSetItem, outerIndex: number) => {
			outerItem.items.forEach((innerItem: ChildDataItem, innerIndex: number) => {
				if (innerItem.isSelected) {
					prePatchCheckedKeys.push(`${outerIndex}_${innerIndex}`);
				}
			});
			if (outerItem.items.some((item: ChildDataItem) =>
				item.isSelected)) {
				prePatchCheckedKeys.push(outerIndex.toString());
			}
		});
		return prePatchCheckedKeys;
	}

	// get selected checkbox data
	public selectedStaffingAgency(event: ISelectedStaffingAgency): void {
		this.getSelectedStaffingAgencies(event);
		if (event.checkedKey.length > Number(magicNumber.zero)) {
			this.professionalReqBroadcastForm.setErrors(null);
		} else {
			this.professionalReqBroadcastForm.setErrors({ 'invalid': true });
		}
	}

	private getSelectedStaffingAgencies(data: ICheckedKeys): void {
		const checkedKey = data.checkedKey,
			flattenedDataSet = this.staffingAgencyList.flatMap((outerItem, outerIndex) =>
				outerItem.items.map((innerItem, innerIndex) =>
					({
						...innerItem,
						Index: `${outerIndex}_${innerIndex}`
					}))),
			filteredDataSet = flattenedDataSet.filter((item) =>
				 checkedKey.includes(item.Index));

		if (this.isPreIdentifiedRequest && filteredDataSet.length > Number(magicNumber.zero)) {
			const selectedKeys = filteredDataSet.map((item) =>
				 item.Index);
			this.checkPSRStaffings(selectedKeys, flattenedDataSet);

		} else {
			this.disabledKeys = [];
		}

		this.createRequestBroadcastDetails(filteredDataSet);
	}

	private checkPSRStaffings(selectedKeys: string[], flattenedDataSet: ChildDataItem[]){
		if (selectedKeys.length > Number(magicNumber.one)) {
			this.multipleStaffingsForPSR = true;
		} else {
			this.multipleStaffingsForPSR = false;
			this.disabledKeys = flattenedDataSet.filter((item) =>
						 !selectedKeys.includes(item.Index)).map((item) =>
						 item.Index);
		}
	}

	// create request broadcast details
	private createRequestBroadcastDetails(filteredSelectedItems: ChildDataItem[]): void {
		// Transform filtered selected items into requestBroadcastDetails format
		this.requestBroadcastDetails = filteredSelectedItems.map((item: ChildDataItem) =>
			({
				staffingAgencyId: item.staffingAgencyId
			}));
	}


	private validateStaffingAgency(): boolean {
		this.toasterService.resetToaster();
		if (this.staffingAgencyList.length == Number(magicNumber.zero)) {
			this.toasterService.showToaster(ToastOptions.Error, 'NoStaffingAgencyAvail');
			return false;
		}
		if (this.staffingAgencyList.length && this.staffingAgencyList[magicNumber.zero]?.items?.length == Number(magicNumber.zero)) {
			this.toasterService.showToaster(ToastOptions.Error, 'NoStaffingAgencyForPreferredLevel', [{ Value: 'Preferred', IsLocalizeKey: true }]);
			return false;
		}
		if (this.requestBroadcastDetails.length == Number(magicNumber.zero)) {
			this.toasterService.showToaster(ToastOptions.Error, 'SelectStaffingAgency');
			return false;
		}
		if(this.multipleStaffingsForPSR){
			this.toasterService.showToaster(ToastOptions.Error, 'PSRRequestStaffingAgencyValidation');
			return false;
		}
		return true;
	}

	private prepareRequestData(): BroadcastInterface {
		return {
			"broadcastUkey": this.isRebroadcasting()
				? this.broadCastUKey
				: null,
			"requestUkey": this.recordUKey,
			"xrmEntitityId": this.entityId,
			"sectorId": this.proffUkeyData.ProfRequest.RequestDetail.SectorId,
			"locationId": this.proffUkeyData.ProfRequest.RequestDetail.WorkLocationId,
			"laborCategoryId": this.proffUkeyData.ProfRequest.PositionDetail.LaborCategoryId,
			"selectedBroadcastedRound": this.professionalReqBroadcastForm.get('broadcastRound')?.value?.Value,
			"requestBroadcastReasonId": this.professionalReqBroadcastForm.get('broadcastReason')?.value?.Value,
			"comments": this.professionalReqBroadcastForm.get('broadcastComments')?.value,
			"OverrideDelayedNotification": this.professionalReqBroadcastForm.get('overrideConfiguredNotif')?.value,
			"requestBroadcastDetails": this.requestBroadcastDetails,
			"submittalCutOffDate": this.localizationService.TransformDate(this.professionalReqBroadcastForm.get('submittalCutOffDate')?.value)
		};
	}

	public togglePanelState1() {
		this.openBroadcastPanel = !this.openBroadcastPanel;
	}

	public submitForm(isRebroadcast: boolean = false): void {
		this.professionalReqBroadcastForm.markAllAsTouched();
		if(!this.validateStaffingAgency() || this.professionalReqBroadcastForm.invalid) {
			this.openBroadcastPanel = true;
			return;
		}
		if (!this.professionalReqBroadcastForm.valid) return;
		const requestObservable = isRebroadcast
			? this.lightIndustrialService.requestRebroadcast(this.prepareRequestData())
			: this.lightIndustrialService.requestBroadcast(this.prepareRequestData());

		requestObservable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: ApiResponse) => {
			this.toasterService.resetToaster();
			if (!data.Succeeded && data.Message) {
				this.toasterService.showToaster(ToastOptions.Error, data.Message);
				return;
			}
			this.isSuccessToast = true;
			this.route.navigate([NavigationPaths.list]);
			this.toasterService.showToaster(
				ToastOptions.Success,
				'Broadcastedsubmittedmsg', [{ Value: this.proffUkeyData.ProfRequest.RequestDetail.RequestCode, IsLocalizeKey: false }]
			);
		});
	}

	// in case of broadcast request is already created
	private patchRequestBroadcastedDetails(data: IBroadcastDetails): void {
		this.broadCastUKey = data.UKey;
		this.broadcastComments = data.BroadcastComments;
		this.professionalReqBroadcastForm.patchValue({
			broadcastRound: { Value: data.BroadcastRound },
			overrideConfiguredNotif: data.OverrideConfiguredDelayedNotification,
			broadcastReason: { Value: data.RequestBroadcastReasonId?.toString() },
			submittalCutOffDate: data.SubmittalCutOffDate
				? new Date(data.SubmittalCutOffDate)
				: null
		});
		// hide the overrideConfiguredNotif checkbox if the request is already broadcasted
		this.isOverrideConfiguredDelayedNotification = false;
		this.lastBroadcastDate = data.LastBroadcastDate;

		this.lastBroadcastRound = data.BroadcastRound.toString();
		this.generateDropdownOptions(Number(this.lastBroadcastRound));
		this.checkedKeys = this.initializeCheckedKeyByStaffingAgencyId(this.staffingAgencyList, data.RequestBroadcastDetailsGetAll);
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

	// #region methods with no dependency or used on HTML

	private getBroadcastReasonList(): void {
		this.professionalRequestService.getBroadcastReasonData('BroadCastReason')
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((res: GenericResponseBase<IDropdownOption[]>) => {
				if (!res.Succeeded || !res.Data) return;
				this.broadcastReasonList = res.Data;
			});
	}

	public getDayHourLocalizationValue(key: string): string {
		this.getCultureType();
		let unitType = this.proffUkeyData.ProfRequestFinancial.RateUniteName ?? '';
		unitType = unitType !== ''
			? unitType
			: 'Hour';
		const dynamicParam: DynamicParam[] = [
			{ Value: this.currencyVal, IsLocalizeKey: false },
			{ Value: unitType, IsLocalizeKey: true }
		];
		return this.localizationService.GetLocalizeMessage(key, dynamicParam);
	}

	private getCultureType(): void {
		this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.currencyVal = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);
	}

	public getUDFLength(isUDFLength: boolean): void {
		this.hasUDFLength = isUDFLength;
	}

	public getDMSLength(isDMSLength: boolean): void {
		this.hasDMSLength = isDMSLength;
	}

	public getBenefitAdderData(data: IBenefitData[]): void {
		this.hasBenefitAdderLength = data.length > Number(magicNumber.zero);
	}

	public onApproverSubmit(data: ApprovalReq): void {
		this.approverDataLength = data;
		// to get approver data length for status bar
		this.approverLength = !(this.lightIndustrialUtilsService.isAllValuesZero(this.approverDataLength.data));
		this.hasApproverDataLength = Boolean(this.approverDataLength.data.length);
		this.statusId = this.proffUkeyData.ProfRequest.RequestDetail.StatusId;
	}

	public disabledDates = (date: Date): boolean => {
		const isPastDate = date < new Date(),
			control = this.professionalReqBroadcastForm.controls['submittalCutOffDate'];
		control.setErrors(isPastDate
			? { error: true, message: 'SubmittalCutOffDateValidation' }
			: null);
		return isPastDate;
	};

	// #endregion

	private getSectorDataById(sectorId: number): Observable<GenericResponseBase<SectorDetails>> {
		return this.sectorService.getSectorData(sectorId).pipe(takeUntilDestroyed(this.destroyRef));
	}

	private getLocationData(locationId: number): Observable<GenericResponseBase<LocationDetails>> {
		return this.locationService.getLocationData(locationId).pipe(takeUntilDestroyed(this.destroyRef));
	}

	private getLabourCatData(labCatId: number): Observable<GenericResponseBase<ILaborCategoryDetails>> {
		return this.professionalRequestService.getLabourCategoryDetails(labCatId).pipe(takeUntilDestroyed(this.destroyRef));
	}

	private handleSectorData(sectorData: GenericResponseBase<SectorDetails>): void {
		if (!sectorData.Succeeded || !sectorData.Data) return;
		this.sectorDetails = sectorData.Data;
		this.overTimeHoursBilledAtShow();
		this.checkSecurityClearance(this.proffUkeyData.ProfRequest.PositionDetail.SecurityClearanceId, this.sectorDetails.IsSecurityClearance);

		const orgTypes = [magicNumber.one, magicNumber.two, magicNumber.three, magicNumber.four];
		orgTypes.forEach((orgType) => {
			const org = sectorData.Data?.SectorOrgLevelConfigDtos.find((orgData: SectorOrgLevelConfigDto) =>
				orgData.OrgType === Number(orgType));
			if (!org) return;
			this.assignOrgTypeData(orgType, org);
		});
	}

	private handleLabourCatData(labourCatData: GenericResponseBase<ILaborCategoryDetails>): void {
		if (!labourCatData.Succeeded || !labourCatData.Data) return;
		this.labourCatData = labourCatData.Data;
		this.isBudgetedHour = labourCatData.Data.CostEstimationTypeId === Number(CostEstimationTypes['Budgeted Hours']);
	}

	public getNteBillRateLabel(): string {
		const { BillRateValidationId } = this.labourCatData;
		if (!BillRateValidationId) {
			return this.localizationService.GetLocalizeMessage('NteTargetRate');
		}
		let value: string | null = null;
		if (BillRateValidationId === Number(dropdown.NTEValue)) {
			value = "NTE";
		} else if (BillRateValidationId === Number(dropdown.TargetValue)) {
			value = "Target";
		}
		return value
			? this.localizationService.GetLocalizeMessage('BillRateCurr', [{ Value: value, IsLocalizeKey: false }])
			: this.localizationService.GetLocalizeMessage('NteTargetRate');
	}

	private overTimeHoursBilledAtShow(): void {
		this.isOTHousBilledAtShow = !this.sectorDetails.MaskOtFieldsInSystem;
	}

	private checkSecurityClearance(securityClearanceId: number, isSecurityClearance: boolean): void {
		this.isSecurityClearanceRequired = (securityClearanceId != Number(magicNumber.one) && isSecurityClearance);
	}

	private assignOrgTypeData(orgType: number, org: SectorOrgLevelConfigDto): void {
		const orgTypeData = {
			OrgName: this.localizationService.GetLocalizeMessage(org.LocalizedKey),
			IsVisible: org.IsVisible,
			IsMandatory: org.IsMandatory
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
}
