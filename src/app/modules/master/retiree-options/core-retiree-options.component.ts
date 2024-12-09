import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { Subject, takeUntil } from 'rxjs';
import { NavigationPaths } from './constant/routes-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { Router } from '@angular/router';
import { ActivateDeactivate, dropdown } from './constant/retiree.enum';
import { RetireeoptionsService } from 'src/app/services/masters/retiree-options.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

@Component({selector: 'app-core-retiree-options',
	templateUrl: './core-retiree-options.component.html',
	styleUrls: ['./core-retiree-options.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreRetireeOptionsComponent {
	public statusForm: FormGroup;
	public showHeader: boolean = true;
	private ngUnsubscribe$ = new Subject<void>();
	public Ukey:string;
	public show:boolean = false;
	public recordStatus: string;
	public recordId:string;
	public entityId: number = XrmEntities.RetireeOption;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'RetireeOptionId',
				cssClass: ['basic-title']
			}
		]
	  };

	 // eslint-disable-next-line max-params
	 constructor(
		private global: PageTitleService,
		private commonHeaderIcons: CommonHeaderActionService,
		private eventLog: EventLogService,
		private router: Router,
		public retireeOptServc: RetireeoptionsService,
		private toasterServc: ToasterService,
		private formBuilder: FormBuilder,
		private cd: ChangeDetectorRef
	 ){this.statusForm = this.formBuilder.group({
		'status': [null]
	});}
	ngOnInit(): void {
		this.getstatusData();
		this.updateStatusData();
	}
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

			this.buttonSet[0].items = this.show
				?this.commonHeaderIcons.commonActionSetOnActive(
					this.onEdit,
					this.onActivate
				)
				:this.commonHeaderIcons.commonActionSetOnActiveEdit(this.onActivate);

			this.buttonSet[1].items = this.show
				?this.commonHeaderIcons.commonActionSetOnDeactiveView(
					this.onEdit,
					this.onActivate
				)
				:this.commonHeaderIcons.commonActionSetOnDeactive(this.onActivate);

			this.cd.markForCheck();
		});

	}
	private updateStatusData(): void{
		this.retireeOptServc.sharedDataObservable.pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((response: {
				retireeID: number;
				Disabled: boolean;
				retireeCode: string;
			}) => {
				this.eventLog.recordId.next(response?.retireeID);
				this.eventLog.entityId.next(this.entityId);
				this.recordId = response.retireeCode;
				this.recordStatus = response.Disabled
  						? 'Inactive'
  						: 'Active';
				this.statusCardData.items[magicNumber.zero].item = this.recordId;
				this.statusCardData.items[magicNumber.one] = response.Disabled
							  ? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
							  : { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
							  this.eventLog.recordId.next(response.retireeID);
				this.eventLog.entityId.next(XrmEntities.RetireeOption);
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
			items: this.commonHeaderIcons.commonActionSetOnEditActive(this.onActivate)
		},
		{
			status: dropdown.Inactive,
			items: this.commonHeaderIcons.commonActionSetOnDeactive(this.onActivate)
		}
	];
	private onEdit = () => {
		this.eventLog.isUpdated.next(true);
		this.router.navigate([`${NavigationPaths.addEdit}/${this.Ukey}`]);
	};

	activateDeactivate(dataItem: ActivateDeactivate[]) {
		this.retireeOptServc.updateRetireeOptionStatus(dataItem).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
			if (dataItem[magicNumber.zero].Disabled) {
				this.recordStatus = dropdown.Inactive;
				this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
				this.statusForm.controls['status'].setValue({
					Text: this.recordStatus,
					Value: this.recordStatus
				});
				this.toasterServc.showToaster(ToastOptions.Success, 'RetireeOptDeactivatedSuccessfully');
			}
			else {
				this.recordStatus = dropdown.Active;
				this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
				this.statusForm.controls['status'].setValue({
					Text: this.recordStatus,
					Value: this.recordStatus
				});
				this.toasterServc.showToaster(ToastOptions.Success, 'RetireeOptActivatedSuccessfully');
			}
			this.eventLog.isUpdated.next(true);
		});
		this.statusForm.controls['status'].
			setValue({
				Text: this.recordStatus,
				Value: this.recordStatus
			});
	}
	ngOnDestroy(): void {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}
}
