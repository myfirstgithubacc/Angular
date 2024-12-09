import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { StatusID } from '../../constant/request-status';

@Component({
	selector: 'app-status-bar-proff',
	templateUrl: './status-bar.component.html',
	styleUrl: './status-bar.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBarComponent implements OnInit, OnChanges {
	@Input()
	public stepsForProgressBar = [
			{
				label: 'New',
				isValid: true,
				disabled: false
			},
			{
				label: 'ApprovalProcess',
				isValid: true,
				disabled: true
			},
			{
				label: 'Broadcast',
				isValid: true,
				disabled: true
			},
			{
				label: 'CandidateSubmission',
				isValid: true,
				disabled: true
			},
			{
				label: 'Closed',
				isValid: true,
				disabled: true
			}
		];

	@Input() public currentStep: number = magicNumber.one;
	@Input() public statusId: number = magicNumber.zero;
	@Input() public isEditMode: boolean = false;
	@Input() public approverlength: boolean = false;

	constructor(private localizationService: LocalizationService, private cdr: ChangeDetectorRef) {

	}

	ngOnChanges(): void {
		this.updateStatusBar();
	}

	ngOnInit(): void {
		this.changeCurrentStep();
	}

	private changeCurrentStep() {
		this.currentStep = this.isEditMode
			? magicNumber.one
			: magicNumber.zero;
		this.stepsForProgressBar.forEach((step) => {
			step.disabled = false;
		});
	}

	private updateStatusBar() {
		switch (this.statusId) {
			case StatusID.Draft:
				this.handleDraftStep();
				break;
			case StatusID.Approved:
			case StatusID.AcknowledgedByMSP:
				this.handleApprovedStep();
				break;
			case StatusID.Declined:
				this.handleDeclineStatus();
				break;
			case StatusID.Open:
				this.handleOpenStep();
				break;
			case StatusID.HoldAnyNewSubmittals:
				this.handleHoldAnyNewSubmittalsStep();
				break;
			default:
				this.handleDefaultStep();
				break;
		}
		if (this.currentStep != Number(magicNumber.zero)) {
			this.stepsForProgressBar[magicNumber.zero].label = this.localizationService.GetLocalizeMessage('Submitted');
		}
		this.cdr.detectChanges();
	}

	private handleDraftStep(): void {
		this.currentStep = magicNumber.zero;
		this.stepsForProgressBar[magicNumber.zero].label = this.localizationService.GetLocalizeMessage('Drafted');
	}

	private handleOpenStep(): void {
		this.currentStep = magicNumber.three;
		this.stepsForProgressBar[magicNumber.one].label = this.approverlength
			? this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'Completed', IsLocalizeKey: true }])
			: this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'NotRequired', IsLocalizeKey: true }]);
		this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('Broadcasted');
		this.stepsForProgressBar[magicNumber.three].label = this.localizationService.GetLocalizeMessage('CandidateSubmissionWithSubStatus', [{ Value: 'Open', IsLocalizeKey: true }]);
	}

	private handleHoldAnyNewSubmittalsStep(): void {
		this.currentStep = magicNumber.three;
		this.stepsForProgressBar[magicNumber.one].label = this.approverlength
			? this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'Completed', IsLocalizeKey: true }])
			: this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'NotRequired', IsLocalizeKey: true }]);
		this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('Broadcasted');
		this.stepsForProgressBar[magicNumber.three].label = this.localizationService.GetLocalizeMessage('HoldAnyNewSubmittal');
	}

	private handleApprovedStep(): void {
		this.currentStep = magicNumber.two;
		this.stepsForProgressBar[magicNumber.one].label = this.approverlength
			? this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'Completed', IsLocalizeKey: true }])
			: this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'NotRequired', IsLocalizeKey: true }]);
		this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('BroadcastWithSubStatus', [{ Value: 'Pending', IsLocalizeKey: true }]);
	}

	private handleDefaultStep(): void {
		if (this.approverlength &&
			(this.statusId == Number(StatusID.ReSubmitted) || this.statusId == Number(StatusID.Submitted))) {
			this.currentStep = magicNumber.one;
			this.stepsForProgressBar[magicNumber.one].label = this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'InProcess', IsLocalizeKey: true }]);
			this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('Broadcast');
		}
		else if (!this.approverlength &&
			(this.statusId == Number(StatusID.ReSubmitted) || this.statusId == Number(StatusID.Submitted))) {
			this.currentStep = magicNumber.two;
			this.stepsForProgressBar[magicNumber.one].label = this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'NotRequired', IsLocalizeKey: true }]);
			this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('BroadcastWithSubStatus', [{ Value: 'Pending', IsLocalizeKey: true }]);
		} else {
			this.currentStep = magicNumber.zero;
			this.stepsForProgressBar[magicNumber.zero].label = this.localizationService.GetLocalizeMessage('New');
		}
	}

	private handleDeclineStatus(): void {
		this.currentStep = magicNumber.one;
		this.stepsForProgressBar[magicNumber.one].label = this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'Declineds', IsLocalizeKey: true }]);
	}

}
