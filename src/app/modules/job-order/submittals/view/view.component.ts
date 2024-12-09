import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectableSettings } from "@progress/kendo-angular-grid";
import { CurrentPage, NavigationUrls, RequiredStrings, StatusId } from '../services/Constants.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { SubmittalsService } from '../services/submittals.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { chevronDownDimension, chevronRightDimension, minusDimension, plusDimension } from '@xrm-shared/icons/xrm-icon-library/xrm-icon-library.component';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { BenefitAdder, ColumnConfig } from 'src/app/modules/contractor/assignment-details/interfaces/interface';
import { ParentData, PRDetails, ProcessPayload, SubmittalDetailsView } from '../services/Interfaces';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SubmittalsDataService } from '../services/submittalsData.service';
import { ApiResponseBase } from '@xrm-core/models/event-configuration.model';
import { RoleGroupId } from 'src/app/modules/acrotrac/common/enum-constants/enum-constants';

@Component({
	selector: 'app-submittal-shared-View',
	templateUrl: './view.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmitalViewComponent implements OnInit, OnChanges {

	@Input() CurrentPage:string = CurrentPage.View;
	@Output() onDataLoaded = new EventEmitter<SubmittalDetailsView>();
	@Input() interviewUkey: string;
	@Input() parentEntity: string;
	@Input() showOnInterview:boolean = false;

	public isEditMode: boolean = false;
	public SubmittalViewForm: FormGroup;
	public showMore: boolean[] = [false, false, false, false, false, false, false];
	public pcEntityId: number = XrmEntities.ProfessionalCandidate;
	public entityId: number = XrmEntities.Submittal;
	public uploadStageId: number = DocumentUploadStage.Candidate_Creation;
	public actionTypeId: number = ActionType.View;
	public processingId: number = magicNumber.five;
	public hasDMSLength:boolean = false;
	public benefitAdderList: BenefitAdder[] = [];
	public BAGridData: BenefitAdder[];
	public pageSize: number = magicNumber.ten;
	public currencyCode:string = RequiredStrings.EmptyString;
	private countryId:string|null;
	public isCommentExpanded: boolean = false;

	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public selectableSettings: SelectableSettings;
	private Ukey: string;
	public UkeyData: SubmittalDetailsView;
	public candidateFullName: string;
	public roleGroupId = RoleGroupId.StaffingAgency;
	public unitType: string;
	private sectorLabel: string | null;
	public recordId: number;
	public estimatedCost: string = '0.00';
	public numericRGI = Number(RoleGroupId.StaffingAgency);

	// UI Icons
	public plus = plusDimension;
	public minus = minusDimension;
	public down = chevronDownDimension;
	public right = chevronRightDimension;
	public altExt: boolean = false;
	public canExt: boolean = false;
	public hasUdfData: boolean = false;
	public BAColumnOptions:ColumnConfig[];

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private submittalService:SubmittalsService,
		private localizationService:LocalizationService,
		public udfCommonMethods: UdfCommonMethods,
		public localisationService:LocalizationService,
		private submittalDataService: SubmittalsDataService,
		public cdr: ChangeDetectorRef
	) {
		this.SubmittalViewForm = this.submittalDataService.createSubmittalViewForm();
		this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.currencyCode = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);
		this.numericRGI = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
		this.roleGroupId = this.numericRGI.toString() as RoleGroupId;
		this.setDataForUsers();
	}

	private setDataForUsers(): void{
		if(this.roleGroupId == RoleGroupId.StaffingAgency){
			this.uploadStageId = magicNumber.zero;
	 	}
		else if(this.roleGroupId == RoleGroupId.Client){
			this.uploadStageId = DocumentUploadStage.Candidate_Creation;
	 	}
		else{
			this.uploadStageId = magicNumber.zero;
		}
	}

	ngOnChanges(): void {
		this.OnChangeStatusBar();
	}

	private OnChangeStatusBar(): void {
		this.submittalService.StepperData.next({
			SubmittalStatusId: this.UkeyData.SubmittalStatusId,
			CurrentPage: this.CurrentPage,
			RecordId: this.UkeyData.SubmittalId
		});
	}

	ngOnInit(): void {
		this.Ukey = this.parentEntity === 'Interview'
		 ? this.interviewUkey
		  : this.activatedRoute.snapshot.params['id'];
		  this.sectorLabel = history.state.sectorLabel;
		if (this.Ukey) {
			this.getSubmittal();
		}
	}

	private markAcknowledged(): void{
		if(this.roleGroupId == RoleGroupId.MSP
			&& (this.UkeyData.SubmittalStatusId == Number(StatusId.Submitted) || this.UkeyData.SubmittalStatusId == Number(StatusId.ReSubmitted))
		){
			const processPayload: ProcessPayload = {
				SubmittalIds: [this.UkeyData.SubmittalId]
			};
			this.submittalService.acknowledgeSubmittal(processPayload)
				.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res:ApiResponseBase) => {
				});
		}
	}

	public getUDFlength(isUDFLength: boolean): void {
		this.hasUdfData = isUDFLength;
	}

	public hasDMSLengthFn(e:boolean): void{
		this.hasDMSLength = e;
	}

	public tabOptions = {
		bindingField: 'Disabled',
		tabList: [
			{
				tabName: 'All',
				favourableValue: 'All',
				selected: true
			}
		]
	};

	private getSubmittal(): void {
		this.submittalService.getSubmittalViewWise(this.Ukey).pipe(switchMap((res: GenericResponseBase<SubmittalDetailsView>) => {
			if(res.Succeeded && res.Data){
				this.setSubmittalData(res);
				this.onDataLoaded.emit(res.Data);
				return this.submittalService.getProfReqData(res.Data.RequestUkey);
			}
			else{
				return of(null);
			}
		}), takeUntil(this.destroyAllSubscriptions$)).subscribe((data: GenericResponseBase<PRDetails> | null) => {
			if(data?.Succeeded && data.Data){
				const profReqData = data.Data,
					parentData: ParentData = {
						ProfessionReqId: profReqData.RequestCode,
						SectorLabel: this.sectorLabel ?? RequiredStrings.Sector,
						SectorName: profReqData.Sector,
						JobCategoryName: profReqData.JobCategory,
						Status: this.UkeyData.SubmittalStatus,
						IsShowSubData: true,
						SubmittalCode: this.UkeyData.SubmittalCode,
						RequestUkey: this.UkeyData.RequestUkey
					};
				this.submittalService.ParentData.next(parentData);
				this.cdr.detectChanges();
			}
  		});
	}

	private setSubmittalData(data: GenericResponseBase<SubmittalDetailsView>): void{
		if(data.Succeeded && data.Data){
			this.UkeyData = data.Data;
			if(this.CurrentPage == CurrentPage.Withdraw.toString())
				this.isCommentExpanded = true;
			this.markAcknowledged();
			this.OnChangeStatusBar();
			this.altPhone();
			this.canPhone();
			this.setBenefitAdderColumnOptions();
			this.setBenefitAdderDecimalValues(this.UkeyData.BenefitAdders);
			this.setComments();
			this.estimatedCost = this.localizationService.TransformNumber(this.UkeyData.EstimatedCost, magicNumber.two, null, magicNumber.two);
			this.recordId = this.UkeyData.SubmittalId;
		}
	}
	private setComments(): void{
		if(this.CurrentPage != 'Withdraw')
			this.SubmittalViewForm.controls['staffingComment'].setValue(this.UkeyData.StaffingAgencyComments);
	}

	public getLocaliseMessage(key:string, placeholder1:string|null = null, placeholder2: string|null = null ): string{
		let localisedMessage = this.localisationService.GetLocalizeMessage(key);

		if(placeholder1 && !placeholder2){
			const dynamicParam:DynamicParam[] = [{Value: placeholder1, IsLocalizeKey: false}];
			localisedMessage = this.localisationService.GetLocalizeMessage(key, dynamicParam);
		}

		if(placeholder1 && placeholder2){
			const dynamicParam:DynamicParam[] = [{Value: placeholder1, IsLocalizeKey: false}, {Value: placeholder2, IsLocalizeKey: false}];
			localisedMessage = this.localisationService.GetLocalizeMessage(key, dynamicParam);
		}

		return localisedMessage;
	}

	private setBenefitAdderColumnOptions(): void{
		this.BAColumnOptions = [
			{
				fieldName: 'LocalizedLabelKey',
				columnHeader: 'BenefitAdderType',
				visibleByDefault: true,
				ValueType: 'text',
				IsLocalizedKey: true
			},
			{
				fieldName: 'Value',
				columnHeader: this.getDayHourLocalizationValue('Rate'),
				visibleByDefault: true
			}
		];
	}
	public getDayHourLocalizationValue(key: string): string {
		if (this.UkeyData.RateUnit != "") {
			this.unitType = this.UkeyData.RateUnit == "Hour"
				? "Hour"
				: 'Day';
			const dynamicParam: DynamicParam[] = [
				{ Value: this.currencyCode, IsLocalizeKey: false },
				{ Value: this.unitType, IsLocalizeKey: false }
			];
			return this.localizationService.GetLocalizeMessage(key, dynamicParam);
		}
		else
			return this.localizationService.GetLocalizeMessage(key);
	}

	private setBenefitAdderDecimalValues(benefitAdderGrid: BenefitAdder[]): void{
	   	this.BAGridData = benefitAdderGrid.map((dt:BenefitAdder) => {
	   		dt.Value = Number(dt.Value).toFixed(magicNumber.two);
	   		dt.LocalizedLabelKey= this.localizationService.GetLocalizeMessage(dt.LocalizedLabelKey);
	   		return dt;
	   	});
	}

	public altPhone(): void {
		const phoneNumber = this.UkeyData.RecruiterPhone,
		 phoneExtension = this.UkeyData.RecruiterPhoneExt;
		if(phoneNumber){
			this.SubmittalViewForm.controls['altPhoneControl'].setValue(phoneNumber);
			if(phoneExtension){
			   	this.altExt = true;
			   	this.SubmittalViewForm.controls['altPhoneExt'].setValue(phoneExtension);
			   }else {
			   	this.altExt = false;
			   	this.SubmittalViewForm.controls['altPhoneExt'].setValue('');
			   }
		}
	}

	public canPhone(): void {
		const phoneNumber = this.UkeyData.PhoneNumber,
		 phoneExtension = this.UkeyData.PhoneExt;
		if(phoneNumber){
			this.SubmittalViewForm.controls['canPhoneControl'].setValue(phoneNumber);
			 if(phoneExtension){
			   	this.altExt = true;
			   	this.SubmittalViewForm.controls['canPhoneExt'].setValue(phoneExtension);
			   }else {
			   	this.altExt = false;
			   	this.SubmittalViewForm.controls['canPhoneExt'].setValue('');
			   }
		}
	}

	private wordCount(text: string): number {
		return text
			? text.split(/\s+/).length
			: magicNumber.zero;
	}

	public showToggleText(index: number): void {
		this.showMore[index] = !this.showMore[index];
	}

	public showicon(data: string): boolean {
		return this.wordCount(data) > parseInt(magicNumber.twenty.toString());
	}

	public navigateBack(): void {
		if(history.state.isCameFromProfReq){
			this.router.navigate([`${NavigationUrls.SubmittalDetails}${history.state.requestUkey}`]);
		}
		else{
			this.router.navigate([`${NavigationUrls.List}`]);
		}
	}

}
