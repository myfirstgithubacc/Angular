import { ISectorFM } from '@xrm-master/sector/common/helper';
import { ToJson } from '../responseTypes/to-json.model';
import { SectorAssignmentExtensionAndOtherConfiguration } from './sector-assignment-extension-and-other-configuration.model';
import { SectorBackgroundCheck } from './sector-background-check.model';
import { SectorBasicDetails } from './sector-basic-detail.model';
import { SectorBenefitAdderConfiguration } from './sector-benefit-adder-configuration.model';
import { SectorChargeNumberConfiguration } from './sector-charge-number-configuration.model';
import { SectorConfigureMspProcessActivity } from './sector-configure-msp-process-activity.model';
import { SectorEmailApprovalConfiguration } from './sector-email-approval-configuration.model';
import { SectorOrgLevelConfigs } from './sector-org-level-configs.model';
import { SectorPerformanceSurveyConfiguration } from './sector-performance-survey-configuration.model';
import { SectorPricingModelConfiguration } from './sector-pricing-model-configuration.model';
import { SectorRatesAndFeesConfiguration } from './sector-rates-and-fees-configuration.model';
import { SectorRequisitionConfiguration } from './sector-requisition-configuration.model';
import { SectorRfxConfiguration } from './sector-rfx-configuration.model';
import { SectorShiftConfiguration } from './sector-shift-configuration.model';
import { SectorSubmittalConfiguration } from './sector-submittal-configuration.model';
import { SectorTenureConfiguration } from './sector-tenure-configuration.model';
import { SectorTimeAndExpenseConfiguration } from './sector-time-and-expense-configuration.model';
import { SectorXrmTimeClock } from './sector-xrm-time-clock.model';
import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SectorUdfFieldRecords } from './sector-udfFieldRecords.model';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';

type nullableNumber = number | null;
type nullableString = string | null;
export class Sector extends ToJson {
	UKey: nullableString;
	SectorUkey: nullableString;
	BasicDetail: SectorBasicDetails;
	ShiftConfiguration: SectorShiftConfiguration;
	OrgLevelConfigs: SectorOrgLevelConfigs;
	PricingModelConfiguration: SectorPricingModelConfiguration;
	RatesAndFeesConfiguration: SectorRatesAndFeesConfiguration;
	TimeAndExpenseConfiguration: SectorTimeAndExpenseConfiguration;
	AssignmentExtensionAndOtherConfiguration: SectorAssignmentExtensionAndOtherConfiguration;
	TenureConfiguration: SectorTenureConfiguration;
	RequisitionConfiguration: SectorRequisitionConfiguration;
	SubmittalConfiguration: SectorSubmittalConfiguration;
	BenefitAdderConfiguration: SectorBenefitAdderConfiguration;
	ConfigureMspProcessActivity: SectorConfigureMspProcessActivity;
	PerformanceSurveyConfiguration: SectorPerformanceSurveyConfiguration;
	RfxConfiguration: SectorRfxConfiguration;
	ChargeNumberConfiguration: SectorChargeNumberConfiguration;
	BackgroundCheck: SectorBackgroundCheck;
	XrmTimeClock: SectorXrmTimeClock;
	EmailApprovalConfiguration: SectorEmailApprovalConfiguration;
	SectorId: nullableNumber;
	Id: nullableNumber;
	StatusCode: string;
	IsCopySector: boolean;
	CopyFromSectorId: number;
	Status: string;
	UdfFieldRecords: IPreparedUdfPayloadData[];

	[Key: string]: any;

	constructor(init?: Partial<ɵTypedOrUntyped<ISectorFM, ɵFormGroupRawValue<ISectorFM>, any>>) {
		super();
		Object.assign(this, init);
		    // Initialize properties with their respective classes
		this.BasicDetail = new SectorBasicDetails(init?.BasicDetail);
		this.ShiftConfiguration = new SectorShiftConfiguration(init?.ShiftConfiguration);
		this.OrgLevelConfigs = new SectorOrgLevelConfigs(init?.OrgLevelConfigs);
		this.PricingModelConfiguration = new SectorPricingModelConfiguration(init?.PricingModelConfiguration);
		this.RatesAndFeesConfiguration = new SectorRatesAndFeesConfiguration(init?.RatesAndFeesConfiguration);
		this.TimeAndExpenseConfiguration = new SectorTimeAndExpenseConfiguration(init?.TimeAndExpenseConfiguration);
		this.AssignmentExtensionAndOtherConfiguration =
		new SectorAssignmentExtensionAndOtherConfiguration(init?.AssignmentExtensionAndOtherConfiguration);
		this.TenureConfiguration = new SectorTenureConfiguration(init?.TenureConfiguration);
		this.RequisitionConfiguration = new SectorRequisitionConfiguration(init?.RequisitionConfiguration);
		this.SubmittalConfiguration = new SectorSubmittalConfiguration(init?.SubmittalConfiguration);
		this.BenefitAdderConfiguration = new SectorBenefitAdderConfiguration(init?.BenefitAdderConfiguration);
		this.ConfigureMspProcessActivity = new SectorConfigureMspProcessActivity(init?.ConfigureMspProcessActivity);
		this.PerformanceSurveyConfiguration = new SectorPerformanceSurveyConfiguration(init?.PerformanceSurveyConfiguration);
		this.RfxConfiguration = new SectorRfxConfiguration(init?.RfxConfiguration);
		this.ChargeNumberConfiguration = new SectorChargeNumberConfiguration(init?.ChargeNumberConfiguration);
		this.BackgroundCheck = new SectorBackgroundCheck(init?.BackgroundCheck);
		this.XrmTimeClock = new SectorXrmTimeClock(init?.XrmTimeClock);
		this.EmailApprovalConfiguration = new SectorEmailApprovalConfiguration(init?.EmailApprovalConfiguration);

		this.UKey = init?.UKey ?? null;
		this.SectorUkey = init?.SectorUkey ?? null;
		this.CopyFromSectorId = init?.CopyFromSectorId ?? magicNumber.zero;
	}

	getObject<T>(key: keyof this): T {
		return this[key] as T;
	}

	bindWholeSectorData(data: Sector) {
		data.BasicDetail = this.BasicDetail;
		data.BackgroundCheck = this.BackgroundCheck;
		data.AssignmentExtensionAndOtherConfiguration = this.AssignmentExtensionAndOtherConfiguration;
		data.BenefitAdderConfiguration = this.BenefitAdderConfiguration;
		data.ChargeNumberConfiguration = this.ChargeNumberConfiguration;
		data.ConfigureMspProcessActivity = this.ConfigureMspProcessActivity;
		data.EmailApprovalConfiguration = this.EmailApprovalConfiguration;
		data.OrgLevelConfigs = this.OrgLevelConfigs;
		data.PerformanceSurveyConfiguration = this.PerformanceSurveyConfiguration;
		this.bindWholeSectorpartTwo(data);
	}

	bindWholeSectorpartTwo(data: Sector) {
		data.PricingModelConfiguration = this.PricingModelConfiguration;
		data.RatesAndFeesConfiguration = this.RatesAndFeesConfiguration;
		data.RequisitionConfiguration = this.RequisitionConfiguration;
		data.RfxConfiguration = this.RfxConfiguration;
		data.ShiftConfiguration = this.ShiftConfiguration;
		data.SubmittalConfiguration = this.SubmittalConfiguration;
		data.TenureConfiguration = this.TenureConfiguration;
		data.TimeAndExpenseConfiguration = this.TimeAndExpenseConfiguration;
		data.XrmTimeClock = this.XrmTimeClock;
		data.UdfFieldRecords = this['UserDefineFields'].UdfFieldRecords;
		data.IsCopySector = this.IsCopySector;
		data.CopyFromSectorId = data.IsCopySector
			? this.CopyFromSectorId
			: magicNumber.zero;
	}
}
