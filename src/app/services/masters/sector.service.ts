
import { ElementRef, Injectable } from '@angular/core';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SectorBasicDetails } from '@xrm-core/models/Sector/sector-basic-detail.model';
import { SectorShiftConfiguration } from '@xrm-core/models/Sector/sector-shift-configuration.model';
import { SectorPricingModelConfiguration } from '@xrm-core/models/Sector/sector-pricing-model-configuration.model';
import { SectorTimeAndExpenseConfiguration } from '@xrm-core/models/Sector/sector-time-and-expense-configuration.model';
import { SectorAssignmentExtensionAndOtherConfiguration } from '@xrm-core/models/Sector/sector-assignment-extension-and-other-configuration.model';
import { SectorTenureConfiguration } from '@xrm-core/models/Sector/sector-tenure-configuration.model';
import { SectorRequisitionConfiguration } from '@xrm-core/models/Sector/sector-requisition-configuration.model';
import { SectorXrmTimeClock } from '@xrm-core/models/Sector/sector-xrm-time-clock.model';
import { DatePipe } from '@angular/common';
import { SectorEmailApprovalConfiguration } from '@xrm-core/models/Sector/sector-email-approval-configuration.model';
import { SectorChargeNumberConfiguration } from '@xrm-core/models/Sector/sector-charge-number-configuration.model';
import { SectorBackgroundCheck } from '@xrm-core/models/Sector/sector-background-check.model';
import { SectorRfxConfiguration, StepDataModel } from '@xrm-core/models/Sector/sector-rfx-configuration.model';
import { SectorPerformanceSurveyConfiguration } from '@xrm-core/models/Sector/sector-performance-survey-configuration.model';
import { SectorBenefitAdder } from '@xrm-core/models/Sector/sector-benefit-adder.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SectorDetails } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { IDropdownOption, IDropdownWithExtras } from '@xrm-shared/models/common.model';
import { SectorRfxStandardField } from '@xrm-core/models/Sector/sector-rfx-standard-fields.model';
import { SectorSowCommodityType } from '@xrm-core/models/Sector/sector-sow-commodity-types.model';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorRatesAndFeesConfiguration } from '@xrm-core/models/Sector/sector-rates-and-fees-configuration.model';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { SectorCostCenterConfig } from '@xrm-core/models/Sector/sector-cost-center-configs.model';
import { ISectorCostCenterConfig } from '@xrm-master/sector/add-edit/charge-number-configurations/utils/helper';
import { SectorOrgLevelConfigDtos } from '@xrm-core/models/Sector/sector-org-level-configs.model';
import { SectorAssignmentType } from '@xrm-core/models/Sector/sector-assignment-types.model';
import { UniqueSubmittal } from '@xrm-core/models/Sector/sector-unique-submittal.model';
import { ISectorRfxStandardFields, ISectorSowCommodityType } from '@xrm-master/sector/add-edit/rfx-configurations/utils/helper';
import { SectorRequisitionSurveyScale } from '@xrm-core/models/Sector/sector-requisition-survey-scales';
import { SectorRequisitionSurveyPerformanceFactor } from '@xrm-core/models/Sector/sector-requisition-survey-performance-factors';
import { SectorClpSurveyScale } from '@xrm-core/models/Sector/sector-survey-scales.model';
import { SectorClpSurveyPerformanceFactor } from '@xrm-core/models/Sector/sector-clp-survey-performance-factors';
import { ISectorClpSurveyPerformanceFactors, ISectorClpSurveyScales, ISectorRequisitionSurveyPerformanceFactors, ISectorRequisitionSurveyScales } from '@xrm-master/sector/add-edit/performance-survey-configurations/utils/helper';
import { SectorCandidateEvaluationItem } from '@xrm-core/models/Sector/sector-candidate-evaluation-items.model';
import { SectorBackground } from '@xrm-core/models/Sector/sector-backgrounds.model';
import { ISectorOrgLevelConfigDtos } from '@xrm-master/sector/add-edit/organization-structure/utils/helper';
import { ISectorAssignmentTypes, ISectorCandidateEvaluationItems } from '@xrm-master/sector/add-edit/requisition-configurations/utils/helper';
import { IUniqueSubmittal } from '@xrm-master/sector/add-edit/submittal-configurations/utils/helper';
import { ISectorBackgrounds } from '@xrm-master/sector/add-edit/background-checks/utils/helper';
import { ISectorBenefitAdders } from '@xrm-master/sector/add-edit/benefit-add-configurations/utils/helper';
import { SectorUdfFieldRecords } from '@xrm-core/models/Sector/sector-udfFieldRecords.model';
type InitStatusOfForm = Record<number, number>;
@Injectable({
	providedIn: 'root'
})

export class SectorService extends HttpMethodService {
	private timeoutId: number;

	// eslint-disable-next-line max-params
	constructor(
		private http: HttpClient,
		private localizationService: LocalizationService,
		private datePipe: DatePipe,
		private customValidators: CustomValidators,
		private formBuilder: FormBuilder
	) {
		super(http);
	}
	public holdData = new BehaviorSubject<{'SectorCode': string | null | undefined, 'RecordStatus': string | undefined, 'Id': number | null | string| undefined} | null>(null);
	getData = this.holdData.asObservable();
	public setRoute = new BehaviorSubject<string>('');
	public initStatusOfForm: InitStatusOfForm = {
		0: Number(magicNumber.zero),
		1: Number(magicNumber.zero),
		2: Number(magicNumber.zero),
		3: Number(magicNumber.zero),
		4: Number(magicNumber.zero),
		5: Number(magicNumber.zero),
		6: Number(magicNumber.zero),
		7: Number(magicNumber.zero),
		8: Number(magicNumber.zero),
		9: Number(magicNumber.zero),
		10: Number(magicNumber.zero),
		11: Number(magicNumber.zero),
		12: Number(magicNumber.zero),
		13: Number(magicNumber.zero),
		14: Number(magicNumber.zero)
	 };
	getRoute = this.setRoute.asObservable();
	// app-list-view persistency

	public holdDataPersistOrg = new BehaviorSubject<SectorOrgLevelConfigDtos[] | null>(null);
	public getDataPersistOrg = this.holdDataPersistOrg.asObservable();

	public holdPersistChargeNumber = new BehaviorSubject<SectorCostCenterConfig[] | null>(null);
	public getPersistChargeNumber = this.holdPersistChargeNumber.asObservable();

	public holdAssignmentRequisitionDetails = new BehaviorSubject<SectorAssignmentType[]|null>(null);
	public getAssignmentRequisitionDetails = this.holdAssignmentRequisitionDetails.asObservable();

	public holdEvaluationRequisitionDetails = new BehaviorSubject<SectorCandidateEvaluationItem[]|null>(null);
	public getEvaluationRequisitionDetails = this.holdEvaluationRequisitionDetails.asObservable();

	public holdUniqueSubmittals = new BehaviorSubject<UniqueSubmittal[]|null>(null);
	public getUniqueSubmittals = this.holdUniqueSubmittals.asObservable();

	public holdBackgroundDetails = new BehaviorSubject<SectorBackground []| null>(null);
	public getBackgroundDetails = this.holdBackgroundDetails.asObservable();

	public dataPersistOnBoarding = new BehaviorSubject<string>('');
	public DataPersistOnBoarding = this.dataPersistOnBoarding.asObservable();

	public showAllSectorSection = new BehaviorSubject<boolean>(false);
	public ShowAllSectorSection = this.dataPersistOnBoarding.asObservable();

	public showAllSectionsSwitch = new BehaviorSubject<boolean>(false);
	public ShowAllSectionsSwitch = this.showAllSectionsSwitch.asObservable();

	public holdBenefitAdder = new BehaviorSubject<SectorBenefitAdder[] | null>(null);
	public getBenefitAdder = this.holdBenefitAdder.asObservable();
	public holdRfxStandardField = new BehaviorSubject<SectorRfxStandardField[] | null>(null);
	public getRfxStandardField = this.holdRfxStandardField.asObservable();
	public holdCommodityTypes = new BehaviorSubject<SectorSowCommodityType[] | null>(null);
	public getCommodityTypes = this.holdCommodityTypes.asObservable();

	// Performance Survey
	public holdReqSurveyScales = new BehaviorSubject<SectorRequisitionSurveyScale[] | null>(null);
	public getReqSurveyScales = this.holdReqSurveyScales.asObservable();

	public holdReqPerformanceFactor = new BehaviorSubject<SectorRequisitionSurveyPerformanceFactor[] | null>(null);
	public getReqPerformanceFactor = this.holdReqPerformanceFactor.asObservable();

	public holdNoOfDaysAfterStartDateLevels = new BehaviorSubject<number[] | {'Days': number | null }[] | null>(null);
	public getNoOfDaysAfterStartDateLevelsObs = this.holdNoOfDaysAfterStartDateLevels.asObservable();

	public holdCLPSurveyScale = new BehaviorSubject<SectorClpSurveyScale[] | null>(null);
	public getCLPSurveyScaleObs = this.holdCLPSurveyScale.asObservable();

	public holdCLPPerformanceFactor = new BehaviorSubject<SectorClpSurveyPerformanceFactor[] | null>(null);
	public getCLPPerformanceFactorObs = this.holdCLPPerformanceFactor.asObservable();

	public pricingModel = new BehaviorSubject<string>('');
	public _pricingModel = this.pricingModel.asObservable();
	public dataPersistUdfdata = new BehaviorSubject<IPreparedUdfPayloadData[] | null>(null);
	public dataPersistUdfdataObs = this.dataPersistUdfdata.asObservable();
	public configureClientUID = new BehaviorSubject<{
    IsUidNumeric: boolean;
    UidLength: number;
    UidLabelLocalizedKey: string;
}|null>(null);
	public configureClientUIDObs = this.configureClientUID.asObservable();

	addCopyiedSector(Ukey: string, sectorName: string): Observable<ApiResponse> {
		const body = { "sectorUkey": Ukey, "sectorNameNew": sectorName };
		return this.Post(`/Sector/CloneSector?uKey=${Ukey}`, body);
	}

	postSectorBasicDetails(body: Sector): Observable<GenericResponseBase<null>> {
		if (body.XrmTimeClock.ClockBufferForReportingDate !== null && body.XrmTimeClock.ClockBufferForShiftStart !== null) {
			this.dateTransFormForXrmTimeClock(body.XrmTimeClock);
		}

		Object.keys(body).forEach((key: string) => {
			body[key] = this.parseKeyValuePairToId(body[key]);
		});

		body.PerformanceSurveyConfiguration.Id = body.SectorId ?? Number(magicNumber.zero);
		this.performanceSurveyAlter(body.PerformanceSurveyConfiguration);
		return this.Post('/sector/save', body);
	}

	private performanceSurveyAlter(performanceSurveyData:SectorPerformanceSurveyConfiguration ) {
		const formArray = performanceSurveyData.NoOfDaysAfterStartDateLevels;
		performanceSurveyData.NoOfDaysAfterStartDateLevels = [];
		if (!performanceSurveyData.SurveyForClosedReq) {
			performanceSurveyData.SectorRequisitionSurveyScales = [];
			performanceSurveyData.SectorRequisitionSurveyPerformanceFactors = [];
		}
		this.daysInsertInPerformanceNoOfDaysAfterStartDateLevels(formArray as {'Days': number | null}[], performanceSurveyData.NoOfDaysAfterStartDateLevels as number[]|null);
	}

	private daysInsertInPerformanceNoOfDaysAfterStartDateLevels(arrayList:{'Days': number | null}[], list: number[]|null) {
		Object.values(arrayList).forEach((row) => {
			if (row.Days)
				list?.push(row.Days);
		});
	}

	getAllSector(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/sector');
	}

	getDropDownList() {
		return [];
	}

	getSectorAllDropdowns(uKey: string) {
		if (uKey && uKey.length > Number(magicNumber.zero)) {
			return this.GetAll<ApiResponse>(`/sector/select-all-uKey/${uKey}`);
		} else {
			return this.GetAll<ApiResponse>(`/sector/select-all-uKey`);
		}
	}

	getSectorDropDownList() {
		return this.GetAll<GenericResponseBase<IDropdownWithExtras[]>>('/sector/select');
	}
	getSectorDropDownListV2() {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>('/sector/select');
	}

	getSectorDropDownListByOrgLevelType(orgType: number):Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>(`/sector/SectorDropdownListByOrgLevelAvailability/${orgType}`);
	}

	getSectorByUkey(Ukey: string): Observable<GenericResponseBase<Sector>> {
		return this.GetAll<GenericResponseBase<Sector>>(`/sector-uKey/${Ukey}`);
	}

	getExistingSectorsDropdownList(): Observable<GenericResponseBase<IDropdownWithExtras[]>> {
		return this.GetAll('/sector/select');
	}

	getSectorById(Id: number): Observable<ApiResponse> {
		return this.GetAll(`/sector-id/${Id}`);
	}

	updateStatus(data: ActivateDeactivate[]): Observable<GenericResponseBase<ActivateDeactivate>> {
		return this.PutBulk('/sector/bulk-status', data);
	}

	// Get sector Data from Sectorid for li Request
	public getSectorData(id: number): Observable<GenericResponseBase<SectorDetails>> {
		return this.Get<ApiResponse>('/sector/select-detail', id) as Observable<GenericResponseBase<SectorDetails>>;
	}

	updateSectorData<T extends keyof Sector>(data: Sector[T], steps: string):Observable<GenericResponseBase<null>> {
		if (steps === 'BasicDetail') {
			return this.updateBasicDetails(data as SectorBasicDetails);
		}
		else if (steps === 'OrgLevelConfigs') {
			return this.updateOrganizationStructure(data as SectorOrgLevelConfigDtos);
		}
		else if (steps === 'ShiftConfiguration') {
			return this.updateSectorShiftConfiguration(data as SectorShiftConfiguration);
		} else if (steps === 'PricingModelConfiguration') {
			return this.updatePricingModelConfiguration(data as SectorPricingModelConfiguration);
		} else if (steps === 'RatesAndFeesConfiguration') {
			return this.updateSectorRatesAndFeesConfigurations(data as SectorRatesAndFeesConfiguration);
		} else if (steps === 'AssignmentExtensionAndOtherConfiguration') {
			return this.updateAssignmentExtAndOtherConfig(data as SectorAssignmentExtensionAndOtherConfiguration);
		} else if (steps === 'TimeAndExpenseConfiguration') {
			return this.updateSectorTimeAndExpenseConfigurations(data as SectorTimeAndExpenseConfiguration);
		} else if (steps === 'TenureConfiguration') {
			return this.updateSectorTenureConfig(data as SectorTenureConfiguration);
		} else {
			return this.callUpdateApi(data, steps);
		}
	}

	callUpdateApi<T extends keyof Sector>(data: Sector[T], steps: string):Observable<GenericResponseBase<null>> {
		if (steps === 'RequisitionConfiguration') {
			return this.updateSectorRequisitionConfigurations(data as SectorRequisitionConfiguration);
		} else if (steps === 'ConfigureMspProcessActivity') {
			return this.updateSectorConfigureMspProcessActivity(data as SectorTenureConfiguration);
		} else if (steps === 'SubmittalConfiguration') {
			return this.updateSectorSubmittalConfiguration(data as SectorTenureConfiguration);
		} else if (steps === 'BenefitAdderConfiguration') {
			return this.updateSectorBenefitAdder(data as SectorBenefitAdder);
		}
		else if (steps === 'XrmTimeClock') {
			return this.updateSectorXRMTimeClock(data as SectorXrmTimeClock);
		} else if (steps === 'EmailApprovalConfiguration') {
			return this.updateSectorEmailConfiguration(data as SectorEmailApprovalConfiguration);
		} else if (steps === 'ChargeNumberConfiguration') {
			return this.updateSectorChargeNumberConfigurations(data as SectorChargeNumberConfiguration);
		}
		else if (steps === 'BackgroundCheck') {
			return this.updateSectorBackgroundCheck(data as SectorBackgroundCheck);
		}
		else if (steps === 'RfxConfiguration') {
			return this.updateSectorRfxConfiguration(data as SectorRfxConfiguration);
		}
		else if (steps === 'PerformanceSurveyConfiguration') {
			return this.updateSectorPerformanceSurveyConfiguration(data as SectorPerformanceSurveyConfiguration);
		}
		else if (steps === 'UserDefineFields') {
			return this.updateUdfData(data as SectorUdfFieldRecords);
		}

		else if (steps === 'updateAllData') {
			return this.updateBulkSectorData(data as Sector);
		}
		else
			return this.Put('return all api', data);
	}

	updateSectorShiftConfiguration(data: SectorShiftConfiguration): Observable<GenericResponseBase<null>> {
		return this.Put('/sector/Shiftconfiguration', data);
	}

	updateUdfData(data: SectorUdfFieldRecords): Observable<GenericResponseBase<null>> {
		return this.Post('/udfc/edit-records', data.UdfFieldRecords);
	}

	updatePricingModelConfiguration(data: SectorPricingModelConfiguration):
	Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/PricingModelConfigurations', data);
	}

	updateSectorRatesAndFeesConfigurations(data: SectorRatesAndFeesConfiguration):
	Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/RatesAndFeesConfigurations', data);
	}

	updateBasicDetails(data: SectorBasicDetails): Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/BasicDetails', data);
	}

	updateOrganizationStructure(data: SectorOrgLevelConfigDtos): Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/OrgLevelConfig', data);
	}

	updateAssignmentExtAndOtherConfig(data: SectorAssignmentExtensionAndOtherConfiguration):
	Observable<GenericResponseBase<null>> {
		return this.Put('/sector/AssignmentExtensionAndOtherConfigurations', data);
	}

	updateSectorTimeAndExpenseConfigurations(data: SectorTimeAndExpenseConfiguration):
	Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/TimeAndExpenseConfigurations', data);
	}

	updateSectorTenureConfig(data: SectorTenureConfiguration): Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/TenureConfigurations', data);
	}

	updateSectorBackgroundCheck(data: SectorBackgroundCheck): Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/BackgroundCheck', data);
	}

	updateSectorRfxConfiguration(data: SectorRfxConfiguration): Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/RfxConfigurations', data);
	}

	updateSectorPerformanceSurveyConfiguration(data: SectorPerformanceSurveyConfiguration):
	Observable<GenericResponseBase<null>> {
		const formArray = data.NoOfDaysAfterStartDateLevels;

		data = this.parseKeyValuePairToId(data);
		data.NoOfDaysAfterStartDateLevels = [];

		this.daysInsertInPerformanceNoOfDaysAfterStartDateLevels(formArray as {'Days': number | null}[], data.NoOfDaysAfterStartDateLevels as number[]|null);

		if (!data.SurveyAllowedForAssignment) {
			data = this.surveyAllowedForassignment(data);
		}

		if (!data.NoOfDaysAfterAssignmentStart)
			data.NoOfDaysAfterStartDateLevels = [];

		if (!data.ScheduleThroughoutLengthOfAssignment) {
			data.LengthOfAssignment = null;
			data.LengthOfAssignmentType = null;
		}

		if (!data.DisplayQuestion)
			data.QuestionLabel = this.localizationService.GetLocalizeMessage('WouldYouConsiderCLPHire');

		if (!data.IsAvgSurveyScoreAllowForComment)
			data.AvgSurveyScore = null;

		data = this.dataManipulation(data);


		return this.Put('/sector/PerformanceConfigurations', data);
	}

	dataManipulation(data: SectorPerformanceSurveyConfiguration) {
		data.SectorRequisitionSurveyScales =
			(data.SurveyForClosedReq)
				? data.SectorRequisitionSurveyScales
				: [];

		data.SectorRequisitionSurveyPerformanceFactors =
			(data.SurveyForClosedReq)
				? data.SectorRequisitionSurveyPerformanceFactors
				: [];

		return data;
	}

	surveyAllowedForassignment(data: SectorPerformanceSurveyConfiguration) {
		data.AfterAssignmentEndDate = false;
		data.NoOfDaysAfterAssignmentStart = false;
		data.ScheduleThroughoutLengthOfAssignment = false;
		data.CanSurveyAnyTime = false;
		data.DisplayQuestion = false;
		data.DisplayNoThanks = false;
		return data;
	}

	updateSectorConfigureMspProcessActivity(data: SectorTenureConfiguration):
	Observable<GenericResponseBase<null>> {
		return this.Put('/sector/ConfigureMspProcessActivity', data);
	}

	updateSectorSubmittalConfiguration(data: SectorTenureConfiguration): Observable<GenericResponseBase<null>> {

		return this.Put('/sector/SubmittalConfiguration', data);
	}

	updateSectorBenefitAdder(data: SectorBenefitAdder): Observable<GenericResponseBase<null>> {

		return this.Put('/sector/BenefitAdder', data);
	}

	updateSectorRequisitionConfigurations(data: SectorRequisitionConfiguration):
	Observable<GenericResponseBase<null>> {

		if (!data.IsSystemRankingFunctionality) {
			data.SectorCandidateEvaluationItems = [];
			data.IsSystemCandidateRankingMandatory = false;
			data.EnableManagerScoring = false;
			data.IsManagerScoringMandatory = false;
		}
		if (!data.EnableManagerScoring) {
			data.IsManagerScoringMandatory = false;
		}
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/RequisitionConfigurations', data);
	}

	updateSectorXRMTimeClock(data: SectorXrmTimeClock): Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		this.dateTransFormForXrmTimeClock(data);
		return this.Put('/sector/XrmTimeClock', data);
	}

	private dateTransFormForXrmTimeClock(xrmTimeClockDetailsData: SectorXrmTimeClock) {
		xrmTimeClockDetailsData.ClockBufferForShiftStart = this.datePipe.transform(xrmTimeClockDetailsData.ClockBufferForShiftStart, 'HH:mm');
		xrmTimeClockDetailsData.ClockBufferForReportingDate = this.datePipe.transform(xrmTimeClockDetailsData.ClockBufferForReportingDate, 'HH:mm');
		xrmTimeClockDetailsData.EffectiveDateForLunchConfiguration = this.datePipe.transform(xrmTimeClockDetailsData.EffectiveDateForLunchConfiguration, 'MM/dd/YYYY');
	}

	updateSectorEmailConfiguration(data: SectorEmailApprovalConfiguration):
	Observable<GenericResponseBase<null>> {
		return this.Put('/sector/EmailApprovalConfigurations', data);
	}

	updateSectorChargeNumberConfigurations(data: SectorChargeNumberConfiguration):
	Observable<GenericResponseBase<null>> {
		data = this.parseKeyValuePairToId(data);
		return this.Put('/sector/ChargeNumberConfigurations', data);
	}

	parseKeyValuePairToId<T extends keyof Sector>(data: Sector[T]) {
		try {
			Object.keys(data).forEach((key) => {
				if (typeof data[key] === 'object' && data[key] !== null)
					Object.keys(data[key]).forEach((keyValue) => {
						if (keyValue === 'Value') {
							data[key] = parseInt(data[key][keyValue]) ?
								parseInt(data[key][keyValue])
								: data[key][keyValue];
						}
					});
			});
		} catch (ex) { /* empty */ }
		return data;
	}

	submitSectorData(data: Sector):Observable<GenericResponseBase<null>> {
		if (data.XrmTimeClock.ClockBufferForReportingDate !==
			null && data.XrmTimeClock.ClockBufferForShiftStart !== null) {
			this.dateTransFormForXrmTimeClock(data.XrmTimeClock);
		}

		Object.keys(data).forEach((key: string) => {
			data[key] = this.parseKeyValuePairToId(data[key]);
		});

		this.performanceSurveyAlter(data.PerformanceSurveyConfiguration);

		return this.Post("/sector/save", data);
	}

	public updateBulkSectorData(data: Sector):Observable<GenericResponseBase<null>> {
		Object.keys(data).forEach((key: string) => {
			data[key] = this.parseKeyValuePairToId(data[key]);
		});
		const formArray = data.PerformanceSurveyConfiguration.NoOfDaysAfterStartDateLevels ?? [];
		data.PerformanceSurveyConfiguration.NoOfDaysAfterStartDateLevels = [];
		this.daysInsertInPerformanceNoOfDaysAfterStartDateLevels(formArray as {'Days': number | null}[], data.PerformanceSurveyConfiguration.NoOfDaysAfterStartDateLevels as number[]|null);
		if (data.XrmTimeClock.ClockBufferForReportingDate !== null && data.XrmTimeClock.ClockBufferForShiftStart !== null) {
			this.dateTransFormForXrmTimeClock(data.XrmTimeClock);
		}
		return this.Put(`/sector/edit`, data);
	}

	viewListStepperCorrection(sector: Sector, form: FormGroup) {
		this.OrgStructureFormArray(sector.OrgLevelConfigs.SectorOrgLevelConfigDtos, form.get('OrgLevelConfigs.SectorOrgLevelConfigDtos') as FormArray<FormGroup<ISectorOrgLevelConfigDtos>>);

		if (sector.RequisitionConfiguration.IsSystemRankingFunctionality) {
			this.onAddSectorCandidateEvaluationItems(sector.RequisitionConfiguration.SectorCandidateEvaluationItems, form.get('RequisitionConfiguration.SectorCandidateEvaluationItems') as FormArray<FormGroup<ISectorCandidateEvaluationItems>>);
		}

		if(sector.BenefitAdderConfiguration.IsBenefitAdder)
			this.onAddBenefitAdderFormArray(sector.BenefitAdderConfiguration.SectorBenefitAdders, form.get('BenefitAdderConfiguration.SectorBenefitAdders') as FormArray);

		this.onAddSectorAssignmentTypes(sector.RequisitionConfiguration.SectorAssignmentTypes, form.get('RequisitionConfiguration.SectorAssignmentTypes') as FormArray<FormGroup<ISectorAssignmentTypes>>);
		this.onAddSectorSubmittal(sector.SubmittalConfiguration.UniqueSubmittals, form.get('SubmittalConfiguration.UniqueSubmittals') as FormArray<FormGroup<IUniqueSubmittal>>);
		this.onAddCostAccCenterConfig(sector.ChargeNumberConfiguration.SectorCostCenterConfigs, form.get('ChargeNumberConfiguration.SectorCostCenterConfigs') as FormArray<FormGroup<ISectorCostCenterConfig>>);
		this.onAddSectorBackground(sector.BackgroundCheck.SectorBackgrounds, form.get('BackgroundCheck.SectorBackgrounds') as FormArray<FormGroup<ISectorBackgrounds>>);
		this.onAddClpPerformanceFactor(sector.PerformanceSurveyConfiguration.SectorClpSurveyPerformanceFactors, form.get('PerformanceSurveyConfiguration.SectorClpSurveyPerformanceFactors') as FormArray);
		this.onAddClpSurveyScale(sector.PerformanceSurveyConfiguration.SectorClpSurveyScales, form.get('PerformanceSurveyConfiguration.SectorClpSurveyScales') as FormArray);
		if (sector.PerformanceSurveyConfiguration.SurveyForClosedReq) {
			this.onAddReqPerformaceFactor(sector.PerformanceSurveyConfiguration.SectorRequisitionSurveyPerformanceFactors ?? [], form.get('PerformanceSurveyConfiguration.SectorRequisitionSurveyPerformanceFactors') as FormArray);
			this.onAddReqSurveyScale(sector.PerformanceSurveyConfiguration.SectorRequisitionSurveyScales ?? [], form.get('PerformanceSurveyConfiguration.SectorRequisitionSurveyScales') as FormArray);
		}

		if (sector.PerformanceSurveyConfiguration.NoOfDaysAfterAssignmentStart) {
			this.NoOfScheduleDaysFormArray(sector.PerformanceSurveyConfiguration.NoOfDaysAfterStartDateLevels, form.get('PerformanceSurveyConfiguration.NoOfDaysAfterStartDateLevels') as FormArray, sector.PerformanceSurveyConfiguration.NoOfDaysAfterAssignmentStart);
		}
	}

	OrgStructureFormArray(list: SectorOrgLevelConfigDtos[], arrayForm: FormArray<FormGroup<ISectorOrgLevelConfigDtos>>) {
		arrayForm.clear();

		list.forEach((row) => {
			arrayForm.push(this.formBuilder.group<ISectorOrgLevelConfigDtos>({
				'Id': this.formBuilder.control(row.Id
					? row.Id
					: magicNumber.zero),
				'OrgName': this.formBuilder.control(row.OrgName, row.IsVisible
					? [this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ScreenLabelName')]
					: []),
				'IsVisible': this.formBuilder.control(row.IsVisible ?? false),
				'IsMandatory': this.formBuilder.control(row.IsMandatory ?? false),
				'IsShowHide': this.formBuilder.control(row.IsVisible ?? false)
			}));
		});
	}

	onAddSectorCandidateEvaluationItems(
		list: SectorCandidateEvaluationItem[],
		 formArray: FormArray<FormGroup<ISectorCandidateEvaluationItems>>
	) {
		formArray.clear();
		list.forEach((row: SectorCandidateEvaluationItem, index: number) => {
			formArray.push(this.formBuilder.group<ISectorCandidateEvaluationItems>({
				'Id': this.formBuilder.control((list[index].Id !== magicNumber.zero || list[index].Id !== null) ?
					list[index].Id
					: magicNumber.zero),
				'Description': this.formBuilder.control(row.Description, this.customValidators.requiredValidationsWithMessage('PleaseSelectData', 'ItemTitle')),
				'EvaluationRequirementId': this.formBuilder.control(
					row.EvaluationRequirementId,
					this.customValidators.requiredValidationsWithMessage('PleaseSelectData', 'EvaluationType')
				),
				'EvaluationRequirementName': this.formBuilder.control(row.EvaluationRequirementName),
				'IsVisible': this.formBuilder.control(row.IsVisible),
				'DisplayOrder': this.formBuilder.control(index)
			}));
		});
	}

	 onAddSectorAssignmentTypes(list: SectorAssignmentType[], formArray: FormArray<FormGroup<ISectorAssignmentTypes>>) {
		formArray.clear();

		list.forEach((row: SectorAssignmentType, index: number) => {
			formArray.push(this.formBuilder.group<ISectorAssignmentTypes>({
				'Id': this.formBuilder.control((list[index].Id !== magicNumber.zero || list[index].Id !== null) ?
					list[index].Id
					: magicNumber.zero),
				'AssignmentName': this.formBuilder.control(row.AssignmentName, this.customValidators.requiredValidationsWithMessage('PleaseSelectData', 'ItemTitle')),
				'DisplayOrder': this.formBuilder.control(index)
			}));
		});
	}

	onAddSectorSubmittal(list: UniqueSubmittal[], formArray: FormArray<FormGroup<IUniqueSubmittal>>, uidName: string= 'CurrentFieldName') {
		formArray.clear();

		list.forEach((row) => {
			formArray.push(this.formBuilder.group<IUniqueSubmittal>({
				'Id': this.formBuilder.control(row.Id ?? magicNumber.one),
				'LabelName': this.formBuilder.control(row.LabelName, [this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'CurrentFieldName'), this.customValidators.MaxLengthValidator(magicNumber.fifty, "MaximumCharLimit")]),
				'ToolTip': this.formBuilder.control(row.ToolTip, [this.customValidators.MaxLengthValidator(magicNumber.fiveThousand, "MaximumCharLimit")]),
				'MaxLength': this.formBuilder.control(row.MaxLength, [this.customValidators.requiredValidationsWithMessage('PleaseEnterData', uidName)]),
				'IsNumeric': this.formBuilder.control(row.IsNumeric, { nonNullable: true }),
				'IsPartialEntry': this.formBuilder.control(row.IsPartialEntry, { nonNullable: true }),
				'RightmostChars': this.formBuilder.control(row.RightmostChars, row.IsPartialEntry
					? [this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'RightmostChars')]
					: [])
			}));
		});
	}

	onAddCostAccCenterConfig(list: SectorCostCenterConfig[], formArray: FormArray<FormGroup<ISectorCostCenterConfig>>) {
		formArray.clear();
		list.forEach((row) => {
			formArray.push(this.formBuilder.group<ISectorCostCenterConfig>({
				'Id': this.formBuilder.control(row.Id
					? row.Id
					: magicNumber.zero, {nonNullable: true}),
				'SegmentName': this.formBuilder.control(row.SegmentName, this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'SegmentName')),
				'SegmentMinLength': this.formBuilder.control(row.SegmentMinLength, [
					this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'SegmentMinLength'),
					this.customValidators.RangeValidator(magicNumber.zero, row.SegmentMaxLength ?? magicNumber.zero)
				]),
				'SegmentMaxLength': this.formBuilder.control(row.SegmentMaxLength, this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'SegmentMaxLength'))
			}));
		});
	}

	onAddRfxStandardFields(rfxList: SectorRfxStandardField[], formArray:FormArray<FormGroup<ISectorRfxStandardFields>>) {
		formArray.clear();
		rfxList.forEach((row, index: number) => {
			formArray.push(this.formBuilder.group<ISectorRfxStandardFields>({
				'Id': this.formBuilder.control(row.Id
					? row.Id
					: magicNumber.zero, {nonNullable: true}),
				'RfxLabelId': this.formBuilder.control(index + magicNumber.one),
				'DisplayName': this.formBuilder.control(row.DisplayName, [this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'CurrentFieldName'), this.customValidators.MaxLengthValidator(magicNumber.fifty, "MaximumCharLimit")])
			}));
		});
	}

	onAddCommodityTypes(commodityList: SectorSowCommodityType[], formArray: FormArray<FormGroup<ISectorSowCommodityType>>) {
		formArray.clear();
		commodityList.forEach((row, index: number) => {
			formArray.push(this.formBuilder.group<ISectorSowCommodityType>({
				'Id': this.formBuilder.control(row.Id
					? row.Id
					: magicNumber.zero, {nonNullable: true}),
				'SowCommodityConfigId': this.formBuilder.control(index + magicNumber.one),
				'CurrentCommodityTypeName': this.formBuilder.control(row.CurrentCommodityTypeName, [this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'CurrentCommodityTypeName'), this.customValidators.MaxLengthValidator(magicNumber.fifty, "MaximumCharLimit")]),
				'Active': this.formBuilder.control(row.Active, {nonNullable: true})
			}));
		});
	}

	onAddSectorBackground(list: SectorBackground[], formArray: FormArray<FormGroup<ISectorBackgrounds>>) {
		formArray.clear();
		const SectorBackgroundMessage = this.localizationService.GetLocalizeMessage('OnboardingItem');
		list.forEach((row, index: number) => {
			formArray.push(this.formBuilder.group<ISectorBackgrounds>({
				'Id': this.formBuilder.control((list[index].Id !== magicNumber.zero && list[index].Id !== null)
					? list[index].Id
					: magicNumber.zero),
				'ComplianceItemLabel': this.formBuilder.control(row.ComplianceItemLabel, this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ScreenLabelName')),
				'IsVisibleToClient': this.formBuilder.control(row.IsVisibleToClient ?? false, { nonNullable: true }),
				'IsApplicableForLi': this.formBuilder.control(row.IsApplicableForLi ?? false, { nonNullable: true }),
				'IsApplicableForProfessional': this.formBuilder.control(row.IsApplicableForProfessional ?? false, { nonNullable: true }),
				'IsApplicableForSow': this.formBuilder.control(row.IsApplicableForSow ?? false, { nonNullable: true }),
				'DisplayOrder': this.formBuilder.control(index),
				'ComplianceType': this.formBuilder.control('B'),
				'ComplianceFieldName': this.formBuilder.control(`${SectorBackgroundMessage} ${index + magicNumber.one}`),
				'IsMandatorySign': this.formBuilder.control(row.IsVisibleToClient, { nonNullable: true }),
				'IsShowHide': this.formBuilder.control(row.IsVisibleToClient, { nonNullable: true })
			}));
		});
	}

	onAddBenefitAdderFormArray(list: SectorBenefitAdder[], arrayForm: FormArray<FormGroup<ISectorBenefitAdders>>) {
		arrayForm.clear();
		list.forEach((row: SectorBenefitAdder, index: number) => {
			arrayForm.push(this.formBuilder.group<ISectorBenefitAdders>({
				'Id': this.formBuilder.control((list[index].Id == Number(magicNumber.zero) || list[index].Id == null) ?
					magicNumber.zero
					: list[index].Id),
				'Label': this.formBuilder.control(row.Label, [
					this.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'BenefitAdder'),
				 this.customValidators.MaxLengthValidator(magicNumber.fifty, "MaximumCharLimit")
				])
			}));
		});
	}

	onAddClpPerformanceFactor(list: SectorClpSurveyPerformanceFactor[], formArray: FormArray<FormGroup<ISectorClpSurveyPerformanceFactors>>) {
		formArray.clear();
		list.forEach((row) => {
			formArray.push(this.formBuilder.group<ISectorClpSurveyPerformanceFactors>({
				'Id': this.formBuilder.control((row.Id == magicNumber.zero || row.Id == null)
					? magicNumber.zero
					: row.Id),
				'XrmEntityId': this.formBuilder.control(magicNumber.twentyNine, {nonNullable: true}),
				'Factor': this.formBuilder.control(row.Factor, this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ItemTitle')),
				'ApplicableFor': this.formBuilder.control(row.ApplicableFor, this.customValidators.requiredValidationsWithMessage('PleaseSelectData', 'UsedIn'))
			}));
		});
	}

	onAddClpSurveyScale(list: SectorClpSurveyScale[], formArray: FormArray<FormGroup<ISectorClpSurveyScales>>) {
		formArray.clear();

		list.forEach((row, index: number) => {
			formArray.push(this.formBuilder.group<ISectorClpSurveyScales>({
				'Id': this.formBuilder.control((row.Id == magicNumber.zero || row.Id == null)
					? magicNumber.zero
					: row.Id, {nonNullable: true}),
				'XrmEntityId': this.formBuilder.control(magicNumber.twentyNine, {nonNullable: true}),
				'Scale': this.formBuilder.control(index + magicNumber.one, {nonNullable: true}),
				'Definition': this.formBuilder.control(row.Definition, this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ItemTitle')),
				'ApplicableFor': this.formBuilder.control(row.ApplicableFor, this.customValidators.requiredValidationsWithMessage('PleaseSelectData', 'UsedIn'))
			}));
		});
	}

	onAddReqPerformaceFactor(
		list: SectorRequisitionSurveyPerformanceFactor[],
		 formArray: FormArray<FormGroup<ISectorRequisitionSurveyPerformanceFactors>>
	) {
		formArray.clear();

		list.forEach((row, index: number) => {
			formArray.push(this.formBuilder.group<ISectorRequisitionSurveyPerformanceFactors>({
				'Id': this.formBuilder.control((list[index].Id == magicNumber.zero || list[index].Id == null)
					? magicNumber.zero
					: list[index].Id, { nonNullable: true }),
				'XrmEntityId': this.formBuilder.control(magicNumber.twenty, { nonNullable: true }),
				'Factor': this.formBuilder.control(
					row.Factor,
					[
						this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ItemTitle'),
						this.customValidators.MaxLengthValidator(magicNumber.hundred, "MaximumCharLimit")
					]
				)
			}));
		});
	}

	onAddReqSurveyScale(list: SectorRequisitionSurveyScale[], formArray: FormArray<FormGroup<ISectorRequisitionSurveyScales>>) {
		formArray.clear();

		list.forEach((row, index: number) => {
			formArray.push(this.formBuilder.group<ISectorRequisitionSurveyScales>({
				'Id': this.formBuilder.control((list[index].Id == magicNumber.zero || list[index].Id == null)
					? magicNumber.zero
					: list[index].Id, { nonNullable: true }),
				'XrmEntityId': this.formBuilder.control(magicNumber.twenty, { nonNullable: true }),
				'Scale': this.formBuilder.control(index + magicNumber.one, { nonNullable: true }),
				'Definition': this.formBuilder.control(
					row.Definition,
					[
						this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ItemTitle'),
						this.customValidators.MaxLengthValidator(magicNumber.hundred, "MaximumCharLimit")
					]
				),
				'ApplicableFor': this.formBuilder.control(row.ApplicableFor, { nonNullable: true }),
				'ApplicableForName': this.formBuilder.control(row.ApplicableForName, { nonNullable: true })
			}));
		});
	}

	NoOfScheduleDaysFormArray(list: number[]| null | {'Days': number | null}[], arrayForm: FormArray, displayFormArray: boolean = false) {
		arrayForm.clear();
		if (list?.length === Number(magicNumber.zero)) {
			if(displayFormArray) {
				arrayForm.push(this.formBuilder.group({
					Days: [null, [this.customValidators.RequiredValidator()]]
				}));
			}
		}
		else {
			list = list?.map((row) =>
				({ 'Days': row })) as {'Days': number | null}[];
			list.forEach((row) => {
				arrayForm.push(this.formBuilder.group({
					Days: [
						row.Days, [
							this.customValidators.RequiredValidator(),
							this.customValidators.RangeValidator(
								Number(magicNumber.one), Number(magicNumber.oneHundredEighty), 'YouCanEnterValueBetween',
								[{ Value: '1', IsLocalizeKey: true }, { Value: '180', IsLocalizeKey: true }]
							)
						]
					]
				}));
			});
		}
	}


	fieldSpecficRequiredMessageValidation(validationMessage: string, fieldName: string) {
		return this.customValidators.RequiredValidator(validationMessage, [{ Value: fieldName, IsLocalizeKey: true }]);
	}

	getSteps(): StepDataModel[] {
		const steps = [];
		steps.push(this.getStepLabel('BasicDetails', 'BasicDetail'));
		steps.push(this.getStepLabel('OrganizationStructure', 'OrgLevelConfigs'));
		steps.push(this.getStepLabel('ShiftConfigurations', 'ShiftConfiguration'));
		steps.push(this.getStepLabel('PricingModelConfigurations', 'PricingModelConfiguration'));
		steps.push(this.getStepLabel('RatesFeesConfigurations', 'RatesAndFeesConfiguration'));
		steps.push(this.getStepLabel('TAndEConfigurations', 'TimeAndExpenseConfiguration'));
		steps.push(this.getStepLabel('AssignmentExtensionAndOtherConfigurations', 'AssignmentExtensionAndOtherConfiguration'));
		steps.push(this.getStepLabel('TenureConfigurations', 'TenureConfiguration'));
		steps.push(this.getStepLabel('RequisitionConfigurations', 'RequisitionConfiguration'));
		steps.push(this.getStepLabel('SubmittalConfigurations', 'SubmittalConfiguration'));
		steps.push(this.getStepLabel('BenefitAdderConfigurations', 'BenefitAdderConfiguration'));
		steps.push(this.getStepLabel('ConfigureMSPProcessActivity', 'ConfigureMspProcessActivity'));
		steps.push(this.getStepLabel('PerformanceSurveyConfigurations', 'PerformanceSurveyConfiguration'));
		steps.push(this.getStepLabel('RFxConfigurations', 'RfxConfiguration'));
		steps.push(this.getStepLabel('CostAccountingCodeConfigurations', 'ChargeNumberConfiguration'));
		steps.push(this.getStepLabel('OnboardingRequirements', 'BackgroundCheck'));
		steps.push(this.getStepLabel('XRMTimeClock', 'XrmTimeClock'));
		steps.push(this.getStepLabel('EmailApprovalConfigurations', 'EmailApprovalConfiguration'));
		steps.push(this.getStepLabel('UserDefineFields', 'UserDefineFields'));
		return steps;
	}

	getStepLabel(label: string, name: string) {
		return {
			'label': label,
			'icon': 'check',
			'id': label,
			'name': name
		};
	}

	getFormErrorStatus(index: number) {
		return this.initStatusOfForm[index];
	}

	setFormInitStatus(index: number) {
		this.initStatusOfForm[index] = this.initStatusOfForm[index] + Number(magicNumber.one);
	}

	setInitialDefault() {
		this.initStatusOfForm = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
			10: 0, 11: 0, 12: 0, 13: 0, 14: 0 };
	}

	 makeScreenScrollOnUpdate(element: ElementRef) {
		const fieldWithError = element.nativeElement.querySelector('.card__heading');
		if (fieldWithError !== null) {
			this.timeoutId = window.setTimeout(() =>
				fieldWithError.scrollIntoView({ block: 'center' }), magicNumber.zero);
		}
	}

	clearTimeout() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = Number(magicNumber.zero);
		}
	}

}

