import { Action, Selector, State, StateContext } from "@ngxs/store";
import { AddApprovalConfiguration, GetApprovalConfiguration, SetApprovalConfigurationById, UpdateApprovalConfiguration, UpdateApprovalConfigurationStatus } from "../actions/apporval-config.action";
import { Observable, tap } from "rxjs";
import { ApprovalConfiguration } from "../../models/approval-config.model";
import { Injectable } from "@angular/core";
import { LoaderService } from "@xrm-shared/services/loader.service";
import { ApprovalConfigurationService } from "src/app/services/masters/approval-configuration.service";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { ApprovalConfigurationGatewayService } from "src/app/services/masters/approval-configuration-gateway.service";


export class ApprovalConfigStateModel {
	approvalConfigurationListStore!: ApprovalConfiguration[];

	statusCodeStore!: string;

	approvaConfigLoadedStore!: boolean;

	approvalConfigByIdStore: any;

	message: string;

	resData:any;

}

@State<ApprovalConfigStateModel>({
	name: 'approval_configuration',
	defaults: {
		approvalConfigurationListStore: [],
		statusCodeStore: '',
		approvaConfigLoadedStore: false,
		approvalConfigByIdStore: null as any,
		message: '',
		resData: ''

	}
})

@Injectable()
export class ApprovalConfigState {

	constructor(
		public approvalConfigSer: ApprovalConfigurationService,
		public approvalConfigGatewaySer: ApprovalConfigurationGatewayService,
		private loaderService: LoaderService
	) { }

	@Selector()
	static getAllApprovalConfig(state: ApprovalConfigStateModel) {
		return state.approvalConfigurationListStore;
	}

	@Selector()
	static approvalConfigLoaded(state: ApprovalConfigStateModel) {
		return state.approvaConfigLoadedStore;
	}

	@Selector()
	static approvalConfigById(state: ApprovalConfigStateModel) {
		return state.approvalConfigByIdStore;
	}

	@Selector()
	static statusCode(state: ApprovalConfigStateModel) {
		return state.statusCodeStore;
	}

	// GET DATA FROM STATE
	@Action(GetApprovalConfiguration)
	GetApprovalConfiguration({ getState, setState }: StateContext<ApprovalConfigStateModel>) {
		return this.approvalConfigGatewaySer.getlistOfApprovalConfiguration().pipe(tap((res: any) => {
			const state = getState();
			setState({
				...state,
				approvalConfigurationListStore: res.Data,
				approvaConfigLoadedStore: true,
				statusCodeStore: res.StatusCode
			});

		}));

	}

	// GET DATA BY ID FROM STATE
	@Action(SetApprovalConfigurationById)
	SetApprovalConfigurationById(
		{ getState, setState }: StateContext<ApprovalConfigStateModel>,
		{ id }: SetApprovalConfigurationById
	): Observable<ApprovalConfigStateModel> | any {

		const state = getState();
		let selectedCategory = state.approvalConfigurationListStore;
		// eslint-disable-next-line one-var
		const index = selectedCategory.findIndex((cat: any) =>
		{ return (cat.UKey === id); });

		if (selectedCategory.length > Number(magicNumber.zero)) {
			setState({
				...state,
				approvalConfigByIdStore: selectedCategory[index]
			});
		} else {

			return this.approvalConfigGatewaySer.getApprovalConfigById(id).pipe(tap((res: any) => {

				selectedCategory = res.Data;

				setState({
					...state,
					approvalConfigByIdStore: selectedCategory
				});

			}));
		}
	}

	// ADD DATA TO STATE
	@Action(AddApprovalConfiguration)
	AddApprovalConfiguration(
		{ getState, patchState }:StateContext<ApprovalConfigStateModel>,
		{ payload }: AddApprovalConfiguration
	): Observable<ApprovalConfigStateModel> {

		return this.approvalConfigGatewaySer.addApprovalConfiguration(payload).pipe(tap((res: any) => {
			const state = getState();
			if (res.Succeeded) {
				patchState({
					approvalConfigurationListStore:
							[res.Data[0], ...state.approvalConfigurationListStore],
					statusCodeStore: res.StatusCode,
					message: res.Message
				});
			} else {
				patchState({
					statusCodeStore: res.StatusCode,
					message: res.Message,
					resData: res
				});
			}


		}));
	}

	// update data status(active/diactive) from state
	@Action(UpdateApprovalConfigurationStatus)
	UpdateApprovalConfigurationStatus({ getState, patchState }:
		StateContext<ApprovalConfigStateModel>, { payload }:
		UpdateApprovalConfigurationStatus): Observable<ApprovalConfigStateModel> {
		this.loaderService.setState(true);
		return this.approvalConfigGatewaySer.
			updateApprovalConfigurationStatus(payload).pipe(tap((res: any) => {

				// debugger
				const state = getState(),
					catList = state.approvalConfigurationListStore,
					indexArray: any = [];
				payload.forEach((a: any) => {
					const index = catList.findIndex((b: any) =>
						b.UKey == a.UKey);
					indexArray.push(index);
				});

				if (res.Succeeded) {
					this.loaderService.setState(false);
					indexArray.forEach((c: any) => {
						if(catList[c]){
							catList[c].Disabled = payload[0]?.Disabled;
						}
					});
				}
				patchState({
					...state,
					approvalConfigurationListStore: catList
				});
			}));
	}


	// UPDATE DATA FROM STATE
	@Action(UpdateApprovalConfiguration)
	UpdateApprovalConfiguration(
		{ getState, patchState }: StateContext<ApprovalConfigStateModel>,
		{ payload }: UpdateApprovalConfiguration
	): Observable<ApprovalConfigStateModel> {
		return this.approvalConfigGatewaySer.updateApprovalConfiguration(payload).pipe(tap((res: any) => {
			const state = getState(),
				catList = state.approvalConfigurationListStore;
			if (res.Succeeded) {
				// debugger
				const index = catList.findIndex((cat: any) =>
					cat.UKey == res.Data.Data[0].UKey);
				// eslint-disable-next-line no-unused-expressions
				catList[index] = res.Data ?
					res.Data.Data[0] :
					null;


				patchState({
					...state,
					approvalConfigurationListStore: catList,
					statusCodeStore: res.StatusCode,
					message: res.Message,
					resData: res
				});
			} else {
				patchState({
					statusCodeStore: res.StatusCode,
					message: res.Message,
					resData: res
				});
			}
		}));
	}
}
