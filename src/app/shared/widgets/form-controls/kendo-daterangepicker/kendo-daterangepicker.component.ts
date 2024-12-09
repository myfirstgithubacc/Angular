import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DateRangeService } from '@progress/kendo-angular-dateinputs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { dateUTC } from '@xrm-shared/Utilities/common-utils';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';
import { RangeDataType } from '@xrm-shared/models/dropdown.model';
@Component({selector: 'app-kendo-daterangepicker',
	templateUrl: './kendo-daterangepicker.component.html',
	styleUrls: ['./kendo-daterangepicker.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoDaterangepickerComponent implements OnInit {
	public formControlStartDate!: FormControl;

	public formControlEndDate!: FormControl;

	@ViewChild('daterange', { read: DateRangeService })

	public service: DateRangeService;

	@Input() label: string = '';

	@Input() fromLabel: string = 'FromDate';

	@Input() toLabel: string = 'ToDate';

	@Input() isEditMode: boolean = false;

	@Input() isDisable: boolean;

	@Input() tooltipTitle: string;

	@Input() tooltipVisible: boolean;

	dateFormatEnum = CultureFormat.DateFormat;

	timeFormatEnum = CultureFormat.TimeFormat;

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() range: RangeDataType = { start: null, end: null };

	@Input() maxDate: Date;

	@Input() minDate: any = new Date(1980, 2, 10);

	@Input() listControlStartDateName: FormControl | undefined;

	@Input() listControlEndDateName: FormControl | undefined;

	@Input() isHtmlContent: boolean = false;

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	public customClassTo: string = '';
	public customClass: string = '';
	public dynamicColor: string = '#383c40';
	public dynamicColorTo: string = '#383c40';

	public kendoDateRangePickerLable: string = '';
	private unsubscribe$ = new Subject<void>();
	@Input()
	set startDateControlName(value: string) {
		this.formControlStartDate = this.parentF.form.get(value) as FormControl;
		if(this.formControlStartDate.value)
			this.formControlStartDate.setValue(new Date(this.formControlStartDate.value), { emitEvent: false });
		if((typeof this.formControlStartDate.value != 'string') && (this.formControlStartDate.value != null))
			this.formControlStartDate.value?.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
		dateUTC(this.formControlStartDate.value);
	}

	@Input()
	set endDateControlName(value: string) {
		this.formControlEndDate = this.parentF.form.get(value) as FormControl;
		if(this.formControlEndDate.value)
			this.formControlEndDate.setValue(new Date(this.formControlEndDate.value), { emitEvent: false });
		if((typeof this.formControlEndDate.value != 'string') && (this.formControlEndDate.value != null))
			this.formControlEndDate.value?.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
		dateUTC(this.formControlEndDate.value);
	}

	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() onOpen: EventEmitter<any> = new EventEmitter<any>();
	@Output() onClose: EventEmitter<any> = new EventEmitter<any>();
	@Output() onBlur: EventEmitter<any> = new EventEmitter<any>();

	isPopupOpen: boolean = false;

	public dateFormat: string;

	public placeholderFormat: any;

	constructor(
		private localizationSrv: LocalizationService,
		private parentF: FormGroupDirective,
		private elementRef: ElementRef,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef
	) {
	}

	ngOnInit(): void {
		this.dateFormatApply();

		this.formControlStartDate.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val: any) => {
			const newValue = this.localizationSrv.TransformDate(val, 'MM/dd/yyyy');
			this.formControlStartDate.setValue(newValue, { emitEvent: false });
			this.addCustomClass(true);
		});

		this.formControlEndDate.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val: any) => {
			const newValue = this.localizationSrv.TransformDate(val, 'MM/dd/yyyy');
			this.formControlEndDate.setValue(newValue, { emitEvent: false });
			this.addCustomClass(false);
		});

	}
	addCustomClass(isStartDate: boolean) {
		const value = isStartDate
				? this.formControlStartDate.value
				: this.formControlEndDate.value,
		 prefix = isStartDate
				? ''
				: 'To',
		 color = value
				? '#383c40'
				: '#bfbfbf',
		 classSuffix = value
				? 'dark'
				: 'light';

		this[`customClass${prefix}`] = `custom-highlight-${classSuffix}`;
		this[`dynamicColor${prefix}`] = color;

		this.cdr.detectChanges();
	}

	ngAfterViewInit() {
		const startDate = this.formControlStartDate.value,
			endDate = this.formControlEndDate.value;

		this.formControlStartDate.setValue(startDate);
		this.formControlEndDate.setValue(endDate);
	}

	public dateFormatApply() {
		this.dateFormat = this.localizationService.GetCulture(CultureFormat.DateFormat);
		this.placeholderFormat = this.localizationService.GetCulture(CultureFormat.DatePlaceholder);
		if (this.listControlStartDateName && isNaN(this.listControlStartDateName.value)) {
			if (this.isEditMode) {
				this.kendoDateRangeLabel();
			}
			this.listControlStartDateName.setValue(null);
			this.formControlStartDate.setValue(null);
			if (this.listControlEndDateName && isNaN(this.listControlEndDateName.value)) {
				this.listControlEndDateName.setValue(null);
			}
			else {
				this.formControlEndDate.setValue(null);
			}
		}
	}

	public kendoDateRangeLabel(): void {
		let startValue =
			this.listControlStartDateName
				? this.listControlStartDateName.value
				: this.formControlStartDate.value,
			endValue = this.listControlEndDateName
				? this.listControlEndDateName.value
				: this.formControlEndDate.value;

		startValue = this.localizationService.TransformData(startValue, CultureFormat.DateFormat);
		endValue = this.localizationService.TransformData(endValue, CultureFormat.DateFormat);
		this.kendoDateRangePickerLable = `${startValue} - ${endValue}`;
	}

	OnChange(event: any, type: any) {
		if (type == "to") {
			if((typeof this.formControlEndDate.value != 'string') && (this.formControlEndDate.value != null))
				this.formControlEndDate.value?.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
			dateUTC(this.formControlEndDate.value);
			this.dateRangePopupClose(null);
			this.addCustomClass(false);
		}
		if((typeof this.formControlStartDate.value != 'string') && (this.formControlStartDate.value != null))
			this.formControlStartDate.value?.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
		dateUTC(this.formControlStartDate.value);
		this.onChange.emit(event);
		this.addCustomClass(true);
	}

	open() {
		const fieldWithError = this.elementRef.nativeElement.querySelector('#daterange'),
			inputDate = fieldWithError.querySelector('.k-dateinput'),
			input = inputDate.querySelector('.k-input-inner');
		input?.blur();
	}

	close() {
		const fieldWithError = this.elementRef.nativeElement.querySelector('#startDate'),
			inputDate = fieldWithError.querySelector('.k-dateinput'),
			input = inputDate.querySelector('.k-input-inner');
		input?.blur();
	}

	resetDateControl() {
		this.range.start = null;
		this.range.end = null;

		this.formControlStartDate.setValue(null);
		this.formControlEndDate.setValue(null);
		this.dateRangePopupClose(null);
	}

	dateRangePopupOpen(evt: any) {
		this.isPopupOpen = true;
		this.onOpen.emit(evt);
	}

	dateRangePopupClose(evt: any) {
		this.isPopupOpen = false;
		this.onClose.emit(evt);
	}

	dateRangeBlur(evt: any) {
		this.onBlur.emit(evt);
	}
	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
