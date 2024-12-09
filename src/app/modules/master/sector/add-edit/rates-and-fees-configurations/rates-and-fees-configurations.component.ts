import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OtRateTypes, PricingModels } from '@xrm-shared/services/common-constants/static-data.enum';
import { Subject, take, takeUntil } from 'rxjs';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorState } from '@xrm-core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IRateAndFeesConfigFM, patchRateAndFeesConfig } from './utils/helper';
import { IPricingModelConfigFM } from '../pricing-model-configurations/utils/formModel';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorPricingModelConfiguration } from '@xrm-core/models/Sector/sector-pricing-model-configuration.model';
import { DropdownModel } from '@xrm-shared/models/common.model';
@Component({
	selector: 'app-rates-and-fees-configurations',
	templateUrl: './rates-and-fees-configurations.component.html',
	styleUrls: ['./rates-and-fees-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatesAndFeesConfigurationsComponent implements OnInit, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() ShowAll: boolean = false;
	@Input() countryId: number = magicNumber.zero;

	public isEditMode: boolean;
	public ratesAndFeesConfigForm: FormGroup<IRateAndFeesConfigFM>;
	public sectorAllDropdowns: DropdownModel | undefined | null;
	public billRateBasedValue = PricingModels['Bill Rate Based'].toString();
	public otRateTypeValue = OtRateTypes['Bill Rate Based'].toString();
	public storedPricingModelData: string;
	public pricingModelConfigForm: FormGroup<IPricingModelConfigFM>;
	public magicNumbers = magicNumber;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private store: Store,
		private el: ElementRef,
		private cdr: ChangeDetectorRef,
		private sectorService: SectorService
	) { }

	ngOnInit(): void {
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}
		this.getForms();

		this.store.select(SectorState.getSectorAllDropdowns).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({OtRateTypes}: SectorAllDropdowns) => {
				this.sectorAllDropdowns = OtRateTypes;
				this.cdr.markForCheck();
			});

		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	ngOnChanges() {
		this.isEditMode = this.formStatus;
	}

	private getForms() {
		this.ratesAndFeesConfigForm = this.childFormGroup.get('RatesAndFeesConfiguration') as FormGroup<IRateAndFeesConfigFM>;
		this.pricingModelConfigForm = this.childFormGroup.get('PricingModelConfiguration') as FormGroup<IPricingModelConfigFM>;
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$))
			.subscribe(({PricingModelConfiguration, RatesAndFeesConfiguration}: Sector) => {
				this.storedPricingModelData = PricingModelConfiguration.PricingModel;
				patchRateAndFeesConfig(RatesAndFeesConfiguration, this.ratesAndFeesConfigForm);

				if (this.isPricingModelSelectedBillRateBased(PricingModelConfiguration.PricingModel) &&
				RatesAndFeesConfiguration.OtRateType?.toString() === OtRateTypes['Bill Rate Based'].toString())
				{
					this.ratesAndFeesConfigForm.patchValue({
						'OtRateType': { 'Text': 'Bill Rate Based', 'Value': OtRateTypes['Bill Rate Based'].toString() }
					});
					this.ifDirectLandOnRateAndFeesConfig(PricingModelConfiguration);
				}
				this.cdr.markForCheck();
			});
	}


	private isPricingModelSelectedBillRateBased = (pricingModelValue: string) => {
		return (pricingModelValue == PricingModels['Bill Rate Based'].toString());
	};

	private ifDirectLandOnRateAndFeesConfig = (PricingModelConfiguration: SectorPricingModelConfiguration) => {
		this.pricingModelConfigForm.controls.PricingModel.patchValue(PricingModelConfiguration.PricingModel.toString());
	};

	private AddMode() {
		if (this.isPricingModelSelectedBillRateBased(this.pricingModelConfigForm.get('PricingModel')?.value ?? '')) {
			this.ratesAndFeesConfigForm.patchValue({
				'OtRateType': {'Text': 'Bill Rate Based', 'Value': OtRateTypes['Bill Rate Based'].toString()}
			});
			this.cdr.markForCheck();
		}
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}
