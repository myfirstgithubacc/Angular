import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { Subject, takeUntil } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { IRecordButton, IStatusCardData, IStatusCardItem } from '@xrm-shared/models/common.model';
import { SubmittalsService } from './services/submittals.service';
import { ParentData, StepperData } from './services/Interfaces';
import { CurrentPage, RequiredStrings, Status, StatusId } from './services/Constants.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SubmittalStepperService } from './services/submittal-stepper.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';

@Component({
	selector: 'app-submittals',
	templateUrl: './core-submittals.component.html',
	styleUrls: ['./core-submittals.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreSubmittalsComponent implements OnInit, OnDestroy {

	constructor(
		private sessionStorage: SessionStorageService,
		private submittalService: SubmittalsService,
		private stepperService: SubmittalStepperService,
		private eventLogService: EventLogService,
		private renderer: Renderer2
	) { }

	public headerData: ParentData | null;
	public headerForm: FormGroup;
	public psrEntityId: number = XrmEntities.ProfessionalRequest;
	public buttonSet: IRecordButton[] = [];
	public statusData: IStatusCardData = {
		items: []
	};
	private sectorLabel: string = RequiredStrings.Sector;
	public stepsForProgressBar = [
		{
			label: 'Submit',
			isValid: true,
			disabled: false
		},
		{
			label: 'PendingProcess',
			isValid: true,
			disabled: false
		},
		{
			label: 'Review',
			isValid: true,
			disabled: false
		},
		{
			label: 'Onboarding',
			isValid: true,
			disabled: false
		},
		{
			label: 'OnboardingCompleted',
			isValid: true,
			disabled: false
		}
	];
	public currentStep: number = magicNumber.zero;
	public isShowStepper: boolean = true;
	public isShowAuditLog: boolean = true;
	public isShowRequestDetail: boolean = false;
	public profReqUkey: string;
	private unsubscribe$: Subject<void> = new Subject<void>();

	ngOnInit(): void {
		this.getParentData();
		this.getStepperData();
	}

	private getParentData(): void {
		this.submittalService.ParentData.pipe(takeUntil(this.unsubscribe$)).subscribe((res: ParentData | null) => {
			this.headerData = res;
			this.profReqUkey = res?.RequestUkey ?? '';
			this.getCommonHeaderData();
		});
	}

	private getStepperData(): void {
		this.submittalService.StepperData.pipe(takeUntil(this.unsubscribe$)).subscribe((res: StepperData | null) => {
			if (res) {
				if (res.CurrentPage == CurrentPage.Add.toString()) {
					this.isShowStepper = false;
					this.isShowAuditLog = false;
					return;
				}
				this.manageStepper(res);
				this.manageAuditLog(res);
			}
			else {
				this.isShowAuditLog = false;
				this.isShowStepper = false;
			}
		});
	}

	private manageStepper(res: StepperData): void {
		this.currentStep = this.stepperService.setStatusStep[res.SubmittalStatusId as StatusId];
		this.stepsForProgressBar = this.stepperService.Steps[res.SubmittalStatusId]();
		if (res.SubmittalStatusId == Number(StatusId.Declined)) {
			this.stepsForProgressBar.forEach((item, index) => {
				if (index > this.currentStep)
					item.disabled = true;
			});
		}
		this.isShowStepper = true;
	}

	private manageAuditLog(res: StepperData): void {
		if (res.SubmittalStatusId == Number(StatusId.Drafted)) {
			this.isShowAuditLog = false;
			return;
		}
		this.eventLogService.entityId.next(XrmEntities.Submittal);
		this.eventLogService.recordId.next(res.RecordId);
		this.eventLogService.isUpdated.next(true);
		this.isShowAuditLog = true;
	}

	ngOnDestroy(): void {
		this.sessionStorage.remove('psrdata');
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public getCommonHeaderData(): void {
		if (this.headerData) {
			if (this.headerData.IsShowSubData && this.headerData.SubmittalCode) {
				this.statusData.items = [
					this.makeHeaderColumn(RequiredStrings.SubmittalId, this.headerData.SubmittalCode, ['basic-title']),
					this.makeHeaderColumn(RequiredStrings.ProfessionalRequestID, this.headerData.ProfessionReqId),
					this.makeHeaderColumn(this.sectorLabel, this.headerData.SectorName),
					this.makeHeaderColumn(RequiredStrings.JobCategory, this.headerData.JobCategoryName),
					this.makeHeaderColumn(
						RequiredStrings.SubmittalStatus,
						this.headerData.Status,
						this.headerData.Status == Status.Withdrawn.toString() || this.headerData.Status == Status.Declined.toString()
							? ['inactive']
							: ['active']
					)
				];
				return;
			}
			this.statusData.items = [
				this.makeHeaderColumn(RequiredStrings.ProfessionalRequestID, this.headerData.ProfessionReqId, ['basic-title']),
				this.makeHeaderColumn(this.sectorLabel, this.headerData.SectorName),
				this.makeHeaderColumn(RequiredStrings.JobCategory, this.headerData.JobCategoryName)
			];
		}
	}

	private makeHeaderColumn(title: string, item: string, cssClass: string[] = []) {
		return {
			title: title,
			titleDynamicParam: [],
			item: item,
			itemDynamicParam: [],
			cssClass: cssClass,
			isLinkable: title == RequiredStrings.ProfessionalRequestID.toString()
				? true
				: false,
			link: RequiredStrings.EmptyString,
			linkParams: title == RequiredStrings.ProfessionalRequestID.toString()
				? item.toString()
				: RequiredStrings.EmptyString
		} as IStatusCardItem;
	}

	public showRequestDetails(event: string): void {
		this.isShowRequestDetail = true;
		this.renderer.setStyle(document.body, 'overflow', 'hidden');
		this.renderer.setStyle(document.body, 'padding-right', '0');
	}

	public closePanel(): void {
		this.isShowRequestDetail = false;
		this.renderer.removeStyle(document.body, 'overflow');
		this.renderer.removeStyle(document.body, 'padding-right');
	}
}
