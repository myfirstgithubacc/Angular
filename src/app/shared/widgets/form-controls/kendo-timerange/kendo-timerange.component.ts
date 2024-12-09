import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { TimerangeWidget } from './kendo-timerange.interface';

@Component({
	selector: 'app-kendo-timerange',
	templateUrl: './kendo-timerange.component.html',
	styleUrls: ['./kendo-timerange.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoTimerangeComponent implements OnInit {
	startformControl: FormControl;
	@ViewChild('anchor') anchor: any;
	public show = false;
	endformControl: FormControl;
	@Input() label: string = '';
	@Input() isRequired: boolean;
	@Input() isEditMode: boolean = false;
	@Input() isHtmlContent: boolean = false;
	@Input() isDisabled: boolean;
	@Input() tooltipTitle: string = '';
	@Input() tooltipVisible: boolean = false;
	@Input() timeRangeProperties: TimerangeWidget;
	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Output() blur = new EventEmitter<FocusEvent>();
	@Output() focus = new EventEmitter<FocusEvent>();
	@Output() open = new EventEmitter<Event>();
	@Output() close = new EventEmitter<Event>();
	@Output() valueChange = new EventEmitter<any>();
	@Output() startTimeValueChange = new EventEmitter<any>();
	@Output() endTimeValueChange = new EventEmitter<any>();
	@Output() getTime = new EventEmitter<any>();
	@Output() cancelButton = new EventEmitter<{ cancel: boolean }>();
	@Output() toggleButton = new EventEmitter<{ startTime: string, endTime: string, status: boolean }>();
	public endMinRange: Date;
	public applyButtonDisabled: boolean = true;
	@Input()
	set startTimeControlName(value: string) {
		this.startformControl = this.parentF.form.get(value) as FormControl;
	}

	@Input()
	set endTimeControlName(value: string) {
		this.endformControl = this.parentF.form.get(value) as FormControl;
	}

	@Input() listControlName: FormControl;

	@Input() timeFormat: string = '';
	timeFormatEnum = CultureFormat.TimeFormat;

	constructor(
		private parentF: FormGroupDirective,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef
	) { }

	formatTime(time: Date): string {
		return this.localizationService.TransformData(time, CultureFormat.TimeFormat);
	}

	toggleTimeRange() {
		this.show = !this.show;
		const timeRange = {
			startTime: this.formatTime(this.startformControl.value),
			endTime: this.formatTime(this.endformControl.value), status: this.show
		};

		this.toggleButton.emit(timeRange);
	}
	hidePopup() {

		this.show = false;

		this.cancelButton.emit({ cancel: true });
		if (this.startformControl.value != null) {
			this.endformControl.disable();
		}

		if (this.endformControl.value != null && this.startformControl.value != null) {

			this.applyButtonDisabled = false;
			this.endformControl.enable();

		} else {
			this.endformControl.disable();
			this.applyButtonDisabled = true;

		}

	}
	emitData() {
		const timeRange = { startTime: this.formatTime(this.startformControl.value), endTime: this.formatTime(this.endformControl.value) };
		this.getTime.emit(timeRange);
		this.show = false;
	}

	applyButtonDisable() {
		if (this.endformControl.value != null && this.startformControl.value != null) {
			this.applyButtonDisabled = false;
		} else {
			this.applyButtonDisabled = true;
		}
	}

	onStartTimeChange(event: any) {

		if (this.startformControl.value != null || this.startformControl.value != undefined || this.startformControl.value != '') {
			if (this.timeRangeProperties.AllowAI && this.startformControl.value != null) {
				const startTime = new Date(this.startformControl.value);
				startTime.setMinutes(startTime.getMinutes() + this.timeRangeProperties.DefaultInterval);
				this.endformControl.setValue(startTime);
			} else {
				this.endMinRange = this.startformControl.value;
			}
			this.endformControl.enable();
			if (event == null) {
				this.endformControl.disable();
				this.endformControl.setValue(null);
			}
			this.applyButtonDisable();
		}
		else {
			this.endformControl.disable();
			this.applyButtonDisabled = true;
		}
		if (this.startformControl.value > this.endformControl.value && !this.timeRangeProperties.AllowAI && this.endformControl.value != null) {

			this.startformControl.setErrors({ error: true, message: 'Start time should be smaller than end time' });

			this.startformControl.markAsTouched();

			this.applyButtonDisabled = true;

		}
		this.startTimeValueChange.emit(this.formatTime(event));
	}


	onEndTimeChange(event: any) {
		if (this.endformControl.value != null || this.endformControl.value != undefined || this.endformControl.value != '') {
			this.applyButtonDisabled = false;
			if (this.timeRangeProperties.AllowAI && this.endformControl.value != null) {
				const endTime = new Date(this.endformControl.value);
				endTime.setMinutes(endTime.getMinutes() - this.timeRangeProperties.DefaultInterval);
				this.startformControl.setValue(endTime);
			}
			this.applyButtonDisable();
		} else {
			this.applyButtonDisabled = true;
		}

		if (this.startformControl.value > this.endformControl.value && !this.timeRangeProperties.AllowAI) {

			this.endformControl.setErrors({ error: true, message: 'End time should be greater than start time' });
			this.endformControl.markAsTouched();
			this.applyButtonDisabled = true;
		} else {
			this.startformControl.setErrors(null);
			this.startformControl.markAsUntouched();
		}
		this.endTimeValueChange.emit(this.formatTime(event));
	}


	ngOnInit(): void {
		this.applyButtonDisable();
		if (this.startformControl.value == null || this.startformControl.value == undefined || this.startformControl.value == '') {
			this.endformControl.disable();
		}

		if (this.timeFormat.length == Number(magicNumber.zero))
			this.timeFormat = this.localizationService.GetCulture(CultureFormat.TimeFormat);

		if (this.listControlName) {
			if (isNaN(this.listControlName.value)) {
				this.listControlName.setValue(null);
			}
		} else if (isNaN(this.startformControl.value)) {

			this.startformControl.setValue(null);
		}

	}
	onBlur(e: FocusEvent) {
		this.blur.emit(e);
	}
	onFocus(e: FocusEvent) {
		this.focus.emit(e);
	}

	onOpen(e: any) {
		this.open.emit(e);
	}
	onClose(e: any) {
		this.close.emit(e);
	}
	onValueChange(e: Event) {
		this.valueChange.emit(e);
	}

}
