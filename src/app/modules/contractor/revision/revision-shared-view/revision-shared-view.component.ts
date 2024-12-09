import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ActionRequest, ApprovalFormEvent, getPORevisionDetails, PORevisionDetail, RevisionData, RevisionSharedDetail, StatusData } from '@xrm-master/role/Generictype.model';
import { DateConversationService } from '../../assignment-details/service/date_conversation.service';

@Component({selector: 'app-revision-shared-view',
	templateUrl: './revision-shared-view.component.html',
	styleUrls: ['./revision-shared-view.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevisionSharedViewComponent implements OnInit, OnChanges {

  @Input() revisionObject: RevisionData;
  @Input() isCommentRequired:boolean = false;
  @Input() isCommentAsterik:boolean = false;
  @Input() isRevisionRequired:boolean = false;
  @Input() public revisionForm: FormGroup;
  public commonHeaderForm: FormGroup;
  public entityId:number = XrmEntities.AssignmentRevision;
  public buttonSet = [];
  @Input() statusData: StatusData;
  public dateFormat: string;
  public assignmentDetailsVisible = false;
  approvalConfigWidgetObj: ActionRequest;
  private countryId=this.local.GetCulture(CultureFormat.CountryId);
  private dynamicParam: DynamicParam[] = [
  	{ Value: this.local.GetCulture(CultureFormat.CurrencyCode, this.countryId), IsLocalizeKey: false },
  	{ Value: '', IsLocalizeKey: false }
  ];
  public Maplocalization = new Map<string, string>([
  	["POApprovedAmountCURR", ""],
  	["POIncurredAmountCURR", ""],
  	["PORemainingAmountCURR", ""],
  	["POAmountforTimeCURR", ""],
  	["PoExpenseAmount", ""],
  	["PoTimeIncurredAmount", ""],
  	["PoExpenseIncurredAmount", ""],
  	["PORemainingAmountforTimeCURR", ""],
  	["PORemainingAmountforExpenseCURR", ""]
  ]);
  showApproverWidget: boolean = true;
  // eslint-disable-next-line max-params
  constructor(
	private fb: FormBuilder,
	private local: LocalizationService,
	private cd:ChangeDetectorRef,
  private dateConvert: DateConversationService
  ) {
  	this.commonHeaderForm = this.fb.group({
  		status: [null]
  	});
  }

  public getDateFormat(dateForm: string, fieldLabel: string): string {
  	const dateFields = [
  		'HourDistributionEffectiveDate',
  		'EndDate',
  		'StartDateForBackfillPosition',
  		'StartDate',
  		'RestMealEffectiveDate',
  		'EndDateForBackfillPosition'
  	];

  	if (dateFields.includes(fieldLabel)) {
  		dateForm = this.local.TransformDate(dateForm, this.dateFormat);
  	}
  	else{
  		dateForm = this.local.GetLocalizeMessage(dateForm);
  	}

  	return dateForm;
  }


  ngOnInit() {
  	this.dateFormat = this.local.GetCulture(CultureFormat.DateFormat);
  	for (const [key, value] of this.Maplocalization.entries()) {
  		const result = this.local.GetLocalizeMessage(key, this.dynamicParam);
  		this.Maplocalization.set(key, result);
  	}
  	this.revisionForm?.statusChanges.subscribe(() => {
  		this.cd.markForCheck();
  	});
  }

  ngOnChanges(changes: SimpleChanges): void {
  	if(changes['revisionObject'] && changes['revisionObject'].currentValue) {
  		this.dynamicParam[1].Value = this.revisionObject?.RevisionDetails?.UnitType;
  		this.getApprovalWidgetData();
  	}
  }

  public redirect(event: string) {
  	if (event == '#assignment') {
  		this.assignmentDetailsVisible = true;
  	}
  }


  private getDetailsList(section: string): RevisionSharedDetail[] {
  	if (!this.revisionObject) {
  		return [];
  	}
  	return this.revisionObject?.RevisionChangesDtos?.filter((element: RevisionSharedDetail) =>
  			element?.Section === section) ?? [];
  }


  public getPositionDetailsList(): RevisionSharedDetail[] {
  	return this.getDetailsList('Position Details');
  }

  public getRateDetailsList(): RevisionSharedDetail[] {
  	return this.getDetailsList('Rate Details');
  }

  public getTimeAndExpenseDetailsList(): RevisionSharedDetail[] {
  	return this.getDetailsList('Time And Expense Configurations');
  }

  public getRevisionStatus() {
  	return this.revisionObject?.RevisionDetails?.StatusName;
  }

  public getPORevisionDetails(): getPORevisionDetails[] {
  	if (this.revisionObject == null || this.revisionObject == undefined)
  		return [];
  	return [
  		{ 'Key': this.local.GetLocalizeMessage('EstimtedCostofChange', this.dynamicParam), 'Value': this.revisionObject?.CurrentPODetails?.EstimatedCostChange },
  		{ 'Key': this.local.GetLocalizeMessage('AdditionalFundRequested', this.dynamicParam), 'Value': this.revisionObject?.CurrentPODetails?.AdditionalFundRequested },
  		{ 'Key': this.local.GetLocalizeMessage('TotalAmountRequested', this.dynamicParam), 'Value': this.revisionObject?.CurrentPODetails?.TotalAmountRequested }
  	];
  }

  public getPORevisionDetailsNewPO(): PORevisionDetail[] {
  	if (this.revisionObject == null || this.revisionObject == undefined)
  		return [];
  	return [
  		{ 'Key': `${this.local.GetLocalizeMessage('NewPORequested')}`, 'Value': this.revisionObject?.NewPODetails?.NewPORequest },
  		{ 'Key': this.local.GetLocalizeMessage('FundRequestedCurr', this.dynamicParam), 'Value': this.revisionObject?.NewPODetails?.FundRequested },
  		{ 'Key': this.local.GetLocalizeMessage('EffectiveFrom'), 'Value': this.revisionObject?.NewPODetails?.EffectiveFrom !=null
  			? this.local.TransformData(this.revisionObject?.NewPODetails?.EffectiveFrom, CultureFormat.DateFormat)
  			: ""},
  		{ 'Key': this.local.GetLocalizeMessage('TotalAmountRequested', this.dynamicParam), 'Value': this.revisionObject?.NewPODetails?.NewTotalAmountRequested }
  	];
  }

  public isCurrentPO(): boolean {
  	return this.revisionObject?.RevisionDetails?.POAdjustmentType == 'CurrentPo'
  		? true
  		: false;
  }

  public isPOGreaterthanZero(): boolean {
  	return this.revisionObject?.CurrentPODetails?.TotalAmountRequested > Number(magicNumber.zero)
  		? true
  		: false;
  }

  public isPONewGreaterthanZero(): boolean {
  	if (this.revisionObject?.NewPODetails?.NewTotalAmountRequested != null) {
  		return this.revisionObject.NewPODetails.NewTotalAmountRequested > Number(magicNumber.zero);
  	}

  	return false;
  }

  public isPONew(): boolean {
  	return this.revisionObject?.RevisionDetails?.POAdjustmentType == 'AddNewPo'
  		? true
  		: false;
  }

  public offcanvasHidden() {
  	this.assignmentDetailsVisible = false;
  }

  public closeOpenPanel() {
  	this.assignmentDetailsVisible = false;
  }

  public isSeparateTandEPoAmount() {
  	return this.revisionObject?.RevisionPODetails?.SeparateTandEPoAmount;
  }

  private getApprovalWidgetData() {
  	if(this.revisionObject){
  		this.approvalConfigWidgetObj = {
  			"actionId": 533,
  			"entityId": XrmEntities.AssignmentRevision,
  			"sectorId": this.revisionObject.RevisionDetails.SectorId,
  			"locationId": this.revisionObject.RevisionDetails.WorkLocationId,
  			"orgLevel1Id": this.revisionObject.RevisionDetails.OrgLevel1Id,
  			"laborCategoryId": this.revisionObject.RevisionDetails.LaborCategoryId,
  			"reasonsForRequestId": 0,
  			"estimatedcost": this.revisionObject.CurrentPODetails.TotalAmountRequested,
  			"nextLevelManagerId": this.revisionObject.RevisionDetails.RequestingManagerId
  		};
  	}
  }

  public onApproverSubmit(event: ApprovalFormEvent){
  	if(event.data.length > Number(magicNumber.zero)){
  		this.showApproverWidget = true;
  	}
  	else{
  		this.showApproverWidget = false;
  	}

  }

  public getLocalizaiton(text: string, isCurrency: boolean = false) {
  	if(isCurrency)
  		{
  		return this.local.GetLocalizeMessage(text, this.dynamicParam);
  	}
  	return this.local.GetLocalizeMessage(text);
  }
}


