import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SubmittalsService } from '../../services/submittals.service';
import { debounceTime, Subject, switchMap, takeUntil } from 'rxjs';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CardVisibilityKeys, RecruiterContactInfo } from '../../services/Interfaces';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({
	selector: 'app-recruiter-details',
	templateUrl: './recruiter-details.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruiterDetailsComponent implements OnInit, OnDestroy {
	@Input() recruiterDetailForm:FormGroup;
	@Input() recruiterNameList: DropdownItem[];
	@Input() isCardVisible: boolean;
	@Output() onExpandedChange = new EventEmitter<{ card: CardVisibilityKeys; isCardVisible: boolean }>();

	public entityId:number = XrmEntities.Submittal;
	public countryId:number = parseInt(magicNumber.zero.toString());

	private unsubscribe$: Subject<void> = new Subject<void>();


	constructor(
		private localisationService:LocalizationService,
		private submittalService: SubmittalsService
	){}

	ngOnInit(): void {
		this.recruiterDetailForm.get('recruiterName')?.valueChanges.pipe(switchMap((res:DropdownItem) => {
			return this.submittalService.getRecruiterDetails(parseInt(res.Value));
		}), takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<RecruiterContactInfo>) => {
			this.onChangeRecruiter(res);
		});

		this.recruiterDetailForm.get('recruiterEmail')?.valueChanges.pipe(switchMap((res: string) => {
			return this.submittalService.checkEmailDomain({Email: res});
		}), takeUntil(this.unsubscribe$), debounceTime(magicNumber.oneThousandTwentyFour)).subscribe((res: GenericResponseBase<boolean>) => {
			if(typeof res.Data == 'boolean')
				this.submittalService.IsEmailValid.next(res.Data);
		});
	}

	public getLocaliseMessage(key:string, placeholder1:string|null = null, placeholder2: string|null = null ){
		let localisedMessage = this.localisationService.GetLocalizeMessage(key);

		if(placeholder1 && !placeholder2){
			const dynamicParam:DynamicParam[] = [{Value: placeholder1, IsLocalizeKey: false}];
			localisedMessage = this.localisationService.GetLocalizeMessage(key, dynamicParam);
		}

		if(placeholder1 && placeholder2){
			const dynamicParam:DynamicParam[] = [{Value: placeholder1, IsLocalizeKey: false}, {Value: placeholder2, IsLocalizeKey: false}];
			localisedMessage = this.localisationService.GetLocalizeMessage(key, dynamicParam);
		}

		return localisedMessage;
	}

	public onChangeRecruiter(res: GenericResponseBase<RecruiterContactInfo>){
		if(res.Succeeded && res.Data){
			if(this.submittalService.IsChangeRecruiterDetails.value){
				this.recruiterDetailForm.get('recruiterPhoneNumber')?.setValue(res.Data.PhoneNumber);
				this.recruiterDetailForm.get('recruiterPhoneNumberExt')?.setValue(res.Data.PhoneNumberExt);
				this.recruiterDetailForm.get('recruiterEmail')?.setValue(res.Data.Email);
			}
			this.countryId = res.Data.CountryId;
		}
		this.submittalService.IsChangeRecruiterDetails.next(true);
	}

	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public onExpandedCollapse(event:boolean){
		this.onExpandedChange.emit({card: 'isrecruiterDetailVisible', isCardVisible: event});
	}

}
