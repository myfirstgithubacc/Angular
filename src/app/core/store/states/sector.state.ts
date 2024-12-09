/* eslint-disable max-statements-per-line */
/* eslint-disable max-lines-per-function */

import { Action, Selector, State, type StateContext } from '@ngxs/store';
import {
	GetExisitngSectors, GetSector, GetSectorAllDropdowns, GetSectorByUKey, ResetSectorStates, SetSectorDetails,
	UpdateSectorStatus
} from '../actions/sector.action';
import { type Observable, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Sector } from '../../models/Sector/sector.model';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorList } from '../../models/Sector/sector-list.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';


export class SectorStateModel {
	sectors!: SectorList[];
	sectorsLoaded!: boolean;
	sectorById!: SectorList;
	sectorDetails!: Sector;
	currentSectorId!: number;
	sectorAllDropdowns!: SectorAllDropdowns;
	sectorName!: string;
	statusCode!: string;
	existingCopySectorDropdowns!: SectorAllDropdowns;
	existingCopySectorLoaded!: boolean;
}

@State<SectorStateModel>({
	name: 'sectors',
	defaults: {
		sectors: [],
		sectorsLoaded: false,
		sectorById: null as any,
		sectorDetails: null as any,
		currentSectorId: null as any,
		sectorAllDropdowns: null as any,
		sectorName: null as any,
		statusCode: '',
		existingCopySectorDropdowns: null as any,
		existingCopySectorLoaded: false
	}
})

@Injectable()
export class SectorState {
	constructor(
		private readonly sector: SectorService,
		private readonly local: LocalizationService,
		private readonly toasterService: ToasterService
	) { }

	public sectorData = new SectorAllDropdowns();
	public data: any;
	public transformedData: any;
	public translateObject = [
		'PasswordExpiryPeriods',
		'ShiftDifferentialMethods',
		'OtRateTypes',
		'NoConsecutiveWeekMissingEntrys',
		'PoTypes',
		'MspFeeTypes',
		'BillRateValidations',
		'CostEstimationTypes',
		'QuestionToBeAnsweredBys',
		'YesNo',
		'LengthOfAssignmentTypes',
		'SurveyUsedInEntities',
		'PricingModels',
		'MarkUpTypes',
		'PoTypeSowIcs',
		'XrmUseEmployeeTimeClocks'
	];

	public radioModel = [
		'ShiftDifferentialMethods',
		'PricingModels',
		'MarkUpTypes',
		'PoTypes',
		'PoTypeSowIcs',
		'XrmUseEmployeeTimeClocks'
	];

	public dropdownModel = ['PasswordExpiryPeriods'];

	@Selector()
	static getAllSector(state: SectorStateModel) {
		return state.sectors;
	}

	@Selector()
	static getSectorAllDropdowns(state: SectorStateModel) {
		return state.sectorAllDropdowns;
	}

	@Selector()
	static sectorsLoaded(state: SectorStateModel) {
		return state.sectorsLoaded;
	}

	@Selector()
	static exisitngCopyDropdownListLoaded(state: SectorStateModel) {
		return state.existingCopySectorLoaded;
	}

	@Selector()
	static existingCopySectorDropdowns(state: SectorStateModel) {
		return state.existingCopySectorDropdowns;
	}

	@Selector()
	static sectorById(state: SectorStateModel) {
		return state.sectorById;
	}

	@Selector()
	static sectorByUKey(state: SectorStateModel) {
		return state.sectorDetails;
	}

	@Selector()
	static currentSectorId(state: SectorStateModel) {
		return state.currentSectorId;
	}

	@Selector()
	static sectorName(state: SectorStateModel) {
		return state.sectorName;
	}

	// Get Data From State.
	@Action(GetSector)
	getSectors({ getState, setState }: StateContext<SectorStateModel>) {
		return this.sector.getAllSector().pipe(tap((res: any) => {
			const state = getState();

			setState({
				...state,
				sectors: res.Data,
				sectorsLoaded: true
			});
		}));
	}

	// UPDATE STATUS FROM STATE
	@Action(UpdateSectorStatus)
	UpdateSectorStatus(
		{ getState, patchState }: StateContext<SectorStateModel>,
		{ payload }: UpdateSectorStatus
	): Observable<SectorStateModel> | void {
		return this.sector.updateStatus(payload).pipe(tap((res: any) => {
			const state = getState(),
				sectorList = state.sectors;

			if (res.Succeeded) {
				payload.forEach((payld: any) => {
					const index = sectorList.findIndex((currList) =>
						currList.UKey === payld.UKey);
					sectorList[index].Disabled = payld.Disabled;
					if (sectorList[index].Status !== 'D') {
						sectorList[index].Status = (payld.Disabled === true)
							? 'I'
							: 'A';
					}
				});
			}
			patchState({
				...state,
				sectors: sectorList
			});
		}));
	}

	@Action(GetSectorByUKey)
	GetSectorByUKey(
		{ getState, setState }: StateContext<SectorStateModel>,
		{ ukey }: GetSectorByUKey
	): Observable<SectorStateModel> | void {
		return this.sector.getSectorByUkey(ukey).pipe(tap((res: any) => {
			const state = getState();
			setState({
				...state,
				sectorDetails: new Sector(res.Data),
				currentSectorId: res.Data.Id,
				sectorName: res.Data.BasicDetail.SectorName
			});
		}));
	}

	@Action(ResetSectorStates)
	ResetSectorStates(
		{ getState, setState }: StateContext<SectorStateModel>,
		{ payload, sectionName }: ResetSectorStates
	) {
		let state = getState();

		state = this.getSectionName(state, payload, sectionName);

		setState({
			...state,
			sectors: [],
			sectorsLoaded: false,
			sectorById: null as any,
			sectorDetails: state.sectorDetails,
			existingCopySectorLoaded: false
		});
	}

	private getSectionName(state: any, payload: any, sectionName: string) {

		if (sectionName === 'BasicDetail') {
			payload.NoOfPastWeekeding = (payload.IsLimitAvailableWeekendingInTimeCapture)
				? payload.NoOfPastWeekeding
				: null;
			state.sectorDetails.BasicDetail = {...payload, 'WeekDayName': state.sectorDetails.BasicDetail.WeekDayName, 'IsWeekendingRequired': state.sectorDetails.BasicDetail.IsWeekendingRequired};
		} else if (sectionName === 'OrgLevelConfigs') { state.sectorDetails.OrgLevelConfigs = payload; }
		else if (sectionName === 'ShiftConfiguration') { state.sectorDetails.ShiftConfiguration = payload; }
		else if (sectionName === 'PricingModelConfiguration') { state.sectorDetails.PricingModelConfiguration = {...payload, 'CostEstimationTypeName': state.sectorDetails.PricingModelConfiguration.CostEstimationTypeName}; }
		else if (sectionName === 'RatesAndFeesConfiguration') { state.sectorDetails.RatesAndFeesConfiguration = payload; }

		state = this.modifyTimeAndExpenseToReqConfigSection(state, payload, sectionName);

		return state;
	}

	private modifyTimeAndExpenseToReqConfigSection(state: any, payload: any, sectionName: string) {
		if (sectionName === 'TimeAndExpenseConfiguration') { state.sectorDetails.TimeAndExpenseConfiguration = payload; }
		else if (sectionName === 'AssignmentExtensionAndOtherConfiguration') { state.sectorDetails.AssignmentExtensionAndOtherConfiguration = payload; }
		else if (sectionName === 'TenureConfiguration') { state.sectorDetails.TenureConfiguration = payload; }
		else if (sectionName === 'ConfigureMspProcessActivity') { state.sectorDetails.ConfigureMspProcessActivity = payload; }
		else if (sectionName === 'SubmittalConfiguration') { state.sectorDetails.SubmittalConfiguration = payload; }
		else if (sectionName === 'ChargeNumberConfiguration') { state.sectorDetails.ChargeNumberConfiguration = payload; }
		else if (sectionName === 'BenefitAdderConfiguration') {
			payload.SectorBenefitAdders = (payload.IsBenefitAdder)
				? payload.SectorBenefitAdders
				: [];
			state.sectorDetails.BenefitAdderConfiguration = payload;
		} else if (sectionName === 'RequisitionConfiguration') { state.sectorDetails.RequisitionConfiguration = payload; }

		state = this.modifyRfxConfigToXrmTimeClockSection(state, payload, sectionName);

		return state;
	}

	private modifyRfxConfigToXrmTimeClockSection(state: any, payload: any, sectionName: string) {
		switch (sectionName) {
			case 'RfxConfiguration':
				payload = payload.IsRfxSowRequired
					? payload
					: null;
				if (payload) {
					payload.SowAmountLimit = payload.IsSowAmountLimitRequired
						? payload.SowAmountLimit
						: null;
					payload.DefaultPoForSowIc = payload.PoTypeSowIc === 'S'
						? payload.DefaultPoForSowIc
						: null;
				}

				this.updateSection('RfxConfiguration', payload, state);
				break;

			case 'PerformanceSurveyConfiguration':
			case 'BackgroundCheck':
			case 'EmailApprovalConfiguration':
				this.updateSection(sectionName, payload, state);
				break;

			case 'XrmTimeClock':
				payload.LunchTimeDeducted = payload.IsAutoLunchDeduction
					? payload.LunchTimeDeducted
					: null;
				payload.MinimumHourWorkedBeforeLunchDeduction = payload.IsAutoLunchDeduction
					? payload.MinimumHourWorkedBeforeLunchDeduction
					: null;
				this.updateSection('XrmTimeClock', payload, state);
				break;

			case 'updateAllData':
				this.updateSection('', payload, state);
				break;
		}
		return state;
	}

	private updateSection(section: string, data: any, state: any) {
		if (section) {
			state.sectorDetails[section] = data;
		} else {
			state.sectorDetails = {
				...data,
				'BasicDetail': {
				  ...data.BasicDetail,
				  'IsWeekendingRequired': state.sectorDetails.BasicDetail.IsWeekendingRequired
				}
			  };
		}
	}

	@Action(GetSectorAllDropdowns)
	getSectorAllDropdowns(
		{ getState, setState }: StateContext<SectorStateModel>,
		{ uKey }: GetSectorAllDropdowns
	): Observable<SectorStateModel> | void {
		try {
			return this.sector.getSectorAllDropdowns(uKey).pipe(tap((res: any) => {
				const state = getState();
				this.translateObject.forEach((item: any) => {
					if (res.Data[item] != null) {
						this.data = res.Data[item].map((e: any) => {
							return { Text: this.local.GetLocalizeMessage(e.TextLocalizedKey ?? e.Text, []), Value: e.Value };
						});
					}
					res.Data[item] = this.data;
					this.sectorData[item] = this.data;
					this.transformedData = Object.assign(res.Data, this.sectorData);
				});

				setState({
					...state,
					sectorAllDropdowns: this.transformedData
				});
			}));
		} catch (error) {
			this.toasterService.showToaster(ToastOptions.Error, 'SomeErrorOccurred');
		}
	}

	@Action(SetSectorDetails)
	SetSectorDetails({ getState, setState }: StateContext<SectorStateModel>) {
		const state = getState();

		setState({
			...state,
			sectorDetails: null as any,
			currentSectorId: null as any,
			sectorName: null as any
		});
	}

	@Action(GetExisitngSectors)
	GetExistingSectorsDropdown({ getState, setState }:
		StateContext<SectorStateModel>): Observable<SectorStateModel> | void {
		return this.sector.getExistingSectorsDropdownList().pipe(tap((res: any) => {
			const state = getState();

			setState({
				...state,
				existingCopySectorDropdowns: res.Data,
				existingCopySectorLoaded: true
			});
		}));
	}
}
