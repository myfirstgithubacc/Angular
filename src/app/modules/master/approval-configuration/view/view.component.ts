import { ActivatedRoute, Params, Router } from '@angular/router';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { NavigationPaths } from '../constant/routes.constant';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { OffCanvasService } from '../services/off-canvas.service';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { ApprovalConfigurationGatewayService } from 'src/app/services/masters/approval-configuration-gateway.service';
import { Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AccessToAllItems, ApplicableInEntity, ApprovalEditData, Level, LevelApprover, LevelArray, StatusCard, StatusOptions, WholeDatabasedOnWorkFlow } from '../constant/enum';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { Idropdown } from '@xrm-core/models/job-category.model';
import { IRecordStatusChangePayload } from '@xrm-shared/models/common.model';

@Component({
	selector: 'approval-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	@Input() myInput: string | undefined;
	public allowCustom:boolean = true;
	public isEditMode: boolean = false;
	public isEdit: boolean = false;
	public entityID = XrmEntities.ApprovalConfiguration;
	public approvalConfigBasicDetails: WholeDatabasedOnWorkFlow;
	public locationData: LevelArray[] = [];
	public enableLiRequest: boolean = false;
	public locationAccess: boolean = false;
	public sectordata: ApplicableInEntity[] = [];
	private ngUnsubscribe$: Subject<void> = new Subject<void>();
	public sectorAccess: boolean = false;
	public laborCategoryData: LevelArray[] = [];
	public labaorCategoryAccess: boolean = false;
	public organizationLevelData: LevelArray[] = [];
	public organizationLevelAccess: boolean = false;
	public reasonForRequestData: LevelArray[] = [];
	public reasonForRequestAccess: boolean = false;
	public approvalConfigurationForm: FormGroup;
	public recordId: string;
	public statusForm: FormGroup;
	public WorkFlowTypeName: string = '';
	public offcanvasElement: boolean = false;
	public approvalLevel:Level[] = [];
	public recordStatus: string;
	public numericWords = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
	public ukey: string = '';
	public statusData = {
		items: [
			{
				item: '',
				title: 'ApprovalConfigId',
				cssClass: ['basic-title']
			}
		]
	};

	public listOfStatus = StatusOptions;

	private onEdit = () => {
		if(this.offcanvasElement){
			this.route.navigate([`${NavigationPaths.addEdit}/${this.ukey}`]);
			this.toasterServc.resetToaster();
			this.offcanvasServc.offcanvasElement = false;

		}else{
			this.route.navigate([`${NavigationPaths.addEdit}/${this.ukey}`]);
		}
	};


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
			items: this.commonHeaderIcons.commonActionSetOnActive(this.onEdit, this.onActivate)
		},
		{
			status: "Inactive",
			items: this.commonHeaderIcons.commonActionSetOnDeactiveView(
				this.onEdit,
				this.onActivate
			)
		}
	];

	public buttonSet2 = [
		{
			status: "Active",
			items: this.commonHeaderIcons.commonActionSetOfEditIconToShowView(this.onEdit)
		},
		{
			status: "Inactive",
			items: this.commonHeaderIcons.commonActionSetOfEditIconToShowView(this.onEdit)
		}
	];

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private eventLog: EventLogService,
		public approvalConfigGatewaySer: ApprovalConfigurationGatewayService,
		private commonHeaderIcons: CommonHeaderActionService,
		public dialogService: DialogPopupService,
		private route: Router,
		private formBuilder: FormBuilder,
		public toasterServc: ToasterService,
		public offcanvasServc: OffCanvasService,
		public cdr: ChangeDetectorRef

	) {

		this.statusForm = this.formBuilder.group({
			status: [null]
		});
	}

	ngOnInit(): void {
		this.getIdFromUrl();
	}

	getIdFromUrl() {
		this.activatedRoute.params.pipe(
			takeUntil(this.ngUnsubscribe$),
			switchMap((param) => {
			  const id = this.myInput ?? param['id'];
			  this.ukey = id;
			  return this.getApprovalConfigurationById(id);
			}),
			switchMap(() =>
				this.toasterServc.showRightPannelObj.pipe(takeUntil(this.ngUnsubscribe$)))
		  ).subscribe((res) => {
			if (res) {
			  this.offcanvasServc.offcanvasElement = true;
			  this.offcanvasElement = true;
			}
		  });

	}


	public transformData(originalData:LevelApprover[]) {
		const transformedData:Level[] = [];
		originalData.forEach((item:LevelApprover) => {
			const existingLevel = transformedData.find((dataItem:Level) =>
				dataItem.level === item.Level);
			if (existingLevel) {
				existingLevel.sublevel.push({level: item.Level, sublevel: item.SubLevel, approverType: item.ApproverType});
			} else {
				transformedData.push({
					level: item.Level,
					sublevel: [{level: item.Level, sublevel: item.SubLevel, approverType: item.ApproverType}]
				});
			}
		});

		return transformedData;
	}

	private getApprovalConfigurationById(id: string): Observable<GenericResponseBase<ApprovalEditData>> {
		return this.approvalConfigGatewaySer.getApprovalConfigById(id, true).pipe(tap((data: GenericResponseBase<ApprovalEditData>) => {
			if (isSuccessfulResponse(data)) {
				this.approvalConfigBasicDetails = data.Data.Result;
			 const levelApprover: LevelApprover[] = data.Data.Result.ApprovalConfigurtion as unknown as LevelApprover[];
			 this.approvalLevel = this.transformData(levelApprover);
				this.statusForm.controls['status'].
					setValue({
						Text: this.recordStatus,
						Value: this.recordStatus
					});
				this.statusData.items = this.createDetailItems([
				 { key: 'ApprovalConfigId', value: this.approvalConfigBasicDetails.ApprovalConfigCode, cssClass: ['basic-title'] },
				 { key: 'Status', value: this.approvalConfigBasicDetails.Disabled
					 ? 'Inactive'
					 : 'Active', cssClass: this.approvalConfigBasicDetails.Disabled
					 ? ['red-color']
					 : ['green-color'] }
			 ]);
				this.getAccessDetails(this.approvalConfigBasicDetails);
				if (!this.sectorAccess) {
					this.sectordata = this.approvalConfigBasicDetails.ApplicableIn[0].
						ApplicableInEntities.filter((sector: ApplicableInEntity) =>
							sector.IsSelected);
				}
				if (!this.locationAccess) {
					this.locationData = this.getTreeData(this.
						approvalConfigBasicDetails.ApplicableIn[magicNumber.one].ApplicableInEntities);
				}

			  if (!this.labaorCategoryAccess) {
					this.laborCategoryData = this.getTreeData(this.
						approvalConfigBasicDetails.ApplicableIn[magicNumber.two].ApplicableInEntities);
				}
				if (!this.organizationLevelAccess) {
					this.organizationLevelData = this.getTreeData(this.
						approvalConfigBasicDetails.ApplicableIn[magicNumber.three].ApplicableInEntities);
				}
				if (!this.reasonForRequestAccess) {
					this.reasonForRequestData = this.getTreeData(this.
						approvalConfigBasicDetails.ApplicableIn[magicNumber.four].ApplicableInEntities);
				}

		 }
		 this.cdr.detectChanges();
		  }));
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


	private getAccessDetails(approvalConfigBasicDetails: WholeDatabasedOnWorkFlow) {
		this.WorkFlowTypeName = this.approvalConfigBasicDetails.WorkFlowTypeName;
		this.WorkFlowTypeName = (this.WorkFlowTypeName === 'LIRequest') ?
			'LiRequest' :
			this.WorkFlowTypeName;
		this.sectorAccess = approvalConfigBasicDetails.ApplicableIn[magicNumber.zero].IsAccessToAll;
		this.locationAccess = approvalConfigBasicDetails.ApplicableIn[magicNumber.one].IsAccessToAll;
		this.labaorCategoryAccess = approvalConfigBasicDetails.ApplicableIn[magicNumber.two].IsAccessToAll;
		this.organizationLevelAccess = approvalConfigBasicDetails.ApplicableIn[magicNumber.three].IsAccessToAll;
		this.reasonForRequestAccess = approvalConfigBasicDetails.ApplicableIn[magicNumber.four].IsAccessToAll;
		this.eventLog.recordId.next(approvalConfigBasicDetails.ApprovalConfigId);
		this.eventLog.entityId.next(this.entityID);

		this.recordId = approvalConfigBasicDetails.ApprovalConfigCode;
		this.recordStatus = approvalConfigBasicDetails.Disabled
			? 'Inactive'
			: 'Active';

		if (approvalConfigBasicDetails.WorkFlowType == Number(magicNumber.twentyThree)) {
			this.enableLiRequest = true;
		}
		this.cdr.detectChanges();
	}

	private getTreeData(event: ApplicableInEntity[]) {
		const Level1Array:LevelArray[] = [];
		event.forEach((data:ApplicableInEntity) => {
			const newArray: Idropdown[] = [];
			if (data.IsSelected) {
				data.AccessToAllItems?.forEach((i: AccessToAllItems) => {
					const obj = { Text: i.Text, Value: i.Value };
					newArray.push(obj);
				});
			}
			else {
				data.AccessToAllItems?.forEach((i: AccessToAllItems) => {
					if (i.IsSelected) {
						const obj = { Text: i.Text, Value: i.Value };
						newArray.push(obj);
					}
				});
			}
			if (newArray.length > Number(magicNumber.zero)) {
				const level1 = { Text: data.Text, items: newArray };
				Level1Array.push(level1);
			}
		});
		Level1Array.sort((a, b) =>
			a.Text.localeCompare(b.Text));
		return Level1Array;

	}

	private ActivateDeactivateApprovalConfiguration(dataItem: IRecordStatusChangePayload[]) {
		this.approvalConfigGatewaySer.updateApprovalConfigurationStatus(dataItem).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe(() => {
				if (dataItem[magicNumber.zero].Disabled) {
					this.recordStatus = 'Inactive';
					this.statusData.items = this.createDetailItems([
						{ key: 'ApprovalConfigId', value: this.recordId, cssClass: ['basic-title'] },
						{ key: 'Status', value: 'Inactive', cssClass: ['red-color']

						}
					]);
					this.toasterServc.showToaster(ToastOptions.Success, "ApprovalConfigurationDeactivatedSuccessfully");
				}
				else {
					this.recordStatus = 'Active';
					this.statusData.items = this.createDetailItems([
						{ key: 'ApprovalConfigId', value: this.recordId, cssClass: ['basic-title'] },
						{ key: 'Status', value: 'Active', cssClass: ['green-color']

						}
					]);
					this.toasterServc.showToaster(ToastOptions.Success, "ApprovalConfigurationActivatedSuccessfully");
				}
				this.eventLog.isUpdated.next(true);
				this.cdr.detectChanges();
			});

		this.statusForm.controls['status'].
			setValue({
				Text: this.recordStatus,
				Value: this.recordStatus
			});

	}

	public navigate() {
		if(!this.offcanvasServc.offcanvasElement){
			this.route.navigate([NavigationPaths.list]);
		}else{
			this.offcanvasServc.offcanvasElement = false;
		}

	}

	ngOnDestroy(): void {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		if(!this.offcanvasElement){
			this.toasterServc.resetToaster();
		}

	}

}
