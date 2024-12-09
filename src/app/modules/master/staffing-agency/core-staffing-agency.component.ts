import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { StaffingAgencyData, StatusCard } from './constant/status-enum';
import { Router } from '@angular/router';
import { NavigationPaths } from './constant/routes-constant';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { Subject, takeUntil } from 'rxjs';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { IRecordButton } from '@xrm-shared/models/common.model';
import { StaffingAgencyGatewayService } from 'src/app/services/masters/staffing-agency-gateway.service';

@Component({selector: 'app-core-staffing-agency',
	templateUrl: './core-staffing-agency.component.html',
	styleUrls: ['./core-staffing-agency.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CoreStaffingAgencyComponent {
	public statusForm: FormGroup;
	public showHeader: boolean = true;
	public buttonSet: IRecordButton[];
	public staffingAgencyData: StaffingAgencyData | null;
	public isView: boolean;
	public recordStatus: string;
	public entityId: number = XrmEntities.StaffingAgency;
	private ngUnsubscribe$: Subject<void> = new Subject<void>();
	public statusData = {
		items: [
			{
				item: '',
				title: 'StaffingAgencyId',
				cssClass: ['basic-title']
			}
		]
	  };
	private onEdit = () => {
		this.route.navigate([`${NavigationPaths.addedit}/${this.staffingAgencyData?.UKey}`]);
	};

	// eslint-disable-next-line max-params
	constructor(
		private route: Router,
		private commonHeaderIcons: CommonHeaderActionService,
		private eventLog: EventLogService,
		private global: PageTitleService,
		private StaffingServ : StaffingAgencyGatewayService,
		private formBuilder: FormBuilder,
		private cd: ChangeDetectorRef
	){
		this.statusForm = this.formBuilder.group({
			status: [null]
		});
	}

	ngOnInit() {
		this.global.getRouteObs.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((url) => {
			this.isView = url.includes(NavigationPaths.view);
			this.showHeader = (url !== NavigationPaths.list) && (url !== NavigationPaths.addedit);
			this.updateButtonSet();
		});
		this.StaffingServ.Staffing.asObservable().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((items) => {
			this.staffingAgencyData = items;
			if(this.staffingAgencyData){
				this.recordStatus = this.staffingAgencyData.StaffingAgencyStatus;
			}
			this.getStatusFormControl();
		});
	}

	private updateButtonSet() {
		this.buttonSet = this.isView ?
			this.getButtonSet() :
			[];
	}

	private getButtonSet() {
		return [
			{
				status: dropdown.Active,
				items: this.commonHeaderIcons.commonActionSetOfEditIconToShowView(this.onEdit)
			},
			{
				status: dropdown.Inactive,
				items: this.commonHeaderIcons.commonActionSetOfEditIconToShowView(this.onEdit)
			},
			{
				status: dropdown.Probation,
				items: this.commonHeaderIcons.commonActionSetOfEditIconToShowView(this.onEdit)
			},
			{
				status: dropdown.Potential,
				items: this.commonHeaderIcons.commonActionSetOfEditIconToShowView(this.onEdit)
			}

		];
	}


	public getStatusFormControl() {
		if(this.staffingAgencyData){
			this.statusData.items = this.createDetailItems([
				{ key: 'StaffingAgencyId', value: this.staffingAgencyData.Code, cssClass: ['basic-title'] },
				{ key: 'Status', value: this.staffingAgencyData.StaffingAgencyStatus, cssClass: this.getCssClass(this.staffingAgencyData.StaffingAgencyStatusId) }
			]);
			this.statusForm.controls['status']
				.setValue({
					Text: this.staffingAgencyData.StaffingAgencyStatus,
					Value: this.staffingAgencyData.StaffingAgencyStatus
				});
		}
		this.SetEventLogData();
	}

	getCssClass(id:number){
		if(id == Number(magicNumber.eightyOne)){
			return ['green-color'];
		}
		else if(id == Number(magicNumber.eightyTwo)){
			return ['orange-color'];
		}
		else if(id == Number(magicNumber.eighty)){
			return ['red-color'];
		}
		else if(id == Number(magicNumber.eightyThree)){
			return ['potential'];
		}
		return[];
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

	private SetEventLogData(){
		this.eventLog.recordId.next(this.staffingAgencyData?.Id);
		this.eventLog.entityId.next(this.entityId);
	}

	ngOnDestroy() {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}
}
