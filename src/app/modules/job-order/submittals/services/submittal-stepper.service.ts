import { Injectable } from '@angular/core';
import { Step, Steps } from './Interfaces';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { StatusId } from './Constants.enum';

@Injectable({
	providedIn: 'root'
})
export class SubmittalStepperService {

	constructor() { }

	public Steps: Steps = {
		[StatusId.Drafted]: this.getStepsDrafted,
		[StatusId.Submitted]: this.getStepsSubmitted,
		[StatusId.ReSubmitted]: this.getStepsSubmitted,
		[StatusId.Withdrawn]: this.getStepsWithdrawn,
		[StatusId.ViewByMSP]: this.getStepsViewedByMsp,
		[StatusId.Declined]: this.getStepsDeclined,
		[StatusId.Forwarded]: this.getStepsForwarded,
		[StatusId.Shortlisted]: this.getStepsShortlisted,
		[StatusId.Selected]: this.getStepsSelected,
		[StatusId.Received]: this.getStepsReceived
	};

	public setStatusStep = {
		[StatusId.Drafted]: magicNumber.zero,
		[StatusId.Submitted]: magicNumber.one,
		[StatusId.ReSubmitted]: magicNumber.one,
		[StatusId.ViewByMSP]: magicNumber.one,
		[StatusId.Received]: magicNumber.one,
		[StatusId.Withdrawn]: magicNumber.one,
		[StatusId.Declined]: magicNumber.one,
		[StatusId.Forwarded]: magicNumber.two,
		[StatusId.Shortlisted]: magicNumber.two,
		[StatusId.Selected]: magicNumber.two,
		[StatusId.Accepted]: magicNumber.two,
		[StatusId.ViewedByManager]: magicNumber.two,
		[StatusId.PendingFinalOnboardApproval]: magicNumber.two,
		[StatusId.PendingFinalOfferApproval]: magicNumber.two,
		[StatusId.SelectedOfferReview]: magicNumber.two,
		[StatusId.SelectedOfferAccepted]: magicNumber.two,
		[StatusId.Deferred]: magicNumber.two,
		[StatusId.SelectedStaffingAgencyConfirmed]: magicNumber.two,
		[StatusId.OfferAccepted]: magicNumber.two,
		[StatusId.OfferDeclined]: magicNumber.two,
		[StatusId.StaffingAgencyOnboardCompeleted]: magicNumber.two

	};

	public getStepsDrafted(): Step[]{
		return [
			{ label: 'SavedAsDraft', isValid: true, disabled: false },
			{ label: 'PendingProcess', isValid: true, disabled: false },
			{ label: 'Review', isValid: true, disabled: false },
			{ label: 'Onboarding', isValid: true, disabled: false },
			{ label: 'OnboardingCompleted', isValid: true, disabled: false }
		];
	}

	public getStepsSubmitted(): Step[]{
		return [
			{ label: 'Submitted', isValid: true, disabled: false },
			{ label: 'PendingProcess', isValid: true, disabled: false },
			{ label: 'Review', isValid: true, disabled: false },
			{ label: 'Onboarding', isValid: true, disabled: false },
			{ label: 'OnboardingCompleted', isValid: true, disabled: false }
		];
	}

	public getStepsDeclined(): Step[]{
		return [
			{ label: 'Submitted', isValid: true, disabled: false },
			{ label: 'Declined', isValid: true, disabled: false },
			{ label: 'Review', isValid: true, disabled: false },
			{ label: 'Onboarding', isValid: true, disabled: false },
			{ label: 'OnboardingCompleted', isValid: true, disabled: false }
		];
	}

	public getStepsWithdrawn(): Step[]{
		return [
			{ label: 'Submitted', isValid: true, disabled: false },
			{ label: 'Withdrawn', isValid: true, disabled: false },
			{ label: 'Review', isValid: true, disabled: false },
			{ label: 'Onboarding', isValid: true, disabled: false },
			{ label: 'OnboardingCompleted', isValid: true, disabled: false }
		];
	}

	public getStepsForwarded(): Step[]{
		return [
			{ label: 'Submitted', isValid: true, disabled: false },
			{ label: 'Forwarded', isValid: true, disabled: false },
			{ label: 'Review', isValid: true, disabled: false },
			{ label: 'Onboarding', isValid: true, disabled: false },
			{ label: 'OnboardingCompleted', isValid: true, disabled: false }
		];
	}

	public getStepsViewedByMsp(): Step[]{
		return [
			{ label: 'Submitted', isValid: true, disabled: false },
			{ label: 'ViewByMSP', isValid: true, disabled: false },
			{ label: 'Review', isValid: true, disabled: false },
			{ label: 'Onboarding', isValid: true, disabled: false },
			{ label: 'OnboardingCompleted', isValid: true, disabled: false }
		];
	}

	public getStepsReceived(): Step[]{
		return [
			{ label: 'Submitted', isValid: true, disabled: false },
			{ label: 'Received', isValid: true, disabled: false },
			{ label: 'Review', isValid: true, disabled: false },
			{ label: 'Onboarding', isValid: true, disabled: false },
			{ label: 'OnboardingCompleted', isValid: true, disabled: false }
		];
	}

	public getStepsSelected(): Step[]{
		return [
			{ label: 'Submitted', isValid: true, disabled: false },
			{ label: 'Forwarded', isValid: true, disabled: false },
			{ label: 'Selected', isValid: true, disabled: false },
			{ label: 'Onboarding', isValid: true, disabled: false },
			{ label: 'OnboardingCompleted', isValid: true, disabled: false }
		];
	}

	public getStepsShortlisted(): Step[]{
		return [
			{ label: 'Submitted', isValid: true, disabled: false },
			{ label: 'Forwarded', isValid: true, disabled: false },
			{ label: 'Shortlisted', isValid: true, disabled: false },
			{ label: 'Onboarding', isValid: true, disabled: false },
			{ label: 'OnboardingCompleted', isValid: true, disabled: false }
		];
	}

}
