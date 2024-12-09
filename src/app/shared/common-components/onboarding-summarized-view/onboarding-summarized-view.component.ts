import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OnboardingRequirementsService } from '@xrm-shared/services/onboarding-requirements.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-onboarding-summarized-view',
	templateUrl: './onboarding-summarized-view.component.html',
	styleUrls: ['./onboarding-summarized-view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingSummarizedViewComponent implements OnChanges, OnDestroy {
	@Input() entityId: number;
	@Input() recordId: number;
	@Input() sectorId: number;
	@Input() locationId: number;
	@Input() isDrugScreen: boolean;
	@Input() isBackgroundCheck: boolean;
	public isEditMode: boolean = true;
	public onboardingForm: FormGroup;
	public backgroundChecksItemList: any[] = [];
	public selectedBackgroundChecksItemList: any[] = [];

	public drugScreenRadioGroupArray: any = [
		{ Text: "Negative", Value: DrugStatusId.Negative },
		{ Text: "PositivewithException", Value: DrugStatusId.PositiveWithException },
		{ Text: "Pending", Value: DrugStatusId.Initiated },
		{ Text: "None", Value: DrugStatusId.None }
	];

	public backgroundCheckRadioFroupArray: any = [
		{ Text: "Completed", Value: BackgroundStatusId.Completed },
		{ Text: "Pending", Value: BackgroundStatusId.Pending },
		{ Text: "None", Value: BackgroundStatusId.None }
	];

	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	constructor(
		private onboardingService: OnboardingRequirementsService,
		private formBuilder: FormBuilder
	) {
		this.initializeOnboardingForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['recordId']) {
			if (changes['recordId'].currentValue) {
				this.getSelectedOnboardingCompliance();
			}
		}
	}

	private initializeOnboardingForm() {
		this.onboardingForm = this.formBuilder.group({
			drugScreenResultId: [null],
			drugResultDate: [null],
			backgroundCheckScreen: [null],
			backgroundResultDate: [null]
		});
	}

	private getSelectedOnboardingCompliance() {
		const data = {
			"xrmEntityId": this.entityId,
			"recordId": this.recordId
		};
		this.onboardingService.getSelectedOnboardingCompliance(data).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
			if (res.Succeeded) {
				this.patchSelectedOnboardingCompliance(res.Data);
			}
		});
	}

	private patchSelectedOnboardingCompliance(data: any) {
		// // patch drug screen
		this.onboardingForm.patchValue({
			'drugScreenResultId': data?.DrugScreenResultId,
			'drugResultDate': data?.DrugResultDate
				? (new Date(data?.DrugResultDate))
				: null
		});

		// // patch background check
		this.onboardingForm.patchValue({
			'backgroundCheckScreen': data?.BackgroundCheckId,
			'backgroundResultDate': data?.BackgroundResultDate
				? (new Date(data?.BackgroundResultDate))
				: null
		});

		// // patch background check items
		this.selectedBackgroundChecksItemList = data?.ComplianceOnboardingItemGetDto;
		this.getBackgroundCheckItemsBasedOnSecLoc();
	}

	private getBackgroundCheckItemsBasedOnSecLoc() {
		const data = {
			locId: this.locationId,
			secId: this.sectorId
		};
		this.onboardingService.getOnboardingRequirements(data).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: any) => {
			if (res.Succeeded) {
				this.backgroundChecksItemList = res.Data
					? res.Data.OnboardingRequirementItems
					: [];
				if (this.backgroundChecksItemList.length > 0) {
					this.prepareBackgroundCheckItemsList();
				}
			}
		});
	}

	private prepareBackgroundCheckItemsList() {
		this.backgroundChecksItemList.forEach((item) => {
			const selectedItem = this.selectedBackgroundChecksItemList.find((element) =>
				element.SectorComplianceItemId === item.SectorComplianceItemId);
			item['ComplianceCheckValue'] = selectedItem
				? selectedItem.ComplianceCheckValue
				: false;
			item['IsVisibleToClient'] = selectedItem
				? selectedItem.IsVisibleToClient
				: false;
		});
	}

	// when page destroy unsubscribe all the action which are subscribed above on this page
	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

}

const DrugStatusId = {
		Positive: 87,
		Negative: 88,
		PositiveWithException: 198,
		None: 199,
		Initiated: 200,
		Completed: 216
	},
	BackgroundStatusId = {
		Completed: 217,
		Pending: 211,
		None: 201,
		Initiated: 202
	};
