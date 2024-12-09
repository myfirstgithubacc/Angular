import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-kendo-masked-textbox',
	templateUrl: './kendo-masked-textbox.component.html',
	styleUrls: ['./kendo-masked-textbox.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoMaskedTextboxComponent {
	formControl: FormControl;

	@Input() maskFormat: string;
	@Input() isEditMode: boolean = true;
	@Input() isZipCode: boolean = false;
	@Input() isRequired: boolean = false;
	@Input() isHtmlContent: boolean = false;
	@Input() tooltipVisible: boolean = false;
	@Input() listControlName: FormControl;
	@Input() label: string = '';
	@Input() tooltipTitle: string = '';
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() addOnLabelText: string = '';
	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];
	@Input() countryId: number | undefined | null = null;
	@Input() isDisabled: boolean;
	@Input() zipCodeFormat: string = '';
	@Input() zipLengthSeries: number | undefined | null = null;
	@Input()
	set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}
	@Output() blurMask = new EventEmitter<FocusEvent>();
	@Output() focusMask = new EventEmitter<FocusEvent>();
	@Output() changeValue = new EventEmitter();

	zipCodeLength: any;
	maskValidation = false;
	value: string = '';
	isClicked = false;


	// eslint-disable-next-line max-params
	constructor(
		private parentF: FormGroupDirective,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnChanges(changes: SimpleChanges) {
		if (this.isDisabled) {
			this.formControl.disable();
		}

		if (!this.countryId) {
			this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		}

		this.updateMaskFormat();

	}

	ngDoCheck(): void {
		if(this.formControl?.touched && !this.formControl?.valid){
			this.cdr.markForCheck();
		}
	}

	private updateMaskFormat() : void {
		if (!this.isZipCode && !this.maskFormat.trim()) {
		  this.isDisabled = true;
		  return;
		}

		this.zipCodeLength = this.localizationService.GetCulture(CultureFormat.ZipLengthSeries, this.countryId);
		this.zipCodeFormat = this.localizationService.GetCulture(CultureFormat.ZipFormat, this.countryId);

		if (!this.zipCodeFormat) {
		  return;
		}

		this.zipCodeLength = this.zipCodeLength.toString().split(',');
		let maxLen = Math.max.apply(magicNumber.zero, this.zipCodeLength),
		  valLen = 0;
		if (this.formControl.value) {
		  valLen = this.formControl.value.trim().length;
		  if (valLen > Number(magicNumber.zero) && this.zipCodeLength.includes(valLen.toString())) {
				maxLen = valLen;
		  }
		}

		this.maskFormat = this.localizationService.GetZipMasking(this.zipCodeFormat, maxLen);
	  }

	public onFocus(e: FocusEvent) {
		this.focusMask.emit(e);

		if (this.isZipCode && this.formControl.value != null && this.formControl.value != undefined) {
			const maxLen = Math.max.apply(magicNumber.zero, this.zipCodeLength);
			this.maskFormat = this.localizationService.GetZipMasking(this.zipCodeFormat, maxLen);
		}
	}

	public onBlur(e: FocusEvent) {
		this.blurMask.emit(e);

		if (this.isZipCode && this.formControl.value != null && this.formControl.value != undefined) {
			const valLen = this.formControl.value.trim().length.toString();
			if (valLen > magicNumber.zero && this.zipCodeLength.includes(valLen)) {
				this.maskFormat = this.localizationService.GetZipMasking(this.zipCodeFormat, valLen);
			}
		}
	}

}
