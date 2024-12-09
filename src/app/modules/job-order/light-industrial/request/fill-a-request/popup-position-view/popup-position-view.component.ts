import { Component, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';
import { LightIndustrialService } from '../../../services/light-industrial.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { PopupData } from '../../../models/fill-a-request.model';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ICandidateData } from 'src/app/modules/job-order/review-candidates/interface/review-candidate.interface';
import { UserRole } from '@xrm-master/user/enum/enums';

@Component({
	selector: 'app-popup-position-view',
	templateUrl: './popup-position-view.component.html',
	styleUrls: ['./popup-position-view.component.scss', '../fill-a-request.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupPositionViewComponent implements OnDestroy {
	public isVisible: boolean = false;
	public sectorId: number;
	public locationId: number;
	public candidateDetails: any;
	private requestData: PopupData;
	public recordId: number = magicNumber.zero;
	public requestEntityId: number = XrmEntities.LightIndustrialRequest;
	public entityId: number = XrmEntities.LICandidate;
	public actionTypeId: number = ActionType.View;
	public userGroupId: number = UserRole.StaffingAgency;
	public uploadStageId: number = DocumentUploadStage.On_Boarding;
	public hasUdfData: boolean;
	public recordUKey: string = '';
	public hasDmsData: boolean;
	public reqLibraryId: number = magicNumber.zero;
	public requestId: number = magicNumber.zero;
	public benefitAdderListArray: IBenefitData[] = [];
	public isDrugScreen: boolean;
	public isBackgroundCheck: boolean;
	private countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
	public localizeCurrency: DynamicParam[] = [
		{
			Value: this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId),
			IsLocalizeKey: false
		}
	];
	public scheduleStartDate: string = '';
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		public udfCommonMethods: UdfCommonMethods,
		private lightIndustrialService: LightIndustrialService,
		private localizationService: LocalizationService,
		private toasterService: ToasterService,
		private cdr: ChangeDetectorRef
	) { }

	private getCandidatePoolById(id: string): void {
		this.lightIndustrialService.getCandidateByUkey(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ICandidateData>) => {
				if (res.Succeeded && res.Data) {
					this.candidateDetails = res.Data;
					this.recordId = this.candidateDetails.CandidateId;
					this.recordUKey = this.candidateDetails.UKey;
					this.cdr.markForCheck();
				}
			});
	}

	public openPopup(liRequestData: PopupData): void {
		this.isVisible = true;
		this.getCandidatePoolById(liRequestData.uKey);
		this.requestData = liRequestData;
		this.requestId = this.requestData.requestId;
		this.sectorId = this.requestData.sectorId;
		this.locationId = this.requestData.locationId;
		this.isDrugScreen = this.requestData.isDrugScreenSection;
		this.isBackgroundCheck = this.requestData.isBackgroundCheckSection;
		this.reqLibraryId = this.requestData.reqLibraryId;
		this.scheduleStartDate = this.requestData.targetStartDate
			? this.localizationService.TransformDate(this.requestData.targetStartDate)
			: '';
	}

	public closePopup(): void {
		this.isVisible = false;
		this.toasterService.resetToaster();
	}

	public getUdfLength(isUdfLength: boolean): void {
		this.hasUdfData = isUdfLength;
	}

	public getDmsLength(isDmsLength: boolean): void {
		this.hasDmsData = isDmsLength;
	}

	public getBenefitAdderData(data: IBenefitData[]): void {
		this.benefitAdderListArray = data;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
