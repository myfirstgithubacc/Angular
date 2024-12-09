import { ElementRef, Injectable } from '@angular/core';
import { StepDataModel } from '@xrm-core/models/Sector/sector-rfx-configuration.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { BehaviorSubject } from 'rxjs';
type InitStatusOfForm = Record<number, number>;

@Injectable({
	providedIn: 'root'
})
export class ProfessionalStepperService {

	public showAllSectionsSwitch = new BehaviorSubject<boolean>(false);
	public ShowAllSectionsSwitch = this.showAllSectionsSwitch.asObservable();

	public initStatusOfForm: InitStatusOfForm = {
		0: Number(magicNumber.zero),
		1: Number(magicNumber.zero),
		2: Number(magicNumber.zero),
		3: Number(magicNumber.zero),
		4: Number(magicNumber.zero)
	};
	private timeoutId: number;

	getSteps(): StepDataModel[] {
		const steps = [];
		steps.push(this.getStepLabel('Job Details', 'requestDetails'));
		steps.push(this.getStepLabel('Assignment Details', 'assignmentRequirement'));
		steps.push(this.getStepLabel('Financial Details', 'rateDetails'));
		steps.push(this.getStepLabel('Approver & Other Details', 'requestComments'));
		return steps;
	}

	getStepLabel(label: string, name: string) {
		return {
			label: label,
			icon: 'check',
			id: label,
			name: name
		};
	}

	getFormErrorStatus(index: number) {
		return this.initStatusOfForm[index];
	}

	setFormInitStatus(index: number) {
		this.initStatusOfForm[index] = this.initStatusOfForm[index] + Number(magicNumber.one);
	}

	setInitialDefault() {
		this.initStatusOfForm = {
			0: 0, 1: 0, 2: 0, 3: 0, 4: 0
		};
	}

	makeScreenScrollOnUpdate(element: ElementRef) {
		const fieldWithError = element.nativeElement.querySelector('.card__heading');
		if (fieldWithError !== null) {
			this.timeoutId = window.setTimeout(() =>
				fieldWithError.scrollIntoView({ block: 'center' }), magicNumber.zero);
		}
	}

	clearTimeout() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = Number(magicNumber.zero);
		}
	}
}
