import { Component, Input, OnChanges, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { StatusID } from '../../constant/request-status';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-status-bar-li',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.scss'],
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
    @Input() public statusId:number;
    @Input() public approverlength: boolean;
    @Input() public isEditMode: boolean;

    constructor(private localizationService: LocalizationService){

    }

    ngOnChanges(): void {
    		this.OnChangeStatusBar();
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

    private OnChangeStatusBar() {

    	switch (this.statusId) {

    		case StatusID.Approved:
    			this.handleApprovalStep();
    			break;

    		case StatusID.Declined:
    			this.handleDeclineStatus();
    			break;

    		case StatusID.Open:
    			this.handleOpenStep();
    			break;

    		case StatusID.Closed:
    			this.handleClosedStep();
    			break;

    		default:
    			this.handleDefaultStep();
    			break;
    	}

    	if(this.currentStep != Number(magicNumber.zero)){
    		this.stepsForProgressBar[magicNumber.zero].label = this.localizationService.GetLocalizeMessage('Submitted');
    	}
    }

    private handleApprovalStep(): void{
    	this.currentStep = magicNumber.two;
    	this.stepsForProgressBar[magicNumber.one].label = this.approverlength
    		? this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'Completed', IsLocalizeKey: true }])
    		: this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'NotRequired', IsLocalizeKey: true }]);
    	this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('BroadcastWithSubStatus', [{ Value: 'Pending', IsLocalizeKey: true }]);
    }

    private handleOpenStep(): void{
    	this.currentStep = magicNumber.three;
    	this.stepsForProgressBar[magicNumber.one].label = this.approverlength
    		? this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'Completed', IsLocalizeKey: true }])
    		: this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'NotRequired', IsLocalizeKey: true }]);
    			this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('Broadcasted');
    			this.stepsForProgressBar[magicNumber.three].label = this.localizationService.GetLocalizeMessage('CandidateSubmissionWithSubStatus', [{ Value: 'Open', IsLocalizeKey: true }]);
    }

    private handleClosedStep(): void{
    	this.currentStep = this.stepsForProgressBar.length + magicNumber.one;
    	this.stepsForProgressBar[magicNumber.one].label = this.approverlength
    		? this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'Completed', IsLocalizeKey: true }])
    		: this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'NotRequired', IsLocalizeKey: true }]);
					  this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('Broadcasted');
					  this.stepsForProgressBar[magicNumber.three].label = this.localizationService.GetLocalizeMessage('CandidateSubmissionWithSubStatus', [{ Value: 'Completed', IsLocalizeKey: true }]);
    }

    private handleDefaultStep(): void{

    	if (this.approverlength &&
		(this.statusId == Number(StatusID.ReSubmitted) || this.statusId == Number(StatusID.Submitted))) {
    		this.currentStep= magicNumber.one;
    		this.stepsForProgressBar[magicNumber.one].label = this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'InProcess', IsLocalizeKey: true }]);
    		this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('Broadcast');
    	}
    	else if (!this.approverlength &&
		(this.statusId == Number(StatusID.ReSubmitted) || this.statusId == Number(StatusID.Submitted))){
    		this.currentStep= magicNumber.two;
    		this.stepsForProgressBar[magicNumber.one].label = this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'NotRequired', IsLocalizeKey: true }]);
    		this.stepsForProgressBar[magicNumber.two].label = this.localizationService.GetLocalizeMessage('BroadcastWithSubStatus', [{ Value: 'Pending', IsLocalizeKey: true }]);
    	}else{
    		this.currentStep= magicNumber.zero;
    		this.stepsForProgressBar[magicNumber.zero].label = this.localizationService.GetLocalizeMessage('New');
    	}
    }

    private handleDeclineStatus(): void{
    	this.currentStep = magicNumber.one;
    	this.stepsForProgressBar[magicNumber.one].label = this.localizationService.GetLocalizeMessage('ApprovalProcessWithSubStatus', [{ Value: 'Declineds', IsLocalizeKey: true }]);
    }
}
