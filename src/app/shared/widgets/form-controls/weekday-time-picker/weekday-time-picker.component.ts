import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { IFormatPlaceholder } from '@xrm-shared/Utilities/placeholder.interface';
import { Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroupDirective } from '@angular/forms';

@Component({
	selector: 'app-weekday-time-picker',
	templateUrl: './weekday-time-picker.component.html',
	styleUrl: './weekday-time-picker.component.scss'
})

export class WeekdayTimePickerComponent implements OnInit{

	public placeholderFormat: IFormatPlaceholder;
	@Input() set controlName(value: string) {
		this.setFormControlName = value;
		this.formControl = this.parentF.form.get(value) as FormControl;
		this.formControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {

		});

	}
	@Output() startTimeValueChange = new EventEmitter<string>();
	@Output() endTimeValueChange = new EventEmitter<string>();
	@Output() daySelectionChanged = new EventEmitter<IDayInfo[]>();
	@Output() getWeekDayInfo = new EventEmitter<string>();
	@Output() onCancel = new EventEmitter<IDayInfo[]>();

	@Input() errorMessage: DynamicParam[] = [{Value: 'scheduled on', IsLocalizeKey: true }];
	@Input() label: string = '';
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Input() tooltipTitle: string;
	@Input() tooltipVisible: boolean = false;
	@Input() skipOnChanges: boolean;
	@Input() dayInfo: IDayInfo[] = [];
	@Input() isWeekdayEditMode: boolean = true;
	@Input() timeRangeProperties: any;
	@Input() isRequired: boolean = false;
	public formControl!: FormControl;
	private unsubscribe$ = new Subject<void>();
	private setFormControlName: string;

	public selectedDays: any;
	public isEditMode: boolean = true;
	public days: string[] = [];

	constructor(
		private localizationService: LocalizationService,
		private parentF: FormGroupDirective
	) {
	}

	ChangeMode(mode: number) {
		if (mode == Number(magicNumber.zero)) {
			this.isEditMode = true;
			this.isWeekdayEditMode = true;
		}
		else if (mode == Number(magicNumber.one)) {
			this.isEditMode = false;
			this.isWeekdayEditMode = false;
			const info: any = {
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


	}
	public getControlName() {
		return this.setFormControlName;
	}
	ngOnChanges(changes: SimpleChanges): void {
		if (this.skipOnChanges) {
			return;
		}
	}


	public toggleDaySelection(day?: IDayInfo) {
		if (!day || !this.isWeekdayEditMode) return;

		const index = this.dayInfo.findIndex((x) =>
			x.day === day.day);

		if (index === Number(magicNumber.minusOne)) return;

		this.dayInfo[index].isSelected = !this.dayInfo[index].isSelected;

		this.daySelectionChanged.emit(this.dayInfo);

		// eslint-disable-next-line one-var
		const selectedDays = this.dayInfo.reduce<Record<string, boolean>>((acc, curr) => {
			acc[curr.day.toLowerCase()] = curr.isSelected;
			return acc;
		}, {});

		this.validateDaySelection();

	}
	public isDaySelectionValid: boolean = true;
	public validateDaySelection(): void {
		const isAnyDaySelected = this.dayInfo.some((day) =>
			day.isSelected);
		this.isDaySelectionValid = isAnyDaySelected || !this.isRequired;
	  }

	  public showValidationErrors(): void {
		this.validateDaySelection();
	  }

	public getObject(object: DynamicParam[] | undefined | null): any {
		if (!object || (object.length == Number(magicNumber.zero))) {

			return null;
		}

		return this.localizationService.GetParamObject(object);
	}

	resetPicker() {
		this.dayInfo = [];
	}
}

