import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Subject, takeUntil } from 'rxjs';
import { SubmittalsDataService } from '../../services/submittalsData.service';
import { CandidateCardData, CardVisibilityKeys } from '../../services/Interfaces';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { SubmittalsService } from '../../services/submittals.service';
import { RequiredStrings } from '../../services/Constants.enum';

@Component({
	selector: 'app-candidate-details',
	templateUrl: './candidate-details.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateDetailsComponent implements OnInit, OnDestroy, OnChanges {

	@Input() candidateDetailsForm:FormGroup;
	@Input() workerClassificationList: DropdownItem[];
	@Input() isCardVisible: boolean;
	@Input() uidLength: number;
	@Input() CandidateCardData: CandidateCardData | null;
	@Output() onExpandedChange = new EventEmitter<{ card: CardVisibilityKeys; isCardVisible: boolean }>();

	public isPreviouslyWorked: boolean = false;
	public entityId: number = XrmEntities.Submittal;
	public candidateCardData: CandidateCardData = {
		FullName: RequiredStrings.EmptyString,
		IsCanDetailsEditable: true,
		PreviousWorkDetails: RequiredStrings.EmptyString
	};
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
		private localisationService: LocalizationService,
		private submittalsDataService: SubmittalsDataService,
		private submittalService: SubmittalsService
	){}

	ngOnInit(){
		this.candidateDetailsForm.get('isPreviouslyWorked')?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((res:boolean) => {
			if(res && this.CandidateCardData)
				this.candidateDetailsForm.get('workHistoryDetails')?.setValue(this.candidateCardData.PreviousWorkDetails);
			else
				this.candidateDetailsForm.get('workHistoryDetails')?.setValue(RequiredStrings.EmptyString);
			this.isPreviouslyWorked = res;
			this.submittalsDataService.setValidationsCanDetails(this.isPreviouslyWorked);
		});

		this.candidateDetailsForm.get('workerClassification')?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((res: DropdownItem) => {
			if(res.Text == RequiredStrings.W2Employee.toString())
				this.submittalService.IsW2Employee.next(true);
		});
	}

	ngOnChanges(): void {
		if(this.CandidateCardData){
			this.candidateCardData = this.CandidateCardData;
			this.candidateDetailsForm.get('lastName')?.setValidators(null);
			this.candidateDetailsForm.get('firstName')?.setValidators(null);
			this.candidateDetailsForm.get('middleName')?.setValidators(null);
		}
	}

	public getLocaliseMessage(key:string){
		return this.localisationService.GetLocalizeMessage(key);
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public onExpandedCollapse(event:boolean){
		this.onExpandedChange.emit({card: 'iscandidateDetailsVisible', isCardVisible: event});
	}
}
