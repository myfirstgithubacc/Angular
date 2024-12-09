import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SubmittalsService } from '../../services/submittals.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { GenericResponseBaseWithValidationMessage } from '@xrm-core/models/responseTypes/generic-response.interface';
import { BenefitAdder, CalculatedRatesResponse, CalculateRatesPayload, CardVisibilityKeys, MarkUpRateData } from '../../services/Interfaces';
import { RequiredStrings, ValidationMessageKeys } from '../../services/Constants.enum';

@Component({
	selector: 'app-rate-details-markup',
	templateUrl: './rate-details-markup.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RateDetailsMarkupComponent implements OnInit, OnDestroy {

	@Input() rateDetailsMarkupForm:FormGroup;
	@Input() markUpRateData: MarkUpRateData;
	@Input() isCardVisible: boolean;
	@Input() benefitAdderData: BenefitAdder[];
	@Output() onExpandedChange = new EventEmitter<{ card: CardVisibilityKeys; isCardVisible: boolean }>();

	public RadioValues = [
		{ Text: RequiredStrings.TimeAndOneHalfNonExempt, Value: magicNumber.sixtyTwo },
		{ Text: RequiredStrings.StraightTimeExempt, Value: magicNumber.sixtyOne }
	];
	public markUpNte: number = magicNumber.zeroDecimalZero;
	public reqNte: number = magicNumber.zeroDecimalZero;
	public shiftDifferential:string;
	public rateUnit:string = RequiredStrings.Hour;
	public currencyCode:string = RequiredStrings.USD;
	private unsubscribe$: Subject<void> = new Subject<void>();
	private errorShownBwr = false;
	private errorShownMarkUp = false;
	public nteLabel: string = RequiredStrings.RequisitionNTE;
	public isBWRDisabled: boolean = false;

	constructor(
		private localisationService:LocalizationService,
		private submittalService: SubmittalsService
	){}

	ngOnInit(): void {
		this.markUpNte = this.markUpRateData.MarkUpNte;
		this.reqNte = this.markUpRateData.ReqNte;
		this.shiftDifferential = this.markUpRateData.ShiftDifferentialMethod;
		this.currencyCode = this.markUpRateData.CurrencyCode;
		this.rateUnit = this.markUpRateData.RateUnit;
		this.nteLabel = this.markUpRateData.IsTargetBillRate
			? RequiredStrings.TargetBillRate
			: RequiredStrings.RequisitionNTE;
		this.isBWRDisabled = (this.markUpRateData.BaseWageRate != parseInt(magicNumber.zero.toString()) && this.markUpRateData.BaseWageRate != null);
		this.rateDetailsMarkupForm.get('reqNte')?.setValue(this.reqNte);


		//could not be made in forkJoin
		this.rateDetailsMarkupForm.get('baseWageRate')?.valueChanges
			.pipe(takeUntil(this.unsubscribe$), debounceTime(magicNumber.fiveHundred)).subscribe(() => {
				this.calculateRates(true);
			});
		this.rateDetailsMarkupForm.get('markUp')?.valueChanges
			.pipe(takeUntil(this.unsubscribe$), debounceTime(magicNumber.fiveHundred)).subscribe(() => {
				this.calculateRates(false);
			});
		this.subscribeSubmitButton();
	}

	public getLocaliseMessage(key:string, placeholder1:string|null = null, placeholder2: string|null = null ): string{
		let localisedMessage: string = this.localisationService.GetLocalizeMessage(key);

		if(placeholder1 && !placeholder2){
			const dynamicParam:DynamicParam[] = [{Value: placeholder1, IsLocalizeKey: false}];
			localisedMessage = this.localisationService.GetLocalizeMessage(key, dynamicParam);
		}
		else if(placeholder1 && placeholder2){
			const dynamicParam:DynamicParam[] = [{Value: placeholder1, IsLocalizeKey: false}, {Value: placeholder2, IsLocalizeKey: false}];
			localisedMessage = this.localisationService.GetLocalizeMessage(key, dynamicParam);
		}

		return localisedMessage;
	}

	public calculateRates(isWageRateChange: boolean): void{
		const payload: CalculateRatesPayload = {
			StaffingAgencyId: this.markUpRateData.StaffingAgencyId,
			RequestId: this.markUpRateData.RequestId,
			SubmittedMarkup: this.rateDetailsMarkupForm.get('markUp')?.value,
			BaseWageRate: this.rateDetailsMarkupForm.get('baseWageRate')?.value
		};
		this.submittalService.calculateRates(payload)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBaseWithValidationMessage<CalculatedRatesResponse>) => {
				if(res.Succeeded && res.Data){
					this.rateDetailsMarkupForm.get('actualWageRate')?.setValue(res.Data.ActualStWageRate);
					this.rateDetailsMarkupForm.get('billRate')?.setValue(res.Data.StaffingAgencyStBillRate);
					if(!this.markUpRateData.IsTargetBillRate)
						this.validateBillRate(isWageRateChange, res.Data.StaffingAgencyStBillRate);
				}
				this.manageFlags(isWageRateChange);
				this.submittalService.CalculatedRates.next(res);
			});
	}

	private validateBillRate(isWageRateChange: boolean, stBillRate: number): void{
		const exceedsNTE = stBillRate > this.reqNte,
			errorMessage = this.getErrorMessage(stBillRate, isWageRateChange);

		if (exceedsNTE) {
			const field = isWageRateChange
				? 'baseWageRate'
				: 'markUp';
			if (isWageRateChange && this.errorShownBwr && this.rateDetailsMarkupForm.get(field)?.errors?.['message'] === undefined) {
				this.setError(field, errorMessage);
			} else if (
				!isWageRateChange
				&& this.errorShownMarkUp
				&& this.rateDetailsMarkupForm.get(field)?.errors?.['message'] === undefined
			) {
				this.setError(field, errorMessage);
			}
		} else {
			const fieldsToCheck = ['baseWageRate', 'markUp'];
			fieldsToCheck.forEach((item) => {
				if (this.rateDetailsMarkupForm.get(item)?.errors?.['message'].includes('Calculated Bill Rate')) {
					this.setError(item, null);
				}
			});
		}
	}

	private getErrorMessage(stBillRate: number, isWageRateChange: boolean): string{
		return this.localisationService.GetLocalizeMessage(
			ValidationMessageKeys.BillRateCannotExceedNTE,
			[
				{
					Value: stBillRate.toFixed(magicNumber.two).toString(),
					IsLocalizeKey: true
				},
				{
					Value: this.markUpRateData.IsTargetBillRate?
						'TargetBillRate'
						: 'RequisitionNTE',
					IsLocalizeKey: true
				},
				{
					Value: this.reqNte.toFixed(magicNumber.two).toString(),
					IsLocalizeKey: true
				},
				{
					Value: isWageRateChange
						? 'BaseWageRateLbl'
						: 'MarkUpPer',
					IsLocalizeKey: true
				}
			]
		);
	}

	private manageFlags(isWageRateChange: boolean): void{
		if (isWageRateChange) {
			this.errorShownBwr = true;
		} else {
			this.errorShownMarkUp = true;
		}
	}

	private setError(controlName: string, message:string|null): void {
		if(message){
			this.rateDetailsMarkupForm.get(controlName)?.setErrors({
				error: true,
				message: message
			});
		}
		else{
			this.rateDetailsMarkupForm.get(controlName)?.setErrors(null);
			this.rateDetailsMarkupForm.get(controlName)?.markAsTouched();
			this.rateDetailsMarkupForm.get(controlName)?.updateValueAndValidity();
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public onExpandedCollapse(event:boolean): void{
		this.onExpandedChange.emit({card: 'israteDetailsMarkupVisible', isCardVisible: event});
	}

	private subscribeSubmitButton(): void{
		this.submittalService.IsWageRateChange.pipe(takeUntil(this.unsubscribe$)).subscribe((res:boolean) => {
			this.validateBillRate(res, this.submittalService.CalculatedRates.value?.Data?.StaffingAgencyStBillRate ?? magicNumber.zero);
		});
	}

}
