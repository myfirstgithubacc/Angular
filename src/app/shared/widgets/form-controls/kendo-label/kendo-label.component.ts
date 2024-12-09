import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';
import { IValueComponent } from '@xrm-shared/Utilities/value.interface';
import { Position } from '@progress/kendo-angular-tooltip/models/position.type';
@Component({
	selector: 'app-kendo-label',
	templateUrl: './kendo-label.component.html',
	styleUrls: ['./kendo-label.component.scss'],
	providers: [AuthCommonService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoLabelComponent implements OnInit {
	@Input() label: string | number;

	@Input() value: any;

	@Input() additionallabel : string;
	@Input() additionallabelLocalizeParam : DynamicParam[] = [];
	@Input() extValue: string | null = '';

	@Input() valueItems: IValueComponent[] = [];

	@Input() tooltipTitle: string = '';

	@Input() tooltipLabelValue: string = '';

	@Input() tooltipPosition?: Position;

	@Input() tooltipVisible: boolean = false;

	@Input() isTooltiplableValueVisible: boolean;

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() countryId: number | undefined | null = magicNumber.zero;

	@Input() isDate: boolean = false;

	@Input() isTime: boolean = false;

	@Input() isDateTime: boolean = false;

	@Input() isCurrency: boolean = false;

	@Input() isNumber: boolean = false;

	@Input() isPhone: boolean = false;

	@Input() isExtension: boolean = false;


	@Input() decimalPlaces: number = magicNumber.two;

	@Input() xrmEntityId: number = magicNumber.zero;

	@Input() entityType: string = '';

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	@Input() fieldName: string | null = null;
	@Input() tooltipTitleParams: DynamicParam[] = [];
	@Input() allowMultilineText: boolean = false;
	@Input() hideIfCount: number | null = null;
  
	public truncatedValue: string = '';
	public showFullText: boolean = false;
	public phoneMask: string | null = null;
	public phoneExtMask: string | null = null;

	currencyCode: string;
	isRendered: boolean = true;
	objString: string = '';

	constructor(
		public localizationService: LocalizationService,
		private commonService: AuthCommonService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnChanges() {
		if (this.countryId == undefined || this.countryId == Number(magicNumber.zero))
			this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);

		this.phoneMask = this.localizationService.GetCulture(CultureFormat.PhoneFormat, this.countryId);
		this.phoneExtMask = this.localizationService.GetCulture(CultureFormat.PhoneExtFormat, this.countryId);

		this.applyCulture();
	}

	ngOnInit() {
		this.manageAuthorization();
		if (this.tooltipPosition == undefined) {
			this.tooltipPosition = 'top';
		}
		this.truncateText();
		// this.applyCulture();
	}
	public getValueItemsLength(): number {
		return this.valueItems.reduce((total, item) => 
		  total + (item.text?.length || 0) + (item.value?.toString().length || 0), 0);
	  }
	
	  private truncateText() {
		if (this.hideIfCount && typeof this.value === 'string' && this.value.length > this.hideIfCount) {
		  this.truncatedValue = `${this.value.slice(0, this.hideIfCount) }...`;
		  this.showFullText = false;
		} else {
		  this.truncatedValue = this.value;
		  this.showFullText = true;
		}
		this.cdr.markForCheck();
	  }
	
	  public toggleFullText() {
		this.showFullText = !this.showFullText;
		this.cdr.markForCheck();
	  }

	manageAuthorization() {

		if (this.xrmEntityId == Number(magicNumber.zero) || this.fieldName == null)
			return;

		const result = this.commonService.manageAuthentication({
			xrmEntityId: this.xrmEntityId,
			entityType: this.entityType,
			fieldName: this.fieldName
		});
		this.isVisibleorEditable(result);
	}

	isVisibleorEditable(result: any) {
		if (result == null) {
			this.isRendered = true;
			return;
		}
		if (result) {
			this.isRendered = result.isViewable;
			if (!this.isRendered)
				return;
		}
	}

	getObject(object: DynamicParam[] | null | undefined): any {
		if (!object)
			return null;

		if (object.length == Number(magicNumber.zero)) return null;
		return this.localizationService.GetParamObject(object);
	}
	applyCulture() {
		if (this.isDate) {
			this.value =
				this.localizationService.TransformData(this.value, CultureFormat.DateFormat);
			return;
		}

		if (this.isTime && this.value) {
			this.value =
			this.localizationService.TransformData(this.value, CultureFormat.TimeFormat);
			return;
		}
		if (this.isNumber) {
			this.value =
				this.localizationService.TransformNumber(this.value, this.decimalPlaces, this.countryId);
			return;
		}

		if (this.isCurrency) {
			this.currencyCode = '';
			const code = this.applyCurrency();
			if (code != null)
				this.currencyCode = code;
			this.label =
				this.localizationService.GetLocalizeMessage(this.label, this.labelLocalizeParam);
		}

		if (this.allowMultilineText) {
			this.formatValueWithLineBreaks();
		}
	}

	getLocalizedadditionallabel(): string {
		const localizedMessage = this.localizationService.GetLocalizeMessage(this.additionallabel, this.additionallabelLocalizeParam);
		return localizedMessage;
	  }

	private formatValueWithLineBreaks() {
		if (!this.value) {
			this.value = '';
			return;
		}
		if (typeof this.value === 'string') {
			this.value = this.value.replace(/\n/g, '<br/>');
		} else {
			this.value = String(this.value);
		}
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
			return null;

		if (!this.countryId)
			this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);

		const currencyCode = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);

		if (currencyCode == null) {

			console.error("Country currency code not found.");
			return '';
		}

		return ` (${currencyCode})`;
	}

	public getFormatedNumber() {
		return this.localizationService.TransformNumber(this.value, this.decimalPlaces, this.countryId);
	}

}

