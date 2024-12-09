
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { OtRateTypes, PricingModels } from '@xrm-shared/services/common-constants/static-data.enum';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from '@xrm-core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { PricingModelConfigDropdowns } from '@xrm-core/models/Sector/sector-pricing-model-configuration.model';
import { IPricingModelConfigFM } from './utils/formModel';
import { patchPricingModelConfig } from './utils/patch-pricing-model-config';
import { IRateAndFeesConfigFM } from '../rates-and-fees-configurations/utils/helper';
@Component({
	selector: 'app-pricing-model-configurations',
	templateUrl: './pricing-model-configurations.component.html',
	styleUrls: ['./pricing-model-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricingModelConfigurationsComponent implements OnInit, OnChanges, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() ShowAll: boolean = false;

	public isEditMode: boolean;
	public pricingModelConfigForm: FormGroup<IPricingModelConfigFM>;
	public dropdowns: PricingModelConfigDropdowns;
	public tooltipContentValue: string = '';

	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private store: Store,
		private sectorService: SectorService,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) { }

	ngOnChanges() {
		this.isEditMode = this.formStatus;
		if (this.reload) {
			this.pricingModelBusinessLogic(this.pricingModelConfigForm.controls.PricingModel.value);
		}
	}

	ngOnInit(): void {
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}

		this.pricingModelConfigForm = this.childFormGroup.get('PricingModelConfiguration') as FormGroup<IPricingModelConfigFM>;

		this.store.select(SectorState.getSectorAllDropdowns).pipe(take(Number(magicNumber.one)), takeUntil(this.destroyAllSubscribtion$))
			.subscribe(({CostEstimationTypes, MspFeeTypes, PricingModels, BillRateValidations}: SectorAllDropdowns) => {
				this.dropdowns = {'CostEstimationTypes': CostEstimationTypes, 'MspFeeTypes': MspFeeTypes, 'PricingModels': PricingModels, 'BillRateValidations': BillRateValidations };
				this.cdr.markForCheck();
			});

		if (this.isEditMode) {
			this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$))
				.subscribe(({PricingModelConfiguration}: Sector) => {
					patchPricingModelConfig(PricingModelConfiguration, this.pricingModelConfigForm);
					this.pricingModelBusinessLogic(PricingModelConfiguration.PricingModel);
					this.tooltipContentValue = PricingModelConfiguration.CostEstimationTypeName;
					this.cdr.markForCheck();
				});
		}
	}

	onClickPricingModel(event: string) {
		this.pricingModelBusinessLogic(event);
		if (event == PricingModels['Markup Based'].toString()) {
			(this.pricingModelConfigForm.parent?.get('RatesAndFeesConfiguration') as FormGroup<IRateAndFeesConfigFM>)
				.controls.OtRateType.reset();
		}
	}

	private pricingModelBusinessLogic(event: string) {
		const rateAndFeesConfig = this.pricingModelConfigForm.parent?.get('RatesAndFeesConfiguration') as FormGroup<IRateAndFeesConfigFM>;
		if((event == PricingModels['Bill Rate Based'].toString())) {
			rateAndFeesConfig.patchValue({
				'OtRateType': { 'Text': 'Bill Rate Based', 'Value': OtRateTypes['Bill Rate Based'].toString() }
			});
		}
		this.cdr.markForCheck();
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}
