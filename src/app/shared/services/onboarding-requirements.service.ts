import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpMethodService } from './http-method.service';

@Injectable({
	providedIn: 'root'
})
export class OnboardingRequirementsService extends HttpMethodService {
	constructor(private http: HttpClient) {
		super(http);
	}

	public getOnboardingRequirements(data: any) {
		const response = this.GetAll(`/loc/select-onbording-requirement/${data.locId}/${data.secId}`);
		return response;
	}

	public getSelectedOnboardingCompliance(data: any) {
		const response = this.GetAll(`/onboarding/select-onboarding-compliance/${data.xrmEntityId}/${data.recordId}`);
		return response;
	}
}
