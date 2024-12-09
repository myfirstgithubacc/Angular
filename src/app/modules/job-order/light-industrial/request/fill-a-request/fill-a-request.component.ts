import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { LightIndustrialService } from '../../services/light-industrial.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { PopupPositionViewComponent } from './popup-position-view/popup-position-view.component';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LightIndustrialPopupService } from '../../services/light-industrial-popup.service';
import { CandidateStatus } from '../../constant/candidate-status';
import { HttpStatusCode } from '@angular/common/http';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { Subject, takeUntil } from 'rxjs';
import {
	ICandidateActionPayload, ICandidateFinalSubmitInterface, IContractorGridData, IContractorGridDataWithAction, IToasterMessage, PopupData
} from '../../models/fill-a-request.model';
import { Column } from 'src/app/modules/contractor/contractor-details/constant/contractor-interface';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { RequestDetails, RequestPositionDetailGetAllDto, TimeRange } from '../../interface/li-request.interface';
import { UserRole } from '@xrm-master/user/enum/enums';
import { SharedVariablesService } from '../../services/shared-variables.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IBroadcastComments } from '../../interface/broadcast.interface';

@Component({
	selector: 'app-fill-a-request',
	templateUrl: './fill-a-request.component.html',
	styleUrls: ['./fill-a-request.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class FillARequestComponent implements OnInit, OnDestroy {

	@ViewChild(PopupPositionViewComponent) popupComponent: PopupPositionViewComponent;
	private isEditMode: boolean = false;
	public fillCandidateForm: FormGroup;
	public liRequestDetails: any = null;
	public hasDmsData: boolean;
	public submissionDate: string;
	public daysInfo: IDayInfo[] = [];
	public contractorGridData: IContractorGridDataWithAction[] = [];
	private contractorGridDataWithStatus: IContractorGridData[] = [];
	public broadcastComments: IBroadcastComments[];
	public recordId: number;
	private recordUkey: string = '';
	private positionId: number;
	private liRequestUKey: string;
	public sectorId: number = magicNumber.zero;
	public locationId: number = magicNumber.zero;
	public entityId: number = XrmEntities.LightIndustrialRequest;
	public actionTypeId: number = ActionType.View;
	public userGroupId: number = UserRole.StaffingAgency;
	public uploadStageId: number = DocumentUploadStage.Request_Creation;
	private countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
	private localizeCurrency: DynamicParam[] = [
		{
			Value: this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId),
			IsLocalizeKey: false
		}
	];
	public timeRange: TimeRange = this.sharedVariablesService.timeRange;

	public positionColumnConfiguration = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: true,
		Id: false,
		firstColumnName: 'ItemNumber',
		secondColumnName: 'Action',
		deleteButtonName: '',
		noOfRows: 0,
		itemSr: true,
		itemLabelName: 'BenefitAdder',
		firstColumnColSpan: 0,
		lastColumnColSpan: 1,
		isAddMoreValidation: false
	};

	public positionGridColumns: Column[] = [
		{
			colSpan: 1,
			columnWidth: '130px',
			columnName: 'CandidatePoolId',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'CandidatePoolCode',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: 1,
			columnWidth: '130px',
			columnName: 'ContractorName',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'ContractorName',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: 1,
			columnWidth: '100px',
			columnName: 'TargetStartDate',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'TargetStartDate',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: 1,
			columnWidth: '100px',
			columnName: 'TargetEndDate',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'TargetEndDate',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: 1,
			columnWidth: '100px',
			columnName: 'BaseWageRate',
			dynamicParam: this.localizeCurrency,
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'BaseWageRate',
					requiredMsg: '',
					isEditMode: true,
					decimal: 2,
					isNumeric: true
				}
			]
		},
		{
			colSpan: 1,
			columnWidth: '100px',
			columnName: 'ActualShiftWageRate',
			dynamicParam: this.localizeCurrency,
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'ActualShiftWageRate',
					requiredMsg: '',
					isEditMode: true,
					decimal: 2,
					isNumeric: true
				}
			]
		},
		{
			colSpan: 1,
			columnWidth: '100px',
			columnName: 'SubmittedMarkupPer',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'SubmittedMarkup',
					requiredMsg: '',
					isEditMode: true,
					decimal: 3,
					isNumeric: true
				}
			]
		},
		{
			colSpan: 1,
			columnWidth: '100px',
			columnName: 'StaffingAgencySTBill',
			dynamicParam: this.localizeCurrency,
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'StaffingAgencyStBillRate',
					requiredMsg: '',
					isEditMode: true,
					decimal: 2,
					isNumeric: true
				}
			]
		},
		{
			colSpan: 1,
			columnWidth: '80px',
			columnName: 'CountryStatus',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'CandidateStatusName',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: 2,
			columnWidth: '80px',
			columnName: 'Actions',
			controls: [
				{
					controlType: 'action',
					controlId: 'action'
				}
			]
		}
	];
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	public isPanelOpen: boolean = true;
	public isPanelOpen2: boolean = false;
	public isPanelOpen3: boolean = false;
	public isSubmitBtnDisable: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private lightIndustrialServices: LightIndustrialService,
		private localizationService: LocalizationService,
		private dialogPopup: DialogPopupService,
		private formBuilder: FormBuilder,
		private route: Router,
		private toasterService: ToasterService,
		private liPopupService: LightIndustrialPopupService,
		private sharedVariablesService: SharedVariablesService,
		private cdr: ChangeDetectorRef
	) {
		this.initializeFillCandidateForm();
	}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param: Params) => {
			if (param['uKey']) {
				this.liRequestUKey = param['uKey'];
				this.getViewDetail(this.liRequestUKey);
			}
		});
		this.onConfirmationPopup();
	}

	private initializeFillCandidateForm(): void {
		this.fillCandidateForm = this.formBuilder.group({
			startTimeControlName: [null],
			endTimeControlName: [null]
		});
	}

	private onConfirmationPopup(): void {
		this.dialogPopup.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data) => {
			switch (data.value) {
				case magicNumber.twenty:
					this.processCandidateAction(this.liRequestDetails?.RequestId, this.positionId, 'WithdrawCandidateSuccessfull');
					break;
				case magicNumber.twentyTwo:
					this.processCandidateAction(this.liRequestDetails?.RequestId, this.positionId, 'RemoveCandidateSuccessfull');
					break;
			}
		});
	}

	private getViewDetail(id: string): void {
		this.lightIndustrialServices.getLIReqViewById(id).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<RequestDetails>) => {
				if (res.Succeeded && res.Data) {
					this.processLIViewData(res.Data);
				} else if(res.StatusCode == Number(HttpStatusCode.Unauthorized)) {
					this.route.navigate(['unauthorized']);
				}
			});
	}

	private processLIViewData(data: RequestDetails): void {
		this.liRequestDetails = data;
		this.recordUkey = this.liRequestDetails?.Ukey;
		this.recordId = this.liRequestDetails?.RequestId;
		this.sectorId = this.liRequestDetails?.SectorId;
		this.broadcastComments = this.liRequestDetails.RequestBroadcastCommentDto;
		this.submissionDate = this.localizationService.TransformDate(this.liRequestDetails?.CreatedDate);
		this.daysInfo = this.lightIndustrialServices.generateDaysInfo(this.liRequestDetails.RequestShiftDetailGetAllDto);
		this.patchFormValues();
		this.transformPositionDetails();
		this.enableDisableSubmitBtn(this.liRequestDetails?.RequestPositionDetailGetAllDtos);
		this.addActionBasedOnStatus();
		this.cdr.markForCheck();
	}

	private patchFormValues(): void {
		this.fillCandidateForm.controls['startTimeControlName'].patchValue(this.liRequestDetails.RequestShiftDetailGetAllDto.StartTime);
		this.fillCandidateForm.controls['endTimeControlName'].patchValue(this.liRequestDetails.RequestShiftDetailGetAllDto.EndTime);
	}

	private transformPositionDetails(): void {
		this.contractorGridDataWithStatus = this.liRequestDetails?.RequestPositionDetailGetAllDtos.map((obj: RequestPositionDetailGetAllDto) => {
			const { TargetStartDate, TargetEndDate, CandidateStatusName, ...rest } = obj,
				transformedStartDate = this.localizationService.TransformDate(TargetStartDate),
				loaclizedCandidateStatusName = this.localizationService.GetLocalizeMessage(CandidateStatusName),
				transformedEndDate = this.localizationService.TransformDate(TargetEndDate);

			return {
				...rest, TargetStartDate: transformedStartDate, TargetEndDate: transformedEndDate, endDate: TargetEndDate,
				CandidateStatusName: loaclizedCandidateStatusName
			};
		});
	}

	private enableDisableSubmitBtn(RequestPosition: RequestPositionDetailGetAllDto[]) {
		this.isSubmitBtnDisable = RequestPosition.some((item: RequestPositionDetailGetAllDto) =>
			item.ClpId === null ||
			item.CandidateStatusId === Number(CandidateStatus.Tentative) ||
			item.CandidateStatusId === Number(CandidateStatus.Requested));
	}

	private addActionBasedOnStatus(): void {
		this.contractorGridData = this.contractorGridDataWithStatus.map((obj) =>
			({ ...obj, action: this.addActionBasedOnStatusId(obj.CandidateStatusId, obj.endDate) }));
	}

	private addActionBasedOnStatusId(statusId: number, targetEndDate: Date): { icon: string; color: string; title: string }[] {
		const currentDate = new Date();
		switch (statusId) {
			case CandidateStatus.Requested:
				return [{ icon: 'user-plus', color: 'orange-color', title: 'Fill' }];
			case CandidateStatus.Tentative:
				return [
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit' },
					{ icon: 'x', color: 'red-color', title: 'Remove' }
				];
			case CandidateStatus.ScheduledWorking:
				return [{ icon: 'eye', color: 'navy-blue-color', title: 'View' }];
			case CandidateStatus.ScheduledNonWorking:
			{
				const isFutureDate = new Date(targetEndDate) > currentDate;
				return [
					{ icon: 'eye', color: 'navy-blue-color', title: 'View' },
					...(isFutureDate
						? [{ icon: 'user-x', color: 'red-color', title: 'Withdraw' }]
						: [])
				];
			}
			case CandidateStatus.PendingforReview:
				return [
					{ icon: 'eye', color: 'navy-blue-color', title: 'View' },
					{ icon: 'user-x', color: 'red-color', title: 'Withdraw' }
				];
			default:
				return [];
		}
	}

	private isCandidateAvailabel(data: IContractorGridDataWithAction[]): boolean {
		const isTentativeCandidate = data.some((obj) =>
			obj.CandidateStatusId === Number(CandidateStatus.Tentative));
		return !isTentativeCandidate;
	}

	public actionClicked(e: any): void {
		const positionDetails = this.liRequestDetails?.RequestPositionDetailGetAllDtos[e.index];
		this.navigateToPopup(e.action.icon, positionDetails);
		this.positionId = positionDetails?.PositionId;
	}

	private navigateToPopup(icon: string, positionDetails: RequestPositionDetailGetAllDto): void {
		const data: PopupData = {
			requestId: this.recordId,
			sectorId: this.sectorId,
			locationId: this.liRequestDetails?.WorkLocationId,
			reqLibraryId: this.liRequestDetails?.ReqLibraryId,
			shiftName: this.liRequestDetails?.RequestShiftDetailGetAllDto.ShiftName,
			isBackgroundCheckSection: this.liRequestDetails?.IsBackgrounCheckRequired,
			isDrugScreenSection: this.liRequestDetails?.IsDrugTestRequired,
			baseWageRate: positionDetails.BaseWageRate,
			positionId: positionDetails.PositionId,
			uKey: positionDetails.Ukey,
			requestUKey: this.liRequestUKey,
			laborCategoryId: this.liRequestDetails?.LaborCategoryId,
			targetStartDate: positionDetails.TargetStartDate,
			targetEndDate: positionDetails.TargetEndDate,
			startDateNoLaterThan: this.liRequestDetails?.StartDateNoLaterThan,
			endDate: this.liRequestDetails?.EndDate
		};
		switch (icon) {
			case 'user-plus': {
				const afterDialogListCloseCallback = () => {
					this.getViewDetail(this.liRequestUKey);
				};
				this.toasterService.resetToaster();
				this.liPopupService.openDialogList(data, afterDialogListCloseCallback);
			}
				break;
			case 'edit-3': {
				const afterDialogAddEditCloseCallback = () => {
					this.getViewDetail(this.liRequestUKey);
				};
				this.toasterService.resetToaster();
				this.liPopupService.openDialogAddEdit(positionDetails.Ukey, data, afterDialogAddEditCloseCallback);
			}
				break;
			case 'eye':
				this.popupComponent.openPopup(data);
				break;
			case 'user-x':
				this.dialogPopup.showConfirmation('WithdrawCandidateConfirmation', PopupDialogButtons.Withdram);
				break;
			case 'x':
				this.dialogPopup.showConfirmation('RemoveCandidateConfirmation', PopupDialogButtons.Remove);
				break;
			default:
				break;
		}
	}

	private processCandidateAction(requestId: number, positionId: number, successMessage: string): void {
		const payload: ICandidateActionPayload = { RequestId: requestId, PositionId: positionId };
		this.lightIndustrialServices.withdrawCandidate(payload)
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: GenericResponseBase<null>) => {
				this.toasterService.resetToaster();
				if (!data.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Error, data.Message);
				} else if (data.StatusCode === Number(HttpStatusCode.Ok)) {
					this.toasterService.showToaster(ToastOptions.Success, successMessage);
					this.getViewDetail(this.liRequestUKey);
				}
			});
	}

	public closePopup(): void {
		this.popupComponent.closePopup();
	}


	public submitForm(): void {
		this.fillCandidateForm.markAllAsTouched();
		if (this.isCandidateAvailabel(this.contractorGridData)) {
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Error, 'PleasefillatleastonePosition');
			return;
		}
		if (this.fillCandidateForm.valid) {
			const paylaod: ICandidateFinalSubmitInterface = {
				"requestUkey": this.recordUkey
			};
			this.lightIndustrialServices.submitFillRequest(paylaod).pipe(takeUntil(this.destroyAllSubscriptions$))
				.subscribe((data: GenericResponseBase<null | IToasterMessage[]>) => {
					this.toasterService.resetToaster();
					setTimeout(() => {
						this.toasterService.resetToaster();
					}, magicNumber.thirtyThousand);

					if (data.StatusCode == Number(HttpStatusCode.BadRequest) && data.Data) {
						const messages = data.Data.map((entry) =>
							entry.Message);
						this.handleErrorMessages(messages);
					} else if (data.StatusCode == Number(HttpStatusCode.Ok)) {
						this.isEditMode = true;
						this.route.navigate(["/xrm/job-order/light-industrial/list"]);
						this.toasterService.showToaster(ToastOptions.Success, 'PositionFilledConfirmation', [{ Value: this.liRequestDetails.RequestCode, IsLocalizeKey: false }]);
					}
				});
			this.scroollToTop();
		}
	}

	private handleErrorMessages(messages: string[]): void {
		if (messages.length === Number(magicNumber.one)) {
			this.toasterService.showToaster(ToastOptions.Error, messages[0]);
		} else {
			const formattedMessage = this.formatMessagesAsList(messages);
			this.toasterService.showToaster(ToastOptions.Error, formattedMessage, [], true);
		}
	}

	private formatMessagesAsList(messages: string[]): string {
		const listItems = messages.map((message) =>
			`<li>${message}</li>`).join('\n');
		return `<ul>\n${listItems}\n</ul>`;
	}

	public getdmslength(e: boolean): void {
		this.hasDmsData = e;
	}

	private scroollToTop(): void {
		window.scrollTo(magicNumber.zero, magicNumber.zero);
	}

	public cancelForm(): void {
		this.toasterService.resetToaster();
		if (this.route.url.includes('global-search')) {
			this.route.navigate(['/xrm/landing/global-search']);
		}
		else {
			this.route.navigate(['/xrm/job-order/light-industrial/list']);
		}
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		if (!this.isEditMode)
			this.toasterService.resetToaster();
		this.dialogPopup.resetDialogButton();
	}

}
