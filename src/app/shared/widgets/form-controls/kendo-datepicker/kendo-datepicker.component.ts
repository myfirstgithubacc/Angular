import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ChangeDetectionStrategy, SimpleChange } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { dateUTC } from '@xrm-shared/Utilities/common-utils';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { DatePickerService } from './datepicker.service';
import { Day } from "@progress/kendo-date-math";

@Component({
	selector: 'app-kendo-datepicker',
	templateUrl: './kendo-datepicker.component.html',
	styleUrls: ['./kendo-datepicker.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoDatepickerComponent implements OnInit, AfterViewInit {
	public formControl!: FormControl;

	minDate1: Date = new Date(magicNumber.nineteenHundred, magicNumber.one, magicNumber.one);

	maxDate1: Date = new Date(
		magicNumber.twoThousandninetynine,
		magicNumber.tweleve, magicNumber.thirtyOne
	);

	@Input() isRequired: boolean;
	@Input() disabledDates: ((date: Date) => boolean) | Date[] | Day[] | any;
	@Input() label: string = '';

	@Input() isEditMode: boolean = false;

	@Input()
	set isDisabled(value: boolean) {
		if (value && this.formControl) {
			this.formControl.disable();
		}
	}

	@Input() tooltipTitle: string;

	@Input() tooltipVisible: boolean;

	@Input() minDate: Date | string | null | undefined = null;

	@Input() maxDate: Date |string | null | undefined = null;

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() listControlName: any;

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	@Input() isHtmlContent: boolean = false;
	@Input() getFormattedDate: boolean = false;
	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() onBlur: EventEmitter<any> = new EventEmitter<any>();

	@Input()
	set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
		this.datePickerService.addDatePickerField(value);
		this.datePickerService.addFieldMapping('startDate', 'StartDate');
		this.datePickerService.addFieldMapping('effectiveDateForLunchConfiguration', 'effectiveDateForLunchConfig');
		this.datePickerService.addFieldMapping('AssignmentStartDate', 'assignmentStartDate');
		this.datePickerService.addFieldMapping('AssignmentEndDate', 'assignmentEndDate');
		if (this.isDisabled) {
			this.formControl.disable();
		}
	}
	private unsubscribe$ = new Subject<void>();
	public dateFormat: string;

	public placeholderFormat: any;
	dateFormatEnum = CultureFormat.DateFormat;
	public customClass: string = '';
	public dynamicColor: string = '#383c40';
	private debounceTimer = new Subject<any>();

	constructor(
		private parentF: FormGroupDirective,
		private localizationSrv: LocalizationService,
		private elementRef: ElementRef,
		private cdr: ChangeDetectorRef,
		private datePipe: DatePipe,
		private datePickerService: DatePickerService
	) { }

	ngOnInit(): void {
		this.dateFormat = this.localizationSrv.GetCulture(CultureFormat.DateFormat);
		this.placeholderFormat = this.localizationSrv.GetCulture(CultureFormat.DatePlaceholder);

		if (this.minDate != null) this.minDate1 = new Date(this.minDate);
		if (this.maxDate != null) this.maxDate1 = new Date(this.maxDate);

		if (this.listControlName) {
			if (isNaN(this.listControlName.value)) {
				this.listControlName.setValue(null);
			}
		} else if (isNaN(this.formControl.value)) {
			this.formControl.setValue(null);
		}

		this.formControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val: any) => {
			this.addCustomClass();
			this.cdr.markForCheck();
			try {
				if (val) {
					this.setDateInControl(val);
				}
			} catch (error) {
				this.setDateInControl(val);
			}

		});

		this.debounceTimer.pipe(debounceTime(magicNumber.fiveHundred), takeUntil(this.unsubscribe$))
			.subscribe((event: any) => {
				if (this.getFormattedDate) {
					this.OnFormattedDate(event);
				} else {
					this.onChange.emit(this.formControl.value);
				}
			});

	}
	ngDoCheck(): void {
		if ((this.formControl?.touched && !this.formControl?.valid) || (this.listControlName?.touched && !this.listControlName?.valid)) {
			this.cdr.markForCheck();
		}
	}
	ngAfterViewInit() {
		const newValue = this.formControl.value;
		this.formControl.setValue(newValue);
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();

	}


	ngOnChanges(changes: SimpleChange) {
		if (changes.currentValue?.controlName)
			this.datePickerService.addDatePickerField(changes.currentValue.controlName);
		this.datePickerService.addFieldMapping('startDate', 'StartDate');
		this.datePickerService.addFieldMapping('effectiveDateForLunchConfiguration', 'effectiveDateForLunchConfig');
		this.datePickerService.addFieldMapping('AssignmentStartDate', 'assignmentStartDate');
		this.datePickerService.addFieldMapping('AssignmentEndDate', 'assignmentEndDate');
		if (!this.disabledDates) {
			this.disabledDates = [];
			if (this.minDate) {
				this.minDate = new Date(this.minDate);
				this.disabledDates = this.dateRangeGenerator(new Date(this.minDate1), this.minDate);
			}

			if (this.maxDate) {
				this.maxDate = new Date(this.maxDate);
				this.maxDate = this.addDays(this.maxDate, magicNumber.one);
				const resetDate: Date[] = this.dateRangeGenerator(this.maxDate, this.maxDate1);
				this.disabledDates = [...this.disabledDates, ...resetDate];
			}
		}
		if (this.minDate != null) this.minDate1 = new Date(this.minDate);
		if (this.maxDate != null) this.maxDate1 = new Date(this.maxDate);
	}

	onValueBlur() {
		const inputDate = this.listControlName
			? this.listControlName.value
			: this.formControl.value;
		let val = null;
		if (inputDate == null) {
			this.setDateInControl(null);
			return;
		}
		if (inputDate >= this.maxDate1) {
			val = this.setDateInControl(this.maxDate1);
			this.formControl.setErrors({
				message: 'DateoutsideAllowedPeriod'
			});
			return;
		}
		if (inputDate <= this.minDate1) {
			val = this.setDateInControl(this.minDate1);
		}

		this.onBlur.emit(val);
	}

	datePicker() {
		const fieldWithError = this.elementRef.nativeElement.querySelector('#datePicker'),
			inputDate = fieldWithError.querySelector('.k-dateinput'),
			input = inputDate.querySelector('.k-input-inner');
		input?.blur();
	}

	OnChange(event: any) {
		this.debounceTimer.next(event);
		this.addCustomClass();
	}

	addCustomClass() {

	}

	OnFormattedDate(event: any) {
		this.onChange.emit(this.datePipe.transform(event, 'MM/dd/YYYY'));
	}


	private setDateInControl(val: any) {
		const newValue = this.localizationSrv.TransformDate(val, 'MM/dd/yyyy');
		if (this.listControlName) {
			this.listControlName.setValue(val, { emitEvent: false });
		} else {
			this.formControl.setValue(val, { emitEvent: false });
		}
		return newValue;
	}

	private dateRangeGenerator(startDate: Date, endDate: Date): Date[] {
		const dateArray = [];
		let currentDate = startDate;
		while (currentDate <= endDate) {
			dateArray.push(new Date(currentDate));
			currentDate = this.addDays(currentDate, magicNumber.one);
		}
		return dateArray;
	}

	private addDays(date: Date, days: number): Date {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}

}
