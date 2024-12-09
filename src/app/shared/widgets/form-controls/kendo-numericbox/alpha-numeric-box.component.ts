import '@progress/kendo-angular-intl/locales/en-IN/all';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, DoCheck } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';

import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';
import { IndexBuilderService } from '@progress/kendo-angular-treeview/index-builder.service';

@Component({
	selector: 'app-numeric-box',
	templateUrl: './alpha-numeric-box.component.html',
	styleUrls: ['./alpha-numeric-box.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class KendoNumericBoxComponent implements OnInit, DoCheck {
	kendoCheck: string = 'kendoCheckBox';

	formControl!: FormControl;

	@Input() label: string = '';
	@Input() isReadOnly: boolean = false;
	@Input() placeholder: string = '';

	@Input() format: string = '';

	@Input() isRequired: boolean = false;

	@Input() isEditMode: boolean = false;

	@Input() isCurrencyType: boolean = false;

	@Input() isPercentType: boolean;

	@Input() isDecimalType: boolean;

	@Input() isHtmlContent: boolean = false;

	@Input() min: number;

	@Input() step: number = magicNumber.zero;

	@Input() max: number;

	@Input() maxlength: number;

	@Input() decimals: number = magicNumber.zero;

	@Input() isDisable: boolean = false;

	@Input() tooltipTitle: string = '';

	@Input() tooltipVisible: boolean = false;

	// isAutoCorrect to disable negative value by default
	@Input() isAutoCorrect: boolean = true;

	@Input() isCurrency: boolean = false;

	@Input() countryId: number | undefined | null;

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Output() onNumericChange = new EventEmitter<any>();
	@Output() onNumericBlur = new EventEmitter<FocusEvent>();
	@Output() afterValueChanged = new EventEmitter<number>();

	currencyCode: string = '';

	@Input()
	set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}

	@Input() formatOptions: string = '';

	@Input() listControlName: any;

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];


	numberFormatEnum = CultureFormat.Number;
	private unsubscribe$ = new Subject<void>();
	constructor(
		private parentF: FormGroupDirective,
		private cd: ChangeDetectorRef
	) {
	}

	ngDoCheck(): void {
		if ((this.formControl?.touched && !this.formControl?.valid) || (this.listControlName?.touched && !this.listControlName?.valid)) {
			this.cd.markForCheck();
		}
	}

	ngOnInit(): void {
		this.applyDecimal();
		const initialValue = this.formControl?.value,
			numericValue = parseFloat(initialValue);
		if (!isNaN(numericValue)) {
			this.formControl?.setValue(numericValue);
		} else {
			this.formControl?.setValue('');
		}
		this.formControl?.statusChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
			this.cd.markForCheck();
		});
		this.listControlName?.statusChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
			this.cd.markForCheck();
		});
	}

	public applyDecimal() {
		if (this.decimals == Number(magicNumber.zero)) {
			this.formatOptions = '#';
			return;
		}

		let zero = '';
		for (let index = 0; index < this.decimals; index++) {
			zero = `${zero}0`;
		}
		this.formatOptions = `#.${zero}`;

	}

	public onChange(e: number) {
		this.onNumericChange.emit(e);
	}

	public onBlur(e: FocusEvent) {
		this.onNumericBlur.emit(e);
	}
	public onAfterValueChange(e: number) {
		this.afterValueChanged.emit(e);
	}
	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	  }

}
