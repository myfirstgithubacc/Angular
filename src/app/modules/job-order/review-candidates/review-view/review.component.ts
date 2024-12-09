import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { NavigationPaths } from '../constants/routes-constants';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { DayInfo, LightIndustrialService } from '../../light-industrial/services/light-industrial.service';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { DmsImplementationComponent } from '@xrm-shared/common-components/dms-implementation/dms-implementation.component';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { ReviewCandidatesService } from '../services/review-candidates.service';
import { Subject, takeUntil } from 'rxjs';
import { ICandidateData, ICandidateLiRequestDetailsGetDto, IDeclineCandidate, ILiRequestShiftGetAllDto, ISelectCandidate, ReviewComments } from '../interface/review-candidate.interface';
import { SectorDetails, SectorOrgLevelConfigDto } from '../../light-industrial/interface/li-request.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CandidateResData } from '../models/review-candidate.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { IDropdownOption, IRouteData } from '@xrm-shared/models/common.model';
import { OrgTypeData } from '../../common-models/org-type.model';

@Component({
	selector: 'app-review',
	templateUrl: './review.component.html',
	styleUrls: ['./review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ReviewComponent implements OnInit, OnDestroy {

	@ViewChild('commentSection') commentSection: ElementRef;
	@ViewChild('dms', { static: false }) dmsImplementation: DmsImplementationComponent;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	private timeoutId: ReturnType<typeof setTimeout> | null = null;
	public hasDMSData: boolean = false;
	public userGroupId: number = magicNumber.three;
	public uploadStageId: number = DocumentUploadStage.On_Boarding;
	public processingId: number = magicNumber.five;
	public declineReason: string = '';
	public statusForm: FormGroup;
	public ReviewCandidatesForm: FormGroup;
	public isEditMode: boolean = false;
	public isViewMode: boolean = false;
	public title: string;
	public navigationPaths = NavigationPaths;
	public uKey: string;
	private activatedRouteData: IRouteData | undefined;
	public liRequestDetails: ICandidateLiRequestDetailsGetDto;
	public candidateData: ICandidateData;
	public entityId: number = XrmEntities.LICandidate;
	public actualShiftWageRate: number;
	public countryId: number;
	public currencyVal: string = '';
	public declineReasonList: IDropdownOption[];
	public isStaffingUser: boolean = false;
	public candidateRecordCode: string;
	public candidateFullName: string;
	public isRequiredDeclineSelection: boolean = false;
	public disableDeclineReason: boolean = false;
	public selectedReasonText: string;

	public orgType1Data: OrgTypeData = new OrgTypeData('', true);
	public orgType2Data: OrgTypeData = new OrgTypeData('', false, false);
	public orgType3Data: OrgTypeData = new OrgTypeData('', false, false);
	public orgType4Data: OrgTypeData = new OrgTypeData('', false, false);

	public actionTypeId: number = ActionType.View;
	public hasUdfData: boolean = false;

	public shiftDetails: ILiRequestShiftGetAllDto;
	public daysInfo: DayInfo[] = [];
	public timeRange = {
		labelLocalizeParam1: [],
		labelLocalizeParam2: [],
		label1: 'Start Time',
		label2: 'End Time',
		DefaultInterval: magicNumber.zero,
		AllowAI: false,
		startisRequired: true,
		endisRequired: true,
		starttooltipVisible: true,
		starttooltipTitle: 'string',
		starttooltipPosition: 'string',
		starttooltipTitleLocalizeParam: [],
		startlabelLocalizeParam: [],
		startisHtmlContent: true,
		endtooltipVisible: true,
		endtooltipTitle: 'string',
		endtooltipPosition: 'string',
		endtooltipTitleLocalizeParam: [],
		endlabelLocalizeParam: [],
		endisHtmlContent: true
	};

	public panelClass: string = 'card--info';
	public isPanelOpen: boolean = true;
	public floatingClass: string = 'card--info';
	public validationcheck: boolean = true;
	public validationcheck4: boolean = false;
	public columnWidth: string = 'col-sm-6 col-md-6';

	public reviewComments: ReviewComments[];

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		public commonHeaderIcon: CommonHeaderActionService,
		private route: Router,
		public activatedRoute: ActivatedRoute,
		private eventLog: EventLogService,
		private sectorService: SectorService,
		private lightIndustrialServices: LightIndustrialService,
		public udfCommonMethods: UdfCommonMethods,
		private localizationService: LocalizationService,
		private customValidators: CustomValidators,
		private toasterService: ToasterService,
		private reviewCandidateService: ReviewCandidatesService,
		private cd: ChangeDetectorRef
	) {
		this.statusForm = this.formBuilder.group({
			status: [null]
		});
		this.ReviewCandidatesForm = this.formBuilder.group({
			startTimeControlName: [null],
			endTimeControlName: [null],
			declineReason: [null],
			commentTextbox: [null]
		});
	}


	ngOnInit(): void {
		this.activatedRouteData = this.activatedRoute.routeConfig?.data as IRouteData | undefined;
		this.isViewMode = this.activatedRouteData?.isViewModeActive ?? false;

		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			if ((typeof param === 'object') && ('id' in param)) {
				const id = param['id'];
				this.getReviewCandidateInfo(id);
				this.uKey = id;
			}
		});

		if (this.isViewMode) {
			this.panelClass = 'card--inverse floating-layout floating-layout__view-layout';
			this.columnWidth = 'col-sm-12 col-md-12';
		}

		this.getCultureType();
		this.getUserType();
	}

	private getUserType() {
		const userType = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
		if (userType == magicNumber.three) {
			this.isStaffingUser = true;
		}
	}

	public getCultureType() {
		this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.currencyVal = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);
	}

	private getReviewCandidateInfo(uKey: string) {
		this.lightIndustrialServices.getCandidateByUkey(uKey)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<ICandidateData>) => {
				if (res.StatusCode === Number(HttpStatusCode.Unauthorized))
					return this.route.navigate(['unauthorizedRecordPage']);

				if (!res.Succeeded && res.Message)
					return this.toasterService.showToaster(ToastOptions.Error, res.Message);

				if (res.Data) {
					this.candidateData = new CandidateResData(res.Data, this.localizationService);
					this.reviewComments = this.candidateData.ReviewerComments;
					this.liRequestDetails = this.candidateData.candidateLiRequestDetailsGetDto;
					this.declineReason = this.candidateData.DeclineReason;
					this.getDataBySectorId();
					this.setShiftDetails(this.candidateData.liRequestShiftGetAllDto);
					this.updateFormControls();
					if (this.isViewMode) {
						this.setEventLogData(this.candidateData.CandidateId);
					}
					this.isRouteFromReviewLink();
				}
			});
	}

	private isRouteFromReviewLink(): void {
		if (!this.candidateData.IsAllowedToReview && localStorage.getItem('isReviewLink') == 'true') {
			this.toasterService.displayToaster(ToastOptions.Warning, this.localizationService.GetLocalizeMessage('AlreadyProcessedRecord'));
		}
	}

	private setEventLogData(recordId: number): void {
		this.eventLog.recordId.next(recordId);
		this.eventLog.entityId.next(XrmEntities.LICandidate);
	}

	private getDataBySectorId() {
		this.getSectorDataById(this.liRequestDetails.SectorId);
		this.getDeclineDropdown(this.liRequestDetails.SectorId);
	}

	private setShiftDetails(shiftDetails: ILiRequestShiftGetAllDto) {
		this.shiftDetails = shiftDetails;
		this.daysInfo = this.lightIndustrialServices.generateDaysInfo(shiftDetails);
		this.actualShiftWageRate = Number(this.candidateData.ActualShiftWageRate.toFixed(magicNumber.two));
	}

	private updateFormControls() {
		this.ReviewCandidatesForm.controls['startTimeControlName'].patchValue(this.shiftDetails.StartTime);
		this.ReviewCandidatesForm.controls['endTimeControlName'].patchValue(this.shiftDetails.EndTime);
	}

	private getDeclineReasonText(list: IDropdownOption[]): void {
		const selectedReason = list.find((reason) =>
			reason.Value == this.candidateData.CandidateDeclineReasonId);
		this.selectedReasonText = selectedReason
			? selectedReason.Text
			: this.declineReason;
	};

	private assignOrgTypeData(orgType: number, org: SectorOrgLevelConfigDto) {
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

	private getSectorDataById(sectorId: number) {
		this.sectorService.getSectorData(sectorId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<SectorDetails>) => {
				if (data.Succeeded && data.Data) {
					const orgTypes = [magicNumber.one, magicNumber.two, magicNumber.three, magicNumber.four];
					orgTypes.forEach((orgType) => {
						const org = data.Data?.SectorOrgLevelConfigDtos.find((orgData: SectorOrgLevelConfigDto) =>
							orgData.OrgType === Number(orgType));
						if (org)
							this.assignOrgTypeData(orgType, org);
					});
				}
				this.cd.detectChanges();
			}
		});
	}

	private getDeclineDropdown(sectorId: number) {
		this.reviewCandidateService.getDeclineReasonByID(sectorId)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<IDropdownOption[]>) => {
				if (res.Succeeded && res.Data) {
					this.declineReasonList = res.Data;
					this.getDeclineReasonText(this.declineReasonList);
				}
			});
	}

	private candidateCommentValidation() {
		this.isRequiredDeclineSelection = true;
		this.ReviewCandidatesForm.controls['commentTextbox'].addValidators(this.customValidators.RequiredValidator('PleaseEnterReviewerComments'));
		this.ReviewCandidatesForm.controls['declineReason'].addValidators(this.customValidators.RequiredValidator('PleaseSelectDeclineReason'));
		this.ReviewCandidatesForm.controls['commentTextbox'].updateValueAndValidity();
		this.ReviewCandidatesForm.controls['declineReason'].updateValueAndValidity();
		this.timeoutId = setTimeout(() => {
			this.accordionValidation();
		}, magicNumber.twoHundred);
	}

	private candidateDeclinePayload(): IDeclineCandidate {
		return {
			"CandidateUkey": this.uKey,
			"DeclineReasonId": this.ReviewCandidatesForm.controls['declineReason'].value.Value,
			"DeclineComment": this.ReviewCandidatesForm.controls['commentTextbox'].value
		};
	}

	private candidateSelectPayload(): ISelectCandidate {
		return {
			"CandidateUkey": this.uKey,
			"Comment": this.ReviewCandidatesForm.controls['commentTextbox'].value
		};
	}

	public selectForm() {
		this.disableDeclineReason = true;
		const payload = this.candidateSelectPayload();

		this.reviewCandidateService.selectCandidate(payload)
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: ApiResponseBase) => {
				this.handleSelectCandidateResponse(data);
			});
	}

	private handleSelectCandidateResponse(data: ApiResponseBase) {
		if (data.StatusCode === HttpStatusCode.BadRequest) {
			this.lightIndustrialServices.multipleErrorValidationMsg(data);
			return;
		}

		if (data.StatusCode === HttpStatusCode.Ok) {
			this.route.navigate([NavigationPaths.list]);
			this.toasterService.resetToaster();

			const toasterMessage = data.Message === 'PendingSelection'
					? 'CandidateSelectedForReview'
					: 'CandidateSubmitionConfirmation',

				toasterOptions = data.Message === 'PendingSelection'
					? undefined
					: [{ Value: this.candidateData.FullName, IsLocalizeKey: false }];

			this.toasterService.showToaster(ToastOptions.Success, toasterMessage, toasterOptions);
		}
	}


	public declineForm() {
		this.disableDeclineReason = false;
		this.candidateCommentValidation();
		this.ReviewCandidatesForm.markAllAsTouched();

		if (!this.ReviewCandidatesForm.valid) {
			return;
		}

		const payload = this.candidateDeclinePayload();
		this.reviewCandidateService.declineCandidate(payload)
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: ApiResponseBase) =>
				this.handleDeclineCandidateResponse(data));
	}

	private handleDeclineCandidateResponse(data: ApiResponseBase) {
		this.toasterService.resetToaster();

		if (!data.Succeeded && data.Message) {
			this.toasterService.showToaster(ToastOptions.Error, data.Message);
			return;
		}

		this.route.navigate([this.navigationPaths.list]);
		this.toasterService.showToaster(ToastOptions.Success, 'CandidateDeclinedConfirmation', [{ Value: this.candidateData.FullName, IsLocalizeKey: false }]);
	}

	public getDayHourLocalizationValue(key: string) {
		let unitType = this.candidateData.candidateLiRequestDetailsGetDto.RateUnitName;
		unitType = unitType !== ''
			? unitType
			: 'Hour';
		const dynamicParam: DynamicParam[] = [
			{ Value: this.currencyVal, IsLocalizeKey: false },
			{ Value: unitType, IsLocalizeKey: true }
		];
		return this.localizationService.GetLocalizeMessage(key, dynamicParam);
	}

	public onCancel() {
		this.route.navigate(["/xrm/job-order/review-candidates/list"]);
	}

	public getUDFlength(isUDFLength: boolean) {
		this.hasUdfData = isUDFLength;
	}

	public getDMSlength(isDMSLength: boolean) {
		this.hasDMSData = isDMSLength;
	}

	public onCommentSectionExpand() {
		if (this.isViewMode) {
			this.floatingClass = 'card--inverse floating-layout floating-layout__view-layout';
			return;
		}

		if (this.validationcheck) {
			this.panelClass = this.panelClass === 'card--success'
				? 'card--info'
				: 'card--success';
			this.validationcheck4 = this.panelClass === 'card--success';
		} else {
			this.panelClass = 'card--info';
		}

		this.isPanelOpen = !this.isPanelOpen;
	}

	public getCardClassCommentSection(): string {
		if (this.isViewMode) {
			return 'card--inverse floating-layout floating-layout__view-layout';
		}

		const element = this.commentSection?.nativeElement;
		if (!element) {
			return 'card--info';
		}

		if (element.querySelector('.ng-touched .ng-invalid')) {
			return 'card--error';
		}

		if (element.querySelector('.ng-touched .ng-valid')) {
			return 'card--success';
		}

		return 'card--info';
	}


	private isCommentSectionNotValid(): boolean {
		const isInvalid = this.commentSection?.nativeElement.querySelector('.ng-invalid');
		if (isInvalid) {
			this.isPanelOpen = true;
			this.cd.markForCheck();
			return true;
		}
		return false;
	}

	private accordionValidation() {
		this.isCommentSectionNotValid();
	}

	ngOnDestroy(): void {
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
		}
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		localStorage.removeItem('isReviewLink');
	}

}
