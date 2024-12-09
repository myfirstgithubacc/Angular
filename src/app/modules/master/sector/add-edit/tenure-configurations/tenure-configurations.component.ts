
import { FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorState } from '@xrm-core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { TenureLimitTypes } from '@xrm-shared/services/common-constants/static-data.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SectorService } from 'src/app/services/masters/sector.service';
import { ITenureConfigFM, patchTenureConfig } from './utils/helper';
import { SectorTenureConfiguration } from '@xrm-core/models/Sector/sector-tenure-configuration.model';
import { DropdownModel } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-tenure-configurations',
	templateUrl: './tenure-configurations.component.html',
	styleUrls: ['./tenure-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenureConfigurationsComponent implements OnInit, OnChanges, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() ShowAll: boolean = false;

	public isEditMode: boolean;
	public tenureConfigForm: FormGroup<ITenureConfigFM>;
	public isDisableAllowableTenureResetPeriod: boolean = false;
	public isSwitchTenurePolicyApplicableShow: boolean = false;
	public dropdown: DropdownModel | undefined | null;
	public tenureLimitTypeMessage: string = "Months";
	public disableControls: boolean = false;
	public magicNumbers = magicNumber;

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
		if (this.reload) {
			this.switchTenurePolicyApplicable(this.tenureConfigForm.controls.TenurePolicyApplicable.value ?? false);
		}
	}

	ngOnInit(): void {
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}

		this.tenureConfigForm = this.childFormGroup.get('TenureConfiguration') as FormGroup<ITenureConfigFM>;

		this.store.select(SectorState.getSectorAllDropdowns).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({TenureLimitTypes}: SectorAllDropdowns) => {
				this.dropdown = TenureLimitTypes;
				this.cdr.markForCheck();
			});

		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	private AddMode() {
		this.switchTenurePolicyApplicable(this.tenureConfigForm.controls.TenurePolicyApplicable.value ?? false);
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({TenureConfiguration}: Sector) => {
				patchTenureConfig(TenureConfiguration, this.tenureConfigForm);
				this.disableControlsOnEdit();
				this.switchTenurePolicyApplicable(TenureConfiguration.TenurePolicyApplicable);

				// Don't Remove this if()...
				if(TenureConfiguration.IsTenureAllowRenewedAfterResetPeriod && !this.isDraft) {
					this.tenureConfigForm.controls.IsTenureAllowRenewedAfterResetPeriod.disable();
				}
				this.cdr.markForCheck();
			});
	}

	private disableControlsOnEdit = () =>
		this.disableControls = true;

	radioTenureLimitType(radioValue: number) {
		this.tenureLimitTypeMessage = (radioValue == Number(TenureLimitTypes.Hours))
			? 'Hours'
			: 'Months';

		if (!(radioValue == Number(TenureLimitTypes.Hours) || radioValue == Number(TenureLimitTypes['Length of Assignment'] ))) {
			this.tenureLimitTypeMessage = '';
		}
	}

	switchTenurePolicyApplicable(toggle: boolean) {
		this.isSwitchTenurePolicyApplicableShow = toggle;
		if (toggle) {
			this.radioTenureLimitType(Number(this.tenureConfigForm.controls.TenureLimitType.value));
			this.switchIsTenureAllowRenewedAfterResetPeriod(this.tenureConfigForm.controls.IsTenureAllowRenewedAfterResetPeriod.value);
		}
		else {
			this.tenureConfigForm.updateValueAndValidity({ emitEvent: false, onlySelf: true });
		}
	}

	switchIsTenureAllowRenewedAfterResetPeriod(toggle: boolean) {
		this.isDisableAllowableTenureResetPeriod = toggle;
		if (toggle && this.tenureConfigForm.controls.TenurePolicyApplicable.value) {
			this.tenureConfigForm.controls.TenureResetPeriod.enable();
		}
		else {
			this.tenureConfigForm.controls.TenureResetPeriod.setValue(null);
			this.tenureConfigForm.controls.TenureResetPeriod.disable();
		}
		this.cdr.markForCheck();
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}
