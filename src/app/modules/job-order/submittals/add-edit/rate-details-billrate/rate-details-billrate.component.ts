import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { BenefitAdder, BillRateData, CardVisibilityKeys } from '../../services/Interfaces';
import { RequiredStrings } from '../../services/Constants.enum';

@Component({
	selector: 'app-rate-details-billrate',
	templateUrl: './rate-details-billrate.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RateDetailsBillrateComponent implements OnInit {

	@Input() rateDetailsBillrateForm:FormGroup;
	@Input() billRateData: BillRateData;
	@Input() isCardVisible: boolean;
	@Input() benefitAdderData: BenefitAdder[];
	@Output() onExpandedChange = new EventEmitter<{ card: CardVisibilityKeys; isCardVisible: boolean }>();

	public reqNte: number = magicNumber.zeroDecimalZero;
	public rateUnit:string = RequiredStrings.Hour;
	public currencyCode:string = RequiredStrings.USD;
	public nteLabel: string = RequiredStrings.RequisitionNTE;

	constructor(private localisationService:LocalizationService){}

  	public RadioValues = [
		{ Text: RequiredStrings.TimeAndOneHalfNonExempt, Value: magicNumber.sixtyTwo },
		{ Text: RequiredStrings.StraightTimeExempt, Value: magicNumber.sixtyOne }
	];

	ngOnInit(): void {
		this.reqNte = this.billRateData.ReqNte;
		this.currencyCode = this.billRateData.CurrencyCode;
		this.rateUnit = this.billRateData.RateUnit;
		this.nteLabel = this.billRateData.IsTargetBillRate
			? RequiredStrings.TargetBillRate
			: RequiredStrings.RequisitionNTE;
		this.rateDetailsBillrateForm.get('reqNte')?.setValue(this.reqNte);
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

	public onExpandedCollapse(event:boolean){
		this.onExpandedChange.emit({card: 'israteDetailsBillrateVisible', isCardVisible: event});
	}
}
