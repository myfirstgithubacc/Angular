import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { BenefitAdderService } from '@xrm-shared/services/benefit-adder.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { RequisitionLibraryGatewayService } from 'src/app/services/masters/requisition-library-gateway.service';
import { Observable, of, switchMap, tap } from 'rxjs';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { IBenefitAdderData, IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IValueComponent } from '@xrm-shared/Utilities/value.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-benefit-adder',
	templateUrl: './benefit-adder.component.html',
	styleUrls: ['./benefit-adder.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BenefitAdderComponent implements OnChanges, OnInit {
	@Input() reqLibraryId: number;
	@Input() requestId: number;
	@Input() entityId: XrmEntities;
	@Input() showInOneLine: boolean = false;
	@Input() sectorId: number;
	@Input() locationId: number;
	@Input() isCreate: boolean = false;
	public benefitData: IBenefitData[] = [];
	public isBenefitDataAvailable: boolean = true;
	public benefitAdderForm: FormGroup;
	public finalData: IValueComponent[] = [];
	public benefitAdderLabel: string = '';
	@Input() public isEntityBenefitAdderPatched: boolean = false;
	private isBenefitAdderConfigCompleted: boolean = false;
	private configData: IBenefitAdderData[];

	@Output() onDataPicked = new EventEmitter<IBenefitData[]>();

	// eslint-disable-next-line max-params
	constructor(
		private benefitAdderService: BenefitAdderService,
		public localizationService: LocalizationService,
		private requisitionLibraryGatewayService: RequisitionLibraryGatewayService,
		private cdr: ChangeDetectorRef,
		private destroyRef: DestroyRef
	) { }

	ngOnInit(): void {
		this.generateBenefitAdderLabel();
	}

	ngOnChanges(): void {
		if (!this.reqLibraryId) {
			this.resetBenefitAdderData();
			return;
		};
		this.fetchBenefitAdderData();
	}

	private generateBenefitAdderLabel(): void {
		const countryId: number = this.localizationService.GetCulture(CultureFormat.CountryId),
			currency: string = `${this.localizationService.GetCulture(CultureFormat.CurrencyCode, countryId)}`,
			localizeCurrency: DynamicParam[] = [{ Value: currency, IsLocalizeKey: true }];

		this.benefitAdderLabel = this.localizationService.GetLocalizeMessage('BenefitAdderPerPersonPerHour', localizeCurrency);
	}

	private resetBenefitAdderData(): void {
		this.benefitData.length = magicNumber.zero;
		this.finalData.length = magicNumber.zero;
	}

	private fetchBenefitAdderData(): void {
		const shouldGetReqLibraryBenefit = this.isCreate || this.isEntityBenefitAdderPatched;
		if (!shouldGetReqLibraryBenefit) {
			this.getBenefitAdderByEntity().subscribe();
		} else {
			this.getBenefitAdderConfiguration(this.sectorId, this.locationId).pipe(
				switchMap(() => {
					return this.getReqLibraryBenefitAdder();
				}),
				takeUntilDestroyed(this.destroyRef)
			).subscribe();
		}
	}

	private getBenefitAdderConfiguration(sid: number, lid: number): Observable<GenericResponseBase<IBenefitAdderData[]>> {
		return this.requisitionLibraryGatewayService.getIsBenefitAdder(sid, lid).pipe(
			switchMap((data: GenericResponseBase<IBenefitAdderData[]>) => {
				if (data.Data && data.Data.length === Number(magicNumber.zero)) {
					return this.requisitionLibraryGatewayService.getIsBenefitAdder(sid, magicNumber.zero);
				}
				return of(data);
			}),
			tap((finalData: GenericResponseBase<IBenefitAdderData[]>) => {
				if (!finalData.Succeeded || !finalData.Data) return;
				this.configData = finalData.Data;
				this.isBenefitDataAvailable = Boolean(this.configData.length);
				this.isBenefitAdderConfigCompleted = true;
				this.cdr.markForCheck();
			})
		);
	}

	private getReqLibraryBenefitAdder(): Observable<GenericResponseBase<IBenefitData[]>> {
		return this.benefitAdderService.getReqLibraryBenefitAdder(this.reqLibraryId)
			.pipe(tap((data: GenericResponseBase<IBenefitData[]>) => {
				data.Data = data.Data?.filter((benefit) =>
					this.configData.some((config) =>
						config.LabelLocalizedKey === benefit.LocalizedLabelKey));
				this.processAndEmitBenefitAdderData(data);
			}));
	}

	private getBenefitAdderByEntity(): Observable<GenericResponseBase<IBenefitData[]>> {
		return this.benefitAdderService.getBenefitAdderByEntity(this.entityId, this.requestId)
			.pipe(tap((data: GenericResponseBase<IBenefitData[]>) => {
				this.processAndEmitBenefitAdderData(data);
				this.isEntityBenefitAdderPatched = true;
			}));
	}

	private processAndEmitBenefitAdderData(data: GenericResponseBase<IBenefitData[]>) : void {
		if (!data.Succeeded || !data.Data) return;
		this.benefitData = data.Data;
		this.finalData = this.benefitData
			.map((subData) =>
				({
					text: subData.LocalizedLabelKey,
					value: parseFloat(subData.Value.toString()).toFixed(magicNumber.two)
				}));
		if ((this.isBenefitAdderConfigCompleted && this.isBenefitDataAvailable) || !this.isEntityBenefitAdderPatched) {
			this.onDataPicked.emit(this.benefitData);
		} else {
			this.onDataPicked.emit([]);
		}
	}
}
