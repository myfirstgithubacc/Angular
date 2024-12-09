
import { Component, OnDestroy, OnInit, Renderer2, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AssingmentDetailsService } from '../service/assingmentDetails.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { DayInfo } from '../service/dayInfo';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { AssingmentType } from '../service/assingmentType.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { RateType } from '../service/rateType.enum';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DmsImplementationService } from '@xrm-shared/services/dms-implementation.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { AssignmentDetailsDataService } from '../service/assingmentDetailsData.service';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { MenuService } from '@xrm-shared/services/menu.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { navigationUrls } from '../constants/const-routes';
import { ApproverEnum, ApproverValueEnum, OrganizationLevelEnum, OrganizationLevelValueEnum } from '../constants/enum';
import { IRecordButtonGridView, StatusData, DetailItem, AssignmentRate, AssignmentHourDistributionRule, AssignmentMealBreakConfiguration, IDay, IAssignmentPONumber, BenefitAdder, AssignmentCostAccountingCode, ColumnConfig, DocumentDetails, AssignmentRevision, RequestDetail, IAssignmentDetails, IDynamicLabel, assignmentRoute, workLocationConfiguration, CostCenterConfig, OrgDetail } from '../interfaces/interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SelectEvent } from '@progress/kendo-angular-layout/tabstrip/events/select-event';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy{

	public buttonSet: IRecordButtonGridView[];
	public entityID= XrmEntities.Assingments;
	public statusData: StatusData = {
		items: []
	};
	public AddEditEventReasonForm: FormGroup;
	public uKey: string;
	// public assignmentDetails: IAssignmentDetails = {} as IAssignmentDetails;
	public assignmentDetails: IAssignmentDetails;
	public assignmentRates: AssignmentRate;
	public HoursDistributionData: AssignmentHourDistributionRule;
	public RestMealBreakData: AssignmentMealBreakConfiguration;
	public daysInfo: IDay[];
	public IsCandidateIDVisible = false;
	private navigationUrlCancel: string = navigationUrls.list;
	public IsRateTypeHours:boolean = false;
	public currencyCode:string = "";
	private countryId:string|null;
	public hasDMSLength:boolean = false;

	// Onboarding Data
	public userGroupId: number = magicNumber.three;
	public uploadStageId: number;
	public actionTypeId: number = ActionType.View;
	public processingId: number = magicNumber.five;
	public isPendingResultSection: boolean = false;
	public isDrugScreen: boolean = true;
	public isBackgroundCheck: boolean = true;
	public recordStatus = "Active";

	// OrgLevel Configurations
	public orglvlNames: string[] = ["OrgLevel1", "OrgLevel2", "OrgLevel3", "OrgLevel4"];
	public orglvlVisible: boolean[] = [false, false, false, false];

	// Right Panel Configurations
	public openRightPanel = {status: false, type: '', ukey: ''};


	// Grid Data
	public pageSize: number = magicNumber.ten;
	public POGridData:IAssignmentPONumber[]|null;
	public BAGridData: BenefitAdder[];
	public CostAccGridData: AssignmentCostAccountingCode[];
	// public DocGridData: any;

	// Grid ColumnOptions
	public POColumnOptions:ColumnConfig[];
	public BAColumnOptions:ColumnConfig[];
	public CostAccColumnOptions:ColumnConfig[] = [];
	public DocColumnOptions = [
		{
			fieldName: 'PoNumber',
			columnHeader: 'DocumentTitle',
			visibleByDefault: true
		},
		{
			fieldName: 'TotalPoAmount',
			columnHeader: 'Document',
			visibleByDefault: true
		},
		{
			fieldName: 'TotalPoAmount',
			columnHeader: 'UploadedBy',
			visibleByDefault: true
		},
		{
			fieldName: 'TotalPoAmount',
			columnHeader: 'UploadedOn',
			visibleByDefault: true
		},
		{
			fieldName: 'TotalPoAmount',
			columnHeader: 'Actions',
			visibleByDefault: true
		}
	];
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

	public timeRange = {
		labelLocalizeParam1: [],
		labelLocalizeParam2: [],
		label1: 'Start Time',
		label2: 'End Time',
		DefaultInterval: 0,
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
	private dmsData: DocumentDetails[];
	private hasDmsData: boolean = false;
	public unitType: string;
	private roleGroupId: string|null;
	private revisionObject: AssignmentRevision = {index: 0, assignmentId: '', revisionId: ''};
	private entityType: string;
	public subEntityType: string;
	private unsubscribe$ = new Subject<void>();


	public LIRequestData: RequestDetail;
	public dynamicLabelName: IDynamicLabel[] = [
		{Text: 'Sector', Value: 'Sector', isVisible: true, isMandatory: true},
		{Text: String(OrganizationLevelEnum.One), Value: String(OrganizationLevelValueEnum.One), isVisible: true, IsMandatory: true},
		{Text: String(OrganizationLevelEnum.Two), Value: String(OrganizationLevelValueEnum.Two), isVisible: true, IsMandatory: true},
		{Text: String(OrganizationLevelEnum.Three), Value: String(OrganizationLevelValueEnum.Three), isVisible: true, IsMandatory: true},
		{Text: String(OrganizationLevelEnum.Four), Value: String(OrganizationLevelValueEnum.Four), isVisible: true, IsMandatory: true},
		{Text: String(ApproverEnum.One), Value: String(ApproverValueEnum.One), isVisible: true, IsMandatory: true},
		{Text: String(ApproverEnum.Two), Value: String(ApproverValueEnum.Two), isVisible: true, IsMandatory: true}
  	];
	public hourDistributionRuleEffecDate: string;
	public restMealEffecDate: string;
	locationAdress: string;
	// eslint-disable-next-line max-params
	constructor
	(
	  private assingmentDetailsService : AssingmentDetailsService,
      private commonHeaderIcon: CommonHeaderActionService,
      private router: Router,
      private assignmentService: AssingmentDetailsService,
      private Routes: ActivatedRoute,
      private fb: FormBuilder,
      private toasterService: ToasterService,
      private localizationService: LocalizationService,
	  private renderer: Renderer2,
	  private dmsImplementationService: DmsImplementationService,
	  private eventlog: EventLogService,
	  private assignmentDetailsDataService: AssignmentDetailsDataService,
	  private menuService: MenuService,
	  public udfCommonMethods: UdfCommonMethods,
	  private cd: ChangeDetectorRef
	) {
		this.getConstructorInitializedData();
	}

	ngOnInit(): void {
		this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.AssignmentRevision);
		this.assignmentService.navigationUrlCancel.pipe(takeUntil(this.unsubscribe$)).subscribe((data: assignmentRoute) => {
			if (data.url && data.url.length > Number(magicNumber.zero)) {
				this.navigationUrlCancel = data.url;
			}
		});
		this.reset();
		this.assingmentDetailsService.navigationUrlRevision.pipe(takeUntil(this.unsubscribe$)).subscribe((data: AssignmentRevision) => {
			this.revisionObject = data;
		});

		this.Routes.params.pipe(takeUntil(this.unsubscribe$), switchMap((params: Params) => {
			this.uKey = params['id'];
			if (this.uKey) {
				this.getActionSet();
				return this.assignmentService.getAssingmentDetailsByUkey(this.uKey);
			}
			return of(null);
		})).subscribe((res: GenericResponseBase<IAssignmentDetails> | null) => {
			if(res?.Succeeded && res.Data){
				this.assignmentDetails = res.Data;
				this.setAssignmentDetails();
			}else {
				this.toasterService.showToaster(ToastOptions.Error, String(res?.Message));
			}
		});
	}

	private getConstructorInitializedData(){
		this.AddEditEventReasonForm = this.fb.group({
			startTimeControlName: [null],
			endTimeControlName: [null]
		});

		this.countryId = sessionStorage.getItem('CountryId');
		this.currencyCode = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);
		this.roleGroupId = sessionStorage.getItem('RoleGroupId');
		this.setEntityType();
		if(this.roleGroupId==String(magicNumber.two) || this.roleGroupId==String(magicNumber.three)){
			this.uploadStageId = 0;
		}else{
			this.uploadStageId = DocumentUploadStage.CLP;
		}
		this.getUserType();
	}
	private getUserType() {
		this.userGroupId = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
	}
	private setEntityType(){
		this.entityType = 'All';
		this.subEntityType = this.entityType;
	}

	public getRevisionTab(){
		return this.revisionObject;
	}

	private reset(){
		this.assingmentDetailsService.resetRevisionPageIndex();
	}

	private setAssignmentDetails() {

		this.hourDistributionRuleEffecDate = this.localizationService.TransformDate(this.assignmentDetails.HourDistributionRuleEffectiveDate);
		this.restMealEffecDate = this.localizationService.TransformDate(this.assignmentDetails.MealBreakConfigurationEffectiveDate);
		this.assignmentDetails.AssignmentStartDate = String(this.localizationService.TransformDate(this.assignmentDetails.AssignmentStartDate));
		this.assignmentDetails.AssignmentEndDate = this.localizationService.TransformDate(this.assignmentDetails.AssignmentEndDate);
		this.isBackgroundCheck = this.assignmentDetails.IsBackgroundChecksRequired;
		this.isDrugScreen = this.assignmentDetails.IsDrugScreenRequired;
		this.updateEventLog();
		this.callDMSService();
		this.setCostAccountingCodeGrid(String(this.assignmentDetails.SectorId));
		this.statusData.items= this.statusDataDetails();

		this.IsCandidateIDVisible = this.assignmentDetails.AssignmentTypeId != Number(AssingmentType.LightIndustrial);
		this.IsRateTypeHours = this.assignmentDetails.UnitType == Number(RateType.Hour);

		this.SetOrgNames(String(this.assignmentDetails.SectorId));

		this.assignmentRates = this.assignmentDetails.AssignmentRates;
		this.assignmentRates.RateEffectiveDateFrom = this.localizationService.TransformDate(this.assignmentRates.RateEffectiveDateFrom);

		this.POGridData = this.assignmentDetails.AssignmentPoNumbers;
		this.setPoColumnOptions();

		this.setBenefitAdderColumnOptions();

		this.CostAccGridData = this.assignmentDetails.AssignmentCostAccountingCodes;
		this.CostAccGridData.map((x:AssignmentCostAccountingCode) => {
			x.EffectiveFrom = this.localizationService.TransformDate(x.EffectiveFrom);
			x.EffectiveTo = this.localizationService.TransformDate(x.EffectiveTo);
		});
		// this.BAGridData = this.assignmentDetails?.BenefitAdders;
		this.setBenefitAdderDecimalValues(this.assignmentDetails.BenefitAdders);
		this.HoursDistributionData = this.assignmentDetails.AssignmentHourDistributionRules?.[0];
		this.RestMealBreakData = this.assignmentDetails.AssignmentMealBreakConfigurations?.[0];
		this.daysInfo = this.generateDaysInfo(this.assignmentDetails.AssignmentShiftDetails?.[0]??[]);
		this.AddEditEventReasonForm.controls['startTimeControlName'].patchValue(this.assignmentDetails.AssignmentShiftDetails?.[0]?.StartTime ?? '');
		this.AddEditEventReasonForm.controls['endTimeControlName'].patchValue(this.assignmentDetails.AssignmentShiftDetails?.[0]?.EndTime ?? '');
		this.getWorkLocationAddress();
	}

	private getWorkLocationAddress(){
		this.assingmentDetailsService.getWorkAddress(Number(this.assignmentDetails.WorkLocationId)).
			pipe(takeUntil(this.unsubscribe$)).subscribe((data1: GenericResponseBase<workLocationConfiguration>) => {
				// console.log("data1",data1);
				if(data1.Data?.LocationAddress){
					this.locationAdress = data1.Data.LocationAddress;
				}
			});
	}

	private statusDataDetails():DetailItem[]{
		return [
			{
				title: 'Worker Name',
				titleDynamicParam: [],
				item: this.assignmentDetails.ContractorName,
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: ''
			},
			{
				title: 'AssignmentID',
				titleDynamicParam: [],
				item: this.assignmentDetails.AssignmentCode,
				itemDynamicParam: [],
				cssClass: [''],
				isLinkable: false,
				link: ''
			},
			{
				title: 'JobCategory',
				titleDynamicParam: [],
				item: this.assignmentDetails.JobCategoryName,
				itemDynamicParam: [],
				cssClass: [''],
				isLinkable: false,
				link: ''
			},
			{
				title: 'StaffingAgency',
				titleDynamicParam: [],
				item: this.assignmentDetails.StaffingAgencyName,
				itemDynamicParam: [],
				cssClass: [''],
				isLinkable: false,
				link: ''
			},
			{
				title: 'Status',
				titleDynamicParam: [],
				item: this.assignmentDetails.StatusName,
				itemDynamicParam: [],
				cssClass: [''],
				isLinkable: false,
				link: ''
			}
		];
	}

	private setBenefitAdderDecimalValues(benefitAdderGrid: BenefitAdder[]){
		this.BAGridData = benefitAdderGrid.map((dt:BenefitAdder) => {
			dt.Value = Number(dt.Value).toFixed(magicNumber.two);
			dt.LocalizedLabelKey= this.localizationService.GetLocalizeMessage(dt.LocalizedLabelKey);
			return dt;
		});
	}

	public hasDMSLengthFn(e:boolean){
		this.hasDMSLength = e;
	}

	private setCostAccountingCodeGrid(sectorId:string) {
		this.assingmentDetailsService.getGetSectorCostCenterConfigsValue(sectorId).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<CostCenterConfig>) => {
				if (res.Succeeded) {
					if(!res.Data?.AddCostCenterManually){
						this.CostAccColumnOptions = [
							{
								fieldName: 'CostAccountingCode',
								columnHeader: 'CostAccountingCode',
								visibleByDefault: true
							},
							{
								fieldName: 'Description',
								columnHeader: 'Description',
								visibleByDefault: true
							},
							{
								fieldName: 'EffectiveFrom',
								columnHeader: 'EffectiveFrom',
								visibleByDefault: true
							},
							{
								fieldName: 'EffectiveTo',
								columnHeader: 'EffectiveTo',
								visibleByDefault: true
							}
						];
					}
					else{
						this.CostAccColumnOptions = [
							{
								fieldName: 'CostAccountingCode',
								columnHeader: 'CostAccountingCode',
								visibleByDefault: true
							},
							{
								fieldName: 'Description',
								columnHeader: 'Description',
								visibleByDefault: true
							}
						];
					}
				}
				this.cd.markForCheck();
			});
	}

	private SetOrgNames(SectorId: string) {
		this.assignmentService.getSectorOrgLevelConfigs(SectorId).
			pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrgDetail[]>) => {
				if (res.Succeeded && res.Data) {
					res.Data.forEach((element: OrgDetail, index: number) => {
						this.orglvlNames[index] = element.LocalizedKey;
						this.orglvlVisible[index] = element.IsVisible;

						this.dynamicLabelName.find((x: IDynamicLabel) => {
							if (x.Text === `OrganizationLevel${index + magicNumber.one}`) {
						  x.Value = element.OrgName;
						  x.isVisible = element.IsVisible;
						  x.isMandatory = element.IsMandatory;
						  return true;
							}
							return false;
					  });
					});
				}
			});
	}

	private generateDaysInfo(data: Record<string, boolean>): DayInfo[] {
		const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		return days.map((day) =>
			({ day, isSelected: data[day.substring(magicNumber.zero, magicNumber.three)] || false }));
	}

	public navigate(): void {
		if(this.router.url.includes('global-search')){
			this.router.navigate([navigationUrls.globalSearchList]);
		}
		else{
			this.router.navigate([this.navigationUrlCancel]);
		}
	}

	private updateEventLog(){
		this.eventlog.recordId.next(this.assignmentDetails.Id);
		this.eventlog.entityId.next(XrmEntities.Assingments);
	}

	private getActionSet() {
		this.buttonSet = [
			{
				status: "Active",
				items: this.commonHeaderIcon.commonActionSetOfEditIconToShowView(this.onEdit, [], [Permission.Edit])
			}
		];
	}

	private onEdit = () => {
		this.router.navigate([`${navigationUrls.edit}/${this.uKey}`]);
	};

	public getDayHourLocalizationValue(key: string) {
		if (this.assignmentDetails.UnitTypeName != "") {
			this.unitType = this.assignmentDetails.UnitTypeName == "Hour"
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

	public getRecordId(){
		return this.assignmentDetails.Id;
	}


	public getLocationId(){
		return this.assignmentDetails.WorkLocationId;
	}

	private setPoColumnOptions(){
		const dynamicParam: DynamicParam[] = [{Value: this.currencyCode, IsLocalizeKey: false}];
		this.POColumnOptions = [
			{	fieldName: 'PoNumber', columnHeader: 'PONumber', visibleByDefault: true	},
			{	fieldName: 'TotalPoAmount',	columnHeader: this.localizationService.GetLocalizeMessage('POApprovedAmountCURR', dynamicParam),
				visibleByDefault: true },
			{	fieldName: 'TotalPoIncurredAmount',	columnHeader: this.localizationService.GetLocalizeMessage('POIncurredAmountCURR', dynamicParam),
				visibleByDefault: !this.isSeparateTandEPoAmount()	},
			{	fieldName: 'PoRemainingAmount',
				columnHeader: this.localizationService.GetLocalizeMessage('PORemainingAmountCURR', dynamicParam),
				visibleByDefault: !this.isSeparateTandEPoAmount()	},
			{	fieldName: 'PoTimeAmount',
				columnHeader: this.localizationService.GetLocalizeMessage('POAmountforTimeCURR', dynamicParam),
				visibleByDefault: this.isSeparateTandEPoAmount()},
			{	fieldName: 'PoExpenseAmount',
				columnHeader: this.localizationService.GetLocalizeMessage('PoExpenseAmount', dynamicParam),
				visibleByDefault: this.isSeparateTandEPoAmount()},
			{	fieldName: 'PoTimeIncurredAmount',
				columnHeader: this.localizationService.GetLocalizeMessage('PoTimeIncurredAmount', dynamicParam),
				visibleByDefault: this.isSeparateTandEPoAmount()},
			{	fieldName: 'PoExpenseIncurredAmount',
				columnHeader: this.localizationService.GetLocalizeMessage('PoExpenseIncurredAmount', dynamicParam),
				visibleByDefault: this.isSeparateTandEPoAmount()},
			{	fieldName: 'PoTimeRemainingAmount',
				columnHeader: this.localizationService.GetLocalizeMessage('PORemainingAmountforTimeCURR', dynamicParam),
				visibleByDefault: this.isSeparateTandEPoAmount()},
			{	fieldName: 'PoExpenseRemainingAmount',
				columnHeader: this.localizationService.GetLocalizeMessage('PORemainingAmountforExpenseCURR', dynamicParam),
				visibleByDefault: this.isSeparateTandEPoAmount()},
			{	fieldName: 'PoEffectiveFrom',	columnHeader: 'EffectiveFrom', visibleByDefault: true, ValueType: 'Date'},
			{	fieldName: 'PoEffectiveTo',	columnHeader: 'EffectiveTo', visibleByDefault: true, ValueType: 'Date'}
		];
	}

	private setBenefitAdderColumnOptions(){
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

	private isSeparateTandEPoAmount(): boolean {
		if(this.POGridData != null){
			return this.POGridData[0]?.SeparateTandEPoAmount;
		}
		return true;
	}

	public getRightPanelConfiguration(){
		return this.openRightPanel;
	}

	public closeOpenPanel(){
		this.openRightPanel.status = false;
		this.openRightPanel.type = '';
		this.openRightPanel.ukey = '';
	}

	public moreDetails(){
		this.assingmentDetailsService.navigateBackUrl.next('');
		if(this.openRightPanel.type == 'LI')
		{
			this.renderer.setStyle(document.body, 'overflow', 'visible');
			this.renderer.setStyle(document.body, 'padding-right', '0');
			this.router.navigate([`${navigationUrls.jobOrderView}/${this.assignmentDetails.RequestUKey}`]);
			this.assingmentDetailsService.navigateBackUrl.next(`${navigationUrls.view}/${this.assignmentDetails.UKey}`);
		}
	}

	public openRightSidePanel(type: string) {
		this.openRightPanel.status = false;
		this.openRightPanel.type = type;
		this.openRightPanel.ukey = this.assignmentDetails.RequestUKey;
		this.assingmentDetailsService.getLiRequestData(this.assignmentDetails.RequestUKey).
			pipe(takeUntil(this.unsubscribe$)).subscribe((res:GenericResponseBase<RequestDetail>) => {
				if(res && res.Succeeded && res.Data){
					this.LIRequestData = res.Data;
				}
				this.cd.markForCheck();
			});
	}

	private callDMSService() {
		this.dmsImplementationService
			.getAllUploadedDmsRecord([{"workFlowId": this.entityID, "recordId": Number(this.assignmentDetails.Id), "isParentWorkflow": true, "IsDraft": false}])
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<DocumentDetails[]>) => {
				// console.log("dms",res);
				if (res.Succeeded && res.Data) {
					this.dmsData = res.Data;
					if (this.dmsData.length > Number(magicNumber.zero)) {
						this.hasDmsData = true;
					} else {
						this.hasDmsData = false;
					}
				}
			});
	}

	public isFieldVisible(controlName:string){
		return this.assignmentDetailsDataService.isFieldVisible(controlName, this.assignmentDetails.LoggedInUserRoleGroupID);
	}
	public onClickRevisionTab(tabName:SelectEvent){
		if(tabName.title == 'Revisions'){
			this.assingmentDetailsService.resetRevisionPageIndex(magicNumber.one, false);
			this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.AssignmentRevision);
		}
		else
			this.assingmentDetailsService.resetRevisionPageIndex(magicNumber.zero, false);
		this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.Assingments);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
