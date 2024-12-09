import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LightIndustrialService } from '../../services/light-industrial.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { NavigationPaths } from '../../constant/routes-constant';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LocationService } from '@xrm-master/location/services/location.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FocusOnErrorDirective } from '@xrm-shared/directives/focus-on-erro.directive';
import { ApproverDataInterface } from '../../models/review-request.model';
import { LightIndustrialUtilsService } from '../../services/light-industrial-utils.service';
import { SharedVariablesService } from '../../services/shared-variables.service';
import { LiRequestDetails } from '../../models/li-request-data.model';
import { IApprovalConfigWidgetPayload, IApproveRequestResponse, INavigationPaths, LocationDetails, OrgTypeData, RequestDetails, RequestPositionDetailGetAllDto, RequestShiftDetailGetAllDto, SectorDetails, SectorOrgLevelConfigDto, TimeRange } from '../../interface/li-request.interface';
import { ReviewComments } from '../../../review-candidates/interface/review-candidate.interface';
import { IPermissionInfo } from '@xrm-shared/models/common.model';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ApprovalInfoDetails } from '@xrm-master/approval-configuration/constant/enum';

@Component({
	selector: 'app-review-request',
	templateUrl: './review-request.component.html',
	styleUrls: ['./review-request.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewRequestComponent implements OnInit, OnDestroy {
	@ViewChild('commentSection') commentSection: ElementRef;
	public focus: FocusOnErrorDirective = new FocusOnErrorDirective();
	public liRequestForm: FormGroup;
	public liRequestDetails: RequestDetails;
	private sectorDetails: SectorDetails;
	private locationDetails: LocationDetails;
	public hasUDFLength: boolean;
	public hasDMSLength: boolean;
	private entityActionList: IPermissionInfo[] = [];
	public isBroadcastActionAllowed: boolean;
	public shiftDetails: RequestShiftDetailGetAllDto;
	public tenurePolicyApplicable: boolean = false;
	public tenureLimitType: number | null = null;
	public requsitionTenure: number;
	public hasApproverDataLength: boolean = true;
	private approverDataLength: IApprovalConfigWidgetPayload;
	public approverLength: boolean = false;
	public orgType1Data: OrgTypeData = this.sharedVariablesService.orgType1Data;
	public orgType2Data: OrgTypeData = this.sharedVariablesService.orgType2Data;
	public orgType3Data: OrgTypeData = this.sharedVariablesService.orgType3Data;
	public orgType4Data: OrgTypeData = this.sharedVariablesService.orgType4Data;
	private ukey: string;
	public navigationPaths: INavigationPaths = NavigationPaths;
	public ApprovalConfigWidgetData: ApprovalInfoDetails;
	public entityId: number = XrmEntities.LightIndustrialRequest;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.View;
	public userGroupId: number = magicNumber.three;
	public uploadStageId: number = DocumentUploadStage.Request_Creation;
	public processingId: number = magicNumber.five;
	public contractorGridData: RequestPositionDetailGetAllDto[] = [];
	public benefitAdderList: IBenefitData[] = [];
	public weekDaysArray: boolean[];
	public isEditMode: boolean = true;
	public daysInfo: IDayInfo[] = [];
	public timeRange: TimeRange = this.sharedVariablesService.timeRange;
	public isRequiredComment: boolean = false;
	public statusId: number;
	public isCACHaveSpecificApprovers: boolean = false;

	public showRequisitioncard: boolean = true;
	public showBroadcastcard: boolean = true;
	public showApproverscard: boolean = false;
	public showCommentsUploadscard: boolean = false;
	public showOtherDetailscard: boolean = false;
	public showDocumentUploadscard: boolean = false;
	public requisitionicondown: boolean = false;
	public requisitioniconup: boolean = true;
	public approvericondown: boolean = true;
	public approvericonup: boolean = false;
	public broadcasticondown: boolean = true;
	public broadcasticonup: boolean = false;
	public otherdetailsicondown: boolean = true;
	public otherdetailsiconup: boolean = false;
	public commenticondown: boolean = true;
	public commenticonup: boolean = false;
	public documenticondown: boolean = true;
	public documenticonup: boolean = false;
	public reviewComments: ReviewComments[];
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public submissionDate: string;
	public startDate: string;
	public baseWageRate: number| null;

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private locationService: LocationService,
		private sectorService: SectorService,
		private lightIndustrialServices: LightIndustrialService,
		private localizationService: LocalizationService,
		private customValidators: CustomValidators,
		private toasterService: ToasterService,
		private route: Router,
		private eventLog: EventLogService,
		private formbuilder: FormBuilder,
		private cdr: ChangeDetectorRef,
		private lightIndustrialUtilsService: LightIndustrialUtilsService,
		private sharedVariablesService: SharedVariablesService
	) { }

	ngOnInit(): void {
		this.initializeForm();
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			if (param != null || param != '') {
				this.getLiRequestDetails(param["uKey"]);
				this.ukey = param["uKey"];
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
		this.liRequestForm = this.formbuilder.group({
			startTimeControlName: [null],
			endTimeControlName: [null],
			approverComment: [null]
		});
	}

	private isRouteFromReviewLink(): void {
		if(!this.liRequestDetails.IsReviewActionRequired && localStorage.getItem('isReviewLink') == 'true')
		{
			this.toasterService.displayToaster(ToastOptions.Warning, this.localizationService.GetLocalizeMessage('AlreadyProcessedRecord'));
		}
	}

	private getLiRequestDetails(uKey: string): void {
		this.lightIndustrialServices.getLIReqViewById(uKey).pipe(takeUntil(this.destroyAllSubscriptions$)).
			subscribe((res: GenericResponseBase<RequestDetails>) => {
				if (res.Succeeded && res.Data) {
					this.liRequestDetails = res.Data;
					this.reviewComments = this.liRequestDetails.ReviewerComments;
					this.getSectorDataById(this.liRequestDetails.SectorId);
					this.getLocationData(this.liRequestDetails.WorkLocationId);
					this.eventLog.recordId.next(this.liRequestDetails.RequestId);
					this.eventLog.entityId.next(this.entityId);
					this.shiftDetails = this.liRequestDetails.RequestShiftDetailGetAllDto;
					this.weekDaysArray = this.lightIndustrialServices.formatWeekData(this.liRequestDetails.RequestShiftDetailGetAllDto);
					this.liRequestForm.controls['startTimeControlName'].patchValue(this.liRequestDetails.RequestShiftDetailGetAllDto.StartTime);
					this.liRequestForm.controls['endTimeControlName'].patchValue(this.liRequestDetails.RequestShiftDetailGetAllDto.EndTime);
					this.daysInfo = this.lightIndustrialServices.generateDaysInfo(this.liRequestDetails.RequestShiftDetailGetAllDto);
					this.contractorGridData = this.liRequestDetails.RequestPositionDetailGetAllDtos;
					this.startDate = this.localizationService.TransformDate(this.liRequestDetails.StartDate);
					this.submissionDate = this.localizationService.TransformDate(this.liRequestDetails.CreatedDate);
					this.baseWageRate = null;
				} else if(res.StatusCode == Number(HttpStatusCode.Unauthorized)) {
					this.route.navigate(['unauthorized']);
				}
				this.isRouteFromReviewLink();
			});
	}

	private getSectorDataById(sectorId: number): void {
		this.sectorService.getSectorData(sectorId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<SectorDetails>) => {
				if (data.Succeeded && data.Data) {
					this.sectorDetails = data.Data;
					this.tenurePolicyApplicable = this.sectorDetails.TenurePolicyApplicable;
					this.tenureLimitType = this.sectorDetails.TenureLimitType;
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

	public onApproverSubmit(data: IApprovalConfigWidgetPayload): void {
		this.approverDataLength = data;
		this.approverLength = !(this.lightIndustrialUtilsService.isAllValuesZero(this.approverDataLength.data));
		this.hasApproverDataLength = this.approverDataLength.data.length === Number(magicNumber.zero);
		this.statusId = this.liRequestDetails.StatusId;
	}

	private approvalCommentValidation(): void {
		this.isRequiredComment = true;
		this.liRequestForm.controls['approverComment'].addValidators(this.customValidators.RequiredValidator('PleaseEnterApproverComment'));
		this.liRequestForm.controls['approverComment'].updateValueAndValidity();
		setTimeout(() => {
			this.accordionValidation();
		}, magicNumber.twoHundred);
	}

	private approverData(): ApproverDataInterface {
		return {
			"recordId": this.liRequestDetails.RequestId,
			"entityId": this.entityId,
			"approverComment": this.liRequestForm.controls['approverComment'].value,
			"requestCurrentStatus": this.liRequestDetails.StatusId
		};
	}

	private processFormRequest(requestObservable: Observable<GenericResponseBase<IApproveRequestResponse>>, successMessage: string) {
		requestObservable.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data: GenericResponseBase<IApproveRequestResponse>) => {
			if (!data.Succeeded) {
				this.toasterService.showToaster(ToastOptions.Error, data.Message);
			} else if (data.StatusCode == Number(HttpStatusCode.Ok)) {
				this.toasterService.showToaster(
					ToastOptions.Success, successMessage,
					[{ Value: this.liRequestDetails.RequestCode, IsLocalizeKey: false }]
				);
				this.route.navigate([this.navigationPaths.list]);
			}
		});
	}

	public selectForm(): void {
		const payload = this.approverData();
		this.processFormRequest(this.lightIndustrialServices.approveLiRequest(payload), 'LiRequestApprovedSuccessfully');
	}

	public declineForm(): void {
		this.approvalCommentValidation();
		this.liRequestForm.markAllAsTouched();
		if (this.liRequestForm.valid) {
			const payload = this.approverData();
			this.processFormRequest(this.lightIndustrialServices.declineLiRequest(payload), 'LiRequestDeclinedSuccessfully');
		}
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
			this.route.navigate([this.navigationPaths.globalPath]);
		} else {
			this.route.navigate([this.navigationPaths.list]);
		}
	}

	private accordionValidation(): void {
		this.isCommentSectionValid();
	}

	public onRequisitionAction() {
		this.showRequisitioncard = !this.showRequisitioncard;
		this.requisitionicondown = !this.requisitionicondown;
		this.requisitioniconup = !this.requisitioniconup;
	}
	public onBroadcastAction() {
		this.showBroadcastcard = !this.showBroadcastcard;
		this.broadcasticondown = !this.broadcasticondown;
		this.broadcasticonup = !this.broadcasticonup;
	}
	public onApproversAction() {
		this.showApproverscard = !this.showApproverscard;
		this.approvericondown = !this.approvericondown;
		this.approvericonup = !this.approvericonup;
	}
	public onOtherDetailsAction() {
		this.showOtherDetailscard = !this.showOtherDetailscard;
		this.otherdetailsicondown = !this.otherdetailsicondown;
		this.otherdetailsiconup = !this.otherdetailsiconup;
	}
	public onCommentAction() {
		this.showCommentsUploadscard = !this.showCommentsUploadscard;
		this.commenticondown = !this.commenticondown;
		this.commenticonup = !this.commenticonup;
	}
	public onDocumentAction() {
		this.showDocumentUploadscard = !this.showDocumentUploadscard;
		this.documenticondown = !this.documenticondown;
		this.documenticonup = !this.documenticonup;
	}


	public getCardClassCommentSection() {
		if (this.commentSection?.nativeElement.querySelector('.ng-touched .ng-invalid')) {
			return 'card--error';
		}
		if (this.commentSection?.nativeElement.querySelector('.ng-touched .ng-valid')) {
			return 'card--success';
		} else {
			return 'card--info';
		}
	}

	private isCommentSectionValid(): boolean {
		const hasInvalidControl = this.commentSection.nativeElement.querySelector('.ng-invalid');
		if (hasInvalidControl) {
			this.showCommentsUploadscard = true;
			this.cdr.detectChanges();
			this.focus.formName = this.liRequestForm;
			this.focus.onClick();
			return true;
		}
		return false;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		localStorage.removeItem('isReviewLink');
	}

}
