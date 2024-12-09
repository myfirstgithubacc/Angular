import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { RoleServices } from './services/role.service';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { Role, Status, StatusData, headerActionSet } from './Generictype.model';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { NavigationPaths } from './constatnt/route';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RoleIdentifier } from './constatnt/enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({
	selector: 'app-core-role',
	templateUrl: './core-role.component.html',
	styleUrls: ['./core-role.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreRoleComponent implements OnInit, OnDestroy {
	public showEditOnStatus: boolean = false;
	public recordId: string = '';
	public recordStatus: string = '';
	private Ukey: string = '';
	public renderCommonSection: boolean = true;
	private unsubscribeAll$ = new Subject<void>();
	private RoleID: string = RoleIdentifier.RoleID;
	public entityId: number = XrmEntities.Role;
	buttonSet: headerActionSet[];
	public statusData: StatusData = {
		items: []
	};
	public role: Role;
	public commonForm:FormGroup;
	public showHeader: boolean = true;
	public isView: boolean;

	// eslint-disable-next-line max-params
	constructor(
		private fb:FormBuilder,
		private route: Router,
		private toasterService: ToasterService,
		private roleService: RoleServices,
		private commonHeaderIcon: CommonHeaderActionService,
		private global: PageTitleService,
		private eventLog: EventLogService
	){
		this.commonForm = this.fb.group({
			'status': [null]
		});
	}

	ngOnInit(): void {
		this.updateUIOnRouteChange();
		this.roleService.dataStream.pipe(takeUntil(this.unsubscribeAll$)).subscribe((data:Role) =>
		{
			if(data!=null){
				this.role=data;
				this.eventLog.recordId.next(this.role.RoleNo);
				this.eventLog.entityId.next(XrmEntities.Role);
				this.updateStatusData(this.role);
			}
		});

	}

	private updateStatusData(RoleWork: Role) {
		this.statusData.items = [
		  {
				title: this.RoleID,
				titleDynamicParam: [],
				item: RoleWork?.RoleCode,
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: '',
				linkParams: ''
		  },
		  {
				title: 'Status',
				titleDynamicParam: [],
				item: this.getRoleStatus(RoleWork),
				itemDynamicParam: [],
				cssClass: [this.getRoleStatus(RoleWork).toLowerCase()],
				isLinkable: false,
				link: '',
				linkParams: ''
		  }
		];
	  }

	private updateUIOnRouteChange(): void {
		this.global.getRouteObs.pipe(takeUntil(this.unsubscribeAll$)).subscribe((url) => {
			this.updateButtonSet(url);
			this.showHeader = (url !== NavigationPaths.list && url !== NavigationPaths.addEdit);
		});
	}

	private updateButtonSet(url: string) {
		const isViewPage = url.includes(NavigationPaths.list),
			isEditPage = url.startsWith(`${NavigationPaths.addEdit}/`);
		if(isViewPage){
			this.buttonSet = this.setButtonSet();
		}
		if(isEditPage){
			this.buttonSet = this.SetActionforEdit();
		}
	}

	public setButtonSet() {
		return [
			{
				status: 'Active',
				items: this.commonHeaderIcon.commonActionSetOnActive(
					this.onEdit,
					this.onActivate
				)
			},
			{
				status: 'Inactive',
				items: this.commonHeaderIcon.commonActionSetOnDeactiveView(
					this.onEdit,
					this.onActivate
				)
			}
		];
	}
	public SetActionforEdit(){
		return this.buttonSet=[
  	  		{
  				status: 'Active',
  				items: this.commonHeaderIcon.commonActionSetOnEditActive(this.onActivate)
  			},
			{
  				status: 'Inactive',
  				items: this.commonHeaderIcon.commonActionSetOnDeactive(this.onActivate)
  			}
  		];
	}
	private updateRecord(data: Status[]) {
		this.roleService
			.activateRoleAndDeactivate(data)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((res: GenericResponseBase<null>) => {
				if (!res.Succeeded) {
					this.toasterService.showToaster(
						ToastOptions.Error,
						res.StatusCode == Number(magicNumber.fourHundredThree)
							? res.Message
							: 'Somethingwentwrong'
					);
				} else if (res?.Succeeded) {
					this.toasterService.showToaster(
						ToastOptions.Success,
						data[0].disabled
							? 'RoleHasBeenDeactivated'
							: 'RoleHasBeenActivated'
					);
					this.role.Disabled = data[0].disabled;
					this.updateStatusData(this.role);
					this.setButtonSet();
					this.updateEventLog();
				}
			});
	}
	private onActivate = (actionName: string) => {
		this.updateRecord([
			{
				uKey: this.role.UKey,
				disabled: actionName === 'Deactivate',
				reasonForChange: ''
			}
		]);
	};

	private onEdit = () => {
		this.route.navigate([`/xrm/master/role/add-edit/${this.role.UKey}`]);
	};

	updateEventLog(): void{
		this.eventLog.isUpdated.next(true);
	}

	public getRoleStatus(role?:Role) {
		return role?.Disabled
			? 'Inactive'
			: 'Active';
	}
	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
	}

}

