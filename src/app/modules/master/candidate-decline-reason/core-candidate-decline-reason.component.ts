import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { NavigationPaths } from './constant/routes-constant';
import { CandidateDeclineReasonService } from 'src/app/services/masters/candidate-decline-reason.service';

@Component({selector: 'app-core-candidate-decline-reason',
	templateUrl: './core-candidate-decline-reason.component.html',
	styleUrls: ['./core-candidate-decline-reason.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreCandidateDeclineReasonComponent implements OnInit, OnDestroy {

	public statusForm: FormGroup;
	public show:boolean = false;
	public statusCardData = {
		items: [
			{
				item: '',
				title: 'CandidateDeclineReasonId',
				cssClass: ['basic-title']
			}
		]
	  };
	public recordId:string;
	public recordStatus:string;
	public Ukey:string;
	public entityId: number = XrmEntities.CandidateDeclineReason;
	public showHeader: boolean = true;
	private unsubscribeAll$ = new Subject<void>();


	// eslint-disable-next-line max-params
	constructor(
		private commonHeaderIcons: CommonHeaderActionService,
		private formBuilder: FormBuilder,
		private canDecRsnServc:CandidateDeclineReasonService,
		private toasterServc: ToasterService,
		private eventLog: EventLogService,
		private global: PageTitleService,
		private cdr: ChangeDetectorRef,
		private router: Router
	) {
		this.statusForm = this.formBuilder.group({
			'status': [null]
		});
	}

	ngOnInit(): void {
		this.getstatusData();
		this.updateStatusData();
	}

	private getstatusData(): void{
		this.global.getRouteObs.pipe(takeUntil(this.unsubscribeAll$)).subscribe((url) => {
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

			this.buttonSet[magicNumber.zero].items = this.show
				?this.commonHeaderIcons.commonActionSetOnActive(
					this.onEdit,
					this.onActivate
				)
				:this.commonHeaderIcons.commonActionSetOnActiveEdit(this.onActivate);

			this.buttonSet[magicNumber.one].items = this.show
				?this.commonHeaderIcons.commonActionSetOnDeactiveView(
					this.onEdit,
					this.onActivate
				)
				:this.commonHeaderIcons.commonActionSetOnDeactive(this.onActivate);

			this.cdr.markForCheck();
		});

	}

	private updateStatusData(): void{
		this.canDecRsnServc.declinereasonObservable.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((response: {
				DeclineReasonID: number;
				Disabled: boolean;
				DeclineReasonCode: string;
			}) => {
				this.recordId = response.DeclineReasonCode;
				this.recordStatus = response.Disabled
  						? 'Inactive'
  						: 'Active';
				this.statusCardData.items[magicNumber.zero].item = this.recordId;
				this.statusCardData.items[magicNumber.one] = response.Disabled
							  ? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
							  : { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };
				this.eventLog.recordId.next(response.DeclineReasonID);
				this.eventLog.entityId.next(this.entityId);
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

	private onEdit = () => {
		this.eventLog.isUpdated.next(true);
		this.router.navigate([`${NavigationPaths.addEdit}/${this.Ukey}`]);
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


	activateDeactivate(dataItem: ActivateDeactivate[]) {
		this.canDecRsnServc.updateCanDeclineRsnStatus(dataItem).pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((res: ApiResponseBase) => {
				if(res.Succeeded){
					if (dataItem[magicNumber.zero].Disabled) {
						this.recordStatus = dropdown.Inactive;
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterServc.showToaster(ToastOptions.Success, 'CandidateDecRsnDeactivatedSuccessfully');
					}
					else {
						this.recordStatus = dropdown.Active;
						this.statusCardData.items[magicNumber.one]= {item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled'};
						this.statusForm.controls['status'].setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
						this.toasterServc.showToaster(ToastOptions.Success, 'CandidateDecRsnActivatedSuccessfully');
					}
					this.eventLog.isUpdated.next(true);
					this.cdr.markForCheck();
				}
			});
		this.statusForm.controls['status'].
			setValue({
				Text: this.recordStatus,
				Value: this.recordStatus
			});
	}

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
	}
}
