import { ChangeDetectorRef, Component, Input, OnInit, ChangeDetectionStrategy, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Position } from '@progress/kendo-angular-tooltip';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'tooltip-content',
	templateUrl: './tooltip-content.component.html',
	styleUrls: ['./tooltip-content.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class TooltipContentComponent implements OnInit {
	@Input() label: string = '';

	@Input() tooltipTitle: string | undefined | null='';

	@Input() value: string | undefined | null = null;

	@Input() forProperty: string;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	@Input() tooltipPosition: Position | null | undefined | any;

	@Input() isHtmlContent: boolean = false;

	@Input() isCurrency: boolean = false;

	@Input() tooltipVisible: boolean = false;

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() countryId: number | undefined | null = magicNumber.zero;

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	@Input() isRequired: boolean = false;

	constructor(private localizationService: LocalizationService, private cdr: ChangeDetectorRef, private translateService: TranslateService) { }

	ngOnInit(): void {

		if (this.tooltipTitle == undefined) {
			this.tooltipTitle = '';
		}

		if (!this.label) {
			this.label = '';
		}

		if (this.tooltipPosition == undefined) {
			this.tooltipPosition = 'top';
		}
	}

	ngDoCheck(): void {
	    const labelText = this.getLabelText();
		if (labelText.trim() !== '') {
			this.cdr.markForCheck();
		}
	}

	getObject(array: DynamicParam[]): any {
		if (array.length == Number(magicNumber.zero)) return null;
		return this.localizationService.GetParamObject(array);
	}

	getLabelText() {
		if (!this.label)
			return '';

		if (!this.isCurrency && this.addOnLabelText.length == Number(magicNumber.zero))
			return this.localizationService.GetLocalizeMessage(this.label, this.labelLocalizeParam);

		const code = this.applyCurrency();
		let result = this.localizationService.GetLocalizeMessage(this.label, this.labelLocalizeParam);

		if (this.isCurrency && code != '')
			result = result + code;

		if (this.addOnLabelText.length != Number(magicNumber.zero))
			result = `${result} (${this.localizationService.GetLocalizeMessage(this.addOnLabelText, this.addOnLabelTextLocalizeParam)})`;

		return result;
	}

	applyCurrency() {
		if (!this.isCurrency)
			return '';

		if (this.countryId == undefined || this.countryId == null || this.countryId == magicNumber.zero)
			this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);

		const currencyCode = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);

		if (currencyCode == null) {
			// eslint-disable-next-line no-console
			console.error("Country currency code not found.");
			return '';
		}

		return ` (${currencyCode})`;
	}

}
