import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { GetHourDistributionRuleAllDropdowns } from "../actions/hour-distribution-rule.action";
import { HourDistributionRuleList } from "@xrm-core/models/hour-distribution-rule/hour-distribution-rule.model";
import { HourDistributionRuleService } from "src/app/services/masters/hour-distribution-rule.service";
import { LocalizationService } from "@xrm-shared/services/Localization/localization.service";
import { HourDistributionRuleDropDowns } from "@xrm-core/models/hour-distribution-rule/hour-distribution-rule-dropdowns";
import { ToasterService } from "@xrm-shared/services/toaster.service";
import { ToastOptions } from "@xrm-shared/enums/toast-options.enum";
export class HourDistributionRuleStateModel {
	hourDistributionRules!: HourDistributionRuleList[];
	hourDistributionRuleLoaded!: boolean;
	hourDistributionRuleById!: HourDistributionRuleList;
	hourDistributionRuleAllDropdowns: HourDistributionRuleDropDowns | null;
	statusCode!: string;
}

@State<HourDistributionRuleStateModel>({
	name: 'hourDistributionRules',
	defaults: {
		hourDistributionRules: [],
		hourDistributionRuleLoaded: false,
		hourDistributionRuleById: null as any,
		hourDistributionRuleAllDropdowns: null,
		statusCode: ''
	}
})

@Injectable()
export class HourDistributionRuleState {
	constructor(
		private hourDistributionRuleService: HourDistributionRuleService,
		private readonly local: LocalizationService,
		private toasterService: ToasterService
	) { }
	private hourDistributionData: any = new HourDistributionRuleDropDowns();
	private data: any;
	public transformedData: any;
	private translateObject = [
		'PreDefinedSchedules',
		'Days',
		'ConditionParameters',
		'ComparisonOperators',
		'SpecialDays'
	];

	private defaultOperators: any = {
		'GreaterThan': '>',
		'LessThan': '<',
		'Equal': '=',
		'LessThanOrEqual': '<=',
		'GreaterThanOrEqual': '>='
	};

	@Selector()
	static getHourDistributionRuleAllDropdowns(state: HourDistributionRuleStateModel) {
		return state.hourDistributionRuleAllDropdowns;
	}

	@Action(GetHourDistributionRuleAllDropdowns)
	GetHourDistributionRuleAllDropdowns(
		{ getState, patchState }: StateContext<HourDistributionRuleStateModel>,
		{ uKey }: GetHourDistributionRuleAllDropdowns
	): Observable<HourDistributionRuleStateModel> | HourDistributionRuleDropDowns {
		const state = getState();
		if (!state.hourDistributionRuleAllDropdowns) {
			return this.hourDistributionRuleService.getHourDistributionRuleAllDropdowns(uKey).pipe(tap((res: any) => {
				try {
					this.translateObject.forEach((item: any) => {
						if (res.Data[item] != null) {
							if (item === 'ComparisonOperators') {
								this.data = res.Data[item].map((e: any) => {
									const text: any = this.defaultOperators[e.Text];
									return { Text: text, Value: e.Value };
								});
							} else {
								this.data = res.Data[item].map((e: any) => {
									return { Text: this.local.GetLocalizeMessage(e.TextLocalizedKey), Value: e.Value };
								});
							}
						}
						res.Data[item] = this.data;
						this.hourDistributionData[item] = this.data;
						this.transformedData = { ...res.Data, ...this.hourDistributionData };
					});

				}
				catch (ex) {
					this.toasterService.showToaster(ToastOptions.Error, 'Somethingwentwrong');
				}
				patchState({
					...state,
					hourDistributionRuleAllDropdowns: this.transformedData
				});
			}));
		}
		else {
			return state.hourDistributionRuleAllDropdowns;
		}
	}
}
