import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { Subject, takeUntil } from 'rxjs';
import { NavigationPaths } from './constant/routes-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ActivateDeactivate } from '@xrm-shared/models/common.model';
import { EventConfigurationService } from 'src/app/services/masters/event-configuration.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { Router } from '@angular/router';
import { dropdown, EditEventConfigData } from './constant/event-configuration.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

@Component({selector: 'app-core-event-configuration',
	templateUrl: './core-event-configuration.component.html',
	styleUrls: ['./core-event-configuration.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreEventConfirgurationComponent {

	public statusForm: FormGroup;
	public showHeader: boolean = true;
	private ngUnsubscribe$ = new Subject<void>();
	public Ukey:string;
	public show:boolean = false;
	public recordStatus: string;
	public eventConfigData: EditEventConfigData;
	public recordId:string;
	public entityId: number = XrmEntities.EventConfiguration;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'EventConfigId',
				cssClass: ['basic-title']
			}
		]
	  };

	// eslint-disable-next-line max-params
	constructor(
		private global: PageTitleService,
		public commonHeaderIcon: CommonHeaderActionService,
		private eventConfigServc:EventConfigurationService,
		private toasterServc: ToasterService,
		private eventLog: EventLogService,
		private route: Router,
		private cd: ChangeDetectorRef,
		private formBuilder: FormBuilder
	){this.statusForm = this.formBuilder.group({
		'status': [null]
	});}

	ngOnInit(): void {
		this.updateStatusData();
		this.getstatusData();
	}
	private onEdit = () => {

		this.route.navigate([`${NavigationPaths.addEdit}/${this.Ukey}`]);
	};

	activateDeactivate(dataItem: ActivateDeactivate[]) {
		this.eventConfigServc.updateEventConfigStatus(dataItem).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
			if (dataItem[Number(magicNumber.zero)].Disabled) {
				this.recordStatus = dropdown.Inactive;
				this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
				this.statusForm.controls['status'].setValue({
					Text: this.recordStatus,
					Value: this.recordStatus
				});
				this.toasterServc.showToaster(ToastOptions.Success, 'EventConfigurationDeactivatedSuccessfully');
			}
			else {
				this.recordStatus = dropdown.Active;
				this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
				this.statusForm.controls['status'].setValue({
					Text: this.recordStatus,
					Value: this.recordStatus
				});
				this.toasterServc.showToaster(ToastOptions.Success, 'EventConfigurationActivatedSuccessfully');
			}
			this.eventLog.isUpdated.next(true);
		});
		this.statusForm.controls['status'].
			setValue({
				Text: this.recordStatus,
				Value: this.recordStatus
			});
	}
	private updateStatusData(): void{
		this.eventConfigServc.sharedDataObservable.pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((response: {
				EventConfigrationID: number;
				Disabled: boolean;
				EventConfigrationCode: string;
			}) => {
				this.eventLog.recordId.next(response?.EventConfigrationID);
				this.eventLog.entityId.next(this.entityId);
				this.recordId = response.EventConfigrationCode;
				this.recordStatus = response.Disabled
  						? 'Inactive'
  						: 'Active';
				this.statusCardData.items[magicNumber.zero].item = this.recordId;
				this.statusCardData.items[magicNumber.one] = response.Disabled
							  ? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
							  : { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
							  this.eventLog.recordId.next(response.EventConfigrationID);
				this.eventLog.entityId.next(XrmEntities.EventConfiguration);
			});
	}

	onActivate = (actions: string) => {
		if (actions == dropdown.Activate) {
			this.activateDeactivate([{ UKey: this.Ukey, ReasonForChange: '', Disabled: false }]);
		}
		else {
			this.activateDeactivate([{ UKey: this.Ukey, ReasonForChange: '', Disabled: true }]);
		}
	};
	public buttonSet = [
		{
			status: dropdown.Active,
			items: this.commonHeaderIcon.commonActionSetOnEditActive(this.onActivate)
		},
		{
			status: dropdown.Inactive,
			items: this.commonHeaderIcon.commonActionSetOnDeactive(this.onActivate)
		}
	];
	private getstatusData(): void{
		this.global.getRouteObs.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((url) => {
			if((url == NavigationPaths.addEdit) || (url == NavigationPaths.list)){
				this.showHeader = false;
			}else{
				this.showHeader = true;
			}

			if(this.showHeader){
				const ukey = url.split('/');
				this.Ukey = ukey[ukey.length - magicNumber.one];
				this.show = url.includes('view');
			}
			this.buttonSet[Number(magicNumber.zero)].items = this.show
				?this.commonHeaderIcon.commonActionSetOnActive(
					this.onEdit,
					this.onActivate
				)
				:this.commonHeaderIcon.commonActionSetOnActiveEdit(this.onActivate);

			this.buttonSet[Number(magicNumber.one)].items = this.show
				?this.commonHeaderIcon.commonActionSetOnDeactiveView(
					this.onEdit,
					this.onActivate
				)
				:this.commonHeaderIcon.commonActionSetOnDeactive(this.onActivate);

			this.cd.markForCheck();
		});
	}
	ngOnDestroy(): void {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}

}
