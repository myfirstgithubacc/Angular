import { ActivatedRoute } from '@angular/router';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin, map, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { DatePipe } from '@angular/common';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { TranslateService } from '@ngx-translate/core';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { PoType, TenureLimitTypes } from '@xrm-shared/services/common-constants/static-data.enum';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { StepperActivateEvent } from '@progress/kendo-angular-layout';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorXrmTimeClock } from '@xrm-core/models/Sector/sector-xrm-time-clock.model';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { StepDataModel } from '@xrm-core/models/Sector/sector-rfx-configuration.model';
import { UdfImplementationService } from '@xrm-shared/common-components/udf-implementation/service/udf-implementation.service';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild(TooltipDirective)
	public tooltipDir!: TooltipDirective;
	public showTooltip(e: MouseEvent): void {
		const element = e.target as HTMLElement;
		if (
			(element.nodeName === 'TD' || element.nodeName === 'TH') &&
			element.offsetWidth < element.scrollWidth &&
			!element.classList.contains('allCheckBox')
		) {
			this.tooltipDir.toggle(element);
		} else {
			this.tooltipDir.hide();
		}
	}
	private destroyAllSubscribtion$ = new Subject<void>();
	private udfLoadControlsPayload = {
		"entityId": 1,
		"sectorId": 0,
		"recordId": 0,
		"recordUKey": "",
		"IsShowNewUdfConfigs": true,
		"editMode": 1,
		"parentsInfos": [],
		"IsDraft": false
	};

	public poType: string;
	public tenureLimitType: string;
	public currentStep: number = magicNumber.zero;
	public recordId: string;
	public ukey: string;
	public uidDynamicColumnname:string='UIDLength';
	public commonHeaderMessage: string;
	public recordStatus: string;
	public resetStep = false;
	public sectorLabelParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	public isDraft: boolean;
	public sectorDetails: Sector;
	public rfxStandardLabelText: string[] = [
		'RfxName',
		'RfxType',
		'PaymentRequestOption',
		'OpenDate',
		'KeyComponent'
	];

	public commodityTypeLabelText: string[] = [
		'Material',
		'RateCardItem',
		'ServiceLabor',
		'ServiceRecurring'
	];

	public sectorLabelTextParams: DynamicParam[] = [
		{
			Value: 'Sector',
			IsLocalizeKey: true
		}
	];

	public rateCardItemTooltip = {
		label: '',
		value: '',
		tooltipTitle: 'Rate_Card_Item_Tooltip',
		content: true,
		tooltip: true,
		tooltipPosition: 'top'
	};

	public requisitionPerformanceFactorTooltip = {
		label: '',
		value: '',
		tooltipTitle: 'Requisition_Performance_Factor_Tooltip',
		content: true,
		tooltip: true,
		tooltipPosition: 'top'
	};

	public standardFieldNameVisibleTooltip = {
		label: '',
		value: '',
		tooltipTitle: 'Standard_Field_Name_Visible_Tooltip',
		content: true,
		tooltip: true,
		tooltipPosition: 'top'
	};

	public clpPerformanceFactorTooltip = {
		label: '',
		value: '',
		tooltipTitle: 'CLP_Performance_Factor_Tooltip',
		content: true,
		tooltip: true,
		tooltipPosition: 'top'
	};

	public requisitionSurveyScaleTooltip = {
		label: '',
		value: '',
		tooltipTitle: 'Requisition_Survey_Scale_Tooltip',
		content: true,
		tooltip: true,
		tooltipPosition: 'top'
	};
	public UIDlabel:string;
	public steps: StepDataModel[] = [];
	public ClockBufferForShiftStart: string;
	public ClockBufferForReportingDate: string;
	public ZipCodeLabel: string = 'PostalCode';
	public StateLabel: string = 'State';

	public entityId: number = XrmEntities.Sector;
	public sectorIdUDF: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.View;

	// eslint-disable-next-line max-params
	constructor(
		private eventLog: EventLogService,
		private activatedRoute: ActivatedRoute,
		private localizationService: LocalizationService,
		private screenTitle: PageTitleService,
		private datePipe: DatePipe,
		private translate: TranslateService,
		public udfCommonMethods: UdfCommonMethods,
		private toasterService: ToasterService,
		private sectorService: SectorService,
		private cdr: ChangeDetectorRef,
		private configureClientService:ConfigureClientService,
		private udfService: UdfImplementationService
	) {
		this.steps = this.sectorService.getSteps();
		this.commonHeaderMessage = this.localizationService.GetLocalizeMessage('EntityId', this.sectorLabelTextParams);
		this.localizeStepperLabel();
	}

	public labelLocalizeFunction(times: number): DynamicParam[] {
		const dynamicParam: DynamicParam[] = [];
		while (times) {
			dynamicParam.push(this.sectorLabelParams[0]);
			times--;
		}
		return dynamicParam;
	}

	ngOnInit(): void {
		this.poType = PoType['Single Po'].toString();
		this.tenureLimitType = TenureLimitTypes['Length of Assignment'].toString();
		this.sectorService.showAllSectorSection.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data:boolean) => {
			this.onChange(data);
		});
		this.activatedRoute.params.pipe(switchMap((param) => {
			return this.sectorService.getSectorByUkey(param['id']);
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<Sector>) => {
			if (isSuccessfulResponse(data)) {
				this.sectorDetails = data.Data;
				this.recordId = data.Data.BasicDetail.SectorCode ?? '';
				this.ZipCodeLabel = this.localizationService.GetCulture(CultureFormat.ZipLabel, data.Data.BasicDetail.CountryId);
				this.StateLabel = this.localizationService.GetCulture(CultureFormat.StateLabel, data.Data.BasicDetail.CountryId);
				this.ukey = data.Data.SectorUkey ?? '';
				this.recordStatus = data.Data.Status;
				this.eventLog.recordId.next(data.Data.SectorId);
				this.eventLog.entityId.next(this.entityId);
				this.recordUKey = data.Data.SectorUkey ?? '';
				this.sectorIdUDF = data.Data.SectorId ?? magicNumber.zero;
				this.sectorService.holdData.next({'SectorCode': data.Data.BasicDetail.SectorCode, 'RecordStatus': data.Data.Status, 'Id': data.Data.Id});
				this.screenTitle.setTitle(`${this.localizationService.GetLocalizeMessage('Sector', this.sectorLabelParams)} - ${this.sectorDetails.BasicDetail.SectorName}`);
				this.isDraft = (data.Data.StatusCode === 'D');
				this.xrmTimeClockDisplay(data.Data.XrmTimeClock);
				if (this.sectorDetails.XrmTimeClock.EffectiveDateForLunchConfiguration)
					this.sectorDetails.XrmTimeClock.EffectiveDateForLunchConfiguration =
							this.datePipe.transform(
								this.sectorDetails.XrmTimeClock.EffectiveDateForLunchConfiguration,
								this.localizationService.GetDateFormat()
							);
				else {
					this.sectorDetails.XrmTimeClock.EffectiveDateForLunchConfiguration = '';
				}
				this.cdr.markForCheck();
				this.udfLoadControlsPayload.sectorId = data.Data.SectorId ?? magicNumber.zero;
				this.udfLoadControlsPayload.recordId = data.Data.SectorId ?? magicNumber.zero;
				this.udfLoadControlsPayload.recordUKey = this.ukey;
				this.udfLoadControlsPayload.editMode = 3;
				this.isUdfSectionShow();
			}
		});
		this.fetchUIDBasicDetails();
	}

	private isUdfSectionShow = () => {
		this.udfService.loadDataToGenerateControls(this.udfLoadControlsPayload).pipe(
			take(magicNumber.one),
		 takeUntil(this.destroyAllSubscribtion$)
		)
			.subscribe((res) => {
				if(!res.Succeeded)
					return;
				const controls = res.Data ?? [];
				if(!controls.length) {
					this.steps.splice(magicNumber.eighteen, magicNumber.one);
					this.steps = [...this.steps];
				}
				this.cdr.markForCheck();
			});
	};

	private fetchUIDBasicDetails(): void {
		this.configureClientService.getBasicDetails()
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe(({ Data }) => {
				this.UIDlabel = Data?.UidLabelLocalizedKey?? '';
				this.uidDynamicColumnname = this.localizationService.GetLocalizeMessage('DynamicLength', [{ Value: this.UIDlabel, IsLocalizeKey: true }]);
			});
	}

	private xrmTimeClockDisplay(data: SectorXrmTimeClock): void {
		this.ClockBufferForShiftStart = data.ClockBufferForShiftStart
			? `${this.transformDateTimeInHoursAndMinutes(data.ClockBufferForShiftStart)} Hour(s)`
			: '';

		this.ClockBufferForReportingDate = data.ClockBufferForReportingDate
			? `${this.transformDateTimeInHoursAndMinutes(data.ClockBufferForReportingDate)} Hour(s)`
			: '';
	}

	private transformDateTimeInHoursAndMinutes(date: string): string | null {
		return this.datePipe.transform(`4/5/2023 ${date}`, 'HH:mm');
	}

	ngAfterViewInit(): void {
		if (!this.resetStep) this.makeScreenScrollOnUpdate();
	}

	private onChange(e: boolean) {
		if (e) {
			this.resetStep = true;
		} else {
			this.resetStep = false;
		}
		this.cdr.markForCheck();
	}

	public next(): void {
		this.currentStep += 1;
		setTimeout(() => {
			this.makeScreenScrollOnUpdate();
		}, magicNumber.fifty);
	}

	public prev(): void {
		this.currentStep -= 1;
		setTimeout(() => {
			this.makeScreenScrollOnUpdate();
		}, magicNumber.fifty);
	}

	stepperEvent(ev: StepperActivateEvent) {
		if (ev.step.name === 'UserDefineFields') {
			window.scrollTo(magicNumber.zero, magicNumber.zero);
		} else {
			setTimeout(() => {
				this.makeScreenScrollOnUpdate();
			}, magicNumber.fifty);
		}
	}

	private localizeStepperLabel() {
		const observables = this.steps.map((step) =>
			this.translate.stream(step.label ?? '').pipe(
				take(magicNumber.one),
				map((res) =>
					res as string), takeUntil(this.destroyAllSubscribtion$)
			));
		forkJoin(observables).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((localizedLabels) => {
			this.steps.forEach((step, index) => {
				this.steps[index].label = localizedLabels[index];
			});
			this.cdr.markForCheck();
		});
	}

	private makeScreenScrollOnUpdate(): void {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.showAllSectorSection.next(false);
		this.sectorService.showAllSectionsSwitch.next(false);
	}
}
