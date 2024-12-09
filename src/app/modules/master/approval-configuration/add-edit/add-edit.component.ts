import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
	allDataUpdatedAsFalseForApplicableIn,
	checkedDuplicateSectorValue,
	manageAccessItems,
	controlNames,
	filterDataBasedOnAccessToAllType,
	updatedApplicableIn,
	bindingJSON
} from '../approval-function';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DataModel } from '../data.model';
import { DialogPopupService } from '../../../../shared/services/dialog-popup.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { LocationService } from 'src/app/services/masters/location.service';
import { NavigationPaths } from '../constant/routes.constant';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { TranslateService } from '@ngx-translate/core';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { EMPTY, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { OffCanvasService } from '../services/off-canvas.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApprovalConfigurationGatewayService } from 'src/app/services/masters/approval-configuration-gateway.service';
import { AccessAllApplicableIn, AccessToAll, ApplicableIn, ApplicableInEntity, ApprovalEditData, ApproverType, LevelApprover, SectorWiseObj, SetupApprovalformValue, StatusOptions, StoreKey, TempObjOfApplicableInData, WholeDatabasedOnWorkFlow, ApprovalRequired, UserType, AccessToAllItems, Structure, SelectionStructure, StatusCard, IDataItem, ApprovalConfigUser, IDataItemResponse } from '../constant/enum';
import { IDropdown, IDropdownOption, IRecordStatusChangePayload } from '@xrm-shared/models/common.model';
import { ApiResponse } from '@xrm-core/models/event-configuration.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';


@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	animations: [
		trigger('slideInOut', [
			state('in', style({ transform: 'translateX(0)',
				changeDetection: ChangeDetectionStrategy.OnPush
			})),
			transition(':enter', [
				style({ transform: 'translateX(100%)' }),
				animate('300ms ease-out')
			]),
			transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
		])
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy{

	public labourKey: string[] = [];
	public locKey: string[] = [];
	public orgKey: string[] = [];
	public sectorKey:string[] = [];
	public reasonKey: string[] = [];
	public checked:boolean = false;
	public sectorWiseObj: SectorWiseObj;
	public showAddButton: boolean = true;
	public commonSelectedKey: string[];
	public approvalReqLength : number = magicNumber.zero;
	public modifiedLocData:ApplicableInEntity[];
	public modifiedOrgData:ApplicableInEntity[];
	public modifiedLabData: ApplicableInEntity[];
	public modifiedReasData: ApplicableInEntity[];
	public sectorData: ApplicableInEntity[] = [];
	public locationData: ApplicableInEntity[] = [];
	public laborCategoriesData:ApplicableInEntity[] = [];
	public reasonforRequestData:ApplicableInEntity[] = [];
	public organizationLevelData:ApplicableInEntity[] = [];
	public selctedDataForEdit : ApplicableInEntity[] = [];
	public approvalConfigUserObj : ApprovalConfigUser;
	public roleDropDownData:IDropdownOption[] = [];
	public userTypeDropDownData: IDropdownOption[] = [];
	public storeKeyValue: StoreKey[] = [];
	public dropDownDataWithLocaKey: IDropdownOption[];
	public approvalRequiredDropDownData: IDropdown[] = [];
	public isEditMode: boolean = false;
	public AddEditApprovalConfigForm: FormGroup;
	public itemTypeUKey: string;
	public approvalEntityList: [] = [];
	public dynamicForm: FormGroup;
	public addSwitchForm: FormGroup;
	public accessToAllSectors: AccessToAll[] = [];
	public accessToAllLocation: AccessToAll[] = [];
	public accessToAllOrgLvl1: AccessToAll[] = [];
	public accessToAllLabCat: AccessToAll[]= [];
	public accessToAllReasonReq: AccessToAll[] = [];
	public wholeDatabasedOnWorkFlow: WholeDatabasedOnWorkFlow;
	public wholeDataOfApplicableInCasedOnWorkFlow: ApplicableIn[];
	public wholeSetupApprovalData: ApproverType[];
	public approverByData: IDropdownOption[];
	public approvalConfigDetail: WholeDatabasedOnWorkFlow;
	public approvalConfigId: string | number;
	public tempObjOfApplicableInData:TempObjOfApplicableInData;
	public expandedKeys = [""];
	public getEditData: boolean = false;
	public xrmEntityId: string | number;
	public formArrayLength: number;
	public workFlowName: string;
	public approveralRequiredName: string;
	public entityId = XrmEntities.ApprovalConfiguration;
	public recordId: string;
	public statusForm: FormGroup;
	public recordStatus: string;
	public patchValueOfApproval: LevelApprover[];
	private selectedSectorForSpecificUser:ApplicableInEntity[] = [];
	private ngUnsubscribe$: Subject<void> = new Subject<void>();
	private changeWorkFlowEntityId : number | undefined;
	public statusData = {
		items: [
			{
				item: '',
				title: 'ApprovalConfigId',
				cssClass: ['basic-title']
			}
		]
	};
	public ukey: string;
	public statusError: boolean = true;
	public listOfStatus = StatusOptions;
	public accessAllSectors = AccessAllApplicableIn;
	public accessAllLocation = AccessAllApplicableIn;
	public accessAllOrgLevel = AccessAllApplicableIn;
	public accessAllLaborCategory = AccessAllApplicableIn;
	public accessAllReasonForRequest = AccessAllApplicableIn;


	private onActivate = (actions: string) => {
		if (actions == dropdown.Activate) {
			this.ActivateDeactivateApprovalConfiguration([{ UKey: this.ukey, ReasonForChange: '', Disabled: false }]);

		}
		else {
			this.ActivateDeactivateApprovalConfiguration([{ UKey: this.ukey, ReasonForChange: '', Disabled: true }]);
		}
	};


	public buttonSet = [
		{
			status: "Active",
			items: this.commonHeaderIcons.commonActionSetOnEditActive(this.onActivate)
		},
		{
			status: "Inactive",
			items: this.commonHeaderIcons.commonActionSetOnDeactive(this.onActivate)
		}
	];

	public secKeyClicked: boolean = false;
	public existingUkey: string | undefined;
	private selectedSectorUnsub$: Subscription | undefined;
	public switchSectorOption: boolean = false;
	public lastValue: IDropdownOption;
	public conflictData: boolean = false;
	public levelRemoved: boolean = false;
	private sectorIdSelected: number[];
	public setupApprovalConfigForm: FormGroup;
	private setupApprovalConfigFormValue: SetupApprovalformValue;

	// eslint-disable-next-line max-params, max-lines-per-function
	constructor(
		private fb: FormBuilder,
		private route: Router,
		private activatedRoute: ActivatedRoute,
		private loaderService: LoaderService,
		private translate: TranslateService,
		private cd: ChangeDetectorRef,
		public location: LocationService,
		public approvalConfigGatewayServ:ApprovalConfigurationGatewayService,
		private dialogPopupService: DialogPopupService,
		private customValidators: CustomValidators,
		private eventLog: EventLogService,
		private commonHeaderIcons: CommonHeaderActionService,
		private formBuilder: FormBuilder,
		private toasterServc: ToasterService,
		private appRef: ApplicationRef,
		public offcanvasServc: OffCanvasService,
		public cdr : ChangeDetectorRef
	) {
		this.initializeApprovalForm();
		this.cd.markForCheck();
	}

	ngOnInit(): void {
		this.getIdFromRoute();
		if(this.isEditMode){
			this.approvalConfigGatewayServ.approverLevelRemoved.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((boolVal) => {
				this.levelRemoved = boolVal;
			});
		}

		this.offcanvasServc.offcanvasElement = false;
		this.toasterServc.showRightPannelObj.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
			if (res) {
				this.offcanvasServc.offcanvasElement = true;
			}
		});
		this.dialogPopupService.OnCloseButton.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((result) => {

		  });
	}

	private getIdFromRoute(){
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$), switchMap((param) => {
			if(param['id']) {
				this.isEditMode = true;
				this.ukey = param['id'] ?? this.itemTypeUKey;
				return this.approvalConfigGatewayServ.getApprovalConfigById(this.ukey, false).pipe(takeUntil(this.ngUnsubscribe$));
			}
			else{
				this.isEditMode = false;
				this.geWorkFlowData();
				this.setDefaultApplicableIn();
				return EMPTY;
			}
		}), takeUntil(this.ngUnsubscribe$)).subscribe((dt: GenericResponseBase<ApprovalEditData>) => {
			if (isSuccessfulResponse(dt)) {
				this.loaderService.setState(false);
				this.isEditMode = true;
				this.getEditData = true;
				this.resetApplicableIn();
				this.approvalConfigDetail = dt.Data.Result;
				this.AddEditApprovalConfigForm.markAsPristine();
				this.setupApprovalConfigForm.markAsPristine();
				this.countSelectedItemsInAllCategories();
				this.recordId = this.approvalConfigDetail.ApprovalConfigCode;
				this.getApprovalConfigId();
			} else {
				this.loaderService.setState(false);
				this.toasterServc.showToaster(
					ToastOptions.Error,
					"Somethingwentwrong"
				);
			}
			this.bindingOfDataInApplicableIn(this.approvalConfigDetail);
			this.loaderService.setState(false);
		});
	}

	private initializeApprovalForm(){
		this.AddEditApprovalConfigForm = this.fb.group({
			ApprovalProcessName: [null, [this.customValidators.RequiredValidator('PleaseEnterNameApprovalProcess')]],
			AprrovalReq: [null],
			Comments: [null],
			Workflow: [null, [this.customValidators.RequiredValidator('PleaseSelectWorkflow')]],
			IsAllSectorApplicable: [{ Value: true }],
			IsAllLocationApplicable: [{ Value: true }],
			IsAllOrgLevel1Applicable: [{ Value: true }],
			IsAllLaborCategoryApplicable: [{ Value: true }],
			IsAllReasonForRequestApplicable: [{ Value: true }]
		});

		this.statusForm = this.formBuilder.group({
			status: [null]
		});

		this.AddEditApprovalConfigForm.get('Workflow')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((newValue) => {
			this.AddEditApprovalConfigForm.get('Workflow')?.setValue(newValue, { emitEvent: false });
		});
		this.cd.markForCheck();
	}

	private setDefaultApplicableIn() {
		const value = {
			Text: '',
			Value: magicNumber.zero,
			TextLocalizedKey: '',
			IsSelected: true
		};
		this.approvalRequired(value);
		controlNames.forEach((controlName) => {
			this.AddEditApprovalConfigForm.get(controlName)?.setValue(true);
		});
	}

	public hideRightPanel() {
		this.offcanvasServc.offcanvasElement = false;
	}

	private setDataForWorkflow(e: IDropdownOption) {
		this.approvalConfigGatewayServ.getAllDataBasedOnWorkFlow(e.Value).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
			if (res.Data) {
				this.lastValue = e;
				this.xrmEntityId = e.Value;
				this.resetApplicableIn();
				this.bindingOfDataInApplicableIn(res.Data);

			} else {
				this.loaderService.setState(false);
			}
		});

	}

	private applicableInSelectedAll() {
		const isSector = this.AddEditApprovalConfigForm.controls['IsAllSectorApplicable'].value,
			isLocation = this.AddEditApprovalConfigForm.controls['IsAllLocationApplicable'].value,
			isLaborCategory = this.AddEditApprovalConfigForm.controls['IsAllLaborCategoryApplicable'].value,
			isOrgLevel1 = this.AddEditApprovalConfigForm.controls['IsAllOrgLevel1Applicable'].value,
			isReaonFrRequest = this.AddEditApprovalConfigForm.controls['IsAllReasonForRequestApplicable'].value;
		if (isSector && isLocation && isLaborCategory && isOrgLevel1 && isReaonFrRequest && !this.setupApprovalConfigForm.dirty) {
			return true;
		} else {
			return false;
		}

	}

	public approvalRequired(e: IDropdownOption) {
		this.resetState();
		const value = e.Value ?? magicNumber.zero;
		this.changeWorkFlowEntityId = value;

		if (!this.isEditMode) {
			if (this.shouldResetApproval(value)) {
				this.resetApprovalData();
				this.setDataForWorkflow(e);
			} else {
				this.handleConfirmationDialog(e, value);
			}
		}

		this.updateSectorSelection();
	}

	private resetState() {
		this.selectedSectorUnsub$?.unsubscribe();
		this.dialogPopupService.resetDialogButton();
	}

	private shouldResetApproval(value: number): boolean {
		return value === Number(magicNumber.zero) || this.applicableInSelectedAll();
	}

	private resetApprovalData() {
		this.approvalRequiredDropDownData = [];
		this.approvalReqLength = this.approvalRequiredDropDownData.length;
	}

	private handleConfirmationDialog(e: IDropdownOption, value: number) {
		this.dialogPopupService.showConfirmation(
			'ThisActionWillResetAllApplicableInSettingsForTheSelectedItem',
			PopupDialogButtons.PageNavigation
		);

		this.selectedSectorUnsub$ = this.dialogPopupService.dialogButtonObs
			.pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((button: { value: number }) =>
				this.handleDialogResponse(button, e, value));
	}

	private handleDialogResponse(button: { value: number }, e: IDropdownOption, value: number) {
		switch (button.value) {
			case Number(magicNumber.eighteen):
				this.processApprovalConfig(e, value);
				break;
			case Number(magicNumber.nineteen):
			default:
				this.restorePreviousValue();
				break;
		}
	}

	private processApprovalConfig(e: IDropdownOption, value: number) {
		this.resetApprovalData();
		this.xrmEntityId = value;
		this.AddEditApprovalConfigForm.controls['Workflow'].setValue(e);
		this.loadApprovalConfigDataByWorkflow(e, value);
		this.dialogPopupService.resetDialogButton();
	}

	private restorePreviousValue() {
		const previousValue = this.lastValue.Value;
		if (previousValue === Number(magicNumber.zero)) {
			this.AddEditApprovalConfigForm.get('Workflow')?.setValue(undefined, { emitEvent: false });
		} else {
			this.AddEditApprovalConfigForm.get('Workflow')?.setValue(this.lastValue, { emitEvent: false });
		}
		this.dialogPopupService.resetDialogButton();
	}

	private updateSectorSelection() {
		this.sectorIdSelected = [];
		this.approvalConfigGatewayServ.changeSpecificUserSector(this.sectorIdSelected, this.changeWorkFlowEntityId)
			.pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((dt: ApiResponse) => {
				const obj = {
					data: dt.Data,
					status: false
				};
				this.approvalConfigGatewayServ.isSectorChanged.next(obj);
			});
	}

	private loadApprovalConfigDataByWorkflow(e: IDropdownOption, value: number){
		this.approvalConfigGatewayServ.getAllDataBasedOnWorkFlow(value).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
			if (res.Data) {
				this.lastValue = e;
				this.setApplicableInTrue();
				this.setAllDataReset();
				this.bindingOfDataInApplicableIn(res.Data);
				this.approvalConfigGatewayServ.isWorkFlowChanged.next(true);

			} else {
				this.loaderService.setState(false);
			}
		});
	}

	setApplicableInTrue(){
		this.AddEditApprovalConfigForm.controls['IsAllSectorApplicable'].setValue(true);
		this.AddEditApprovalConfigForm.controls['IsAllLocationApplicable'].setValue(true);
		this.AddEditApprovalConfigForm.controls['IsAllOrgLevel1Applicable'].setValue(true);
		this.AddEditApprovalConfigForm.controls['IsAllLaborCategoryApplicable'].setValue(true);
		this.AddEditApprovalConfigForm.controls['IsAllReasonForRequestApplicable'].setValue(true);
	}

	private resetApplicableIn() {
		this.sectorKey = [];
		this.locKey = [];
		this.orgKey = [];
		this.labourKey = [];
		this.reasonKey = [];
		this.accessToAllLabCat = [];
		this.accessToAllLocation = [];
		this.accessToAllOrgLvl1 = [];
		this.accessToAllReasonReq = [];
		this.accessToAllSectors = [];
		if (!this.isEditMode) {
			controlNames.forEach((controlName) => {
				this.AddEditApprovalConfigForm.get(controlName)?.setValue(true);
			});
		}


	}

	private bindingOfDataInApplicableIn(Apidata: WholeDatabasedOnWorkFlow) {
		this.wholeDatabasedOnWorkFlow = Apidata;
		this.wholeDataOfApplicableInCasedOnWorkFlow = this.wholeDatabasedOnWorkFlow.ApplicableIn;
		this.wholeSetupApprovalData = this.wholeDatabasedOnWorkFlow.ApproverTypes;
		if (this.wholeSetupApprovalData.length > Number(magicNumber.zero)) {
			this.getRoleAndUserData(this.wholeSetupApprovalData);
		}
		this.approverByData = this.wholeSetupApprovalData.map((y: ApproverType) => {
			return {
				"Text": y.ApproverTypeName,
				 "Value": y.ApproverTypeId,
				 "TextLocalizedKey": '',
				 "IsSelected": false
			};
		});

		const approvalReq = this.wholeDatabasedOnWorkFlow.ApprovalRequired;

		if (approvalReq.length > Number(magicNumber.zero)) {
			approvalReq.map((dt: ApprovalRequired) => {
				let dataOttype = null;
				if(dt.ApprovalRequiredName){
					this.translate.stream(dt.ApprovalRequiredName).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
						dataOttype = res;
						this.approvalRequiredDropDownData.push({
							Text: dataOttype, Value: String(dt.ApprovalRequiredId)
						});
						this.approvalReqLength = this.approvalRequiredDropDownData.length;
					});
				}else{
					this.approvalRequiredDropDownData.push({
						Text: "", Value: String(dt.ApprovalRequiredId)
					});
					this.approvalReqLength = this.approvalRequiredDropDownData.length;
				}
			});
			this.cd.markForCheck();
		}

		this.intializedSectorData('all');
	}


	private getRoleAndUserData(wholeSetupApprovalData: ApproverType[]) {
		this.sectorIdSelected = [];
		const approverItem = wholeSetupApprovalData,
			approverData: ApproverType[] = [];
		approverItem.forEach((e: ApproverType) => {
			if (e.ApproverTypeId == Number(magicNumber.four) || e.ApproverTypeId == Number(magicNumber.five) ||
				e.ApproverTypeId == Number(magicNumber.six)) {
				approverData.push(e);
			}

		});
		approverData.forEach((Dt: ApproverType) => {
			if (Dt.ApproverTypeId == Number(magicNumber.four)) {
				this.dataWithLocalizationKey(Dt.
					RolesDetail);
				this.roleDropDownData = this.dropDownDataWithLocaKey;
			}
			if (Dt.ApproverTypeId == Number(magicNumber.five)) {
				this.dataWithLocalizationKey(Dt.UserTypes);
				this.userTypeDropDownData = this.dropDownDataWithLocaKey;
			}
		});

		this.approvalConfigUserObj = {
			"roles": this.roleDropDownData,
			"userType": this.userTypeDropDownData,
			"user": []
		};
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (this.approvalConfigUserObj && this.isEditMode) {
			this.bindDataToDynamicForm();
		}
	}

	private dataWithLocalizationKey(data: UserType[] | null) {
		this.dropDownDataWithLocaKey = [];
		data?.map((dt: UserType) => {
			let dataOttype = null;
			if (dt.Text != null) {
				this.translate.stream(dt.Text).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
					dataOttype = res;
					this.dropDownDataWithLocaKey.push({
						Text: dataOttype, Value: Number(dt.Value),
						TextLocalizedKey: dt.TextLocalizedKey?? '', IsSelected: dt.IsSelected ?? false
					});
				});
			}

		});
	}

	private getSectorIndex() {
		this.sectorKey = [];
		this.sectorData.forEach((sect: ApplicableInEntity) => {
			if (sect.IsSelected) {
				this.sectorKey.push(sect.Index);
			}
			if (this.sectorKey.length > Number(magicNumber.zero)) {
				this.AddEditApprovalConfigForm.get('IsAllSectorApplicable')?.setValue(false);
			}
		});
	}

	private bindDataToDynamicForm() {
		const getDataById = this.wholeDatabasedOnWorkFlow.ApprovalConfigurtion.LevelApprovers;
		this.patchValueOfApproval = getDataById;
		this.cd.markForCheck();
	}

	private getApplicableInData() {
		const sectorData = this.wholeDataOfApplicableInCasedOnWorkFlow.filter((e:ApplicableIn) => {
			return e.AccessToAllType === "Sector";
		});
		this.sectorData = sectorData[magicNumber.zero]?.ApplicableInEntities;
		sectorData[magicNumber.zero]?.ApplicableInEntities.map((dt: ApplicableInEntity) => {
			if (dt.IsSelected) {
				const index = this.accessToAllSectors.findIndex((a: AccessToAll) =>
					Number(dt.Value) == a.itemId);
				if (index < Number(magicNumber.zero)) {
					this.accessToAllSectors.push({
						id: magicNumber.zero,
						itemId: Number(dt.Value)
					});
				}
			}
		});

		this.locationData = filterDataBasedOnAccessToAllType(this.wholeDataOfApplicableInCasedOnWorkFlow, "Location");
		this.laborCategoriesData = filterDataBasedOnAccessToAllType(this.wholeDataOfApplicableInCasedOnWorkFlow, "LaborCategories");
		this.reasonforRequestData = filterDataBasedOnAccessToAllType(this.wholeDataOfApplicableInCasedOnWorkFlow, "ReasonForRequest");
		this.organizationLevelData = filterDataBasedOnAccessToAllType(this.wholeDataOfApplicableInCasedOnWorkFlow, "OrganizationLevel1");
		this.tempObjOfApplicableInData = {
			"location": this.locationData,
			"orgLevel": this.organizationLevelData,
			"reasonForRequest": this.reasonforRequestData,
			"labourCategories": this.laborCategoriesData,
			"sector": this.sectorData
		};

		if (!this.isEditMode) {
			this.commonSectorObj({
				selectedLabourData: this.tempObjOfApplicableInData.labourCategories,
				selectedLocation: this.tempObjOfApplicableInData.location,
				selectedReasonData: this.tempObjOfApplicableInData.reasonForRequest,
				selectedOrgData: this.tempObjOfApplicableInData.orgLevel
			});
		}

		if (this.isEditMode) {
			this.modifyDataBasedOnSelection();
			this.getSectorIndex();
		}
	}

	private intializedSectorData(type: string) {
		if (type == "all") {
			this.getApplicableInData();
		}
		if (this.isEditMode) {
			this.selectedApplicableInDataForEdit();
		}
	}

	private selectedApplicableInDataForEdit() {
		this.sectorIdSelected = [];
		const selectedLocation:ApplicableInEntity[] = [],
			selectedLabourData: ApplicableInEntity[] = [],
			selectedOrgData: ApplicableInEntity[] = [],
			selectedReasonData: ApplicableInEntity[] = [],
			selectedSector = this.sectorData.filter((e: ApplicableInEntity) =>
				e.IsSelected);
		this.selectedSectorForSpecificUser = selectedSector;
		this.getSpecificUserData(selectedSector);

		this.commonSelectedKey = [];
		this.locKey = [];
		this.labourKey = [];
		this.orgKey = [];
		this.reasonKey = [];

		if (selectedSector.length > Number(magicNumber.zero)) {
			selectedSector.forEach((e: ApplicableInEntity) => {
				this.subFnSelectedApplicableInDataLocation(selectedLocation, e);
				this.subFnSelectedApplicableInDataLabCat(selectedLabourData, e);
				this.subFnSelectedApplicableInDataReasonFrReq(selectedReasonData, e);
				this.subFnSelectedApplicableInDataOrgLvl(selectedOrgData, e);
			});
			this.commonSectorObj({
				selectedLabourData: selectedLabourData,
				selectedLocation: selectedLocation,
				selectedReasonData: selectedReasonData,
				selectedOrgData: selectedOrgData
			});
		}

		else {
			this.bindAllTheDataIndividually();
		}
	}
	actionPerformed = true;
	public getSpecificUserData(sectorData:ApplicableInEntity[]){
		this.sectorIdSelected = [];
		sectorData.forEach((dt:ApplicableInEntity) => {
			if(!this.sectorIdSelected.includes(Number(dt.Value))){
				this.sectorIdSelected.push(Number(dt.Value));
			}
		});
		this.approvalConfigGatewayServ.changeSpecificUserSector(this.sectorIdSelected, this.changeWorkFlowEntityId)
			.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((dt:ApiResponse) => {
				const obj ={
					"data": dt.Data,
					"status": false
				};
				this.approvalConfigGatewayServ.isSectorChanged.next(obj);

			});
	}

	private subFnSelectedApplicableInDataLocation(selectedLocation: ApplicableInEntity[], e: ApplicableInEntity) {
		if (this.tempObjOfApplicableInData.location.length > Number(magicNumber.zero)) {
			this.commonFunctionForApplicableforEdit(this.tempObjOfApplicableInData.location, e);
			if (this.selctedDataForEdit[magicNumber.zero]) {
				selectedLocation.push(this.selctedDataForEdit[magicNumber.zero]);
				selectedLocation = this.findIndexing(selectedLocation, magicNumber.one);
				this.modifiedLocData = selectedLocation;
				this.accessToAllLocation = [];
				manageAccessItems(selectedLocation, this.accessToAllLocation);
				this.locKey = this.commonSelectedKey;

			}
		}
	}

	private subFnSelectedApplicableInDataLabCat(selectedLabourData: ApplicableInEntity[], e:ApplicableInEntity) {
		if (this.tempObjOfApplicableInData.labourCategories.length > Number(magicNumber.zero)) {
			this.commonFunctionForApplicableforEdit(this.tempObjOfApplicableInData.
				labourCategories, e);
			if (this.selctedDataForEdit[magicNumber.zero]) {
				selectedLabourData.push(this.selctedDataForEdit[magicNumber.zero]);
				selectedLabourData = this.findIndexing(selectedLabourData, magicNumber.three);
				this.modifiedLabData = selectedLabourData;
				this.accessToAllLabCat = [];
				manageAccessItems(selectedLabourData, this.accessToAllLabCat);
				this.labourKey = this.commonSelectedKey;
				if (this.labourKey.length > Number(magicNumber.zero)) {
					this.AddEditApprovalConfigForm.get('IsAllLaborCategoryApplicable')?.setValue(false);
				}
			}
		}
	}

	private subFnSelectedApplicableInDataReasonFrReq(selectedReasonData: ApplicableInEntity[], e:ApplicableInEntity) {
		if (this.tempObjOfApplicableInData.reasonForRequest.length > Number(magicNumber.zero)) {
			this.commonFunctionForApplicableforEdit(this.tempObjOfApplicableInData.
				reasonForRequest, e);
			if (this.selctedDataForEdit[magicNumber.zero]) {
				selectedReasonData.push(this.selctedDataForEdit[magicNumber.zero]);
				selectedReasonData = this.findIndexing(selectedReasonData, magicNumber.four);
				this.modifiedReasData = selectedReasonData;
				this.accessToAllReasonReq = [];
				manageAccessItems(selectedReasonData, this.accessToAllReasonReq);
				this.reasonKey = this.commonSelectedKey;
				if (this.reasonKey.length > Number(magicNumber.zero)) {
					this.AddEditApprovalConfigForm.get('IsAllReasonForRequestApplicable')?.setValue(false);
				}
			}

		}
	}

	private subFnSelectedApplicableInDataOrgLvl(selectedOrgData: ApplicableInEntity[], e: ApplicableInEntity) {
		if (this.tempObjOfApplicableInData.orgLevel.length > Number(magicNumber.zero)) {
			this.commonFunctionForApplicableforEdit(this.tempObjOfApplicableInData.orgLevel, e);
			if (this.selctedDataForEdit[magicNumber.zero]) {
				selectedOrgData.push(this.selctedDataForEdit[magicNumber.zero]);
				selectedOrgData = this.findIndexing(selectedOrgData, magicNumber.two);
				this.modifiedOrgData = selectedOrgData;
				this.accessToAllOrgLvl1 = [];
				manageAccessItems(selectedOrgData, this.accessToAllOrgLvl1);
				this.orgKey = this.commonSelectedKey;
				if (this.orgKey.length > Number(magicNumber.zero)) {
					this.AddEditApprovalConfigForm.get('IsAllOrgLevel1Applicable')?.setValue(false);
				}
			}

		}
	}

	private bindAllTheDataIndividually() {
		const selectedLocation: ApplicableInEntity[] = [],
			selectedLabourData: ApplicableInEntity[] = [],
			selectedOrgData: ApplicableInEntity[] = [],
			selectedReasonData: ApplicableInEntity[] = [];
		this.commonSelectedKey = [];
		this.locKey = [];
		this.labourKey = [];
		this.orgKey = [];
		this.reasonKey = [];

		this.subFnBindLocLabCatData(selectedLocation, selectedLabourData);
		this.subFnBindOrgLvlReasonFrReqData(selectedReasonData, selectedOrgData);

		this.commonSectorObj({
			selectedLabourData: this.modifiedLabData,
			selectedLocation: this.modifiedLocData,
			selectedReasonData: this.modifiedReasData,
			selectedOrgData: this.modifiedOrgData
		});
	}

	private subFnBindLocLabCatData(selectedLocation: ApplicableInEntity[], selectedLabourData: ApplicableInEntity[]) {
		if (this.tempObjOfApplicableInData.location.length > Number(magicNumber.zero)) {
			selectedLocation = this.findIndexing(
				this.tempObjOfApplicableInData.location,
				magicNumber.one
			);
			this.locKey = this.commonSelectedKey;
			this.modifiedLocData = selectedLocation;
			this.accessToAllLocation = [];
			manageAccessItems(selectedLocation, this.accessToAllLocation);
		}
		if (this.tempObjOfApplicableInData.labourCategories.length > Number(magicNumber.zero)) {
			selectedLabourData = this.findIndexing(this.tempObjOfApplicableInData.
				labourCategories, magicNumber.three);
			this.labourKey = this.commonSelectedKey;
			this.modifiedLabData = selectedLabourData;
			this.accessToAllLabCat = [];
			manageAccessItems(selectedLabourData, this.accessToAllLabCat);
		}
	}

	private subFnBindOrgLvlReasonFrReqData(selectedReasonData: ApplicableInEntity[], selectedOrgData: ApplicableInEntity[]) {
		if (this.tempObjOfApplicableInData.reasonForRequest.length > Number(magicNumber.zero)) {
			selectedReasonData = this.findIndexing(this.tempObjOfApplicableInData.
				reasonForRequest, magicNumber.four);
			this.reasonKey = this.commonSelectedKey;
			this.modifiedReasData = selectedReasonData;
			this.accessToAllReasonReq = [];
			manageAccessItems(selectedReasonData, this.accessToAllReasonReq);
		}
		if (this.tempObjOfApplicableInData.orgLevel.length > Number(magicNumber.zero)) {
			selectedOrgData = this.findIndexing(
				this.tempObjOfApplicableInData.orgLevel,
				magicNumber.two
			);
			this.orgKey = this.commonSelectedKey;
			this.modifiedOrgData = selectedOrgData;
			this.accessToAllOrgLvl1 = [];
			manageAccessItems(selectedOrgData, this.accessToAllOrgLvl1);
		}
	}

	private findIndexing(data: ApplicableInEntity[], id: number) {
		this.commonSelectedKey = [];
		data.forEach((e: ApplicableInEntity, i: number) => {
			e.Index = i.toString();
			e.items?.forEach((d: AccessToAllItems, j: number) => {
				d.Index = `${i}_${j}`;
			});
		});

		this.processSelections(data, id);
		return data;
	}

	private processSelections(data:ApplicableInEntity[], id: number){
		data.forEach((d:ApplicableInEntity) => {
			if (d.IsSelected) {
				if (!this.commonSelectedKey.includes(d.Index)) {
					if (!checkedDuplicateSectorValue(this.storeKeyValue, d.Index)) {
						this.storeKeyValue.push({ "keyname": d.Value, "indexvalue": d.Index, "id": id });

					}

					this.commonSelectedKey.push(d.Index);
				}
			}
			d.items?.forEach((f: AccessToAllItems) => {
				if (f.IsSelected) {
					if (!checkedDuplicateSectorValue(this.storeKeyValue, f.Index)) {
						const parentId = f.parentId;
						this.storeKeyValue.push({
							"keyname": parentId ?? d.Value,
							"indexvalue": f.Index,
							"id": id
						  });

					}
					if (!this.commonSelectedKey.includes(f.Index)) {
						this.commonSelectedKey.push(f.Index);
					}
				}
			});
		});
	}

	private commonFunctionForApplicableforEdit(data: ApplicableInEntity[], item:ApplicableInEntity) {
		this.selctedDataForEdit = [];
		if (data.length > Number(magicNumber.zero)) {
			const value = data.filter((loc: ApplicableInEntity) => {
				return loc.Value === item.Value;
			});
			if (value[magicNumber.zero]) {
				this.selctedDataForEdit.push(value[magicNumber.zero]);
			}
		}
	}

	private getApprovalConfigId() {
		const sectorStatus = this.approvalConfigDetail.ApplicableIn[magicNumber.zero].IsAccessToAll,
			locationStatus = this.approvalConfigDetail.ApplicableIn[magicNumber.one].IsAccessToAll,
			laborCategoryStatus = this.approvalConfigDetail.ApplicableIn[magicNumber.two].IsAccessToAll,
			orgLevelStatus = this.approvalConfigDetail.ApplicableIn[magicNumber.three].IsAccessToAll,
			resonForRequestStatus = this.approvalConfigDetail.ApplicableIn[magicNumber.four].IsAccessToAll;

		this.isEditMode = true;
		this.eventLog.recordId.next(this.approvalConfigDetail.ApprovalConfigId);
		this.eventLog.entityId.next(this.entityId);
		this.recordStatus = this.approvalConfigDetail.Disabled ?
			'Inactive' :
			'Active';
		this.approvalConfigId = this.approvalConfigDetail.ApprovalConfigId;
		this.workFlowName = this.approvalConfigDetail.WorkFlowTypeName;
		this.workFlowName = (this.workFlowName === 'LIRequest') ?
			'LiRequest' :
			this.workFlowName;

		this.xrmEntityId = this.approvalConfigDetail.WorkFlowType;
		this.changeWorkFlowEntityId = this.approvalConfigDetail.WorkFlowType;
		this.approveralRequiredName = this.approvalConfigDetail.ApprovalRequired[0].
			ApprovalRequiredName;
		this.changeWorkFlowEntityId = this.approvalConfigDetail.WorkFlowType;
		this.AddEditApprovalConfigForm.patchValue({
			ApprovalProcessName: this.approvalConfigDetail.ApprovalProcessName,
			AprrovalReq: {
				Value: this.approvalConfigDetail.ApprovalRequired[0].ApprovalRequiredId
			},
			Comments: this.approvalConfigDetail.Comment,
			Workflow: {
				Value: String(this.approvalConfigDetail.WorkFlowType)
			},
			IsAllSectorApplicable: sectorStatus,
			IsAllLocationApplicable: locationStatus,
			IsAllOrgLevel1Applicable: orgLevelStatus,
			IsAllLaborCategoryApplicable: laborCategoryStatus,
			IsAllReasonForRequestApplicable: resonForRequestStatus
		});
		this.appRef.tick();

		this.statusForm.controls['status'].
			setValue({
				Text: this.recordStatus,
				Value: this.recordStatus
			});
		this.statusData.items = this.createDetailItems([
			{ key: 'ApprovalConfigId', value: String(this.recordId), cssClass: ['basic-title'] },
			{ key: 'Status', value: this.recordStatus, cssClass: this.approvalConfigDetail.Disabled
				? ['red-color']
				: ['green-color'] }
		]);
	}

	private createDetailItems(details: StatusCard[]) {
    	return details.map((detail: StatusCard) =>
    		({
    			title: detail.key,
    			titleDynamicParam: [],
    			item: detail.value,
    			itemDynamicParam: [],
    			cssClass: detail.cssClass ?? [],
    			isLinkable: false,
    			link: '',
    			linkParams: ''
    		}));
	}

	public submitForm() {
		try {
			this.AddEditApprovalConfigForm.markAllAsTouched();
			this.approvalConfigGatewayServ.isSubmitForm.next(true);
			if (this.approvalRequiredDropDownData.length > Number(magicNumber.one)) {
				this.AddEditApprovalConfigForm.controls['AprrovalReq'].setValidators([this.customValidators.RequiredValidator('PleaseSelectValueApprovaRequired')]);
				this.AddEditApprovalConfigForm.controls['AprrovalReq'].updateValueAndValidity();
			} else {
				this.AddEditApprovalConfigForm.controls['AprrovalReq'].clearValidators();
				this.AddEditApprovalConfigForm.controls['AprrovalReq'].updateValueAndValidity();
			}
			this.validateAndSaveFormData();

		} catch (error) {
			console.log("error", error);
		}

	}

	private validateAndSaveFormData(){
		const isSector = this.AddEditApprovalConfigForm.controls['IsAllSectorApplicable'].value,
			isLocation = this.AddEditApprovalConfigForm.controls['IsAllLocationApplicable'].value,
			isLaborCategory = this.AddEditApprovalConfigForm.controls['IsAllLaborCategoryApplicable'].value,
			isOrgLevel1 = this.AddEditApprovalConfigForm.controls['IsAllOrgLevel1Applicable'].value,
			isReaonFrRequest = this.AddEditApprovalConfigForm.controls['IsAllReasonForRequestApplicable'].value,
			counts = this.countSelectedItemsInAllCategories();
		if (this.accessToAllSectors.length == Number(magicNumber.zero) && !isSector) {
			this.toasterServc.showToaster(ToastOptions.Error, "PleaseSelectOneSector");
		}

		else if (
			(!this.validateConditionsForSelection(this.locationData) && !isLocation) ||
			(!this.validateConditionsForSelection(this.organizationLevelData) && !isOrgLevel1) ||
			(!this.validateConditionsForSelection(this.laborCategoriesData) && !isLaborCategory) ||
			(!this.validateConditionsForSelection(this.reasonforRequestData) && !isReaonFrRequest)) {

			this.toasterServc.showToaster(ToastOptions.Error, "PleaseSelectAtleastOneLocationLabourCategoryOrg1ReasonForReasonSelectedSector");
		}
		else if ((!isLocation && counts.sector1 !== counts.location1)
			|| (!isLaborCategory && counts.sector1 !== counts.labor1)
			|| (!isOrgLevel1 && counts.sector1 !== counts.Organization1)
			|| (!isReaonFrRequest && counts.sector1 !== counts.ReasonforReq1)) {
			this.toasterServc.showToaster(ToastOptions.Error, "SectorDataDidNotMatchForTheSelectedLocationLabourCategoryorg1ReasonForReason");
		}

		else if (this.AddEditApprovalConfigForm.valid && this.setupApprovalConfigForm.valid) {
			this.save();

		}

	}

	private removeDuplicates(arr: ApplicableInEntity[], prop: keyof ApplicableInEntity) {
		return arr.filter((obj, index, self) =>
			index === self.findIndex((el) =>
				el[prop] === obj[prop]));
	}

	private countSelectedItems(data : ApplicableInEntity[], callback: (child: AccessToAllItems) => boolean) {
		let count = magicNumber.zero;
		data.forEach((parent: ApplicableInEntity) => {
			if (parent.AccessToAllItems?.some((child: AccessToAllItems) =>
				callback(child))) {
			  count++;
			}
		});
		return count;
	}

	private countSelectedItemsInAllCategories() {
		let sector1: number = magicNumber.zero,
			location1: number = magicNumber.zero,
			labor1: number = magicNumber.zero,
			Organization1: number = magicNumber.zero,
			ReasonforReq1: number = magicNumber.zero;
		this.locationData = this.removeDuplicates(this.locationData, 'Value');
		location1 = this.countSelectedItems(this.locationData, (child:AccessToAllItems) =>
			child.IsSelected);

		this.laborCategoriesData = this.removeDuplicates(this.laborCategoriesData, 'Value');
		labor1 = this.countSelectedItems(this.laborCategoriesData, (child:AccessToAllItems) =>
		 child.IsSelected);

		this.organizationLevelData = this.removeDuplicates(this.organizationLevelData, 'Value');
		Organization1 = this.countSelectedItems(this.organizationLevelData, (child:AccessToAllItems) =>
		 child.IsSelected);

		this.reasonforRequestData = this.removeDuplicates(this.reasonforRequestData, 'Value');
		ReasonforReq1 = this.countSelectedItems(this.reasonforRequestData, (child:AccessToAllItems) =>
		 child.IsSelected);

		const sectorValue = this.AddEditApprovalConfigForm.get('IsAllSectorApplicable')?.value;

		this.sectorData.forEach((parent: ApplicableInEntity) => {
			if (sectorValue
				? !parent.IsSelected
				: parent.IsSelected) {
				sector1++;
			}
		});
		return {
			sector1,
			location1,
			labor1,
			Organization1,
			ReasonforReq1
		};
	}

	private validateConditionsForSelection(conditions: ApplicableInEntity[]): boolean {
		for (const data of conditions) {
			const hasSelectedChild = data.AccessToAllItems?.some((accessItem: AccessToAllItems) =>
				accessItem.IsSelected);

			if (!hasSelectedChild) {
				return false;
			}
		}
		return true;

	}


	private save() {
		const mergeFormData = {
				...this.AddEditApprovalConfigForm.value,
				...bindingJSON(this.setupApprovalConfigFormValue)
			},

			approvalData: DataModel = new DataModel(mergeFormData);
		    this.approvalModalData(approvalData);
		if (this.approvalRequiredDropDownData.length > Number(magicNumber.one)) {
			approvalData.ApprovalRequiredId = Number(this.AddEditApprovalConfigForm.controls['AprrovalReq'].value.Value);
		}
		else {
			approvalData.ApprovalRequiredId = Number(this.approvalRequiredDropDownData[0]?.Value);
		}
		this.AddEditApprovalConfigForm.controls['AprrovalReq'].updateValueAndValidity();
		delete approvalData.AprrovalReq;
		delete approvalData.Workflow;
		if (this.isEditMode) {
			this.saveEditMode(approvalData);
		} else this.saveAddMode(approvalData);


	}

	private checkChildData(data: ApplicableInEntity[]): AccessToAll[] {
		const processedData: AccessToAll[] = data
		  .flatMap((dt: ApplicableInEntity) => {
				if (!dt.AccessToAllItems) return [];
				return dt.AccessToAllItems
			  .filter((item: AccessToAllItems) =>
						item.IsSelected)
			  .map((selectedItem: AccessToAllItems) =>
						({
							id: magicNumber.zero,
							itemId: Number(selectedItem.Value)
			  }));
		  });

		return processedData;
	  }

	private approvalModalData(approvalData: DataModel) {
		approvalData.ReasonForChange = '';
		approvalData.WorkFlowType = Number(this.AddEditApprovalConfigForm.controls['Workflow'].value.Value);
		approvalData.Sectors = this.accessToAllSectors;

		if (this.isEditMode) {
			this.updateApprovalDataForEditMode(approvalData);
		} else {
			approvalData.Location = this.checkChildData(this.locationData);
			approvalData.OrgLevel1 = this.checkChildData(this.organizationLevelData);
			approvalData.LaborCategories = this.checkChildData(this.laborCategoriesData);
			approvalData.ReasonForRequest = this.checkChildData(this.reasonforRequestData);

		}

		if (this.AddEditApprovalConfigForm.get('IsAllLocationApplicable')?.value) approvalData.Location = [];
		if (this.AddEditApprovalConfigForm.get('IsAllOrgLevel1Applicable')?.value) approvalData.OrgLevel1 = [];
		if (this.AddEditApprovalConfigForm.get('IsAllLaborCategoryApplicable')?.value) approvalData.LaborCategories = [];
		if (this.AddEditApprovalConfigForm.get('IsAllReasonForRequestApplicable')?.value) approvalData.ReasonForRequest = [];
		if (this.AddEditApprovalConfigForm.get('IsAllSectorApplicable')?.value) approvalData.Sectors = [];

	}

	private updateApprovalDataForEditMode(approvalData: DataModel){
		if (this.accessToAllLocation.length === Number(magicNumber.zero)) {
			this.accessToAllLocation = [];
			approvalData.Location = manageAccessItems(this.modifiedLocData, this.accessToAllLocation);

		} else {
			approvalData.Location = this.checkChildData(this.locationData);

		}
		if (this.accessToAllOrgLvl1.length === Number(magicNumber.zero)) {
			this.accessToAllOrgLvl1 = [];
			approvalData.OrgLevel1 = manageAccessItems(this.modifiedOrgData, this.accessToAllOrgLvl1);
		} else {
			approvalData.OrgLevel1 = this.checkChildData(this.organizationLevelData);
		}
		if (this.accessToAllLabCat.length === Number(magicNumber.zero)) {
			this.accessToAllLabCat = [];
			approvalData.LaborCategories = manageAccessItems(this.modifiedLabData, this.accessToAllLabCat);
		} else {
			approvalData.LaborCategories = this.checkChildData(this.laborCategoriesData);
		}
		if (this.accessToAllReasonReq.length === Number(magicNumber.zero)) {
			this.accessToAllReasonReq = [];
			approvalData.ReasonForRequest = manageAccessItems(this.modifiedReasData, this.accessToAllReasonReq);
		} else {
			approvalData.ReasonForRequest = this.checkChildData(this.reasonforRequestData);
		}
	}

	// eslint-disable-next-line max-lines-per-function
	private saveEditMode(approvalData: DataModel) {
		this.loaderService.setState(true);
		approvalData.UKey = this.ukey;
		approvalData.approvalConfigUkey = this.ukey;
		this.approvalConfigGatewayServ.updateApprovalConfiguration(approvalData).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe({
				next: (data: GenericResponseBase<IDataItemResponse>) => {
					this.toasterServc.resetToaster();
					this.eventLog.isUpdated.next(true);
					if (isSuccessfulResponse(data)) {
						this.secKeyClicked = false;
						this.approvalConfigGatewayServ.approverLevelRemoved.next(false);
						if(data.Data.Ukey){
							this.itemTypeUKey = data.Data.Ukey;
							this.ukey = data.Data.Ukey;
						}
						if(data.Data.UKey){
							this.itemTypeUKey = data.Data.UKey;
							this.ukey = data.Data.UKey;
						}
						this.route.navigate([`${NavigationPaths.addEdit}/${this.ukey}`]);
						this.approvalConfigGatewayServ.isDataSaved.next(true);
						this.getSpecificUserData(this.selectedSectorForSpecificUser);
						this.actionPerformed = true;
						this.getIdFromRoute();
						this.cd.detectChanges();
						this.loaderService.setState(false);
						setTimeout(() => {
							this.toasterServc.showToaster(ToastOptions.Success, "ApprovalConfigurationAddedSuccessfully");
						});
						this.statusError = false;
						this.AddEditApprovalConfigForm.markAsPristine();
						this.setupApprovalConfigForm.markAsPristine();

					}
					else {
						this.loaderService.setState(false);
						if(data.Data?.Ukey){
							this.itemTypeUKey = data.Data.Ukey;
							this.ukey = data.Data.Ukey;
							this.existingUkey = data.Data.UKey;
						}
						if(data.Data?.UKey){
							this.itemTypeUKey = data.Data.UKey;
							this.existingUkey = data.Data.UKey;
							this.ukey = data.Data.UKey;
						}
						if (data.StatusCode === Number(HttpStatusCode.Conflict) && data.Data) {
							this.toasterServc.showToaster(
								ToastOptions.Error, data.Message, [],
								false, true, data.Data.ApprovalProcessName
							);
						}
						else this.toasterServc.showToaster(ToastOptions.Error, data.Message);
					}
				}
			});
	}


	private saveAddMode(approvalData: DataModel) {
		this.loaderService.setState(true);
		this.approvalConfigGatewayServ.addApprovalConfiguration(approvalData).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe({
				next: (data: GenericResponseBase<IDataItem>) => {
					if (isSuccessfulResponse(data)) {
						this.conflictData = false;
						this.toasterServc.resetToaster();
						this.loaderService.setState(false);
						this.route.navigate([NavigationPaths.list]);
						setTimeout(() => {
							this.toasterServc.showToaster(ToastOptions.Success, "ApprovalConfigurationAddedSuccessfully");
						});
					}
					else {
						this.toasterServc.resetToaster();
						this.loaderService.setState(false);
						this.existingUkey = String(data.Data?.UKey);

						if (data.StatusCode === Number(HttpStatusCode.Conflict) && data.Data) {
							this.conflictData = true;
							this.toasterServc.showToaster(
								ToastOptions.Error, data.Message, [],
								false, true, data.Data.ApprovalProcessName
							);
						} else {
							this.conflictData = true;
							this.toasterServc.showToaster(ToastOptions.Error, data.Message);
						}
					}
				}
			});
	}

	private commonSectorObj(options: {
		selectedLabourData: ApplicableInEntity[],
		selectedLocation: ApplicableInEntity[],
		selectedReasonData: ApplicableInEntity[],
		selectedOrgData: ApplicableInEntity[]
	}) {
		const { selectedLabourData,
			selectedLocation, selectedReasonData, selectedOrgData } = options;

		this.sectorWiseObj = {
			"labourObj": {
				data: selectedLabourData,
				checkedKey: this.labourKey
			},
			"locationObj": {
				data: selectedLocation,
				checkedKey: this.locKey
			},
			"reasonForReqObj": {
				data: selectedReasonData,
				checkedKey: this.reasonKey
			},
			"orgLevelObj": {
				data: selectedOrgData,
				checkedKey: this.orgKey
			}
		};

		if (this.isEditMode) {
			if (this.locKey.length > Number(magicNumber.zero) &&
				selectedLocation.length > Number(magicNumber.zero)) {
				this.AddEditApprovalConfigForm.get('IsAllLocationApplicable')?.setValue(false);
				this.appRef.tick();
			}
			if (this.labourKey.length > Number(magicNumber.zero) &&
				selectedLabourData.length > Number(magicNumber.zero)) {
				this.AddEditApprovalConfigForm.get('IsAllLaborCategoryApplicable')?.setValue(false);
				this.appRef.tick();
			}
			if (this.orgKey.length > Number(magicNumber.zero) &&
				selectedOrgData.length > Number(magicNumber.zero)) {
				this.AddEditApprovalConfigForm.get('IsAllOrgLevel1Applicable')?.setValue(false);
				this.appRef.tick();
			}
			if (this.reasonKey.length > Number(magicNumber.zero) &&
				selectedReasonData.length > Number(magicNumber.zero)) {
				this.AddEditApprovalConfigForm.get('IsAllReasonForRequestApplicable')?.setValue(false);
				this.appRef.tick();
			}

		}
	}

	public navigate() {
		this.route.navigate([NavigationPaths.list]);
	}

	private setIsSelectedFalse(data: ApplicableInEntity[]) {
		data = data.map((dt: ApplicableInEntity) => {
			dt.AccessToAllItems?.map((setData: AccessToAllItems) => {
				setData.IsSelected = false;
			});
			return dt;
		});
		return data;
	}

	private setAllDataReset() {
		this.setIsSelectedFalse(this.locationData);
		this.setIsSelectedFalse(this.organizationLevelData);
		this.setIsSelectedFalse(this.laborCategoriesData);
		this.setIsSelectedFalse(this.reasonforRequestData);
		this.accessToAllLocation = [];
		this.locKey = [];
		this.accessToAllOrgLvl1 = [];
		this.orgKey = [];
		this.accessToAllLabCat = [];
		this.labourKey = [];
		this.accessToAllReasonReq = [];
		this.reasonKey = [];
		this.updateDataEdit(this.tempObjOfApplicableInData.location);
		this.updateDataEdit(this.tempObjOfApplicableInData.orgLevel);
		this.updateDataEdit(this.tempObjOfApplicableInData.labourCategories);
		this.updateDataEdit(this.tempObjOfApplicableInData.reasonForRequest);
		this.AddEditApprovalConfigForm.controls['IsAllLocationApplicable'].setValue(true);
		this.AddEditApprovalConfigForm.controls['IsAllOrgLevel1Applicable'].setValue(true);
		this.AddEditApprovalConfigForm.controls['IsAllLaborCategoryApplicable'].setValue(true);
		this.AddEditApprovalConfigForm.controls['IsAllReasonForRequestApplicable'].setValue(true);
	}

	private isAllOtherThanSector() {
		const isLocation = this.AddEditApprovalConfigForm.controls['IsAllLocationApplicable'].value,
			isLaborCategory = this.AddEditApprovalConfigForm.controls['IsAllLaborCategoryApplicable'].value,
			isOrgLevel1 = this.AddEditApprovalConfigForm.controls['IsAllOrgLevel1Applicable'].value,
			isReaonFrRequest = this.AddEditApprovalConfigForm.controls['IsAllReasonForRequestApplicable'].value;
		if ((isLocation && isLaborCategory && isOrgLevel1 && isReaonFrRequest)) {
			return true;
		} else {
			return false;
		}
	}


	private resetApplicableInData(type: number, data: boolean) {
		if (type == Number(magicNumber.one) && data) {
			this.resetApplicableIn();
			this.selectedApplicableDataForEditWhenAlldata();
		}
	}

	public onChangeSwitch(data: boolean, type?: number) {
		this.dialogPopupService.resetDialogButton();
		this.selectedSectorUnsub$?.unsubscribe();
		const switchToAll = this.AddEditApprovalConfigForm.get('IsAllSectorApplicable')?.value;
		if(data && type == magicNumber.one){
			this.sectorIdSelected = [];
			this.approvalConfigGatewayServ.changeSpecificUserSector (this.sectorIdSelected, this.changeWorkFlowEntityId)
				.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((dt:ApiResponse) => {
					const obj ={
						"data": dt.Data,
						"status": false
					};
					this.approvalConfigGatewayServ.isSectorChanged.next(obj);
				});
		}
		if (type == magicNumber.one && !this.isAllOtherThanSector()) {

			this.AddEditApprovalConfigForm.controls['IsAllSectorApplicable'].setValue(!switchToAll);
			this.dialogPopupService.showConfirmation('SwitchingSectorChngesApplicabliIn', PopupDialogButtons.PageNavigation);

			this.handleSectorSwitchConfirmation(switchToAll, type, data);

		} else if (type == magicNumber.one && this.isAllOtherThanSector()) {
			this.selectedApplicableDataForEditWhenAlldata();
		}
		if (type == magicNumber.two && data) {
			this.accessToAllLocation = [];
			this.AddEditApprovalConfigForm.controls['IsAllLocationApplicable'].setValue(true);
			this.locKey = [];
			this.updateDataEdit(this.tempObjOfApplicableInData.location);
		}
		if (type == Number(magicNumber.three) && data) {
			this.accessToAllOrgLvl1 = [];
			this.AddEditApprovalConfigForm.controls['IsAllOrgLevel1Applicable'].setValue(true);
			this.orgKey = [];
			this.updateDataEdit(this.tempObjOfApplicableInData.orgLevel);
		}
		if (type == magicNumber.four && data) {
			this.accessToAllLabCat = [];
			this.AddEditApprovalConfigForm.controls['IsAllLaborCategoryApplicable'].setValue(true);
			this.labourKey = [];
			this.updateDataEdit(this.tempObjOfApplicableInData.labourCategories);
		}
		if (type == magicNumber.five && data) {
			this.accessToAllReasonReq = [];
			this.AddEditApprovalConfigForm.controls['IsAllReasonForRequestApplicable'].setValue(true);
			this.reasonKey = [];
			this.updateDataEdit(this.tempObjOfApplicableInData.reasonForRequest);
		}

		this.cd.detectChanges();
	}

	private handleSectorSwitchConfirmation(switchToAll:string, type:number, data:boolean){
		this.selectedSectorUnsub$ = this.dialogPopupService.dialogButtonObs.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((button) => {
			if (button.value == magicNumber.eighteen) {

				this.AddEditApprovalConfigForm.controls['IsAllSectorApplicable'].setValue(switchToAll);
				if ((switchToAll && type == Number(magicNumber.one)) || (!switchToAll && type == Number(magicNumber.one))) {
					this.setAllDataReset();
				}
				this.resetApplicableInData(magicNumber.one, data);
				this.dialogPopupService.resetDialogButton();
			} else if (button.value == magicNumber.nineteen) {
				this.dialogPopupService.resetDialogButton();
				return;
			}

		});
	}

	private updateDataEdit(dataType: ApplicableInEntity[]) {
		dataType.map((dt: ApplicableInEntity) => {
			dt.IsSelected = false;
			dt.AccessToAllItems?.map((data: AccessToAllItems) => {
				data.IsSelected = false;
			});
			return dt;
		});
	}

	private selectedApplicableDataForEditWhenAlldata() {
		this.sectorData = allDataUpdatedAsFalseForApplicableIn(this.sectorData);
		const selectedLabour = allDataUpdatedAsFalseForApplicableIn(this.
				tempObjOfApplicableInData.labourCategories),
			selectedLocation = allDataUpdatedAsFalseForApplicableIn(this.
				tempObjOfApplicableInData.location),
			selectedReason = allDataUpdatedAsFalseForApplicableIn(this.
				tempObjOfApplicableInData.reasonForRequest),
			selectedOrg = allDataUpdatedAsFalseForApplicableIn(this.
				tempObjOfApplicableInData.orgLevel);
		this.commonSectorObj({
			selectedLabourData: selectedLabour,
			selectedLocation: selectedLocation,
			selectedReasonData: selectedReason,
			selectedOrgData: selectedOrg
		});
	}

	private commonFn(data: Structure[]) {
		data.map((dt: Structure) => {
			const index = this.accessToAllSectors.findIndex((dtInd: AccessToAll) =>
				Number(dt.item.dataItem.Value) == dtInd.itemId);
			if (index < Number(magicNumber.zero) && dt.item.dataItem.IsSelected) {
				this.accessToAllSectors.push({
					id: magicNumber.zero,
					itemId: Number(dt.item.dataItem.Value)
				});
			}
			else{
				const index1 = this.accessToAllSectors.findIndex((dtInd: AccessToAll) =>
					Number(dt.item.dataItem.Value) == dtInd.itemId);
				if (index1 >= Number(magicNumber.zero) && !dt.item.dataItem.IsSelected) {
					this.accessToAllSectors.splice(index, magicNumber.one);
				}
			}
		});
		if (this.isEditMode) {
			this.sectorData.map((secDt: ApplicableInEntity) => {
				const index = this.accessToAllSectors.findIndex((dtInd: AccessToAll) =>
					Number(secDt.Value) == dtInd.itemId);
				if (index < Number(magicNumber.zero) && secDt.IsSelected) {
					this.accessToAllSectors.push({
						id: magicNumber.zero,
						itemId: Number(secDt.Value)
					});
				}
			});
		}

	}

	private ApplicableInData() {
		this.tempObjOfApplicableInData.location = [
			...new Map(this.tempObjOfApplicableInData.location.map((item: ApplicableInEntity) =>
				[item.Value, item])).values()
		];

		this.tempObjOfApplicableInData.orgLevel = [
			...new Map(this.tempObjOfApplicableInData.orgLevel.map((item: ApplicableInEntity) =>
				[item.Value, item])).values()
		];

		this.tempObjOfApplicableInData.labourCategories = [
			...new Map(this.tempObjOfApplicableInData.labourCategories.map((item: ApplicableInEntity) =>
				[item.Value, item])).values()
		];

		this.tempObjOfApplicableInData.reasonForRequest = [
			...new Map(this.tempObjOfApplicableInData.reasonForRequest.map((item: ApplicableInEntity) =>
				[item.Value, item])).values()
		];
	}

	public handleSpecificUserData(){
		let actionPerformed = true;
		this.sectorIdSelected = [];
		this.accessToAllSectors.forEach((dt:AccessToAll) => {
			if(!this.sectorIdSelected.includes(dt.itemId)){
				this.sectorIdSelected.push(dt.itemId);
			}
		});

		this.approvalConfigGatewayServ.changeSpecificUserSector(this.sectorIdSelected, this.changeWorkFlowEntityId).
			pipe(takeUntil(this.ngUnsubscribe$)).subscribe((dt:ApiResponse) => {
				actionPerformed = false;
				const obj ={
					"data": dt.Data,
					"status": true
				};
				this.approvalConfigGatewayServ.isSectorChanged.next(obj);
			});

	}

	public onTreeChecked(data: Structure[]) {
		this.expandedKeys = [""];
		this.secKeyClicked = true;
		this.filterDataFromSecKey(data);
		this.commonFn(data);
		this.handleSpecificUserData();
		this.ApplicableInData();

		const uncheckedData = data.filter((e: Structure) =>
				!e.item.dataItem.IsSelected),
		 checked = data.filter((e: Structure) =>
				e.item.dataItem.IsSelected);
		checked.sort((a: Structure, b: Structure) => {
			const textA = a.item.dataItem.Text.toLowerCase(),
				textB = b.item.dataItem.Text.toLowerCase();
			return textA.localeCompare(textB);
		});
		if (uncheckedData.length > Number(magicNumber.zero)) {
			this.afterUncheckedKeyChange(uncheckedData);
		}

		if (checked.length > Number(magicNumber.zero)) {
			this.forSpecificData(checked);
		}

		else {
			this.forAllDataReload();
		}
	}

	private filterDataFromSecKey(data: Structure[]) {
		data.forEach((a: Structure) => {
			if (!a.checked) {
				const index = this.sectorKey.findIndex((c) =>
					c == a.item.index);
				this.sectorKey.splice(index, magicNumber.one);
			}
		});
	}

	private geWorkFlowData() {
		this.approvalConfigGatewayServ.getWorkFlowData().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: ApiResponse) => {
			if (res.StatusCode == HttpStatusCode.Ok) {
				this.approvalEntityList = res.Data;
			}
		});
	}

	private filterApplicableData = (propertyIndex: number) => {
		const propertyData = this.approvalConfigDetail.ApplicableIn[propertyIndex].ApplicableInEntities;

		return propertyData.filter((dt: ApplicableInEntity) => {
			if (dt.IsSelected || dt.AccessToAllItems?.some((child: AccessToAllItems) =>
				child.IsSelected)) {
				return true;
			}
			return false;
		});
	};

	private modifyDataBasedOnSelection() {
		this.locationData = this.filterApplicableData(magicNumber.one);
		this.laborCategoriesData = this.filterApplicableData(magicNumber.two);
		this.organizationLevelData = this.filterApplicableData(magicNumber.three);
		this.reasonforRequestData = this.filterApplicableData(magicNumber.four);

	}

	private checkIndexNext(data: ApplicableInEntity[], value: string, index: number) {
		let indexExist = false;
		const labLengthValue = data.length;
		for (let i = (index + magicNumber.one); i < labLengthValue; i++) {
			if (value == (data[i]?.Index ?? -magicNumber.one)) {
				indexExist = true;
			}
		}
		return indexExist;
	}

	public onCategoryChecked(data: SelectionStructure, id: number) {
		this.secKeyClicked = true;
		if (id == Number(magicNumber.one)) {
			this.accessToAllLocation = [];
			this.subOnCategoryChecked(this.tempObjOfApplicableInData.location, this.accessToAllLocation, data, id);
		}
		if (id == Number(magicNumber.two)) {
			this.accessToAllOrgLvl1 = [];
			this.subOnCategoryChecked(this.tempObjOfApplicableInData.orgLevel, this.accessToAllOrgLvl1, data, id);
		}
		if (id == Number(magicNumber.three)) {
			this.accessToAllLabCat = [];
			this.subOnCategoryChecked(this.tempObjOfApplicableInData.labourCategories, this.accessToAllLabCat, data, id);
		}
		if (id == Number(magicNumber.four)) {
			this.accessToAllReasonReq = [];
			this.subOnCategoryChecked(this.tempObjOfApplicableInData.reasonForRequest, this.accessToAllReasonReq, data, id);
		}
	}

	// eslint-disable-next-line max-params
	private subOnCategoryChecked(data: ApplicableInEntity[], access: AccessToAll[], checkedData: SelectionStructure, id: number) {

		data = data.map((val: ApplicableInEntity, index: number) => {
			if (this.checkIndexNext(data, val.Index, index)) {
				val.Index = String(magicNumber.minusOne);
			}
			return val;
		});

		this.locationData = this.removeDuplicates(this.locationData, 'Value');
		this.organizationLevelData = this.removeDuplicates(this.organizationLevelData, 'Value');
		this.laborCategoriesData = this.removeDuplicates(this.laborCategoriesData, 'Value');
		this.reasonforRequestData = this.removeDuplicates(this.reasonforRequestData, 'Value');

		data.map((val: ApplicableInEntity) => {
			val.AccessToAllItems?.map((value: AccessToAllItems) => {

				const parentIndex = value.Index.split('_'),
					indexValue = checkedData.checkedKey.findIndex((newValue) =>
						newValue == value.Index) > -magicNumber.one;
				value.IsSelected = false;


				if (indexValue && (parentIndex[magicNumber.zero] == val.Index)) {
					value.IsSelected = indexValue;
					access.push({ id: magicNumber.zero, itemId: Number(value.Value) });
					if(id == Number(magicNumber.one)) this.locationData.push(val);
					if(id == Number(magicNumber.two)) this.organizationLevelData.push(val);
					if(id == Number(magicNumber.three)) this.laborCategoriesData.push(val);
					if(id == Number(magicNumber.four)) this.reasonforRequestData.push(val);

				}
			});
		});
	}

	private forSpecificData(specificdata: Structure[]) {
		if (!this.isEditMode) {
			this.locationData = [];
			this.reasonforRequestData = [];
			this.organizationLevelData = [];
			this.laborCategoriesData = [];
		}

		if (specificdata.length > Number(magicNumber.zero)) {
			specificdata.forEach((specValue: Structure) => {
				this.findSelectedDataForCategory(specValue);

				if (this.isEditMode) {
					this.selectedApplicableInDataForEdit();
				}
				else {
					this.commonSectorObj({
						selectedLabourData: this.laborCategoriesData,
						selectedLocation: this.locationData,
						selectedReasonData: this.reasonforRequestData,
						selectedOrgData: this.organizationLevelData
					});
				}
			});
		}
	}

	private findSelectedDataForCategory(specValue: Structure){
		if (this.tempObjOfApplicableInData.location.length> Number(magicNumber.zero)) {
			this.commonFunForFindingSelctedData(this.
				tempObjOfApplicableInData.location, specValue, magicNumber.one);

		}
		if (this.tempObjOfApplicableInData.orgLevel.length> Number(magicNumber.zero)) {
			this.commonFunForFindingSelctedData(this.
				tempObjOfApplicableInData.orgLevel, specValue, magicNumber.two);
		}
		if (this.tempObjOfApplicableInData.reasonForRequest.length> Number(magicNumber.zero)) {
			this.commonFunForFindingSelctedData(this.
				tempObjOfApplicableInData.reasonForRequest, specValue, magicNumber.three);

		}
		if (this.tempObjOfApplicableInData.labourCategories.length> Number(magicNumber.zero)) {
			this.commonFunForFindingSelctedData(this.
				tempObjOfApplicableInData.labourCategories, specValue, magicNumber.four);
		}
	}

	private commonFunForFindingSelctedData(data: ApplicableInEntity[], specValue: Structure, id: number) {
		const specificData = data.find((a: ApplicableInEntity) => {
			return a.Value === specValue.item.dataItem.Value;
		});

		if (id == Number(magicNumber.one) && specificData) {
			this.subFnSelectedDataCommonFn(specificData, this.locationData);
			this.locKey = this.commonSelectedKey;
		}
		if (id == Number(magicNumber.two) && specificData) {
			this.subFnSelectedDataCommonFn(specificData, this.organizationLevelData);
			this.orgKey = this.commonSelectedKey;
		}
		if (id == Number(magicNumber.three) && specificData) {
			this.subFnSelectedDataCommonFn(specificData, this.reasonforRequestData);
			this.reasonKey = this.commonSelectedKey;
		}
		if (id == Number(magicNumber.four) && specificData) {
			this.subFnSelectedDataCommonFn(specificData, this.laborCategoriesData);
			this.labourKey = this.commonSelectedKey;
		}
	}

	private subFnSelectedDataCommonFn(specificData: ApplicableInEntity, data: ApplicableInEntity[]) {
		data.push(specificData);
		this.findIndexing(data, magicNumber.one);
	}

	private forAllDataReload() {
		this.intializedSectorData("all");
	}

	private handleChilEntityForUncheck(uncheck: Structure) {
		this.locationData = this.locationData.filter((dt: ApplicableInEntity) =>
			dt.Value != uncheck.item.dataItem.Value);
		this.organizationLevelData = this.organizationLevelData.filter((dt: ApplicableInEntity) =>
			dt.Value != uncheck.item.dataItem.Value);
		this.laborCategoriesData = this.laborCategoriesData.filter((dt: ApplicableInEntity) =>
			dt.Value != uncheck.item.dataItem.Value);
		this.reasonforRequestData = this.reasonforRequestData.filter((dt: ApplicableInEntity) =>
			dt.Value != uncheck.item.dataItem.Value);
	}

	private afterUncheckedKeyChange(uncheckedData: Structure[]) {
		try {
			const afterUncheckedDataOfsector = this.storeKeyValue.filter((el: StoreKey) => {
				return !uncheckedData.find((els: Structure) => {
					return els.item.dataItem.Value === el.keyname;
				});
			});
			this.storeKeyValue = [];
			this.locKey = [];
			this.orgKey = [];
			this.labourKey = [];
			this.reasonKey = [];
			this.storeKeyValue = afterUncheckedDataOfsector;

			uncheckedData.forEach((uncheck: Structure) => {
				this.handleChilEntityForUncheck(uncheck);

				this.updateApplicableInDataForUncheck(uncheck);
			});
			if (this.isEditMode) {
				this.selectedApplicableInDataForEdit();
			}

			if (afterUncheckedDataOfsector.length > Number(magicNumber.zero)) {
				afterUncheckedDataOfsector.forEach((checkedData) => {
					this.handleCheckedDataKeys(checkedData);
				});
			}
		} catch (error) {
			console.log("error", error);
		}
	}

	private updateApplicableInDataForUncheck(uncheck: Structure){
		if (this.tempObjOfApplicableInData.location.length > Number(magicNumber.zero)) {

			this.tempObjOfApplicableInData.location = updatedApplicableIn(this.
				tempObjOfApplicableInData.location, uncheck.item.dataItem.Value);

		}
		if (this.tempObjOfApplicableInData.labourCategories.length > Number(magicNumber.zero)) {
			this.tempObjOfApplicableInData.labourCategories = updatedApplicableIn(this.
				tempObjOfApplicableInData.labourCategories, uncheck.item.dataItem.Value);
		}
		if (this.tempObjOfApplicableInData.orgLevel.length	> Number(magicNumber.zero)) {
			this.tempObjOfApplicableInData.orgLevel = updatedApplicableIn(this.
				tempObjOfApplicableInData.orgLevel, uncheck.item.dataItem.Value);
		}
		if (this.tempObjOfApplicableInData.reasonForRequest.length > Number(magicNumber.zero)) {
			this.tempObjOfApplicableInData.reasonForRequest = updatedApplicableIn(this.
				tempObjOfApplicableInData.reasonForRequest, uncheck.item.dataItem.Value);
		}
	}

	private handleCheckedDataKeys(checkedData: StoreKey){
		if (checkedData.id == Number(magicNumber.one)) {
			this.locKey.push(String(checkedData.indexvalue));
		}
		if (checkedData.id == Number(magicNumber.two)) {
			this.orgKey.push(String(checkedData.indexvalue));
		}
		if (checkedData.id == Number(magicNumber.three)) {
			this.labourKey.push(String(checkedData.indexvalue));
		}
		if (checkedData.id == Number(magicNumber.four)) {
			this.reasonKey.push(String(checkedData.indexvalue));
		}
	}


	private ActivateDeactivateApprovalConfiguration(dataItem: IRecordStatusChangePayload[]) {
		this.approvalConfigGatewayServ.updateApprovalConfigurationStatus(dataItem).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe(() => {
				if (dataItem[magicNumber.zero].Disabled) {
					this.recordStatus = 'Inactive';
					this.statusData.items = this.createDetailItems([
						{ key: 'ApprovalConfigId', value: String(this.recordId), cssClass: ['basic-title'] },
						{ key: 'Status', value: 'Inactive', cssClass: ['red-color']

						}
					]);
					this.cdr.detectChanges();
					this.toasterServc.showToaster(ToastOptions.Success, "ApprovalConfigurationDeactivatedSuccessfully");
				}
				else {
					this.recordStatus = 'Active';
					this.statusData.items = this.createDetailItems([
						{ key: 'ApprovalConfigId', value: String(this.recordId), cssClass: ['basic-title'] },
						{ key: 'Status', value: 'Active', cssClass: ['green-color']

						}
					]);
					this.cdr.detectChanges();
					this.toasterServc.showToaster(ToastOptions.Success, "ApprovalConfigurationActivatedSuccessfully");
				}
				this.eventLog.isUpdated.next(true);
			});

		this.statusForm.controls['status'].
			setValue({
				Text: this.recordStatus,
				Value: this.recordStatus
			});

	}

	ngOnDestroy() {
		if (this.isEditMode || this.conflictData) {
			this.toasterServc.resetToaster();
		}
		this.approvalConfigGatewayServ.isWorkFlowChanged.next(false);
		this.approvalConfigGatewayServ.isSubmitForm.next(false);
		this.selectedSectorUnsub$?.unsubscribe();
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.conflictData = false;
	}

	public getApprovalFormValue(data:SetupApprovalformValue){
		this.setupApprovalConfigFormValue = data;
		this.cd.markForCheck();
	}

	public getApprovalFrom(form:FormGroup){
		this.setupApprovalConfigForm = form;
		this.cd.markForCheck();
	}

	public isRfrVisible(xrmEntityId: number | string){
		return xrmEntityId== Number(magicNumber.twentyThree) || xrmEntityId == Number(magicNumber.twentyOne);
	}
}
