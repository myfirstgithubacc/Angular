
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { SectorService } from 'src/app/services/masters/sector.service';
import { IShiftConfigFM } from './utils/formModel';
import { patchShiftConfig } from './utils/patch-shift-config';
import { IRadioWithExtras } from '@xrm-shared/models/common.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

	@Component({
		selector: 'app-shift-configurations',
		templateUrl: './shift-configurations.component.html',
		styleUrls: ['./shift-configurations.component.scss'],
		changeDetection: ChangeDetectionStrategy.OnPush
	})

export class ShiftConfigurationsComponent implements OnInit, OnChanges, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() ShowAll: boolean = false;

	public isEditMode: boolean;
	public shiftConfigForm: FormGroup<IShiftConfigFM>;
	public sectorAllDropdowns: IRadioWithExtras[] | undefined | null;
	public isTooltipVisible:boolean = false;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private store: Store,
		private el: ElementRef,
		private cdr: ChangeDetectorRef,
		private sectorService: SectorService
	) { }

	ngOnChanges() {
		this.isEditMode = this.formStatus;
	}

	ngOnInit(): void {
		this.isTooltipVisible = true;
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}
		this.shiftConfigForm = this.childFormGroup.get('ShiftConfiguration') as FormGroup<IShiftConfigFM>;

		this.store.select(SectorState.getSectorAllDropdowns).pipe(take(Number(magicNumber.one)), takeUntil(this.destroyAllSubscribtion$)).
			subscribe((data: SectorAllDropdowns) => {
				this.sectorAllDropdowns = data.ShiftDifferentialMethods;
				this.cdr.markForCheck();
			});

		if (this.isEditMode) {
			this.isTooltipVisible = false;
			this.store.select(SectorState.sectorByUKey).pipe(take(Number(magicNumber.one)), takeUntil(this.destroyAllSubscribtion$)).
				subscribe(({ShiftConfiguration}: Sector) => {
					patchShiftConfig(ShiftConfiguration, this.shiftConfigForm);
					this.cdr.markForCheck();
				});
		}
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}

