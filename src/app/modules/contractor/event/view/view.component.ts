import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ContractorService } from 'src/app/services/masters/contractor.service ';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HttpStatusCode } from '@angular/common/http';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { Subject, takeUntil } from 'rxjs';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { ContractorEventData, StaffingChoice } from '../constant/event-interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IRecordButton, IStatusCardData } from '@xrm-shared/models/common.model';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { NavigationPaths } from '../constant/routes-constant';

@Component({selector: 'app-view1',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})


export class EventsViewComponent implements OnInit, OnDestroy {
  @Input() isTab: boolean = false;
  @Input() viewUkey: string;
  @Output() backToList = new EventEmitter<boolean>();
  public DateTypeId: number = magicNumber.twofiftyFour;
  public twentyFour : number = magicNumber.twofiftyFour;
  private ukey: string;
  private staffingLabel: string = '';
  public choosestaffing: StaffingChoice[];
  private isMSPUser: boolean = false;
  private unsubscribe$: Subject<void> = new Subject<void>();
  public entityID = XrmEntities.ContractorEvent;
  public contractorEventData: ContractorEventData;
  public recordStatus: string;
  public recordTitle: string;
  public statusForm: FormGroup;
  public buttonSet: IRecordButton[];
  public statusCardData:IStatusCardData = {
  	items: [
  		{
  			item: '',
  			title: 'EventName',
  			cssClass: ['basic-title']
  		},
  		{
  			item: '',
  			title: 'ContractorEventId',
  			cssClass: ['']
  		}
  	]
  };
  public listOfStatus = [
  	{ Text: dropdown.Active, Value: dropdown.Active },
  	{ Text: dropdown.Inactive, Value: dropdown.Inactive }
  ];

  populateChooseStaffing() {
  	const currentStaf = this.localizationService.GetLocalizeMessage('CurrentStaffingAgency');

  	if(this.isMSPUser){
  		this.choosestaffing = [
  			{ Text: `${currentStaf} (${this.staffingLabel})`, Value: magicNumber.one },
  			{ Text: 'AllPrefStaffAgencies', Value: magicNumber.two },
  			{ Text: 'SelectedStaffAgencies', Value: magicNumber.three }
  		];
  	}else{
  		this.choosestaffing = [
  			{ Text: `${currentStaf}`, Value: magicNumber.one },
  			{ Text: 'AllPrefStaffAgencies', Value: magicNumber.two }
  		];
  	}
  }

  getButtonSet() {
  	this.buttonSet = [
  		{
  			status: dropdown.Active, items: this.commonHeaderIcon.commonActionSetOnEditActive(this.onActivate)
  		},
  		{
  			status: dropdown.Inactive, items: this.commonHeaderIcon.commonActionSetOnDeactive(this.onActivate)
		 }
  	];
  }

  // eslint-disable-next-line max-params
  constructor(
    private activatedRoute: ActivatedRoute,
    public commonHeaderIcon: CommonHeaderActionService,
    private contractorSer: ContractorService,
    private router: Router,
	private localizationService:LocalizationService,
	private cdr: ChangeDetectorRef,
	private formBuilder: FormBuilder,
	private toasterServc: ToasterService,
	private eventLog: EventLogService
  ) {

  	this.statusForm = this.formBuilder.group({
  		status: [null]
  	});
  }


  ngOnInit(): void {
  	if(!this.isTab){
  		 this.activatedRoute.params.pipe(takeUntil(this.unsubscribe$)).subscribe((param) => {
  			if (param['id']) {
  				this.ukey = param['id'];
  				this.getDataByUkey(this.ukey);
  			}
  		});
  	}else{
  		this.ukey = this.viewUkey;
  		this.getDataByUkey(this.ukey);
  	}
  	this.getUserType();
  }


  private getUserType() {
  	const userType = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
  	if (userType == magicNumber.two) {
  		this.isMSPUser = true;
  	}
  }


  getDataByUkey(id: string) {
  		this.contractorSer.getContractorEventByUkey(id).pipe(takeUntil(this.unsubscribe$))
  		.subscribe((res: GenericResponseBase<ContractorEventData>) => {
  			if (res.StatusCode == Number(HttpStatusCode.Ok) && res.Data) {
  				this.contractorEventData = res.Data;
  				this.cdr.markForCheck();
  				this.recordTitle = String(this.contractorEventData.AssignmentId);
  				this.recordStatus = this.contractorEventData.Disabled
  					? dropdown.Inactive
  					: dropdown.Active;
  				this.DateTypeId = this.contractorEventData.ToDate == null
  					? magicNumber.twoFiftyThree
  					: magicNumber.twofiftyFour;
					  this.statusCardData.items[magicNumber.zero].item = this.contractorEventData.EventName;
					  this.statusCardData.items[magicNumber.one].item = this.contractorEventData.EventCode;
					  this.statusCardData.items[magicNumber.two] = this.contractorEventData.Disabled
  					? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
  					: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
  				this.eventLog.recordId.next(this.contractorEventData.Id);
  				this.eventLog.entityId.next(this.entityID);
  				this.contractorEventData.BroadcastFrom ??= magicNumber.one;
  				if(this.contractorEventData.BackfillRequired == 'Yes'){
  					this.buttonSet = [];
  				}else{
  					this.getButtonSet();
  				}
  				this.staffingLabel = this.contractorEventData.staffingAgencies[magicNumber.zero].Text;
  				this.populateChooseStaffing();
  				this.statusForm.controls['status'].
  					setValue({
  						Text: this.recordStatus,
  						Value: this.recordStatus
  					});
  			}
  		});
  }

  onActivate = (actions: string) => {
  	if (actions == dropdown.Activate) {
  		this.activateDeactivate([{ UKey: this.ukey, ReasonForChange: '', Disabled: false }]);
  	}else {
  		this.activateDeactivate([{ UKey: this.ukey, ReasonForChange: '', Disabled: true }]);
  	}
  };

  activateDeactivate(viewUkey: ActivateDeactivate[]) {
  	this.contractorSer.updateContactEventStatus(viewUkey).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
  		if (viewUkey[magicNumber.zero].Disabled) {
  			this.recordStatus = dropdown.Inactive;
			  this.cdr.markForCheck();
  			this.toasterServc.showToaster(ToastOptions.Success, 'ContractorEventDeactivatedSuccessfully');
  		}else {
  			this.recordStatus = dropdown.Active;
			  this.cdr.markForCheck();
  			this.toasterServc.showToaster(ToastOptions.Success, 'ContractorEventActivatedSuccessfully');
  		}
		  this.statusCardData.items[magicNumber.two] = viewUkey[magicNumber.zero].Disabled
			  ? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
			  : { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
  	});
  }

  back() {
  	if(!this.isTab){
  		this.router.navigate([`${NavigationPaths.list}`]);
  	}else{
  		this.backToList.emit(true);
  	}
  }

  ngOnDestroy(): void {
  		this.toasterServc.resetToaster();
  		this.unsubscribe$.next();
  		this.unsubscribe$.complete();
  }
}
