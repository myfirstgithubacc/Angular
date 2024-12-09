import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { IFormatPlaceholder } from '@xrm-shared/Utilities/placeholder.interface';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { TimeRange } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { WeekDayPicker } from '@xrm-shared/models/list-view.model';

@Component({
	selector: 'app-weekday-picker',
	templateUrl: './weekday-picker.component.html',
	styleUrls: ['./weekday-picker.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekdayPickerComponent implements OnInit {

	startFormControl: FormControl;
	endFormControl: FormControl;
	public placeholderFormat: IFormatPlaceholder;
	@Input() timeFormat: string = 'h:mm a';
	@Output() startTimeValueChange = new EventEmitter<string>();
	@Output() endTimeValueChange = new EventEmitter<string>();

	@Input() label: string = '';
	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() dayInfo: IDayInfo[] = [];
	@Input() isWeekdayEditMode: boolean = false;
	@Input() timeRangeProperties: TimeRange;
	@Input() isReadonly: boolean = true;

	@Output() daySelectionChanged = new EventEmitter<IDayInfo[]>();
	@Output() selectedTimeChange = new EventEmitter<string>();
	@Output() getWeekDayInfo = new EventEmitter<WeekDayPicker>();
	@Output() onCancel = new EventEmitter<IDayInfo[]>();

	public selectedDays: any[] = [];
	@Input() skipOnChanges: boolean;
	public selectedTime: any = { startTime: null, endTime: null };
	public startTimeControlNameForTR: string = '';
	public endTimeControlNameForTR: string = '';
	public isEditMode: boolean = false;
	public days: string[] = [];
	@Input()
	set startTimeControlName(value: string) {
		this.startTimeControlNameForTR = value;
		this.startFormControl = this.parentF.form.get(value) as FormControl;
	}

	@Input()
	set endTimeControlName(value: string) {
		this.endTimeControlNameForTR = value;
		this.endFormControl = this.parentF.form.get(value) as FormControl;
	}

	constructor(private parentF: FormGroupDirective, private localizationService: LocalizationService) {
	}

	public updateTime(selectedTime: SelectedTime) {
		if (!selectedTime.cancel) {
			this.selectedTime = selectedTime;
			this.selectedTimeChange.emit(this.selectedTime);
		}
		else {
			this.selectedTime.startTime = this.startFormControl.value;
			this.selectedTime.endTime = this.endFormControl.value;
		}
	}
	onOpenPopup(e: { startTime: Date; endTime: Date }) {
		if (e) {
			this.selectedTime.startTime = e.startTime;
			this.selectedTime.endTime = e.endTime;
		}
	}
	ChangeMode(mode: number) {
		if (mode == Number(magicNumber.zero)) {
			this.isEditMode = true;
			this.isWeekdayEditMode = true;
			this.startFormControl.setValue(this.selectedTime.startTime);
			this.endFormControl.setValue(this.selectedTime.endTime);
		}
		else if (mode == Number(magicNumber.one)) {
			this.isEditMode = false;
			this.isWeekdayEditMode = false;
			if (this.startFormControl.value != null && this.endFormControl.value != null) {
				this.selectedTime.startTime = this.startFormControl.value;
				this.selectedTime.endTime = this.endFormControl.value;
			}
			const info: any = {
				time: this.selectedTime,
				day: this.dayInfo
			};
			this.getWeekDayInfo.emit(info);
		}
		else if (mode == Number(magicNumber.two)) {
			this.isEditMode = false;
			this.isWeekdayEditMode = false;
			this.onCancel.emit(this.dayInfo);
		}
	}
	ngOnInit(): void {
		this.placeholderFormat = this.localizationService.GetCulture(CultureFormat.DatePlaceholder);

		this.selectedTime.startTime = this.startFormControl.value;
		this.selectedTime.endTime = this.endFormControl.value;
		this.timeFormat = this.localizationService.GetCulture(CultureFormat.TimeFormat);
	}
	ngOnChanges(changes: SimpleChanges): void {
		if (this.skipOnChanges) {
			return;
		}
		this.selectedTime.startTime = this.startFormControl.value;
		this.selectedTime.endTime = this.endFormControl.value;
		this.timeFormat = this.localizationService.GetCulture(CultureFormat.TimeFormat);
	}

	onStartTimeChange(event: Date) {

		if (this.startFormControl.value != null || this.startFormControl.value != undefined || this.startFormControl.value != '') {
			// add minutes into start time to set end time
			if (this.timeRangeProperties.AllowAI && this.startFormControl.value != null) {
				const startTime = new Date(this.startFormControl.value);
				startTime.setMinutes(startTime.getMinutes() + this.timeRangeProperties.DefaultInterval);
				this.endFormControl.setValue(startTime);
			}
		}
		this.startTimeValueChange.emit(this.formatTime(event));
	}


	onEndTimeChange(event: Date) {
		if (this.endFormControl.value != null || this.endFormControl.value != undefined || this.endFormControl.value != '') {
			if (this.timeRangeProperties.AllowAI && this.endFormControl.value != null) {
				const endTime = new Date(this.endFormControl.value);
				endTime.setMinutes(endTime.getMinutes() - this.timeRangeProperties.DefaultInterval);
				this.startFormControl.setValue(endTime);
			}
		}
		this.endTimeValueChange.emit(this.formatTime(event));
	}

	public toggleDaySelection(day?: IDayInfo) {
		if (!day || !this.isWeekdayEditMode) return;

		const index = this.dayInfo.findIndex(x => x.day === day.day);

		if (index === Number(magicNumber.minusOne)) return;

		this.dayInfo[index].isSelected = !this.dayInfo[index].isSelected;

		this.daySelectionChanged.emit(this.dayInfo);
	}

	public formatTime(time: Date): string {
		return this.localizationService.TransformData(time, CultureFormat.TimeFormat, null, this.timeFormat);
	}

	public getObject(object: DynamicParam[] | undefined | null): any {
		if (!object || (object.length == Number(magicNumber.zero))) {

			return null;
		}

		return this.localizationService.GetParamObject(object);
	}
}
interface SelectedTime {
	startTime: Date | null;
	endTime: Date | null;
	cancel?: boolean;
}

