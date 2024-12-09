import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Optional, Output, SimpleChanges, ViewEncapsulation, numberAttribute } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { Subject, takeUntil } from 'rxjs';
import { TimeEntryService } from 'src/app/services/acrotrac/time-entry.service';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { WeekendingSettings } from '@xrm-core/models/acrotrac/time-entry/common-interface/weekending-settings';
import { DropdownModel } from '@xrm-shared/models/common.model';
@Component({
	selector: 'app-weekending-dropdown',
	templateUrl: './weekending-dropdown.component.html',
	styleUrls: ['./weekending-dropdown.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class WeekendingDropdownComponent implements OnInit, OnChanges, OnDestroy {
	@Input() WeekendingList: DropdownModel[];
	@Input({ transform: numberAttribute }) entityId: number;
	@Input({ transform: numberAttribute }) AssignmentId: number;
	@Input() ScreenId: number | null | undefined;

	@Output() OnWeekendingDropdownChange: EventEmitter<{ 'selectedWeekending': DropdownModel, 'path': string }> = new EventEmitter<{ 'selectedWeekending': DropdownModel, 'path': string }>();

	public formGroup!: FormGroup;
	public controlName: string = 'WeekendingDate';

	private destroyAllSubscribtion$ = new Subject<void>();
	private navigationPath: string = '';
	private weekendingSettings: WeekendingSettings;
	private dateFormat: string = '';

	// eslint-disable-next-line max-params
	constructor(
		@Optional() private parentF: FormGroupDirective,
		private timesheetService: TimeEntryService,
		private cdr: ChangeDetectorRef,
		private sessionStorageService: SessionStorageService,
		private expEntryService: ExpenseEntryService
	) {

	}

	ngOnInit(): void {
		this.formGroup = this.parentF.form;
		this.dateFormat = this.sessionStorageService.get('DateFormat') ?? '';
		this.weekendingSettings = JSON.parse(this.sessionStorageService.get('StartPoint') ?? '');

		if (this.AssignmentId !== Number(magicNumber.zero))
			this.getWeekendingDate();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes?.['AssignmentId']?.currentValue && !changes?.['AssignmentId']?.firstChange) {
			this.getWeekendingDate();
		}
	}

	public onWeekendingDropdownChange = ($event: DropdownModel | undefined) => {
		if ($event) {
			this.getSelectedWeekendingDateStatus($event);
			this.cdr.markForCheck();
		}
	};

	private getWeekendingDate = () => {
		this.expEntryService.getAllWeekendingDatesForEntry(
			this.entityId, this.AssignmentId,
			this.ScreenId ?? this.weekendingSettings.ScreenId, this.dateFormat
		).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((WeekendingDate) => {
			this.WeekendingList = WeekendingDate;
			this.cdr.markForCheck();
		});
	};

	private getSelectedWeekendingDateStatus = (selectedWeekendingDate: DropdownModel) => {
		this.timesheetService.getTimesheetStatus(
			{ 'AssignmentId': { 'Value': this.AssignmentId }, 'WeekendingDate': selectedWeekendingDate },
			this.weekendingSettings
		).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((path: string) => {
			this.navigationPath = path;
			this.OnWeekendingDropdownChange.emit({ 'selectedWeekending': selectedWeekendingDate, 'path': this.navigationPath });
			this.cdr.markForCheck();
		});
	};

	ngAfterViewInit(): void {
		this.controlName = 'WeekendingDate';
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
