import { Component, OnInit } from '@angular/core';
import { CurrentPage, NavigationUrls, RequiredStrings } from '../services/Constants.enum';
import { SubmittalDetailsView } from '../services/Interfaces';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { FormGroup } from '@angular/forms';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SubmittalsDataService } from '../services/submittalsData.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-review',
	templateUrl: './review.component.html'
})
export class ReviewComponent implements OnInit {

	public currentPage: string = CurrentPage.Review;
	public submittalDeclineForm: FormGroup;
	public resumeForwardForm: FormGroup;
	public declineReasonList: DropdownItem[];
	public isShowDnrLevel: boolean = false;
	public RadioValues = [
		{ Text: RequiredStrings.Client, Value: magicNumber.twoHundredSeventySeven },
		{ Text: RequiredStrings.Sector, Value: magicNumber.twoHundredSeventyEight }
	];
	private submittalViewData: SubmittalDetailsView;
	constructor(
    private toasterService: ToasterService,
    private submittalDataService: SubmittalsDataService,
    private router: Router
	) {
		this.submittalDeclineForm = this.submittalDataService.createSubmittalDeclineForm();
		this.resumeForwardForm = this.submittalDataService.createResumeForwardForm();
	}

	ngOnInit() {
	}

	public manageButtons(submittalViewData: SubmittalDetailsView): void{
		this.submittalViewData = submittalViewData;
	}

	public navigateBack(): void{
		if(history.state.isCameFromProfReq){
			this.router.navigate([`${NavigationUrls.SubmittalDetails}${history.state.requestUkey}`]);
		}
		else{
			this.router.navigate([`${NavigationUrls.List}`]);
		}
	}

	public navigateInterview(): void{
		this.router.navigate([`${NavigationUrls.InterviewRequest}${this.submittalViewData.SubmittalUkey}`]);
	}

	public shortlistCandidate(): void{
		this.toasterService.showToaster(ToastOptions.Information, 'Functionality not developed yet.');
	}

	public declineSubmittal(): void{
		this.toasterService.showToaster(ToastOptions.Information, 'Functionality not developed yet.');
	}

}
