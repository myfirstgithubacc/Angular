
import { FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { PoType } from '@xrm-shared/services/common-constants/static-data.enum';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ITimeAndExpenseConfigFM, patchTimeAndExpenseConfig } from './utils/helper';
import { DropdownModel, IRadioGroupModel, IRadioWithExtras } from '@xrm-shared/models/common.model';
@Component({
	selector: 'app-time-and-expense-configurations',
	templateUrl: './time-and-expense-configurations.component.html',
	styleUrls: ['./time-and-expense-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeAndExpenseConfigurationsComponent implements OnInit, OnChanges, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() ShowAll: boolean = false;

	public dropdown: DropdownModel | undefined | null;
	public radioButton: IRadioWithExtras[] | undefined | null;
	public isEditMode: boolean;
	public timeAndExpenseConfigForm: FormGroup<ITimeAndExpenseConfigFM>;
	public isPORecruitment: boolean = true;
	public isAdjustmentUploadedAutoApproved: boolean = false;
	public tooltipTitleParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }, { Value: 'Sector', IsLocalizeKey: true }];
	public magicNumbers = magicNumber;

	private xrmTimeClockDetailsForm: FormGroup;
	private destroyAllSubscribtion$ = new Subject<void>();
	// eslint-disable-next-line max-params
	constructor(
		private sectorService: SectorService,
		private store: Store,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) { }

	ngOnChanges() {
		this.isEditMode = this.formStatus;

		if (this.reload) {
			this.switchTimeUploadApprovedHours(this.timeAndExpenseConfigForm.controls.TimeUploadAsApprovedHours.value);
		}
	}

	ngOnInit(): void {
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}
		this.timeAndExpenseConfigForm = this.childFormGroup.get('TimeAndExpenseConfiguration') as FormGroup<ITimeAndExpenseConfigFM>;
		this.xrmTimeClockDetailsForm = this.childFormGroup.get('XrmTimeClock') as FormGroup;

		this.store.select(SectorState.getSectorAllDropdowns).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$))
			.subscribe(({PoTypes, NoConsecutiveWeekMissingEntrys}: SectorAllDropdowns) => {
				this.radioButton = PoTypes?.filter((item: IRadioGroupModel) =>
					item.Value === PoType['Single Po'].toString());
				this.dropdown = NoConsecutiveWeekMissingEntrys;
				this.cdr.markForCheck();
			});

		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	private AddMode() {
		this.switchTimeUploadApprovedHours(this.timeAndExpenseConfigForm.controls.TimeUploadAsApprovedHours.value);
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({TimeAndExpenseConfiguration}: Sector) => {
				patchTimeAndExpenseConfig(TimeAndExpenseConfiguration, this.timeAndExpenseConfigForm);
				this.switchTimeUploadApprovedHours(TimeAndExpenseConfiguration.TimeUploadAsApprovedHours);
				this.cdr.markForCheck();
			});
	}

	// Switch Hide Show
	switchTimeUploadApprovedHours(toggle: boolean) {
		this.isAdjustmentUploadedAutoApproved = toggle;
	}

	OnChangeIsClpJobRotationAllowedSwitch(toggle: boolean) {
		this.timeAndExpenseConfigForm.controls.IsClpJobRotationAllowed.setValue(toggle);
		this.cdr.markForCheck();
		this.xrmTimeClockDetailsForm.controls['IsAllowManualJobCategory'].setValue(false);
		this.xrmTimeClockDetailsForm.controls['IsAllowManualShift'].setValue(false);
		this.cdr.markForCheck();
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}
